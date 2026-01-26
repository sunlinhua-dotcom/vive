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

// Main Thread Compression (Best Compatibility for iOS/Mobile)
export const compressFile = (file, maxWidth = 1024, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Scale Logic
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

                // Export
                const compressedData = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedData);
            };
            img.onerror = (err) => reject(new Error("Image Load Failed"));
        };
        reader.onerror = (err) => reject(new Error("File Read Failed"));
    });
};
