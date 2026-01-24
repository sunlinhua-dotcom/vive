import headerMain from '../assets/header-main.png';

function Header() {
    return (
        <header className="w-full flex justify-center z-10 animate-fade-in pt-8 md:pt-12 pb-4" style={{ animationDelay: '0.1s' }}>
            <div className="w-[80%] max-w-[400px] md:max-w-[500px] px-4">
                <img
                    src={headerMain}
                    alt="MODERN VIVE 摩登双妹"
                    className="w-full h-auto drop-shadow-[0_4px_30px_rgba(184,149,95,0.3)] pointer-events-none"
                />
            </div>
        </header>
    );
}

export default Header;
