
import { useState, useEffect } from 'react'
import './GeneratingScreen.css'

function GeneratingScreen({ uploadedImage, loadingText, progress = 0 }) {
    const [year, setYear] = useState(2025);

    // Simulate Year Countdown sync with progress 
    // If progress 0->100, Year 2025 -> 1930
    useEffect(() => {
        const targetYear = 2025 - Math.floor((2025 - 1930) * (progress / 100));
        setYear(targetYear);
    }, [progress]);

    return (
        <div className="generating-screen fade-in">
            <div className="time-tunnel">
                {/* 核心视觉：脉冲光环 */}
                <div className="pulse-ring ring-1"></div>
                <div className="pulse-ring ring-2"></div>
                <div className="pulse-ring ring-3"></div>

                {/* 中心用户头像 */}
                <div className="avatar-container">
                    <img
                        src={uploadedImage}
                        className="tunnel-avatar"
                        alt="Time Traveler"
                    />
                    <div className="avatar-glow"></div>
                </div>
            </div>

            <div className="status-display">
                <div className="year-counter">{year}</div>
                <div className="phase-text">{loadingText || "正在开启时光隧道..."}</div>

                {/* Real Progress Bar */}
                <div className="real-progress-container">
                    <div className="real-progress-track">
                        <div className="real-progress-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="real-progress-number">{Math.round(progress)}%</div>
                </div>
            </div>

            <div className="brand-watermark">
                <span className="brand-vive">VIVE</span>
                <span className="brand-x">×</span>
                <span className="brand-partner">DIGIREPUB</span>
            </div>
        </div>
    )
}

export default GeneratingScreen
