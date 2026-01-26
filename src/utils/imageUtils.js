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
    // Helper to read file as DataURL for fallback
    const readFileAsDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    };

    // Fallback function: Main Thread Canvas
    const fallbackCompression = async () => {
        console.warn("Using Main Thread Compression Fallback");
        const base64 = await readFileAsDataURL(file);
        return compressImage(base64, maxWidth);
    };

    try {
        // Create Worker (Compatible with Vite)
        const workerURL = new URL('./compressionWorker.js', import.meta.url);

        return new Promise((resolve, reject) => {
            const worker = new Worker(workerURL, { type: 'module' });

            // Timeout to prevent hanging
            const timeoutId = setTimeout(() => {
                worker.terminate();
                reject(new Error("Worker timeout, switching to fallback"));
            }, 3000);

            worker.onmessage = (e) => {
                clearTimeout(timeoutId);
                worker.terminate();
                if (e.data.error) {
                    reject(new Error(e.data.error));
                } else {
                    // Convert ArrayBuffer back to Base64 (or just return blob if needed, but app expects base64)
                    // Wait, our worker returns { buffer }... we need to convert buffer to base64
                    // Actually, let's keep it simple: Worker returns buffer, we convert here.
                    const blob = new Blob([e.data.buffer], { type: e.data.type });
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                }
            };

            worker.onerror = (err) => {
                clearTimeout(timeoutId);
                worker.terminate();
                reject(err);
            };

            // Send to worker
            createImageBitmap(file).then(bitmap => {
                worker.postMessage({ imageBitmap: bitmap, maxWidth, quality }, [bitmap]);
            }).catch(reject);
        });

    } catch (e) {
        console.warn("Worker compression failed:", e);
        return fallbackCompression();
    }
};
