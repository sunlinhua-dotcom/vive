
import axios from 'axios';
import { compressImage } from '../utils/imageUtils';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BASE_URL = import.meta.env.VITE_GEMINI_BASE_URL;

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
    },
    timeout: 0 // 移除超时限制，完全等待服务端响应
});

/**
 * 步骤 1: 分析用户图片并生成文案
 */
export const analyzeImageAndGenerateCopy = async (imageBase64) => {
    try {
        const compressedImage = await compressImage(imageBase64, 512);
        const base64Data = compressedImage.split(',')[1];

        const prompt = `
      你是一个精通面相学和时尚摄影的专家。请极其仔细地分析这张自拍照中人物的**面部硬特征**。
      目标是让画师能根据你的描述画出非常相似的人。
      
      请完成以下任务，并以json格式返回：
      1. 'features': **[CRITICAL]** 用精确的英文描述面部特征。包括：
         - Face Shape (e.g. oval, square, high cheekbones)
         - Eyes (e.g. almond, monolid, double eyelid, eye color, eye distance)
         - Nose (e.g. high bridge, button nose, wide/narrow)
         - Lips (e.g. full, thin, cupid's bow)
         - Hair (e.g. length, texture, color, parting)
         - Distinguishing marks (e.g. moles)
         - [Keep it concise but strictly anatomical]
      2. 'keyword': 为用户生成一个"摩登关键词"，格式为"#XXXX"（例如 #明媚的玫瑰, #传奇的摩登），要有VIVE双妹的品牌调性。
      3. 'attitude': 用一句简短的话总结用户的"摩登态度"，要在15个字以内。
      4. 'loading_text': 生成一句优美的、带有时间穿越感的等待文案。
      请直接返回JSON对象。
    `;

        console.log("正在调用 Gemini Flash 分析图片...");
        const response = await apiClient.post('/chat/completions', {
            model: "gemini-3-flash-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Data}`
                            }
                        }
                    ]
                }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.data.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(content);

    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return {
            features: "Asian woman, oval face, almond eyes, elegant features, black hair",
            keyword: "#传奇的摩登",
            attitude: "优雅是永不过时的经典",
            loading_text: "正在为您回溯百年前的摩登时光..."
        };
    }
};

/**
 * 步骤 2: 生成图片 (重构版：生成一张"古今双妹"同框图)
 * 关键修正: 必须传入 imageBase64，让 AI "看着图" 画，实现真正的 Reference Image 生图
 */
export const generateFashionImages = async (features, imageBase64) => {
    // 压缩图片以符合 API 大小限制 (稍微压一下，太大会报错)
    const compressedImage = await compressImage(imageBase64, 1024);
    const base64Data = compressedImage.split(',')[1];

    // 核心 Prompt：双人同框，前世今生，强调自然互动 + 人脸相似度
    const fusionPrompt = `
      Generate a high-fashion magazine cover image featuring TWO women.
      
      **STRICT REFERENCE CONTROL**: 
      - The provided image MUST be used as the **STRUCTURAL BLUEPRINT** and **FACE REFERENCE**.
      - **Face Identity**: The generated women MUST look like the person in the uploaded image. Use the exact eye shape, nose structure, and lip shape described here: [${features}].
      - **ControlNet-like Fidelity**: Maintain the user's facial proportions and distinguishing features strictly.
      
      **CORE IDENTITY**: Both women represent the SAME PERSON (the user) in two different eras.
      
      Concept: "Double Life / Timeless Encounter".
      Aspect Ratio: 3:4 (Portrait).
      
      COMPOSITION & POSE (Crucial):
      - Two women posing together intimately and naturally, NOT a split screen. 
      - They should look like twins or sisters (Past self and Present self).
      - **Pose**: Leaning against each other back-to-back, OR standing shoulder-to-shoulder holding hands, OR one resting head on the other's shoulder. 
      - The interaction must feel organic and emotional.
      - Face forward to camera, clear facial details.
      
      OUTFITS:
      - Woman 1 (Vintage): 1930s Shanghai Cheongsam (Qipao), finger waves hairstyle, fitting the user's face.
      - Woman 2 (Modern): 2026 modern luxury minimalist fashion, sleek hair, fitting the user's face.
      
      STYLE:
      - Cinematic lighting that blends the vintage and modern atmospheres seamlessly.
      - VIVE brand aesthetic (Red, Gold, Black).
      - Masterpiece, 8k resolution, photorealistic face, highly detailed skin texture.
      - **CRITICAL**: Pure photography ONLY. NO TEXT, NO LOGO, NO WATERMARK, NO TYPOGRAPHY in the background or foreground. Keep the image clean.
    `;

    try {
        console.log(`[Fusion] 请求 Chat API (Vision) 生成双人同框图...`);

        // 尝试通过 Chat 接口触发绘图，同时传入文本Prompt和图片
        const res = await apiClient.post('/chat/completions', {
            model: "gemini-3-pro-image-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: fusionPrompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Data}`
                            }
                        }
                    ]
                }
            ]
        });

        if (res.data.choices && res.data.choices[0]) {
            const content = res.data.choices[0].message.content;

            // 提取图片 URL
            const urlMatch = content.match(/https?:\/\/[^\s)]+?\.(png|jpg|jpeg|webp)/i) ||
                content.match(/!\[.*?\]\((.*?)\)/);

            if (urlMatch) {
                const url = urlMatch[1] || urlMatch[0];
                // 移除可能的括号
                const cleanUrl = url.replace(/[()]/g, '');
                // 返回单一结果对象
                return {
                    fusionImage: cleanUrl,
                    errors: null
                };
            }

            console.warn(`[Fusion] 未找到图片URL`);
            return { fusionImage: null, errors: { global: `AI生成了文本但未返回图片 URL` } };
        }
        return { fusionImage: null, errors: { global: "AI未返回有效内容" } };

    } catch (err) {
        const msg = err.response ? JSON.stringify(err.response.data) : err.message;
        console.error(`[Fusion] Error:`, msg);
        return { fusionImage: null, errors: { global: msg } };
    }
};
