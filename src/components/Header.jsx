import './Header.css'

function Header() {
    return (
        <header className="header">
            <div className="header-content">
                <div className="brand">
                    <img src="/vive-logo-light.jpg" alt="VIVE 双妹" className="brand-logo" />
                </div>
                <div className="header-tagline">
                    <span className="tagline-text">衣而奇华 · 虎月</span>
                </div>
            </div>
        </header>
    )
}

export default Header
