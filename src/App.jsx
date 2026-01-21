
import { useState, useEffect } from 'react'
import Header from './components/Header'
import UploadSection from './components/UploadSection'
import GeneratingScreen from './components/GeneratingScreen'
import ResultSection from './components/ResultSection'
import Footer from './components/Footer'
import { analyzeImageAndGenerateCopy, generateFashionImages } from './services/gemini'
import './App.css'

function App() {
  const [step, setStep] = useState('upload') // 'upload' | 'generating' | 'result'
  const [uploadedImage, setUploadedImage] = useState(null)
  const [generatedResults, setGeneratedResults] = useState(null)
  const [loadingText, setLoadingText] = useState("")
  const [progress, setProgress] = useState(0)

  // Check for saved result on mount
  useEffect(() => {
    const savedResult = localStorage.getItem('vive_result');
    if (savedResult) {
      try {
        const parsed = JSON.parse(savedResult);
        if (parsed.fusionImage) {
          setGeneratedResults(parsed);
          setStep('result');
        }
      } catch (e) { /* ignore */ }
    }
  }, []);

  const handleImageUpload = async (imageDataUrl) => {
    setUploadedImage(imageDataUrl)
    setStep('generating')
    setProgress(5)
    setLoadingText("正在读取您的摩登密码...")

    try {
      // 1. 调用 Gemini Flash 分析图片并生成文案
      setProgress(15)
      const analysis = await analyzeImageAndGenerateCopy(imageDataUrl)

      // 更新加载文案
      if (analysis.loading_text) {
        setLoadingText(analysis.loading_text)
      }
      setProgress(30)

      // 2. 调用 Gemini Image 生成图片
      setLoadingText("正在创造您的跨时空双生...")
      const images = await generateFashionImages(analysis.features, imageDataUrl)
      setProgress(70)

      // 3. 智能合成：将 Logo、文案、底图烧录成一张图
      setLoadingText("正在为您合成摩登月份牌...")

      let finalImage = images.fusionImage;
      const currentDate = new Date()
      const month = currentDate.toLocaleString('en-US', { month: 'long' }).toUpperCase()
      const year = currentDate.getFullYear()

      if (images.fusionImage && !images.fusionImage.startsWith('ERROR')) {
        try {
          // 动态导入合成引擎以节省初始包体积
          const { composeFinalImage } = await import('./utils/imageCompositor');

          const compositeData = {
            month,
            year,
            keyword: analysis.keyword,
            attitude: analysis.attitude,
            logoColor: 'white'
          };

          setProgress(85)
          console.log("Starting composition...");
          finalImage = await composeFinalImage(images.fusionImage, compositeData);
          console.log("Composition success!");
          setProgress(100)

        } catch (composeError) {
          console.error("Composition failed, falling back to raw image", composeError);
        }
      }

      // 4. 组合结果
      const result = {
        month,
        year,
        keyword: analysis.keyword,
        attitude: analysis.attitude,
        fusionImage: finalImage,
        imageType: (finalImage && finalImage.startsWith('data:')) ? 'composite' : 'raw',
        errors: images.errors
      };

      setGeneratedResults(result)

      // Save to localStorage
      localStorage.setItem('vive_result', JSON.stringify(result));

      setStep('result')

    } catch (error) {
      console.error("Workflow failed:", error)
      const errorMsg = error.response ? `API Error: ${error.response.status}` : error.message;
      alert(`抱歉，生成中断。\n错误详情: ${errorMsg}\n请尝试刷新页面或检查网络。`)
      setStep('upload')
    }
  }

  const handleReset = () => {
    localStorage.removeItem('vive_result');
    setStep('upload')
    setUploadedImage(null)
    setGeneratedResults(null)
    setLoadingText("")
    setProgress(0)
  }

  return (
    <div className="app">
      {/* 左侧：品牌视觉区 (仅 Desktop 显示) */}

      {/* 全屏内容 */}
      {step === 'upload' && (
        <UploadSection onImageUpload={handleImageUpload} />
      )}

      {step === 'generating' && (
        <GeneratingScreen
          uploadedImage={uploadedImage}
          loadingText={loadingText}
          progress={progress}
        />
      )}

      {step === 'result' && generatedResults && (
        <ResultSection
          resultImage={generatedResults.fusionImage}
          onRetry={handleReset}
          onShare={() => {
            if (navigator.share && generatedResults.fusionImage) {
              fetch(generatedResults.fusionImage)
                .then(res => res.blob())
                .then(blob => {
                  const file = new File([blob], 'vive-modern-encounter.jpg', { type: 'image/jpeg' });
                  navigator.share({ files: [file], title: 'VIVE 摩登奇遇' });
                })
                .catch(err => console.error('Share failed:', err));
            } else {
              alert('您的浏览器不支持原生分享，请长按图片保存后分享');
            }
          }}
        />
      )}
    </div>
  )
}

export default App
