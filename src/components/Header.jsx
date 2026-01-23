
function Header() {
    return (
        <header className="w-full flex flex-col items-center justify-center z-10 animate-fade-in mt-4" style={{ animationDelay: '0.1s' }}>
            <div className="flex flex-col items-center w-full max-w-[280px]">
                <h1 className="text-brand-gold text-[3.5rem] leading-[0.85] font-display font-normal text-center tracking-tighter" style={{ fontStretch: 'ultra-condensed' }}>
                    <span className="block">MODERN</span>
                    <span className="block">VIVE</span>
                </h1>
                <div className="flex items-center justify-between w-full mt-2 px-1">
                    <div className="text-brand-gold text-3xl font-serif font-light tracking-wide leading-none">
                        摩登
                    </div>
                    <div className="mx-3 relative flex items-center justify-center">
                        <div className="w-16 h-16 border border-brand-gold transform rotate-45 flex items-center justify-center bg-transparent">
                            <div className="transform -rotate-45 flex flex-col items-center justify-center space-y-1">
                                <span className="text-brand-gold text-[10px] leading-none font-serif tracking-widest block">静待</span>
                                <span className="text-brand-gold text-[10px] leading-none font-serif tracking-widest block">相逢</span>
                            </div>
                        </div>
                        <div className="absolute -left-3 w-4 h-4 border border-brand-gold transform rotate-45"></div>
                        <div className="absolute -right-3 w-4 h-4 border border-brand-gold transform rotate-45"></div>
                    </div>
                    <div className="text-brand-gold text-3xl font-serif font-light tracking-wide leading-none">
                        双妹
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
