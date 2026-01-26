
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { compressFile } from '../utils/imageUtils';

function UploadSection({ onImageUpload }) {
    const [isProcessing, setIsProcessing] = useState(false);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles?.length > 0) {
            setIsProcessing(true);
            try {
                const base64 = await compressFile(acceptedFiles[0], 1024, 0.7);
                onImageUpload(base64);
            } catch (error) {
                console.error("Compression failed", error);
                alert("Upload failed, please try again.");
                setIsProcessing(false);
            }
        }
    }, [onImageUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false
    });

    return (
        <main className="flex-grow flex flex-col items-center justify-center w-full max-w-lg z-10 space-y-3 md:space-y-8 animate-fade-in py-1 md:py-4" style={{ animationDelay: '0.2s' }}>

            {/* The Frame - 1:1 Pixel Reconstruction of UI.png */}
            <div
                {...getRootProps()}
                className={`relative group w-[290px] h-[360px] md:w-[320px] md:h-[400px] cursor-pointer outline-none transition-all duration-700 animate-breathe ${isDragActive ? 'scale-[1.01]' : ''}`}
            >
                <input {...getInputProps()} />

                {/* The Absolute Master SVG - Drawing every line from UI.png */}
                <svg viewBox="0 0 320 400" className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible drop-shadow-[0_0_30px_rgba(184,149,95,0.25)]">
                    {/* Outer Border (Double) */}
                    <rect x="5" y="5" width="310" height="390" fill="none" stroke="#B8955F" strokeWidth="0.8" opacity="0.4" />
                    <rect x="8" y="8" width="304" height="384" fill="none" stroke="#B8955F" strokeWidth="0.4" opacity="0.2" />

                    {/* Stepped Inner Frame (The iconic shape in UI.png) */}
                    <path
                        d="M40,15 L280,15 L305,40 L305,360 L280,385 L40,385 L15,360 L15,40 Z"
                        fill="none" stroke="#B8955F" strokeWidth="1.2" opacity="0.75"
                    />

                    {/* Left & Right Decorative Railing Pattern */}
                    <g transform="translate(8, 100)">
                        <line x1="0" y1="0" x2="0" y2="200" stroke="#B8955F" strokeWidth="0.5" opacity="0.5" />
                        <path d="M-4,90 L4,100 L-4,110" fill="none" stroke="#B8955F" strokeWidth="0.8" opacity="0.6" />
                    </g>
                    <g transform="translate(312, 100)">
                        <line x1="0" y1="0" x2="0" y2="200" stroke="#B8955F" strokeWidth="0.5" opacity="0.5" />
                        <path d="M4,90 L-4,100 L4,110" fill="none" stroke="#B8955F" strokeWidth="0.8" opacity="0.6" />
                    </g>

                    {/* Top Fence detail */}
                    <g transform="translate(100, 10)">
                        {[...Array(24)].map((_, i) => (
                            <line key={i} x1={i * 5} y1="0" x2={i * 5} y2="8" stroke="#B8955F" strokeWidth="0.4" opacity="0.5" />
                        ))}
                    </g>

                    {/* Corner Radiating Details */}
                    <g transform="translate(15, 15)">
                        <path d="M0,45 L0,0 L45,0" fill="none" stroke="#B8955F" strokeWidth="1.8" />
                        <line x1="0" y1="0" x2="35" y2="35" stroke="#B8955F" strokeWidth="0.4" opacity="0.3" />
                    </g>
                    <g transform="translate(305, 15) scale(-1, 1)">
                        <path d="M0,45 L0,0 L45,0" fill="none" stroke="#B8955F" strokeWidth="1.8" />
                    </g>
                    <g transform="translate(15, 385) scale(1, -1)">
                        <path d="M0,45 L0,0 L45,0" fill="none" stroke="#B8955F" strokeWidth="1.8" />
                    </g>
                    <g transform="translate(305, 385) scale(-1, -1)">
                        <path d="M0,45 L0,0 L45,0" fill="none" stroke="#B8955F" strokeWidth="1.8" />
                    </g>

                    {/* Bottom Master Fan Component (Stepped Tiers) */}
                    <g transform="translate(160, 395)">
                        <path d="M-50,0 L-30,-25 L30,-25 L50,0 Z" fill="rgba(184, 149, 95, 0.1)" stroke="#B8955F" strokeWidth="0.6" opacity="0.5" />
                        <path d="M-30,0 L-10,-40 L10,-40 L30,0 Z" fill="rgba(184, 149, 95, 0.15)" stroke="#B8955F" strokeWidth="0.8" opacity="0.8" />
                        <path d="M-10,0 L0,-50 L10,0 Z" fill="rgba(184, 149, 95, 0.2)" stroke="#B8955F" strokeWidth="1.2" opacity="1" />
                    </g>
                </svg>

                {/* Content Container (Precise Icon & Text) */}
                <div className="w-full h-full flex flex-col items-center justify-center space-y-10 z-10 p-12">
                    {isProcessing ? (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-12 h-12 border-l-2 border-primary/40 border-t-2 border-primary rounded-full animate-spin"></div>
                            <span className="text-primary text-[10px] tracking-[1.2em] font-serif uppercase animate-pulse">凝练摩登</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-12 pt-4 transition-transform duration-700 group-hover:scale-105">
                            {/* Iconic Pentaprism Camera Icon from UI.png */}
                            <div className="relative animate-float">
                                <svg viewBox="0 0 24 24" className="w-16 h-16 md:w-20 md:h-20 fill-none stroke-[#B8955F] stroke-[0.35] opacity-90">
                                    {/* Body */}
                                    <path d="M3,8h18v12H3V8z" />
                                    {/* Pentaprism Top */}
                                    <path d="M9,8l1.5-3h3l1.5 3" />
                                    {/* Lens System */}
                                    <circle cx="12" cy="14" r="5" />
                                    <circle cx="12" cy="14" r="1.5" />
                                    <circle cx="12" cy="14" r="0.2" fill="#B8955F" stroke="none" />
                                    {/* Add Icon */}
                                    <path d="M18,14v4M16,16h4" strokeWidth="0.8" />
                                </svg>
                                <div className="absolute inset-0 bg-[#B8955F]/10 blur-3xl rounded-full opacity-30"></div>
                            </div>
                            <span className="text-[#B8955F] text-[12px] md:text-[13px] tracking-[0.5em] font-serif font-light text-center leading-relaxed opacity-90">
                                定格此刻光影，唤醒海派摩登
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Slogan Section (Typography Mastered - YaHei) */}
            <div className="text-center space-y-3 w-full z-10 px-4 mt-2">
                <h2 className="text-[17px] md:text-[20px] tracking-[0.15em] text-[#B8955F] font-normal leading-tight">
                    AI生成你的专属摩登月份牌
                </h2>
                <div className="flex items-center justify-center space-x-4 opacity-80">
                    <span className="text-[13px] md:text-[14px] tracking-[0.1em] text-[#B8955F] font-light">尽态极妍</span>
                    <span className="text-[12px] text-[#B8955F]/60">|</span>
                    <span className="text-[13px] md:text-[14px] tracking-[0.1em] text-[#B8955F] font-light">传世之美</span>
                </div>
            </div>
        </main>
    );
}

export default UploadSection;
