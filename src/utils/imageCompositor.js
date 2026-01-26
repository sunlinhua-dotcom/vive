
/**
 * 智能图像合成引擎
 * 负责将 AI 底图、品牌 Logo、日历文案合成一张最终图片
 * 策略：Fit & Design (保留完整画面，利用留白做设计)，拒绝暴力裁剪
 */
export const composeFinalImage = async (baseImageUrl, data) => {
    const { month, year, keyword, attitude } = data;

    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 1. 加载底图
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = baseImageUrl;

        img.onload = async () => {
            // 目标尺寸：3:4 高清海报
            const targetWidth = 1024;
            const targetHeight = 1365;

            canvas.width = targetWidth;
            canvas.height = targetHeight;

            // --- A. 绘制背景 ---
            // 提取图片主色调有点慢，这里默认使用深色背景(#1a1a1a)或深红(#4a0e0e)作为底色
            // 这样如果是方图，上下留白部分就有颜色了
            ctx.fillStyle = "#1a1a1a";
            ctx.fillRect(0, 0, targetWidth, targetHeight);

            // --- B. 智能贴图 (Strict Full Bleed / Cover Mode) ---
            // 用户要求：画面要是一体的 (One Piece)，拒绝分离感。
            // 策略：无论原图比例如何，强制 Cover 铺满整个 3:4 画布。
            // 可能会裁切掉左右或上下部分，但保证画面完整无黑边/无模糊底。

            const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
            const dWidth = img.width * scale;
            const dHeight = img.height * scale;

            // 居中裁切
            const dx = (targetWidth - dWidth) / 2;
            const dy = (targetHeight - dHeight) / 2;

            ctx.drawImage(img, dx, dy, dWidth, dHeight);

            // --- C. 氛围渐变 (Refined) ---

            // 1. 底部渐变：为了让白色文字和日历清晰可见
            // 使用多段渐变模拟指数衰减，避免"一条黑线"的感觉
            const bottomH = 450;
            const gradient = ctx.createLinearGradient(0, targetHeight - bottomH, 0, targetHeight);
            gradient.addColorStop(0, "rgba(0,0,0,0)");      // 完全透明
            gradient.addColorStop(0.3, "rgba(0,0,0,0.1)");  // 缓慢过渡
            gradient.addColorStop(0.7, "rgba(0,0,0,0.6)");  // 加深
            gradient.addColorStop(1, "rgba(0,0,0,0.9)");    // 底部最深
            ctx.fillStyle = gradient;
            ctx.fillRect(0, targetHeight - bottomH, targetWidth, bottomH);

            // 2. 顶部渐变：极致丝滑 (Ultra Smooth 150px)
            // 目的：在 150px 内创建自然漫射阴影，衬托白色 Logo，消除色块感
            const topH = 150;
            const topGradient = ctx.createLinearGradient(0, 0, 0, topH);

            // 多段指数衰减，确保过渡肉眼不可见
            topGradient.addColorStop(0, "rgba(0,0,0,0.6)");    // 顶部：柔和深色
            topGradient.addColorStop(0.2, "rgba(0,0,0,0.4)");  // 
            topGradient.addColorStop(0.4, "rgba(0,0,0,0.2)");  // 
            topGradient.addColorStop(0.7, "rgba(0,0,0,0.05)"); // 极淡
            topGradient.addColorStop(1, "rgba(0,0,0,0)");      // 完全消失

            ctx.fillStyle = topGradient;
            ctx.fillRect(0, 0, targetWidth, topH);




            // [已移除] 水印 "MODERN VIVE" 以免遮挡人脸

            // --- D. 绘制顶部 Logo ---
            // 动态导入处理工具
            const { processLogo } = await import('./logoProcessor');

            // 强制将 Logo 处理为透明底 + 纯白色 (适合深色海报)
            // 无论原图是什么颜色，这里强转白色
            const processedLogoUrl = await processLogo('/vive-logo-light.jpg', {
                threshold: 230,
                targetColor: 'white' // 强转白色
            });

            const logoImg = new Image();
            logoImg.crossOrigin = "Anonymous"; // Ensure cross-origin is set for processed image if it's a data URL or from a different origin
            logoImg.src = processedLogoUrl;

            await new Promise(r => { logoImg.onload = r; logoImg.onerror = r; });

            if (logoImg.width > 0) {
                // 4.5 [NEW] 绘制背景大 VIVE 水印 (Big VIVE Watermark)
                // 位于 Logo 和日期下方，作为装饰背景
                ctx.save();
                ctx.globalAlpha = 0.08; // 极低透明度，仅作为纹理
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                // 使用思源黑 (Noto Sans SC) / 无衬线体
                ctx.font = `bold ${targetWidth * 0.35}px "Noto Sans SC", "Source Han Sans CN", sans-serif`;
                ctx.fillStyle = '#FFFFFF';
                // 稍微拉伸一点高度，更有张力
                ctx.scale(1, 1.2);
                // 绘制在 Logo 中心位置稍微偏上一点
                ctx.fillText("VIVE", targetWidth / 2, 80);
                ctx.restore();

                // 5. 绘制 Logo (上方居中)
                // 不需要混合模式了，已经是透明白字
                ctx.save();
                // ctx.globalCompositeOperation = 'multiply'; // 不需要了

                const logoWidth = canvas.width * 0.25; // 宽度占 25%
                const logoHeight = logoImg.height * (logoWidth / logoImg.width);
                const logoX = (canvas.width - logoWidth) / 2;
                const logoY = 60; // 距离顶部 60px

                // 加一点阴影让白色Logo更清晰
                ctx.shadowColor = "rgba(0,0,0,0.5)";
                ctx.shadowBlur = 10;

                ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
                ctx.restore();

                // 1. 绘制 Logo (中间)
                ctx.shadowColor = "rgba(0,0,0,0.8)";
                ctx.shadowBlur = 15;
                ctx.shadowOffsetY = 5;

                // 计算 Logo 中心线 Y 坐标，用于对齐文字
                const centerY = logoY + logoHeight / 2;

                // 2. 绘制左侧日期 (MARCH 2026) -> 垂直居中于 Logo
                ctx.textAlign = 'left';
                ctx.fillStyle = '#FFFFFF';
                ctx.textBaseline = 'middle'; // 垂直居中
                // 字体参考图中是全大写 serif
                ctx.font = `${targetWidth * 0.035}px "Playfair Display", serif`;
                ctx.shadowBlur = 8;
                ctx.fillText(`${month} ${year}`, 50, centerY);

                // 3. 绘制右侧农历 (乙巳年腊月) -> 右对齐
                ctx.textAlign = 'right';
                ctx.font = `${targetWidth * 0.035}px "Noto Serif SC", serif`; // 中式衬线体
                ctx.fillText("乙巳年腊月", targetWidth - 50, centerY);

                ctx.fillText("乙巳年腊月", targetWidth - 50, centerY);
            }

            // --- F. 绘制底部内容 (左侧) ---
            const footerY = targetHeight - 60;

            // 关键词
            ctx.textAlign = 'left';
            ctx.fillStyle = '#FFFFFF';
            // Label
            ctx.font = `${targetWidth * 0.02}px "Noto Serif SC", serif`;
            ctx.globalAlpha = 0.9;
            ctx.fillText("你的摩登关键词是", 50, footerY - 140);

            // Keyword
            ctx.font = `bold ${targetWidth * 0.06}px "Noto Serif SC", serif`;
            ctx.globalAlpha = 1;
            ctx.fillText(keyword, 50, footerY - 70);

            // Attitude
            ctx.font = `italic ${targetWidth * 0.025}px serif`;
            ctx.fillStyle = '#C5A065'; // 金色态度
            ctx.fillText(`“${attitude}”`, 50, footerY - 20);


            // --- G. 绘制日历 (右下角) ---
            const calX = targetWidth * 0.55;
            // 上移日历起始点，确保31号能露出
            // 5行 * 50px ≈ 250px, 所以至少要留出 300px 空间
            const calY = targetHeight - 320;
            const cellW = (targetWidth * 0.4) / 7;
            const cellH = cellW * 0.9;

            ctx.textAlign = 'center';
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowBlur = 2;

            // Weeks
            ctx.font = `bold ${targetWidth * 0.018}px sans-serif`;
            ctx.globalAlpha = 0.7;
            const weeks = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
            weeks.forEach((d, i) => {
                ctx.fillText(d, calX + i * cellW + cellW / 2, calY);
            });

            // Days (Dynamic & Real)
            ctx.globalAlpha = 1.0;
            ctx.font = `${targetWidth * 0.02}px sans-serif`;

            // 1. 解析月份为索引 (0-11)
            const monthMap = {
                "JANUARY": 0, "FEBRUARY": 1, "MARCH": 2, "APRIL": 3, "MAY": 4, "JUNE": 5,
                "JULY": 6, "AUGUST": 7, "SEPTEMBER": 8, "OCTOBER": 9, "NOVEMBER": 10, "DECEMBER": 11
            };
            const mIndex = monthMap[(month || "JANUARY").toUpperCase()] || 0;
            const yNum = parseInt(year) || 2026;

            // 2. 计算当月第一天是周几 (JS getDay: 0=Sun, 1=Mon... 6=Sat)
            const firstDate = new Date(yNum, mIndex, 1);
            const jsDay = firstDate.getDay();
            // 我们的表头是 MON(0) -> SUN(6)
            // 转换：Sun(0) => 6, Mon(1) => 0, Tue(2) => 1 ...
            const startOffset = (jsDay + 6) % 7;

            // 3. 计算当月总天数 (下个月的第0天 = 当月最后一天)
            const daysInMonth = new Date(yNum, mIndex + 1, 0).getDate();

            let currentDay = 1;
            // 最多绘制 6 行，足以覆盖任何月份
            for (let r = 1; r <= 6; r++) {
                for (let c = 0; c < 7; c++) {
                    // 第一行：检查起始偏移
                    if (r === 1 && c < startOffset) {
                        continue; // 空白
                    }

                    if (currentDay <= daysInMonth) {
                        ctx.fillText(currentDay.toString(), calX + c * cellW + cellW / 2, calY + r * cellH);
                        currentDay++;
                    }
                }
                if (currentDay > daysInMonth) break;
            }

            // 导出：使用 PNG 格式以彻底消除渐变色块/条纹 (JPEG Compression Artifacts)
            resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = (e) => reject(e);
    });
};
