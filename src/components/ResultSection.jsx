
import React, { useState } from 'react';

function ResultSection({ resultImage, onReset, data }) {
    const [saveMessage, setSaveMessage] = useState('');

    const { month, year, keyword, attitude } = data || {};

    const handleSave = async () => {
        try {
            // 1. 将 Base64 转换为 Blob/File 对象
            const response = await fetch(resultImage);
            const blob = await response.blob();
            const file = new File([blob], `VIVE_摩登月份牌_${new Date().getTime()}.jpg`, { type: 'image/jpeg' });

            // 2. 尝试调用系统原生分享 (Web Share API Level 2)
            // 大多数现代手机浏览器 (iOS 15+, Android) 支持直接分享文件，这能直接唤起“保存图像”菜单
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'VIVE 摩登奇遇',
                    text: '这是我的摩登月份牌，邀您共赏。'
                });
                setSaveMessage('分享已唤起，请选择“保存图像”');
            } else {
                // 3. 降级方案 (PC端 / 不支持分享的浏览器)
                // 使用 Blob URL 下载，比 Base64 更稳定
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = file.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                setSaveMessage('海报下载已触发 ✓');
            }
        } catch (error) {
            console.error('Save failed:', error);
            // 4. 最后的兜底提示
            setSaveMessage('自动保存失败，请长按图片保存');
        }

        setTimeout(() => setSaveMessage(''), 4000);
    };

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[60vh] space-y-8 md:space-y-12 animate-fade-in py-4">
            {/* Full Bleed Image - No Frame */}
            <div className="relative group w-full max-w-[768px] transition-all duration-700">
                <img src={resultImage} alt="Modern Encounter Poster" className="w-full h-auto object-contain transition-transform duration-[4s] group-hover:scale-[1.02]" />

            </div>

            {/* Generated Copy & Calendar Metadata - RESTORED */}
            {data && (
                <div className="flex flex-col items-center space-y-4 text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center space-x-3 text-[#B8955F]">
                        <span className="text-[14px] md:text-[16px] font-serif tracking-[0.2em]">{month}</span>
                        <span className="w-[1px] h-3 bg-current opacity-50"></span>
                        <span className="text-[14px] md:text-[16px] font-serif tracking-[0.2em]">{year}</span>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <span className="text-[18px] md:text-[22px] font-serif text-[#E6D5B8] tracking-[0.1em]">{keyword}</span>
                        <span className="text-[12px] md:text-[14px] font-serif text-[#B8955F]/80 tracking-[0.15em]">{attitude}</span>
                    </div>
                </div>
            )}

            {/* Action Buttons - Matching Homepage Style */}
            <div className="flex flex-col items-center space-y-6 w-full max-w-[340px] animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {/* 重新生成按钮 */}
                <button
                    onClick={onReset}
                    className="group relative w-full py-4 border border-[#B8955F] text-[#B8955F] font-serif tracking-[0.3em] font-light transition-all duration-500 hover:bg-[#B8955F] hover:text-black hover:shadow-[0_0_30px_rgba(184,149,95,0.3)]"
                >
                    <span className="relative z-10">再次定格记忆</span>
                </button>

                {/* 保存海报按钮 */}
                <button
                    onClick={handleSave}
                    className="group relative w-full py-4 bg-[#B8955F] text-black font-serif tracking-[0.3em] font-medium transition-all duration-500 hover:shadow-[0_0_40px_rgba(184,149,95,0.5)] hover:brightness-110"
                >
                    <span className="relative z-10">保存海报</span>
                </button>

                {/* 装饰分隔线 */}
                <div className="flex items-center space-x-4 text-[#B8955F]/30 scale-90 pt-2">
                    <div className="h-[0.5px] w-12 bg-current"></div>
                    <span className="text-[10px] tracking-[0.5em] font-serif uppercase">VIVE · 双妹</span>
                    <div className="h-[0.5px] w-12 bg-current"></div>
                </div>
            </div>

            {/* 保存成功提示 (浮动消息) */}
            {saveMessage && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
                    <div className="bg-[#B8955F] text-black px-8 py-4 font-serif tracking-[0.2em] text-sm shadow-[0_0_30px_rgba(184,149,95,0.6)]">
                        {saveMessage}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ResultSection;
