
import React from 'react';

const ResultSection = ({ resultImage, onRetry, onShare }) => {

    const handleDownload = () => {
        if (!resultImage) return;
        const link = document.createElement('a');
        link.href = resultImage;
        link.download = `VIVE_1930_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-[70vh] space-y-8 animate-fade-in py-6">
            {/* Immersive Image Container - Now with Frame */}
            <div className="relative group w-full max-w-[340px] aspect-[3/4] p-1 bg-brand-gold/10 backdrop-blur-sm rounded-sm shadow-2xl">
                <div className="absolute inset-0 border border-brand-gold/30 pointer-events-none"></div>
                <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black/40">
                    <img src={resultImage} alt="Your 1930s Self" className="max-w-full max-h-full object-contain" />
                    {/* Shine effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                </div>
            </div>

            {/* Floating Action Dock */}
            <div className="w-full max-w-sm px-6">
                <div className="flex justify-between items-center py-4 px-2">
                    <button
                        className="flex flex-col items-center space-y-2 text-brand-gold/60 hover:text-brand-gold transition-colors group"
                        onClick={onRetry}
                    >
                        <div className="p-2 border border-brand-gold/20 rounded-full group-hover:bg-brand-gold/5">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12C21 16.9706 16.9706 21 12 21C9.69678 21 7.59216 20.1352 6 18.708L6.5 18M3 12C3 7.02944 7.02944 3 12 3C14.3032 3 16.4078 3.86477 18 5.292L17.5 6" />
                                <path d="M17.5 6H21V2.5" />
                                <path d="M6.5 18H3V21.5" />
                            </svg>
                        </div>
                        <span className="text-[10px] tracking-widest font-serif uppercase">Retry</span>
                    </button>

                    <button
                        className="flex flex-col items-center space-y-2 text-brand-gold group"
                        onClick={handleDownload}
                    >
                        <div className="p-4 border-2 border-brand-gold rounded-full group-hover:bg-brand-gold/10 transition-all scale-110 shadow-[0_0_15px_rgba(184,149,95,0.3)]">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 16L12 3" />
                                <path d="M6 10L12 16L18 10" />
                                <path d="M3 19V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V19" />
                            </svg>
                        </div>
                        <span className="text-[10px] tracking-[0.3em] font-serif uppercase font-bold mt-1">Save</span>
                    </button>

                    <button
                        className="flex flex-col items-center space-y-2 text-brand-gold/60 hover:text-brand-gold transition-colors group"
                        onClick={onShare}
                    >
                        <div className="p-2 border border-brand-gold/20 rounded-full group-hover:bg-brand-gold/5">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M13 5L20 12L13 19" />
                                <path d="M20 12H3" />
                            </svg>
                        </div>
                        <span className="text-[10px] tracking-widest font-serif uppercase">Share</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultSection;
