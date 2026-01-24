import React, { useState, useEffect } from 'react';

const ParallaxBackground = () => {
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleOrientation = (event) => {
            // Gamma: Left/Right tilt (-90 to 90)
            // Beta: Front/Back tilt (-180 to 180)
            const { gamma, beta } = event;

            // Limit the tilt range to avoid extreme movements
            // Max shift: +/- 20px
            const maxShift = 20;
            const x = Math.min(Math.max(gamma / 2, -maxShift), maxShift);
            const y = Math.min(Math.max((beta - 45) / 2, -maxShift), maxShift);

            setOffset({ x: -x, y: -y }); // Invert for "depth" feel
        };

        // Check if permission is needed (iOS 13+)
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            // We can't request permission automatically on mount (must be user action)
            // So we wait for a global trigger or just fail gracefully to static.
            // For now, we'll try to listen if already granted.
            /* 
               Note: To prompt efficiently, we usually bind this to the first user interaction.
               For this implementation, we will add a small "Enable 3D" button or just let it be static on iOS 
               until verified. 
               However, standard browsers (Android) work directly.
            */
            window.addEventListener('deviceorientation', handleOrientation);
        } else {
            // Android / Desktop (dev tools)
            window.addEventListener('deviceorientation', handleOrientation);
        }

        // iOS 13+ Permission Trigger (One-time)
        const requestAccess = async () => {
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    const permission = await DeviceOrientationEvent.requestPermission();
                    if (permission === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation);
                    }
                } catch (e) {
                    console.error(e);
                }
            }
        };

        // Attach to body click to capture early interaction
        document.body.addEventListener('click', requestAccess, { once: true });

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
            document.body.removeEventListener('click', requestAccess);
        };
    }, []);

    return (
        <div
            className="fixed inset-[-5%] w-[110%] h-[110%] -z-50 pointer-events-none transition-transform duration-100 ease-out will-change-transform"
            style={{
                backgroundImage: "url('/BACKGROUND.jpeg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center bottom',
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`
            }}
        >
            {/* Optional Overlay for more depth */}
            <div className="absolute inset-0 bg-black/10"></div>
        </div>
    );
};

export default ParallaxBackground;
