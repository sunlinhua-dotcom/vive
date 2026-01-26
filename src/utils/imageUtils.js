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
export const compressFile = (file, maxWidth = 1024, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        // 创建 Worker (兼容 Vite)
        const worker = new Worker(new URL('./compressionWorker.js', import.meta.url), {
            type: 'module'
        });

        worker.onmessage = (e) => {
            if (e.data.error) {
                console.error("Worker transformation failed:", e.data.error);
                // 兜底：如果 Worker 失败（如不支持 OffscreenCanvas），可以考虑回退逻辑
                reject(new Error(e.data.error));
            } else {
                resolve(e.data.base64);
            }
            worker.terminate();
        };

        worker.onerror = (err) => {
            console.error("Worker error:", err);
            reject(err);
            worker.terminate();
        };

        // 发送数据到子线程
        worker.postMessage({ file, maxWidth, quality });
    });
};
