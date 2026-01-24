
import React from 'react'

function GeneratingScreen({ uploadedImage, loadingText, progress = 0 }) {
    // Countdown Logic:
    // Starts at 2026. Only begins decreasing after progress > 15% to avoid jumping to 2007 immediately.
    // Maps range [15, 100] -> [2026, 1930]
    const currentYear = 2026;
    const targetYear = 1930;
    const triggerThreshold = 15; // Wait until 15% progress (App jumps to 10 then 20)

    const year = progress <= triggerThreshold
        ? currentYear
        : Math.floor(currentYear - (currentYear - targetYear) * ((progress - triggerThreshold) / (100 - triggerThreshold)));

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[50vh] space-y-12 animate-fade-in py-8">
            {/* Time Tunnel Visuals - Art Deco Style */}
            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Concentric Golden Rings Pulse */}
                <div className="absolute inset-0 border border-primary/40 rounded-full animate-[pulse_3s_infinite] opacity-30"></div>
                <div className="absolute inset-4 border border-primary/30 rounded-full animate-[pulse_4s_infinite] opacity-20"></div>
                <div className="absolute inset-10 border border-primary/20 rounded-full animate-[pulse_5s_infinite] opacity-10"></div>

                {/* Decorative Frame Lines */}
                <div className="absolute inset-[3px] border-[0.5px] border-primary/10 rounded-full animate-spin-slow"></div>

                {/* Center Avatar Fragment */}
                <div className="relative z-10 w-32 h-32 rounded-full overflow-hidden p-[2px] bg-background-dark border border-primary/30 shadow-[0_0_30px_rgba(184,149,95,0.15)]">
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                        <img
                            src={uploadedImage}
                            className="w-full h-full object-cover transition-all duration-1000"
                            alt="Time Traveler"
                        />
                        {/* Shimmer overlay - Keep subtle shine but no tint */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>
            </div>

            <div className="text-center space-y-6 w-full max-w-xs">
                <div className="font-serif text-5xl font-light text-primary tracking-[0.2em] tabular-nums drop-shadow-[0_2px_10px_rgba(184,149,95,0.3)] italic">
                    {year}
                </div>

                <div className="space-y-6">
                    <p className="font-serif text-[10px] tracking-[0.4em] text-primary/80 uppercase px-4 leading-loose">
                        {loadingText || "正在开启时光隧道..."}
                    </p>

                    {/* Minimalist Art Deco Progress Bar */}
                    <div className="w-48 space-y-3 mx-auto">
                        <div className="relative w-full h-[1.5px] bg-primary/10 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(184,149,95,0.6)]"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between items-center text-[7px] tracking-[0.2em] font-serif text-primary/40 uppercase">
                            <span>TRANSFORMING</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GeneratingScreen
