
function Footer() {
    return (
        <footer className="w-full max-w-md z-10 pb-6 pt-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="w-8 h-px bg-brand-gold/40 mx-auto mb-6"></div>
            <div className="flex justify-between items-center px-6 text-xs tracking-[0.25em] font-light text-brand-gold">
                <div className="flex flex-col items-center group cursor-pointer transition-opacity hover:opacity-100 opacity-80">
                    <span>东情西韵</span>
                </div>
                <div className="flex flex-col items-center group cursor-pointer transition-opacity hover:opacity-100 opacity-80">
                    <span>奢美方兴</span>
                </div>
                <div className="flex flex-col items-center group cursor-pointer transition-opacity hover:opacity-100 opacity-80">
                    <span>智识先锋</span>
                </div>
            </div>
            <div className="mt-8 text-center">
                <p className="text-[9px] uppercase tracking-widest opacity-30">Luxury Vintage Fashion · 2026</p>
            </div>
        </footer>
    );
}

export default Footer;
