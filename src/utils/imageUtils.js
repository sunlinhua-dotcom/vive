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

// Helper: File to DataURL
const fileToDataURL = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
};

/**
 * 极致优化的主线程压缩 (为了手机端 100% 兼容)
 * 之前的 Web Worker 方案在 iOS Safari 上存在 OffscreenCanvas 兼容性问题
 * 回归到最稳健的 Canvas 方案
 */
export const compressFile = async (file, maxWidth = 1024, quality = 0.7) => {
    try {
        // 1. 读取文件
        const dataURL = await fileToDataURL(file);

        // 2. 压缩 (复用已有的 compressImage)
        return await compressImage(dataURL, maxWidth);
    } catch (e) {
        console.error("Compression failed:", e);
        throw e;
    }
};
