// 图片压缩工具
export const compressImage = (base64Str, maxWidth = 600) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // 强制限制最大宽/高为 600px，防止 502 Bad Gateway
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxWidth) {
                    width = Math.round((width * maxWidth) / height);
                    height = maxWidth;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // 0.5 质量，确保 Base64 字符串足够短
            resolve(canvas.toDataURL('image/jpeg', 0.5));
        };
        img.onerror = () => {
            // 极端兜底
            resolve(base64Str);
        };
    });
};

/**
 * 使用 Web Worker 进行多线程压缩 (极致优化)
 * @param {File} file 原文件
 * @param {number} maxWidth 最大宽度
 * @param {number} quality 质量 0-1
 */
// Helper: File to DataURL
const fileToDataURL = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
};

export const compressFile = async (file, maxWidth = 1024, quality = 0.7) => {
    // 1. Try Main Thread for Mobile Compatibility (Safari iOS often fails with Workers)
    // To be absolutely safe, let's wrap the Worker attempt in a try/catch and fallback.

    try {
        // Feature check: OffscreenCanvas support (rough check)
        if (typeof OffscreenCanvas === 'undefined') {
            throw new Error("OffscreenCanvas not supported");
        }

        // 1. Create ImageBitmap (Main Thread)
        const imageBitmap = await createImageBitmap(file);

        return await new Promise((resolve, reject) => {
            const worker = new Worker(new URL('./compressionWorker.js', import.meta.url), { type: 'module' });

            worker.onmessage = (e) => {
                if (e.data.error) {
                    reject(new Error(e.data.error));
                } else {
                    const isPng = file.type === 'image/png';
                    const prefix = isPng ? 'data:image/png;base64,' : 'data:image/jpeg;base64,';
                    const binary = String.fromCharCode(...new Uint8Array(e.data.buffer));
                    resolve(prefix + btoa(binary));
                }
                worker.terminate();
            };

            worker.onerror = (err) => {
                reject(err);
                worker.terminate();
            };

            worker.postMessage({
                imageBitmap,
                quality,
                targetSize: maxWidth
            }, [imageBitmap]);
        });

    } catch (workerError) {
        console.warn("Worker compression failed, falling back to Main Thread:", workerError);
        // Fallback: Main Thread Canvas
        const dataURL = await fileToDataURL(file);
        return compressImage(dataURL, maxWidth);
    }
};
