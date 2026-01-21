import { useRef, useState } from 'react'
import { compressFile } from '../utils/imageUtils'
import './UploadSection.css'

function UploadSection({ onImageUpload }) {
    const fileInputRef = useRef(null)
    const [isDragging, setIsDragging] = useState(false)

    const handleFileSelect = async (file) => {
        if (file && file.type.startsWith('image/')) {
            try {
                // 前端直接压缩：最大宽1024px，质量0.7
                // 这将瞬间把 10MB 的照片变成 ~200KB，极大加速体验
                console.log("正在进行前端极速压缩...");
                const compressedBase64 = await compressFile(file, 1024, 0.7);
                console.log("压缩完成，准备上传");
                onImageUpload(compressedBase64);
            } catch (error) {
                console.error("图片压缩失败:", error);
                // 压缩失败时的兜底：使用原始 FileReader（虽然慢但能用）
                const reader = new FileReader();
                reader.onload = (e) => onImageUpload(e.target.result);
                reader.readAsDataURL(file);
            }
        }
    }

    const handleClick = () => {
        fileInputRef.current.click()
    }

    const handleChange = (e) => {
        const file = e.target.files[0]
        handleFileSelect(file)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        handleFileSelect(file)
    }

    return (
        <section className="upload-section fade-in">
            <header className="upload-header">
                {/* 顶部联名露出：高端、低调但清晰 */}
                <div style={{
                    fontFamily: '"Playfair Display", serif',
                    color: 'var(--vive-gold)',
                    fontSize: '0.9rem',
                    letterSpacing: '2px',
                    marginBottom: '0.5rem',
                    opacity: 0.9,
                    fontWeight: 600
                }}>
                    VIVE <span style={{ fontSize: '0.7em', verticalAlign: 'middle', margin: '0 4px' }}>✕</span> DIGIREPUB
                </div>
                <h1 className="upload-title">MODERN ENCOUNTER</h1>
                <p className="upload-subtitle">双妹·摩登奇遇</p>
            </header>

            <div
                className={`upload-area ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="file-input"
                    accept="image/*"
                    onChange={handleChange}
                />

                <div className="upload-icon">
                    {/* 使用更精致的加号图标 (Thin stroke) */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M12 5v14M5 12h14" strokeLinecap="square" />
                    </svg>
                </div>

                <div className="upload-text">
                    <span className="upload-main-text">Unlock Your Modern Look</span>
                    <span className="upload-hint">点击或拖拽照片，开启百年穿越</span>
                </div>
            </div>

            <div className="features">
                <div className="feature-item">
                    <span className="feature-icon">💃</span>
                    <div className="feature-content">
                        <span className="feature-title">古韵风华</span>
                        <span className="feature-desc">1930s Shanghai Chic</span>
                    </div>
                </div>
                <div className="feature-divider">+</div>
                <div className="feature-item">
                    <span className="feature-icon">👗</span>
                    <div className="feature-content">
                        <span className="feature-title">今朝摩登</span>
                        <span className="feature-desc">2026 Modern Elegance</span>
                    </div>
                </div>
            </div>

            <div className="upload-footer">
                <div className="footer-slogan">全网共晒双妹月份牌 · 看见百年摩登之美</div>

                {/* 大合数码 Digirepub 品牌深度露出 */}
                <div className="partner-branding" style={{
                    marginTop: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                }}>
                    <div style={{
                        padding: '4px 16px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(197, 160, 101, 0.4)',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        color: 'var(--vive-gold)',
                        letterSpacing: '1.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span>●</span> 年会预览版 · Annual Meeting Preview
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column', // 改为垂直布局，让Logo更大
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '5px'
                    }}>
                        <span style={{
                            fontSize: '0.65rem',
                            color: 'rgba(255,255,255,0.4)',
                            textTransform: 'uppercase',
                            letterSpacing: '2px'
                        }}>Official Creative AI Partner</span>

                        {/* Logo 放大且保持原色 */}
                        <img
                            src="/digirepub-logo.png"
                            alt="Digirepub"
                            style={{
                                height: '36px', // 放大到 36px
                                objectFit: 'contain',
                                filter: 'brightness(1.15) contrast(1.1)', // 稍微提亮增强质感
                            }}
                        />
                    </div>
                </div>
            </div>      </section>
    )
}

export default UploadSection
