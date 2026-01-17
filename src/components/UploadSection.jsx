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
            <div className="upload-header">
                <h2 className="upload-title">AI生成你的独家月份牌</h2>
                <p className="upload-subtitle">看看百年前你的摩登风华</p>
            </div>

            <div
                className={`upload-area ${isDragging ? 'dragging' : ''}`}
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="file-input"
                />

                <div className="upload-icon">
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                        <path d="M32 20v24M20 32h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </div>

                <div className="upload-text">
                    <span className="upload-main-text">上传你的自拍照</span>
                    <span className="upload-hint">点击或拖拽照片到此处</span>
                </div>
            </div>

            <div className="features">
                <div className="feature-item">
                    <div className="feature-icon">🎎</div>
                    <div className="feature-content">
                        <span className="feature-title">古韵风华</span>
                        <span className="feature-desc">民国旗袍造型</span>
                    </div>
                </div>
                <div className="feature-divider">+</div>
                <div className="feature-item">
                    <div className="feature-icon">👗</div>
                    <div className="feature-content">
                        <span className="feature-title">今朝摩登</span>
                        <span className="feature-desc">现代时尚穿搭</span>
                    </div>
                </div>
            </div>

            <p className="upload-footer">
                全网共晒双妹月份牌，看见百年摩登之美
            </p>
        </section>
    )
}

export default UploadSection
