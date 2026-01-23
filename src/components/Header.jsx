import headerLogo from '../assets/header-logo.png';

function Header() {
    return (
        <header className="w-full flex flex-col items-center z-10 animate-fade-in space-y-5 pt-8 md:pt-16" style={{ animationDelay: '0.1s' }}>
            {/* Top Brand Text */}
            <div className="flex items-center space-x-8 text-[9px] md:text-[11px] tracking-[0.8em] text-primary/60 font-serif font-light uppercase">
                <span>VIVE</span>
                <span className="text-primary/10 font-extralight text-lg scale-y-75">✕</span>
                <span className="pl-1">DIGIREPUB</span>
            </div>

            {/* Main Visual Logo */}
            <div className="flex flex-col items-center w-full max-w-[280px] md:max-w-[380px] px-4">
                <img
                    src={headerLogo}
                    alt="MODERN VIVE 摩登双妹"
                    className="w-full h-auto drop-shadow-[0_4px_40px_rgba(184,149,95,0.4)] pointer-events-none"
                />
            </div>
        </header>
    );
}

export default Header;
