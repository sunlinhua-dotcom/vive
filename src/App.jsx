
import { useState, useEffect } from 'react'
import Header from './components/Header'
import UploadSection from './components/UploadSection'
import GeneratingScreen from './components/GeneratingScreen'
import ResultSection from './components/ResultSection'
import Footer from './components/Footer'
import { analyzeImageAndGenerateCopy, generateFashionImages } from './services/gemini'

import { getUserStorageKey, getClientUUID } from './utils/uuid'
import ParallaxBackground from './components/ParallaxBackground'


function App() {
  const [step, setStep] = useState('upload') // 'upload' | 'generating' | 'result'
  const [uploadedImage, setUploadedImage] = useState(null)
  const [generatedResults, setGeneratedResults] = useState(null)
  const [loadingText, setLoadingText] = useState("")
  const [progress, setProgress] = useState(0)

  // Check for saved result on mount (Scoped by User UUID)
  useEffect(() => {
    const userKey = getUserStorageKey('vive_result');
    console.log(`[App] Initializing Session. Client UUID: ${getClientUUID()}`);

    const savedResult = localStorage.getItem(userKey);
    if (savedResult) {
      try {
        const parsed = JSON.parse(savedResult);
        if (parsed.fusionImage) {
          setGeneratedResults(parsed);
          setStep('result');
        }
      } catch { /* ignore */ }
    }
  }, []);

  // Import compression utility at top level if possible, or inside dynamically
  // To avoid breaking existing imports, we'll use dynamic import for utility or assume it's available via gemini service's transitive import? 
  // Better to import it directly. But since I can't easily change top imports without reading file start, I'll use the one from utils.

  const handleImageUpload = async (imageDataUrl) => {
    setUploadedImage(imageDataUrl)
    setStep('generating')
    setProgress(5)
    setLoadingText("正在极速连接摩登时空 (并行加速中)...")

    try {
      // 1. 统一压缩 (Unified Compression) - Client Side
      // Target 1024px is good for both Text Analysis and Image Generation
      setProgress(10)
      const { compressImage } = await import('./utils/imageUtils');
      const compressedImage = await compressImage(imageDataUrl, 1024);

      // 2. 并行执行 (Parallel Processing)
      setProgress(20)
      setLoadingText("正在同时解析面孔与编织梦境...")

      // 启动一个定时器，每 500ms 增加 1-2%，直到 75%
      // 启动一个定时器，每 500ms 增加，直到 98% (避免卡在 75%)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 98) return prev;
          // 快到 70% 时减速，超过 85% 时极慢蠕动
          const increment = prev > 85 ? 0.2 : (prev > 70 ? 0.5 : Math.random() * 3);
          return prev + increment;
        });
      }, 500);

      const analysisPromise = analyzeImageAndGenerateCopy(compressedImage)
        .then(res => {
          console.log("Text Analysis Done");
          setLoadingText("您的摩登关键词已浮现...") // 中间反馈
          return res;
        });

      const imagePromise = generateFashionImages(null, compressedImage)
        .then(res => {
          console.log("Image Generation Done");
          return res;
        });

      // Wait for both
      const [analysis, images] = await Promise.all([analysisPromise, imagePromise]);

      // 清除定时器，跳到 85%
      clearInterval(progressInterval);
      setProgress(85);
      setLoadingText("正在为您合成摩登月份牌...")

      // 3. 后处理 (Composition)
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

          setProgress(90)
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
      const userKey = getUserStorageKey('vive_result');
      localStorage.setItem(userKey, JSON.stringify(result));
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
    <div className="relative h-screen w-full flex flex-col items-center justify-between py-2 px-6 overflow-hidden">
      {/* 3D Gyroscope Background */}
      <ParallaxBackground />

      {/* Background Decorations & Effects */}
      <div className="sunray-bg"></div>

      {/* Subtle Vignette */}
      <div className="fixed inset-0 pointer-events-none z-[1] bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)]"></div>

      {/* Header - Always Visible */}
      <Header />

      {/* Main Content */}
      <div className="flex-grow w-full flex flex-col items-center justify-center z-10 py-2">
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
            data={generatedResults}
            onReset={handleReset}
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
