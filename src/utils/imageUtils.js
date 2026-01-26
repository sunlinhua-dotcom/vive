// 图片压缩工具 (Universal Main Thread - Safest for Mobile)
export const compressImage = (input, maxWidth = 800) => {
    return new Promise((resolve) => {
        // Handle standard HTML5 File object
        if (input instanceof File) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64Str = e.target.result;
                processBase64(base64Str, maxWidth).then(resolve);
            };
            reader.onerror = () => {
                // Should almost never happen, but fallback
                console.warn("FileReader failed");
                resolve(null);
            };
            reader.readAsDataURL(input);
        } else if (typeof input === 'string') {
            // Handle Base64 String
            processBase64(input, maxWidth).then(resolve);
        } else {
            console.warn("Invalid input to compressImage");
            resolve(input);
        }
    });
};

const processBase64 = (base64Str, maxWidth) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // 强制限制最大宽/高 (Mobile Safe Limit)
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

            // 0.6 Quality is sweet spot for AI (Faces still good, size small)
            resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = () => {
            console.warn("Image Load Error - returning original");
            resolve(base64Str);
        };
    });
};

// Legacy shim if needed, or just remove compressFile export
export const compressFile = compressImage; // Alias for compatibility
