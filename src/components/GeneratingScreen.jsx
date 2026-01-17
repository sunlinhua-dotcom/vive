
import { useState, useEffect } from 'react'
import './GeneratingScreen.css'

function GeneratingScreen({ uploadedImage, loadingText }) {
    const [progress, setProgress] = useState(0)
    const [currentTip, setCurrentTip] = useState(0)

    // 模拟进度条：前30秒快，后面慢，无限逼近99%直到完成
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(old => {
                if (old < 30) return old + 2; // 前15秒：快速到30%
                if (old < 70) return old + 0.5; // 中间段：匀速
                if (old < 95) return old + 0.1; // 后期：极慢
                return old; // 停在 95% 等待
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    // 轮播提示语，缓解等待焦虑
    const tips = [
        "正在回溯 1930 年的上海滩...",
        "正在为您挑选最适合的旗袍面料...",
        "AI 摄影师正在寻找最佳光影...",
        "正在冲洗胶片，双妹即将登场...",
        "精工细作，绝代风华值得等待..."
    ];

    useEffect(() => {
        const tipTimer = setInterval(() => {
            setCurrentTip(prev => (prev + 1) % tips.length)
        }, 8000) // 每8秒换一句
        return () => clearInterval(tipTimer)
    }, [])

    return (
        <div className="generating-screen fade-in">
            <div className="content-wrapper">

                {/* 图片扫描特效 */}
                <div className="image-scanner">
                    <img
                        src={uploadedImage}
                        alt="User"
                        className="source-image"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                            e.target.onerror = null; // 防止死循环
                            e.target.src = '/vive-logo-dark.jpg'; // 兜底 Logo
                        }}
                    />
                    <div className="scan-line"></div>
                    <div className="scan-overlay"></div>
                </div>

                {/* 进度指示 */}
                <div className="status-container">
                    <div className="loading-text">
                        {/* 优先显示传入的 loadingText (通常是分析完成后的文案)，否则显示轮播 Tips */}
                        {loadingText && loadingText !== "正在读取您的摩登密码..." ? loadingText : tips[currentTip]}
                    </div>

                    <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>

                    <div className="progress-percentage">{Math.floor(progress)}%</div>

                    {/* 常驻提示：管理用户预期 */}
                    <div className="wait-warning fade-in" style={{ marginTop: '20px', color: '#c5a065', fontSize: '0.9rem', maxWidth: '80%' }}>
                        为呈现极致的 8K 级光影细节，<br />本次生成可能需要 <b>3～5 分钟</b>，请勿关闭页面。
                    </div>

                    {/* 超时安抚：如果超过 60% (约1分钟)，显示额外提示 */}
                    {progress > 60 && (
                        <div className="slow-notice fade-in">
                            AI 正在精细绘制您的面部微表情...
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default GeneratingScreen
