
import axios from 'axios';
import { compressImage } from '../utils/imageUtils';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BASE_URL = import.meta.env.VITE_GEMINI_BASE_URL;

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

        const response = await fetch(`${BASE_URL}/models/gemini-3-flash-preview:generateContent`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: "image/jpeg", data: base64Data } }
                    ]
                }]
            })
        });

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanContent);

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
 * 步骤 2: 生成图片 (APIYI + gemini-3-pro-image-preview)
 */
export const generateFashionImages = async (features, imageBase64) => {
    const compressedImage = await compressImage(imageBase64, 1024);
    const base64Data = compressedImage.split(',')[1];

    if (!API_KEY) {
        return { fusionImage: null, errors: { global: "API Key 缺失。请配置 VITE_GEMINI_API_KEY。" } };
    }

    // --- VIVE 摩登衣橱混搭引擎 ---
    const fabrics = ["Rich Velvet", "Heavy Silk Satin", "Structured Wool Tweed", "French Lace", "Brocade with Gold Thread", "Matte Leather", "Sequined Fabric"];
    const colors = ["Deep Crimson Red", "Jet Black", "Champagne Gold", "Dark Emerald Green", "Navy Blue", "Pearl White", "Burgundy", "Chocolate Brown"];

    const vintageStyles = [
        "Cheongsam with high mandarin collar and cap sleeves",
        "Sleeveless Qipao with floor-length hem",
        "Qipao paired with a faux fur shawl",
        "Qipao with intricate peony embroidery",
        "Art Deco style dress with geometric patterns"
    ];

    const modernStyles = [
        "Oversized Sharp Blazer with wide-leg trousers (Power Suit)",
        "Structured Asymmetrical Dress with architectural details",
        "Old Money Aesthetic Tweed Set",
        "Minimalist Slip Dress combined with a heavy wool coat",
        "High-waisted tailored pants with a corset top",
        "All-black Tuxedo style suit for women (Le Smoking)"
    ];

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const color1 = pick(colors);
    const fabric1 = pick(fabrics);
    const vintageItem = pick(vintageStyles);
    const color2 = Math.random() > 0.5 ? color1 : pick(colors);
    const fabric2 = pick(fabrics);
    const modernItem = pick(modernStyles);

    const generatedVintage = `${color1} ${fabric1} ${vintageItem}`;
    const generatedModern = `${color2} ${fabric2} ${modernItem}`;

    console.log(`[Fusion] Style: ${generatedVintage} | ${generatedModern}`);

    // 核心 Prompt
    const fusionPrompt = `
      Generate a high-fashion magazine cover image featuring TWO women.
      
      **STRICT REFERENCE CONTROL**: 
      - The provided image MUST be used as the **STRUCTURAL BLUEPRINT** and **FACE REFERENCE**.
      - **Face Identity**: The generated women MUST look like the person in the uploaded image. Use the exact eye shape, nose structure, and lip shape described here: [${features}].
      - **Make them look like the SAME PERSON in two different eras.**
      
      Concept: "Double Life / Timeless Encounter".
      Aspect Ratio: 3:4 (Portrait).
      
      COMPOSITION & POSE:
      - Two women posing together intimately (back-to-back, or holding hands).
      - Natural interaction, cinematic lighting.
      
      OUTFITS (High Fashion & Heavy Texture):
      - Woman 1 (Vintage 1930s): ${generatedVintage}, 1930s finger waves hair.
      - Woman 2 (Modern 2026): ${generatedModern}, sleek modern hair.
      
      STYLE:
      - **Heaviness & Quality**: Use textures like Velvet, Wool, and Satin. AVOID plastic, neon, or futuristic silver metal.
      - Magazine Cover Aesthetic.
      - VIVE Brand Atmosphere (Luxury, Timeless, Shanghai).
      - Masterpiece, 8k resolution, photorealistic skin texture.
      - NO TEXT in background.
    `;

    try {
        console.log(`[Fusion] 请求 APIYI gemini-3-pro-image-preview...`);

        // 使用 APIYI 提供的调用格式 (注意字段使用驼峰命名)
        const response = await fetch(`${BASE_URL}/models/gemini-3-pro-image-preview:generateContent`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: fusionPrompt },
                        { inlineData: { mimeType: "image/jpeg", data: base64Data } }
                    ]
                }],
                generationConfig: {
                    responseModalities: ["IMAGE"],
                    imageConfig: {
                        aspectRatio: "3:4",
                        imageSize: "1K"
                    }
                }
            })
        });

        const data = await response.json();

        // 检查错误
        if (data.error) {
            console.error("[Fusion] API Error:", data.error);
            return { fusionImage: null, errors: { global: data.error.message || JSON.stringify(data.error) } };
        }

        // 提取图片 Base64 (APIYI 使用驼峰命名 inlineData/mimeType)
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.inlineData?.data) {
            const imageBase64 = data.candidates[0].content.parts[0].inlineData.data;
            const mimeType = data.candidates[0].content.parts[0].inlineData.mimeType || 'image/jpeg';
            console.log("[Fusion] 收到 Base64 图片");
            return {
                fusionImage: `data:${mimeType};base64,${imageBase64}`,
                errors: null
            };
        }

        // 兼容下划线命名 (inline_data/mime_type)
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.inline_data?.data) {
            const imageBase64 = data.candidates[0].content.parts[0].inline_data.data;
            const mimeType = data.candidates[0].content.parts[0].inline_data.mime_type || 'image/jpeg';
            console.log("[Fusion] 收到 Base64 图片 (下划线格式)");
            return {
                fusionImage: `data:${mimeType};base64,${imageBase64}`,
                errors: null
            };
        }

        // 如果返回的是文本
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            const text = data.candidates[0].content.parts[0].text;
            console.warn("[Fusion] API返回文本:", text.substring(0, 100));
            return { fusionImage: null, errors: { global: `AI未生成图片: ${text.substring(0, 50)}...` } };
        }

        console.error("[Fusion] 未知响应格式:", JSON.stringify(data).substring(0, 200));
        return { fusionImage: null, errors: { global: "API响应格式不符合预期" } };

    } catch (err) {
        console.error(`[Fusion] Error:`, err);
        return { fusionImage: null, errors: { global: err.message } };
    }
};
