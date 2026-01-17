
import { useRef } from 'react'
import './ResultSection.css'

function ResultSection({ results, onReset }) {
    const scrollRef = useRef(null)

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = results.fusionImage;
        link.download = `VIVE_Modern_Calendar_${results.month}_${results.year}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const {
        fusionImage,
        keyword,
        attitude,
        month,
        year,
        imageType = 'raw',
        errors
    } = results

    return (
        <section className="result-section fade-in">
            <div className="layout-container">

                <div className="info-panel">
                    <h2 className="info-title">YOUR STYLE KEYWORD</h2>
                    <div className="info-keyword">{keyword}</div>
                    <div className="info-attitude">“{attitude}”</div>
                </div>

                <div className="poster-container" ref={scrollRef}>
                    <div className="poster-card slide-up" style={{ background: '#000' }}>

                        {imageType === 'composite' ? (
                            /* ====== 模式 A: 完美合成图 ====== */
                            <img
                                src={fusionImage}
                                alt="Modern Calendar"
                                className="fusion-image"
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                        ) : (
                            /* ====== 模式 B: 前端合成 (降级方案) ====== */
                            <>
                                <div className="poster-header-row">
                                    <div className="header-left">
                                        <span className="poster-date-en">{month} {year}</span>
                                    </div>
                                    <div className="header-center">
                                        <div className="logo-group">
                                            <div className="logo-since">SINCE 1898</div>
                                            {/* 使用透明PNG，无需混合模式 */}
                                            <img
                                                src="/logo-white.png"
                                                alt="VIVE"
                                                className="main-logo"
                                                style={{ mixBlendMode: 'normal', filter: 'none' }}
                                            />
                                            <div className="logo-cn">雙妹</div>
                                        </div>
                                    </div>
                                    <div className="header-right">
                                        <span className="poster-date-cn">农历丙午年 虎月</span>
                                    </div>
                                </div>

                                <div className="background-watermark">
                                    <div className="watermark-line">MOD</div>
                                    <div className="watermark-line indent">ERN</div>
                                    <div className="watermark-line smaller">VIVE</div>
                                </div>

                                <div className="poster-image-area">
                                    {fusionImage ? (
                                        <img src={fusionImage} alt="古今双妹" className="fusion-image" />
                                    ) : (
                                        <div className="placeholder-image">
                                            <div>生成失败</div>
                                            {errors?.global && <div className="error-debug">{errors.global}</div>}
                                        </div>
                                    )}
                                </div>

                                <div className="poster-footer">
                                    <div className="footer-left">
                                        <div className="footer-label">你的摩登关键词是</div>
                                        <div className="footer-keyword">{keyword}</div>
                                    </div>
                                    <div className="footer-right">
                                        <div className="calendar-grid">
                                            <div className="calendar-week-row">
                                                <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                                            </div>
                                            <div className="calendar-days-grid">
                                                <span></span><span></span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                                                <span>6</span><span>7</span><span>8</span><span>9</span><span>10</span><span>11</span><span>12</span>
                                                <span>13</span><span>14</span><span>15</span>...
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="action-buttons slide-up" style={{ animationDelay: '0.8s' }}>
                {imageType === 'composite' && (
                    <button className="btn-primary" onClick={handleDownload}>
                        下载高清海报
                    </button>
                )}
                <button className="btn-secondary" onClick={onReset}>
                    重新生成
                </button>
            </div>
        </section>
    )
}

export default ResultSection
