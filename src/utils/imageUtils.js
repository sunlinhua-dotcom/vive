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
export const compressFile = async (file, maxWidth = 1024, quality = 0.7) => {
    // 1. Create ImageBitmap from File (Main Thread)
    const imageBitmap = await createImageBitmap(file);

    return new Promise((resolve, reject) => {
        // Create Worker
        const worker = new Worker(new URL('./compressionWorker.js', import.meta.url), {
            type: 'module'
        });

        worker.onmessage = (e) => {
            if (e.data.error) {
                console.error("Worker error:", e.data.error);
                reject(new Error(e.data.error));
            } else {
                // Determine format based on buffer
                const isPng = file.type === 'image/png';
                const prefix = isPng ? 'data:image/png;base64,' : 'data:image/jpeg;base64,';

                // Convert ArrayBuffer back to Base64 (Main Thread)
                // Note: Large buffer to string can be slow, but better than freezing UI during compression
                const binary = String.fromCharCode(...new Uint8Array(e.data.buffer));
                const base64 = btoa(binary);
                resolve(prefix + base64);
            }
            worker.terminate();
        };

        worker.onerror = (err) => {
            console.error("Worker connection error:", err);
            reject(err);
            worker.terminate();
        };

        // 2. Transfer ImageBitmap to Worker (Zero Copy)
        // Map 'maxWidth' to 'targetSize' to match worker expectation
        worker.postMessage({
            imageBitmap,
            quality,
            targetSize: maxWidth
        }, [imageBitmap]);
    });
};
