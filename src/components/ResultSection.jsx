
import React from 'react';
import Header from './Header';
import './ResultSection.css';

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
        <div className="result-screen fade-in">
            {/* Header Removed as requested */}
            {/* <div className="result-header-wrapper">
                <Header />
            </div> */}

            {/* Immersive Image Container - Now with Frame */}
            <div className="result-image-container theme-framed">
                <div className="image-frame-inner">
                    <img src={resultImage} alt="Your 1930s Self" className="result-image-content" />
                    {/* Shine effect overlay */}
                    <div className="shine-overlay"></div>
                </div>
            </div>

            {/* Floating Action Dock */}
            <div className="action-dock">
                <div className="dock-glass-panel">
                    <button className="icon-btn secondary" onClick={onRetry}>
                        <div className="btn-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 12C21 16.9706 16.9706 21 12 21C9.69678 21 7.59216 20.1352 6 18.708L6.5 18M3 12C3 7.02944 7.02944 3 12 3C14.3032 3 16.4078 3.86477 18 5.292L17.5 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M17.5 6H21V2.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M6.5 18H3V21.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="btn-label">重试</span>
                    </button>

                    <button className="icon-btn primary-pulse" onClick={handleDownload}>
                        <div className="btn-icon">
                            {/* Premium Filled Arrow/Tray for Save */}
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 16L12 3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                <path d="M6 10L12 16L18 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M3 19V20C3 20.5523 3.44772 21 4 21H20C20.5523 21 21 20.5523 21 20V19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="btn-label">保存</span>
                    </button>

                    <button className="icon-btn secondary" onClick={onShare}>
                        <div className="btn-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 5L20 12L13 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M20 12H3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="btn-label">晒给闺蜜</span>
                    </button>
                </div>
            </div>
            {/* Removed confusing footer brand */}
        </div>
    );
};

export default ResultSection;
