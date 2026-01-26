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
// Fallback: Main thread compression (FileReader + Canvas)
const compressImageFallback = (file, maxWidth, quality) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

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
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = (err) => reject(new Error("Fallback Image Load Failed"));
        };
        reader.onerror = (err) => reject(new Error("Fallback File Read Failed"));
    });
};

export const compressFile = async (file, maxWidth = 1024, quality = 0.7) => {
    try {
        // 1. Try Worker (Preferred)
        // Check for support first
        if (typeof Worker === 'undefined' || typeof createImageBitmap === 'undefined') {
            throw new Error("Worker API not supported");
        }

        const imageBitmap = await createImageBitmap(file);

        return await new Promise((resolve, reject) => {
            const worker = new Worker(new URL('./compressionWorker.js', import.meta.url), {
                type: 'module'
            });

            // Timeout safety: If worker takes > 5s, force fallback
            const timer = setTimeout(() => {
                worker.terminate();
                reject(new Error("Worker Timeout (Mobile Safari safe-guard)"));
            }, 5000);

            worker.onmessage = (e) => {
                clearTimeout(timer);
                if (e.data.error) {
                    reject(new Error(e.data.error));
                } else {
                    const isPng = file.type === 'image/png';
                    const prefix = isPng ? 'data:image/png;base64,' : 'data:image/jpeg;base64,';
                    const binary = String.fromCharCode(...new Uint8Array(e.data.buffer));
                    const base64 = btoa(binary);
                    resolve(prefix + base64);
                }
                worker.terminate();
            };

            worker.onerror = (err) => {
                clearTimeout(timer);
                reject(err);
                worker.terminate();
            };

            worker.postMessage({
                imageBitmap,
                quality,
                targetSize: maxWidth
            }, [imageBitmap]);
        });

    } catch (err) {
        console.warn("Worker Compression Failed (Falling back to Main Thread):", err);
        // 2. Fallback to Main Thread
        return await compressImageFallback(file, maxWidth, quality);
    }
};
