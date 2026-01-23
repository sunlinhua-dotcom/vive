
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { compressFile } from '../utils/imageUtils'

function UploadSection({ onImageUpload }) {
    const [isProcessing, setIsProcessing] = useState(false);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles?.length > 0) {
            setIsProcessing(true);
            try {
                // Instant feedback - compress immediately
                const base64 = await compressFile(acceptedFiles[0], 1024, 0.7);
                onImageUpload(base64);
            } catch (error) {
                console.error("Compression failed", error);
                alert("Upload failed, please try again.");
                setIsProcessing(false);
            }
        }
    }, [onImageUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false
    })

    return (
        <main className="flex-grow flex flex-col items-center justify-center w-full max-w-md z-10 space-y-8 animate-fade-in mt-8" style={{ animationDelay: '0.2s' }}>
            <div
                {...getRootProps()}
                className={`relative group w-64 h-80 md:w-72 md:h-96 cursor-pointer transition-transform duration-500 hover:scale-[1.01] ${isDragActive ? 'scale-[1.02]' : ''}`}
            >
                <input {...getInputProps()} />
                <div className="absolute inset-0 border border-brand-gold/30 dark:border-brand-gold/20 rounded-tl-3xl rounded-br-3xl"></div>
                <div className="absolute inset-2 border border-brand-gold/60 dark:border-brand-gold/50 rounded-tl-2xl rounded-br-2xl flex flex-col items-center justify-center bg-white/40 dark:bg-black/20 backdrop-blur-sm shadow-sm transition-colors duration-300 group-hover:bg-white/60 dark:group-hover:bg-white/5">
                    {isProcessing ? (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-brand-gold/80 text-[10px] tracking-widest font-serif uppercase">凝练中...</span>
                        </div>
                    ) : (
                        <>
                            <div className="text-brand-gold transition-transform duration-500 group-hover:rotate-90">
                                <span className="material-icons text-4xl font-light">add</span>
                            </div>
                            <span className="mt-4 text-brand-gold/80 text-xs tracking-[0.2em] font-serif uppercase">Upload Photo</span>
                        </>
                    )}
                </div>
            </div>

            <div className="text-center space-y-3">
                <h2 className="font-display text-xl tracking-wider font-medium text-brand-gold">Unlock Your Modern Look</h2>
                <p className="text-xs tracking-widest opacity-60">点击或拖拽照片 · 开启百年穿越</p>
            </div>
        </main>
    )
}

export default UploadSection
