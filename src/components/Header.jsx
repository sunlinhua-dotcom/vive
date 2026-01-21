import { useState, useEffect } from 'react'
import { processLogo } from '../utils/logoProcessor'
import './Header.css'

function Header() {
    const [logoSrc, setLogoSrc] = useState(null);

    useEffect(() => {
        // 动态处理 Logo，去除白底
        processLogo('/vive-logo-light.jpg', { threshold: 230 })
            .then(transparentLogo => setLogoSrc(transparentLogo));
    }, []);

    return (
        <header className="header">
            <div className="header-content">
                <div className="brand">
                    {/* 使用处理后的透明 Logo，如果是 null (还没处理完) 先显示原图占位但 opacity 0 */}
                    {logoSrc ? (
                        <img src={logoSrc} alt="VIVE 双妹" className="brand-logo" />
                    ) : (
                        <img src="/vive-logo-light.jpg" alt="Loading..." className="brand-logo" style={{ opacity: 0 }} />
                    )}
                </div>
                {/* <div className="header-tagline">
                    <span className="tagline-text">衣而奇华 · 虎月</span>
                </div> */}
            </div>
        </header>
    )
}

export default Header
