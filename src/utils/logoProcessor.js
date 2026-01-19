/**
 * 图片处理工具：专门用于处理 Logo 的白底问题
 */

export const processLogo = (src, options = {}) => {
    const {
        threshold = 240, // 白色阈值，大于此值被视为背景
        targetColor = null // 'white' | 'gold' | null (保留原色)
    } = options;

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = src;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            // 绘制原图
            ctx.drawImage(img, 0, 0);

            // 获取像素数据
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // 1. 去除白底
                // 如果像素非常亮（接近白色），将其透明度设为 0
                if (r > threshold && g > threshold && b > threshold) {
                    data[i + 3] = 0; // Alpha = 0
                } else {
                    // 2. 颜色替换 (如果有要求)
                    // 如果不是背景，且需要变色（例如变成白色或金色文字）
                    if (targetColor === 'white') {
                        data[i] = 255;
                        data[i + 1] = 255;
                        data[i + 2] = 255;
                    } else if (targetColor === 'gold') {
                        // VIVE Gold: #C5A065 (197, 160, 101)
                        data[i] = 197;
                        data[i + 1] = 160;
                        data[i + 2] = 101;
                    }
                    // 这里的简单的逻辑：只要不是白底，就全都染成目标色。
                    // 对于复杂的彩色 Logo 可能不适用，但对于单色/双色文字 Logo 很完美。
                }
            }

            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL());
        };

        img.onerror = (e) => {
            console.error("Logo processing failed", e);
            resolve(src); // 失败则返回原图
        };
    });
};
