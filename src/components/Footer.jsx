import React from 'react';
import footerLogo from '../assets/footer-logo.png';

const Footer = ({ version }) => {
    return (
        <footer className="w-full text-center py-4 z-10 fade-in-up delay-300 flex flex-col items-center">
            {/* Using the Official Provided Combined Logo - Guaranteed 100% Accuracy */}
            <div className="flex items-center justify-center w-full px-10 pt-2 transition-all duration-700">
                <img
                    src={footerLogo}
                    alt="VIVE x DIGIREPUB Official"
                    className="w-full max-w-[340px] md:max-w-[420px] h-auto pointer-events-none drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)] opacity-60"
                />
            </div>

            {/* Version Indicator */}
            {version && <p className="text-[10px] text-white/30 font-mono mt-2">{version}</p>}

            {/* Hidden accessibility text */}
            <p className="sr-only">VIVE x DIGIREPUB Official Partnership 2026</p>
        </footer>
    );
}

export default Footer;
