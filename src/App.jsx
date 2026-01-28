
import { useState, useEffect } from 'react'
import Header from './components/Header'
import UploadSection from './components/UploadSection'
import GeneratingScreen from './components/GeneratingScreen'
import ResultSection from './components/ResultSection'
import Footer from './components/Footer'
import { analyzeImageAndGenerateCopy, generateFashionImages } from './services/gemini'
// Preload utility modules for faster generation
import { compressImage } from './utils/imageUtils'
import { composeFinalImage } from './utils/imageCompositor'
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
          // eslint-disable-next-line react-hooks/exhaustive-deps
          // Safe: Only runs once on mount (empty deps array), no cascading renders
          setGeneratedResults(() => parsed);
          setStep(() => 'result');
        }
      } catch { /* ignore */ }
    }
  }, []);

  // Dynamic Loading Messages
  useEffect(() => {
    if (step === 'generating') {
      const messages = [
        // AI & Compute (Hardcore)
        "正在构建 468 个面部特征关键点矩阵...",
        "正在运行 Gemini-pro-vision 多模态深度学习模型...",
        "正在分配高性能 TPU v5p 云端算力集群...",
        "正在建立端到端加密 (E2EE) 安全数据通道...",
        "正在加载 1750 亿参数的大语言模型上下文...",
        "正在解算 GAN (生成对抗网络) 风格迁移权重...",
        "正在进行 Transformer 多头注意力机制计算...",
        "正在优化 8K 分辨率下的视网膜级 (Retina) 渲染...",
        "正在执行 FP16 半精度浮点矩阵运算...",
        "正在遍历 1024 维高维潜空间 (Latent Space)...",
        "正在同步全球分布式边缘计算节点...",
        "正在进行卷积神经网络 (CNN) 特征提取...",
        // Graphics & Rendering (Visuals)
        "正在计算基于物理的皮肤次表面散射 (SSS)...",
        "正在进行 HDR 高动态范围光照渲染...",
        "正在合成体积光 (Volumetric Lighting) 粒子特效...",
        "正在优化 4K 级图像超分辨率重采样...",
        "正在解算复杂几何体的环境光遮蔽 (Ambient Occlusion)...",
        "正在模拟真实物理镜头的光学景深 (DoF)...",
        "正在追踪光线路径 (Ray Tracing) 以还原真实反射...",
        "正在渲染菲涅尔 (Fresnel) 材质边缘光效...",
        // Aesthetics & Brand (Soul)
        "双妹 VIVE：以赤诚底色，挥洒摩登意气...",
        "正在校准 0.618 黄金分割构图比例...",
        "正在渲染 Art Deco 风格的几何金属光泽...",
        "正在平衡画面中的冷暖色彩对比度...",
        "正在为您量体裁衣，定制专属造型...",
        "正在匹配 Pantone 高级成衣流行色谱...",
        "正在复刻手工丝绒的高级漫反射质感..."
      ];

      // eslint-disable-next-line react-hooks/exhaustive-deps
      // Safe: Only runs when step changes to 'generating', controlled by [step] dependency
      setLoadingText(() => messages[Math.floor(Math.random() * messages.length)]);

      const interval = setInterval(() => {
        // Randomly pick a message every 2.5s
        setLoadingText(() => messages[Math.floor(Math.random() * messages.length)]);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleImageUpload = async (imageDataUrl) => {
    setUploadedImage(imageDataUrl)
    setStep('generating')
    // Start smoothly from 0
    setProgress(0)

    // Start Smooth Progress Animation (Linear 0-99%)
    // We use a local ref object to track the interval ID across the async function scope
    const progressTimer = { id: null };

    // Start timer immediately for instant feedback
    let p = 0;
    progressTimer.id = setInterval(() => {
      p += 0.5;
      if (p >= 99) p = 99;
      setProgress(p);
    }, 100);

    try {
      // 1. Compress Image (Optimized to 800px, module preloaded)
      const compressedImage = await compressImage(imageDataUrl, 800);

      // 2. Analysis is instant (local random selection), no need to parallelize
      const analysis = analyzeImageAndGenerateCopy(compressedImage);
      console.log("Text Analysis Done (Instant)");

      // 3. Image generation is the only real async operation
      const images = await generateFashionImages(null, compressedImage);
      console.log("Image Generation Done");

      if (progressTimer.id) clearInterval(progressTimer.id);
      // API Finished. 
      // Do NOT set progress to 90. Allow it to stay high or jump naturally to 100 in composition.

      // 3. 后处理 (Composition)
      let finalImage = images.fusionImage;
      const currentDate = new Date()
      const month = currentDate.toLocaleString('en-US', { month: 'long' }).toUpperCase()
      const year = currentDate.getFullYear()

      if (images.fusionImage && !images.fusionImage.startsWith('ERROR')) {
        try {
          // Module already preloaded at top

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
      if (progressTimer.id) clearInterval(progressTimer.id);
      console.error("Workflow failed:", error)
      const errorMsg = error.response ? `API Error: ${error.response.status}` : error.message;
      alert(`抱歉，生成中断。\n错误详情: ${errorMsg}\n请尝试刷新页面或检查网络。`)
      setStep('upload')
    }
  }

  const handleReset = () => {
    // Fix: Use user-scoped key instead of hardcoded key
    const userKey = getUserStorageKey('vive_result');
    localStorage.removeItem(userKey);
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
    <div className="relative h-screen w-full flex flex-col items-center justify-start gap-4 md:gap-10 py-6 px-6 overflow-hidden">
      {/* 3D Gyroscope Background */}
      <ParallaxBackground />

      {/* Background Decorations & Effects */}
      <div className="sunray-bg"></div>

      {/* Subtle Vignette */}
      <div className="fixed inset-0 pointer-events-none z-[1] bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.4)_100%)]"></div>

      {/* Header - Always Visible */}
      <Header />

      {/* Main Content - Natural Height for Upload, Scrollable for Result */}
      <div className={`w-full z-10 flex flex-col items-center ${step === 'result' ? 'flex-grow overflow-y-auto no-scrollbar justify-start' : 'justify-center'}`}>
        <div className="w-full flex flex-col items-center justify-center">
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
