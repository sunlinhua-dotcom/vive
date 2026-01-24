
import React, { useState } from 'react';

function ResultSection({ resultImage, onReset, data }) {
    const [saveMessage, setSaveMessage] = useState('');

    const { month, year, keyword, attitude } = data || {};

    const handleSave = () => {
        // 创建一个临时 <a> 标签来触发下载
        const link = document.createElement('a');
        link.href = resultImage;
        link.download = `VIVE_摩登月份牌_${new Date().getTime()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 显示保存成功提示
        setSaveMessage('海报已保存至相册 ✓');
        setTimeout(() => setSaveMessage(''), 3000);
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
