
import { useState, useEffect } from 'react'
import Header from './components/Header'
import UploadSection from './components/UploadSection'
import GeneratingScreen from './components/GeneratingScreen'
import ResultSection from './components/ResultSection'
import Footer from './components/Footer'
import { analyzeImageAndGenerateCopy, generateFashionImages } from './services/gemini'
import { composeFinalImage } from './utils/imageCompositor'
import './App.css'

function App() {
  const [step, setStep] = useState('upload') // 'upload' | 'generating' | 'result'
  const [uploadedImage, setUploadedImage] = useState(null)
  const [generatedResults, setGeneratedResults] = useState(null)
  const [loadingText, setLoadingText] = useState("")
  const [progress, setProgress] = useState(0)

  const startPolling = (taskId) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:3004/api/status/${taskId}`);
        if (!res.ok) throw new Error("Status check failed");

        const data = await res.json();

        // Update Loading Text based on progress/analysis
        if (data.progress) setProgress(data.progress);

        if (data.progress < 30) setLoadingText("正在上传并分析面部特征...");
        else if (data.progress < 60) setLoadingText(data.analysis?.loading_text || "穿越回 1930 年上海滩...");
        else if (data.progress < 90) setLoadingText("正在为您量身定制旗袍...");
        else setLoadingText("最后合成中...");

        if (data.status === 'completed') {
          clearInterval(interval);

          // Client-Side Composition: Turn raw AI image into Poster
          setLoadingText("正在装裱海报...");
          try {
            const posterDataUrl = await composeFinalImage(data.result.fusionImage, data.result);

            // Update result with composed image
            const finalResult = { ...data.result, fusionImage: posterDataUrl };

            localStorage.removeItem('vive_active_task_id'); // Task done
            localStorage.setItem('vive_result', JSON.stringify(finalResult)); // Save result
            setGeneratedResults(finalResult);
            setStep('result');
          } catch (compError) {
            console.error("Composition Failed:", compError);
            alert("海报合成失败，将显示原图");
            // Fallback to raw image
            setGeneratedResults(data.result);
            setStep('result');
          }
        } else if (data.status === 'failed') {
          clearInterval(interval);
          localStorage.removeItem('vive_active_task_id');
          alert(`生成失败: ${data.error}`);
          setStep('upload');
        }
      } catch (e) {
        console.error("Polling error", e);
        // Optionally stop polling after N retries
      }
    }, 3000);
  };

  // Restore state or resume polling
  useEffect(() => {
    // 1. Check for completed result first
    const savedResult = localStorage.getItem('vive_result');
    if (savedResult) {
      try {
        const parsed = JSON.parse(savedResult);
        setGeneratedResults(parsed);
        setStep('result');
        return; // Result found, no need to poll
      } catch (e) { }
    }

    // 2. Check for active background task
    const activeTaskId = localStorage.getItem('vive_active_task_id');
    if (activeTaskId) {
      console.log("Resuming background task:", activeTaskId);
      setStep('generating');
      startPolling(activeTaskId);
    }
  }, []);

  const handleImageUpload = async (imageDataUrl) => {
    setUploadedImage(imageDataUrl);
    setStep('generating');
    setLoadingText("正在把任务提交给 VIVE 总部...");

    try {
      // Submit to Backend Queue
      const response = await fetch('http://localhost:3004/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl })
      });

      if (!response.ok) throw new Error("Backend submission failed");

      const { taskId } = await response.json();
      console.log("Task Submitted:", taskId);

      // Persist Task ID
      localStorage.setItem('vive_active_task_id', taskId);

      // Start Polling
      startPolling(taskId);

    } catch (error) {
      console.error("Workflow failed:", error);
      alert("提交失败，请确保后台服务已启动 (localhost:3004)");
      setStep('upload');
    }
  }

  const handleReset = () => {
    localStorage.removeItem('vive_result');
    localStorage.removeItem('vive_active_task_id');
    setStep('upload');
    setUploadedImage(null);
    setGeneratedResults(null);
    setLoadingText("");
  }

  return (
    <div className="app">
      <div className="main-content">
        {step === 'upload' && (
          <UploadSection onImageUpload={handleImageUpload} />
        )}

        {step === 'generating' && (
          <GeneratingScreen
            uploadedImage={uploadedImage || '/vive-logo-dark.jpg'} // Fallback if image lost on refresh
            loadingText={loadingText}
            progress={progress}
          />
        )}

        {step === 'result' && generatedResults && (
          <ResultSection
            resultImage={generatedResults.fusionImage}
            onRetry={handleReset}
            onShare={() => alert("长按图片即可保存分享")}
          />
        )}
      </div>
    </div>
  );
}


export default App
