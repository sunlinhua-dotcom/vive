// Helper to get Lunar Date string
const getLunarDateString = (yearStr, monthStr) => {
    try {
        const monthMap = {
            "JANUARY": 0, "FEBRUARY": 1, "MARCH": 2, "APRIL": 3, "MAY": 4, "JUNE": 5,
            "JULY": 6, "AUGUST": 7, "SEPTEMBER": 8, "OCTOBER": 9, "NOVEMBER": 10, "DECEMBER": 11
        };
        const y = parseInt(yearStr) || new Date().getFullYear();
        const m = monthMap[(monthStr || "").toUpperCase()];

        // Use current month if input is invalid, but typically we want to trust the input
        // If m is undefined, it means monthStr might be empty or invalid.
        const dateMonth = (m !== undefined) ? m : new Date().getMonth();

        const date = new Date(y, dateMonth, 1);

        // Use Intl to get Chinese Calendar string
        // We want: "丙午年正月" (Year + Month)
        const formatter = new Intl.DateTimeFormat('zh-CN', {
            calendar: 'chinese',
            year: 'numeric',
            month: 'long'
        });

        const parts = formatter.formatToParts(date);
        const lunarYear = parts.find(p => p.type === 'year')?.value || '';
        const lunarMonth = parts.find(p => p.type === 'month')?.value || '';

        if (lunarYear && lunarMonth) {
            // Remove "年" from year if it's there (some browsers might duplicate like "丙午年年")
            // But usually standard output is fine. 
            // Just return concatenated string.
            return `${lunarYear}${lunarMonth}`;
        }
        return "乙巳年腊月"; // Fallback
    } catch (e) {
        console.error("Lunar Date Error", e);
        return "乙巳年腊月"; // Fallback
    }
};

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
            // 确保覆盖 AI 可能生成的白色/亮色天花板
            ctx.save();
            ctx.globalCompositeOperation = 'source-over'; // 强制覆盖模式
            // 2. 顶部渐变：自然通透 (Natural & Transparent)
            // 既然提示词已经优化了构图，这里便不再需要厚重的遮盖。
            // 只保留极淡的阴影 (Max 20%) 以确保白色 Logo 在任何极端情况下依然可读。
            const topH = 150;
            const topGradient = ctx.createLinearGradient(0, 0, 0, topH);

            topGradient.addColorStop(0, "rgba(0,0,0,0.25)");    // 顶部：与20%
            topGradient.addColorStop(0.3, "rgba(0,0,0,0.1)");   // 
            topGradient.addColorStop(1, "rgba(0,0,0,0)");       // 完全透明

            ctx.fillStyle = topGradient;
            ctx.fillRect(0, 0, targetWidth, topH);
            ctx.restore();




            // [已移除] 水印 "MODERN VIVE" 以免遮挡人脸

            // --- D. Header Branding (Restored & Gold Tinted) ---
            // 动态导入处理工具
            const { processLogo } = await import('./logoProcessor');

            // 强制将 Logo 处理为透明底 + 白色 (用户确认要白色，和头部信息一致)
            // Color: White
            const processedLogoUrl = await processLogo('/vive-logo-light.jpg', {
                threshold: 230,
                targetColor: 'white' // White for the Logo Symbol
            });

            const logoImg = new Image();
            logoImg.crossOrigin = "Anonymous";
            logoImg.src = processedLogoUrl;

            await new Promise(r => { logoImg.onload = r; logoImg.onerror = r; });

            if (logoImg.width > 0) {
                // Draw Logo (Centered Top)
                ctx.save();
                const logoWidth = canvas.width * 0.25; // 25% width
                const logoHeight = logoImg.height * (logoWidth / logoImg.width);
                const logoX = (canvas.width - logoWidth) / 2;
                const logoY = 60; // Top margin

                // Shadow for visibility
                ctx.shadowColor = "rgba(0,0,0,0.5)";
                ctx.shadowBlur = 10;

                ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
                ctx.restore();

                // Compute Center Y for text alignment
                const centerY = logoY + logoHeight / 2;

                // --- Header Metadata (White) ---
                const textColor = '#FFFFFF'; // "Original White Header Info"
                ctx.fillStyle = textColor;
                ctx.shadowColor = "rgba(0,0,0,0.6)";
                ctx.shadowBlur = 8;
                ctx.textBaseline = 'middle';

                // Left: Month Year
                ctx.textAlign = 'left';
                ctx.font = `${targetWidth * 0.035}px "Playfair Display", serif`;
                ctx.fillText(`${month} ${year}`, 50, centerY);

                // Right: Lunar Date
                ctx.textAlign = 'right';
                // Chinese Serif
                ctx.font = `${targetWidth * 0.035}px "Noto Serif SC", serif`;
                const lunarDateStr = getLunarDateString(year, month);
                ctx.fillText(lunarDateStr, targetWidth - 50, centerY);
            }
            ctx.restore();

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

            // 导出
            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };

        img.onerror = (e) => reject(e);
    });
};
