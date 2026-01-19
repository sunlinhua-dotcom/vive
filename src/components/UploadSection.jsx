import { useRef, useState } from 'react'
import './UploadSection.css'

function UploadSection({ onImageUpload }) {
    const fileInputRef = useRef(null)
    const [isDragging, setIsDragging] = useState(false)

    const handleFileSelect = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                onImageUpload(e.target.result)
            }
            reader.readAsDataURL(file)
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
                全网共晒双妹月份牌 · 看见百年摩登之美
            </div>      </section>
    )
}

export default UploadSection
