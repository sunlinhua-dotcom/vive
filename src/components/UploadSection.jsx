
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { compressFile } from '../utils/imageUtils'
import './UploadSection.css'

function UploadSection({ onImageUpload }) {
    const [isProcessing, setIsProcessing] = useState(false);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (acceptedFiles?.length > 0) {
            setIsProcessing(true);
            try {
                // Instant feedback - compress immediately
                // Max 1024px width for speed
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
        <div className="upload-section fade-in">
            <div className="upload-header">
                <div className="header-collab">VIVE x DIGIREPUB</div>
                <div className="upload-title">TIMELESS CHIC</div>
                <div className="upload-subtitle">双妹 · 寻找世上的另一个你</div>
            </div>

            {/* Upload Area */}
            <div
                {...getRootProps()}
                className={`upload-area ${isDragActive ? 'dragging' : ''}`}
            >
                <input {...getInputProps()} />

                {isProcessing ? (
                    <div className="processing-state">
                        <div className="upload-spinner"></div>
                        <div className="upload-main-text" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
                            正在穿越时光...
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="upload-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                        <div className="upload-text">
                            <span className="upload-main-text">Who were you in 1930?</span>
                            <span className="upload-hint">上传一张自拍，揭开你的民国前世</span>
                        </div>
                    </>
                )}
            </div>

            {/* Campaign Tagline */}
            <div className="campaign-tagline">
                寻回东方骨相美 · 闺蜜圈都在晒的摩登大片
            </div>

            {/* Features (Decorative) */}
            <div className="features">
                <div className="feature-item">
                    <span className="feature-title">画报级质感</span>
                </div>
                <div className="feature-divider">|</div>
                <div className="feature-item">
                    <span className="feature-title">独家高定</span>
                </div>
                <div className="feature-divider">|</div>
                <div className="feature-item">
                    <span className="feature-title">惊艳朋友圈</span>
                </div>
            </div>

            {/* Footer Branding */}
            <div className="upload-footer">
                <div className="partner-branding">
                    {/* Badge */}
                    <div className="partner-badge">年会预览版 · Annual Meeting Preview</div>

                    <div className="partner-content-row">
                        <div className="partner-logo-container">
                            <img src="/digirepub-logo.png" alt="Digirepub" style={{ height: '32px' }} />
                        </div>
                        <div className="partner-info-col">
                            <div className="brand-role">OFFICIAL</div>
                            <div className="brand-role">CREATIVE AI PARTNER</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UploadSection
