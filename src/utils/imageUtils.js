// 图片压缩工具
export const compressImage = (base64Str, maxWidth = 800) => {
    return new Promise((resolve) => {
        let img = new Image();
        img.src = base64Str;
        img.onload = () => {
            let canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // 压缩质量 0.7
            resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => {
            resolve(base64Str); // 如果压缩失败，返回原图
        };
    });
};
