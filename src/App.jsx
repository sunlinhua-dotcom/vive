
import { useState, useEffect } from 'react'
import Header from './components/Header'
import UploadSection from './components/UploadSection'
import GeneratingScreen from './components/GeneratingScreen'
import ResultSection from './components/ResultSection'
import Footer from './components/Footer'
import { analyzeImageAndGenerateCopy, generateFashionImages } from './services/gemini'

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
      setProgress(15)
      const analysis = await analyzeImageAndGenerateCopy(imageDataUrl)

      if (analysis.loading_text) {
        setLoadingText(analysis.loading_text)
      }
      setProgress(30)

      setLoadingText("正在创造您的跨时空双生...")
      const images = await generateFashionImages(analysis.features, imageDataUrl)
      setProgress(70)

      setLoadingText("正在为您合成摩登月份牌...")

      let finalImage = images.fusionImage;
      const currentDate = new Date()
      const month = currentDate.toLocaleString('en-US', { month: 'long' }).toUpperCase()
      const year = currentDate.getFullYear()

      if (images.fusionImage && !images.fusionImage.startsWith('ERROR')) {
        try {
          const { composeFinalImage } = await import('./utils/imageCompositor');

          const compositeData = {
            month,
            year,
            keyword: analysis.keyword,
            attitude: analysis.attitude,
            logoColor: 'white'
          };

          setProgress(85)
          finalImage = await composeFinalImage(images.fusionImage, compositeData);
          setProgress(100)

        } catch (composeError) {
          console.error("Composition failed, falling back to raw image", composeError);
        }
      }

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
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between py-8 px-6">
      {/* Background Decorations */}
      <div className="paper-overlay"></div>
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-gold-accent opacity-5 dark:opacity-10 rounded-full blur-3xl z-0"></div>
      <div className="absolute bottom-0 -left-20 w-80 h-80 bg-primary opacity-5 dark:opacity-10 rounded-full blur-3xl z-0"></div>

      {/* Header - Always visible on upload, hides on other steps if desired or keep fixed */}
      {step === 'upload' && <Header />}

      {/* Main Content */}
      <div className="flex-grow w-full flex flex-col items-center justify-center z-10">
        {step === 'upload' && (
          <UploadSection onImageUpload={handleImageUpload} />
        )}

        {step === 'generating' && (
          <div className="w-full max-w-md">
            <GeneratingScreen
              uploadedImage={uploadedImage}
              loadingText={loadingText}
              progress={progress}
            />
          </div>
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

      {/* Footer - Always visible on upload */}
      {step === 'upload' && <Footer />}
    </div>
  )
}

export default App
