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
 * 直接压缩 File 对象，避免先读取大 Base64
 * @param {File} file 原文件
 * @param {number} maxWidth 最大宽度，默认为 1024 (足够高清且体积小)
 * @param {number} quality 图片质量 0-1
 */
export const compressFile = (file, maxWidth = 1024, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();
        img.src = objectUrl;

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // 保持比例缩放
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

            // 绘制
            ctx.drawImage(img, 0, 0, width, height);

            // 释放内存
            URL.revokeObjectURL(objectUrl);

            // 导出压缩后的 Base64
            // 使用 0.7 质量通常能把 5MB 图压到 200KB 以内，且肉眼看不出区别
            resolve(canvas.toDataURL('image/jpeg', quality));
        };

        img.onerror = (e) => {
            URL.revokeObjectURL(objectUrl);
            reject(e);
        };
    });
};
