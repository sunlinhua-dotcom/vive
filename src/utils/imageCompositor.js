
/**
 * 智能图像合成引擎
 * 负责将 AI 底图、品牌 Logo、日历文案合成一张最终图片
 * 策略：Fit & Design (保留完整画面，利用留白做设计)，拒绝暴力裁剪
 */
export const composeFinalImage = async (baseImageUrl, data) => {
    const { month, year, keyword, attitude, logoColor = 'white' } = data;

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

            // --- B. 智能贴图 (Fit, Don't Cut) ---
            const imgRatio = img.width / img.height;
            const targetRatio = targetWidth / targetHeight; // 0.75

            let dWidth, dHeight, dx, dy;

            if (imgRatio >= 1) {
                // 情况1：源图是宽图或方图 (1:1, 4:3)
                // 策略：宽度撑满，高度自然算。保留完整左右内容（双人图核心）
                // 结果：上下会有留白。这正好！顶部留白放Logo，底部留白放日历。
                dWidth = targetWidth;
                dHeight = dWidth / imgRatio;
                dx = 0;
                // 垂直位置：放在中间偏下一点，给人脸留出顶部Logo空间
                // 如果是方图(h=1024)，目标1365，留白341。
                // 建议 topPadding = 150 (放Logo), 剩下空间给底部
                dy = (targetHeight - dHeight) / 2 + 50;

                // 但如果留白太多不好看，用一个放大的模糊背景垫底
                ctx.save();
                ctx.filter = 'blur(40px) brightness(0.4)';
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight); // 铺满模糊
                ctx.restore();
            } else {
                // 情况2：源图已经是竖图 (1:2, 9:16)
                // 策略：Cover 模式，稍微裁切上下，通过调整让脸能在中间
                // (对于双人全身照，通常脸在上方1/3处)
                const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
                dWidth = img.width * scale;
                dHeight = img.height * scale;
                dx = (targetWidth - dWidth) / 2;
                dy = (targetHeight - dHeight) / 2;
            }

            ctx.drawImage(img, dx, dy, dWidth, dHeight);

            // 稍微加一个底部渐变，让日历字能看清
            const gradient = ctx.createLinearGradient(0, targetHeight - 400, 0, targetHeight);
            gradient.addColorStop(0, "transparent");
            gradient.addColorStop(1, "rgba(0,0,0,0.9)");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, targetHeight - 400, targetWidth, 400);

            // 顶部也加一点渐变，衬托Logo
            const topGradient = ctx.createLinearGradient(0, 0, 0, 300);
            topGradient.addColorStop(0, "rgba(0,0,0,0.8)");
            topGradient.addColorStop(1, "transparent");
            ctx.fillStyle = topGradient;
            ctx.fillRect(0, 0, targetWidth, 300);


            // [已移除] 水印 "MODERN VIVE" 以免遮挡人脸

            // --- D. 绘制顶部 Logo ---
            // 加载 Logo (强制转小写)
            const safeColor = (logoColor || 'white').toLowerCase();
            const logoSrc = `/logo-${safeColor}.png`;
            const logoImg = new Image();
            logoImg.crossOrigin = "Anonymous";
            logoImg.src = logoSrc;

            await new Promise(r => { logoImg.onload = r; logoImg.onerror = r; });

            if (logoImg.width > 0) {
                // 复刻参考图：Logo 居中，两侧放日期
                // Logo 宽度调回 40%，给左右文字留空间
                const logoW = targetWidth * 0.40;
                const logoH = (logoImg.height / logoImg.width) * logoW;
                const logoX = (targetWidth - logoW) / 2;
                const logoY = 60; // 顶部留白，不贴顶，保持呼吸感

                // 1. 绘制 Logo (中间)
                ctx.shadowColor = "rgba(0,0,0,0.8)";
                ctx.shadowBlur = 15;
                ctx.shadowOffsetY = 5;
                ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);

                // 计算 Logo 中心线 Y 坐标，用于对齐文字
                const centerY = logoY + logoH / 2;

                // 2. 绘制左侧日期 (MARCH 2026) -> 垂直居中于 Logo
                ctx.textAlign = 'left';
                ctx.fillStyle = '#FFFFFF';
                ctx.textBaseline = 'middle'; // 垂直居中
                // 字体参考图中是全大写 serif
                ctx.font = `${targetWidth * 0.035}px "Playfair Display", serif`;
                ctx.shadowBlur = 8;
                ctx.fillText(`${month} ${year}`, 50, centerY);

                // 3. 绘制右侧农历 -> 垂直居中于 Logo
                ctx.textAlign = 'right';
                ctx.font = `${targetWidth * 0.025}px "Noto Serif SC", serif`;
                ctx.fillText("农历丙午年 虎月", targetWidth - 50, centerY);
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

            // 导出
            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };

        img.onerror = (e) => reject(e);
    });
};
