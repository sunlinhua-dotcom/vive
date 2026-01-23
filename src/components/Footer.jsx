
function Footer() {
    return (
        <footer className="w-full max-w-lg z-10 pb-6 md:pb-12 pt-0 animate-fade-in flex flex-col items-center" style={{ animationDelay: '0.3s' }}>

            {/* Using the Official Provided Combined Logo - Guaranteed 100% Accuracy */}
            <div className="flex items-center justify-center w-full px-10 pt-2 transition-all duration-700">
                <img
                    src="/footer-logo.png"
                    alt="VIVE x DIGIREPUB Official"
                    className="w-full max-w-[340px] md:max-w-[420px] h-auto pointer-events-none drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                />
            </div>

            {/* Hidden accessibility text */}
            <p className="sr-only">VIVE x DIGIREPUB Official Partnership 2026</p>
        </footer>
    );
}

export default Footer;
