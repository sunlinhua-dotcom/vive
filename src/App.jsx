
import { useState, useEffect } from 'react'
import Header from './components/Header'
import UploadSection from './components/UploadSection'
import GeneratingScreen from './components/GeneratingScreen'
import ResultSection from './components/ResultSection'
import Footer from './components/Footer'
import { analyzeImageAndGenerateCopy, generateFashionImages } from './services/gemini'

import { getUserStorageKey, getClientUUID } from './utils/uuid'
import ParallaxBackground from './components/ParallaxBackground'


import Admin from './pages/Admin'

function App() {
  // Simple Hash Routing for Internal Admin Tools
  const [isAdmin, setIsAdmin] = useState(window.location.hash === '#/admin');

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdmin(window.location.hash === '#/admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);



  const [step, setStep] = useState('upload') // 'upload' | 'generating' | 'result'
  // ... existing state initialization ...
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

  // Dynamic Loading Messages
  useEffect(() => {
    if (step === 'generating') {
      const messages = [
        "正在开启时光隧道 (2026 -> 1930)...",
        "正在以此刻容颜，演绎双面摩登...",
        "正在为您量体裁衣，定制旗袍...",
        "正在显影底片，定格摩登瞬间...",
        "正在渲染 Art Deco 建筑细节...",
        "即将抵达..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingText(messages[i % messages.length]);
        i++;
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleImageUpload = async (imageDataUrl) => {
    // [CRITICAL FIX] Prevent Double Submission on Mobile
    if (step === 'generating') return;

    setUploadedImage(imageDataUrl)
    setStep('generating')
    // Start smoothly from 0
    setProgress(0)

    // Smooth Progress Simulation
    // 0-30%: Fast (Initializing)
    // 30-70%: Medium (AI Processing)
    // 70-98%: Slow (Finalizing)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99) return prev;

        let increment = 0;
        if (prev < 30) increment = 2;       // Fast start
        else if (prev < 70) increment = 0.5; // Steady processing
        else increment = 0.1;               // Creep at the end

        return Math.min(prev + increment, 99);
      });
    }, 100);

    try {
      // 1. Unified Compression
      const { compressImage } = await import('./utils/imageUtils');
      const compressedImage = await compressImage(imageDataUrl, 1024);

      // 2. Parallel Processing
      // ... processing logic remains same, but remove manual setProgress/setLoadingText calls

      const analysisPromise = analyzeImageAndGenerateCopy(compressedImage)
        .then(res => {
          console.log("Text Analysis Done");
          return res;
        });

      const imagePromise = generateFashionImages(null, compressedImage)
        .then(res => {
          console.log("Image Generation Done");
          return res;
        });

      // Wait for both
      const [analysis, images] = await Promise.all([analysisPromise, imagePromise]);

      clearInterval(progressInterval);
      // API Finished, starting composition. Set to 90% (not 100 to avoid backward jump)
      setProgress(90);

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

          // Composition happening...
          finalImage = await composeFinalImage(images.fusionImage, compositeData);

          // Done
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
      clearInterval(progressInterval);
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

  if (isAdmin) {
    return <Admin />;
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

      {/* Main Content - Scrollable for Results */}
      <div className="flex-grow w-full z-10 py-2 overflow-y-auto no-scrollbar">
        <div className="w-full flex flex-col items-center justify-center min-h-full">
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
      </div>

      {/* Footer - Always Visible, Pinned to Bottom */}
      {step === 'upload' && <Footer />}
    </div>
  )
}

export default App
