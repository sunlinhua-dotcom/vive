
import React from 'react'

function GeneratingScreen({ uploadedImage, loadingText, progress = 0 }) {
    const year = 2026 - Math.floor((2026 - 1930) * (progress / 100));

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[60vh] space-y-12 animate-fade-in">
            {/* Time Tunnel Visuals */}
            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* 核心视觉：脉冲光环 */}
                <div className="absolute inset-0 border border-brand-gold/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
                <div className="absolute inset-4 border border-brand-gold/30 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
                <div className="absolute inset-8 border border-brand-gold/40 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '2s' }}></div>

                {/* 中心用户头像 */}
                <div className="relative z-10 w-32 h-32 rounded-full overflow-hidden border-2 border-brand-gold shadow-2xl">
                    <img
                        src={uploadedImage}
                        className="w-full h-full object-cover grayscale sepia brightness-90"
                        alt="Time Traveler"
                    />
                    <div className="absolute inset-0 bg-brand-gold/10 mix-blend-overlay"></div>
                </div>
            </div>

            <div className="text-center space-y-6">
                <div className="font-display text-6xl font-bold text-brand-gold tracking-widest tabular-nums drop-shadow-sm">
                    {year}
                </div>

                <div className="space-y-4">
                    <p className="font-serif text-sm tracking-[0.2em] text-brand-gold/80 italic">
                        {loadingText || "正在开启时光隧道..."}
                    </p>

                    {/* Real Progress Bar */}
                    <div className="w-64 space-y-3 mx-auto">
                        <div className="relative w-full h-[2px] bg-brand-gold/10 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-brand-gold transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div className="text-[10px] tracking-widest font-serif text-brand-gold/60">
                            PROGRESS: {Math.round(progress)}%
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-4 opacity-40">
                <span className="text-[10px] font-serif tracking-widest uppercase text-brand-gold">VIVE</span>
                <span className="w-1 h-1 bg-brand-gold rounded-full"></span>
                <span className="text-[10px] font-serif tracking-widest uppercase text-brand-gold">DIGIREPUB</span>
            </div>
        </div>
    )
}

export default GeneratingScreen
