
import { useState } from 'react'
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

  const handleImageUpload = async (imageDataUrl) => {
    setUploadedImage(imageDataUrl)
    setStep('generating')
    setLoadingText("正在读取您的摩登密码...") // 初始文案

    try {
      // 1. 调用 Gemini Flash 分析图片并生成文案
      const analysis = await analyzeImageAndGenerateCopy(imageDataUrl)

      // 更新加载文案
      if (analysis.loading_text) {
        setLoadingText(analysis.loading_text)
      }

      // 2. 调用 Gemini Image 生成图片
      // 注意：这里需要一定时间，期间 GeneratingScreen 会显示 scan 动画
      // 传入 imageDataUrl 实现 Reference Image Control
      const images = await generateFashionImages(analysis.features, imageDataUrl)

      // 3. 智能合成：将 Logo、文案、底图烧录成一张图
      // 这样用户拿到的就是一张完整的 JPG，包含所有设计元素
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
            logoColor: 'white' // 默认用白色Logo
          };

          // 执行合成
          console.log("Starting composition...");
          finalImage = await composeFinalImage(images.fusionImage, compositeData);
          console.log("Composition success!");

        } catch (composeError) {
          console.error("Composition failed, falling back to raw image", composeError);
          // 如果合成失败（例如Canvas跨域），UI层会自动降级处理（还是用CSS叠加）
        }
      }

      // 4. 组合结果
      setGeneratedResults({
        month,
        year,
        keyword: analysis.keyword,
        attitude: analysis.attitude,
        fusionImage: finalImage,
        // 修复：必须先判断 finalImage 是否存在
        imageType: (finalImage && finalImage.startsWith('data:')) ? 'composite' : 'raw',
        errors: images.errors
      })

      setStep('result')

    } catch (error) {
      console.error("Workflow failed:", error)
      const errorMsg = error.response ? `API Error: ${error.response.status}` : error.message;
      alert(`抱歉，生成中断。\n错误详情: ${errorMsg}\n请尝试刷新页面或检查网络。`)
      setStep('upload')
    }
  }

  const handleReset = () => {
    setStep('upload')
    setUploadedImage(null)
    setGeneratedResults(null)
    setLoadingText("")
  }

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        {step === 'upload' && (
          <UploadSection onImageUpload={handleImageUpload} />
        )}

        {step === 'generating' && (
          <GeneratingScreen
            uploadedImage={uploadedImage}
            loadingText={loadingText}
          />
        )}

        {step === 'result' && generatedResults && (
          <ResultSection
            results={generatedResults}
            onReset={handleReset}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App
