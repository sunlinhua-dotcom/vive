
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
      你是一个精通上海滩复古时尚与现代美学的时尚主编。请仔细分析这张用户的自拍照。
      请完成以下任务，并以JSON格式返回：
      1. 'features': 详细描述用户的面部特征（性别、发型、大致年龄感、表情、配饰等），用于生成AI画像，用英文描述。
      2. 'keyword': 为用户生成一个"摩登关键词"，格式为"#XXXX"（例如 #明媚的玫瑰, #传奇的摩登），要有VIVE双妹的品牌调性。
      3. 'attitude': 用一句简短的话总结用户的"摩登态度"，要在15个字以内。
      4. 'loading_text': 生成一句优美的、带有时间穿越感的等待文案（例如："正在为您翻阅百年前的上海滩画报..."）。
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
            features: "Asian woman, elegant, vintage style",
            keyword: "#传奇的摩登",
            attitude: "优雅是永不过时的经典",
            loading_text: "正在为您回溯百年前的摩登时光..."
        };
    }
};

/**
 * 步骤 2: 生成图片 (重构版：生成一张"古今双妹"同框图)
 */
export const generateFashionImages = async (features) => {
    // 核心 Prompt：双人同框，前世今生，强调自然互动
    const fusionPrompt = `
      Generate a high-fashion magazine cover image featuring TWO women based on this description: ${features}. 
      Concept: "Double Life / Timeless Encounter".
      Aspect Ratio: 3:4 (Portrait).
      
      COMPOSITION & POSE (Crucial):
      - Two women posing together intimately and naturally, NOT a split screen. 
      - They should look like twins or sisters.
      - **Pose**: Leaning against each other back-to-back, OR standing shoulder-to-shoulder holding hands, OR one resting head on the other's shoulder. 
      - The interaction must feel organic and emotional, like a reunion across time.
      - Face forward to camera.
      
      OUTFITS:
      - Woman 1 (Vintage): 1930s Shanghai Cheongsam (Qipao), finger waves hair, elegant makeup.
      - Woman 2 (Modern): 2026 modern luxury minimalist fashion, sleek hair, confident makeup.
      
      STYLE:
      - Cinematic lighting that blends the vintage and modern atmospheres seamlessly.
      - VIVE brand aesthetic (Red, Gold, Black).
      - Masterpiece, 8k resolution, photorealistic face.
      - **CRITICAL**: Pure photography ONLY. NO TEXT, NO LOGO, NO WATERMARK, NO TYPOGRAPHY in the background or foreground. Keep the image clean.
    `;

    try {
        console.log(`[Fusion] 请求 Chat API 生成双人同框图...`);

        // 尝试通过 Chat 接口触发绘图
        const res = await apiClient.post('/chat/completions', {
            model: "gemini-3-pro-image-preview",
            messages: [{ role: "user", content: fusionPrompt }]
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
