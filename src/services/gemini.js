
// Helper to get env vars in both Vite and Node
const getEnv = (key) => {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
        return import.meta.env[key];
    }
    return '';
};

const API_KEY = getEnv('VITE_GEMINI_API_KEY');
const BASE_URL = getEnv('VITE_GEMINI_BASE_URL');

// Conditional import or mock for compressImage
// In Node, we assume the image is already compressed/processed by the client
import { compressImage as clientCompress } from '../utils/imageUtils.js';

const compressImageSafe = async (base64, targetSize) => {
    if (typeof window === 'undefined') {
        // Server-side: Skip compression (or implement node-side compression later)
        return base64;
    }
    return await clientCompress(base64, targetSize);
}

/**
 * 步骤 1: 分析用户图片并生成文案
 * 注意：使用 gemini-3-pro-image-preview 因为 APIYI 账户只支持这个模型
 */
export const analyzeImageAndGenerateCopy = async (imageBase64) => {
    try {
        const compressedImage = await compressImageSafe(imageBase64, 512);
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
      请直接返回JSON对象，不要包含任何其他内容。
    `;

        console.log("正在调用 Gemini 分析图片...");

        // 使用 gemini-3-pro-image-preview (APIYI 账户支持的模型)
        const response = await fetch(`${BASE_URL}/models/gemini-3-pro-image-preview:generateContent`, {
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

        // 检查错误
        if (data.error) {
            console.error("Analysis API Error:", data.error);
            throw new Error(data.error.message);
        }

        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        console.log("Analysis raw content:", content.substring(0, 200));
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanContent);

    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        // 兜底数据
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
    const compressedImage = await compressImageSafe(imageBase64, 1024);
    const base64Data = compressedImage.split(',')[1];

    if (!API_KEY) {
        return { fusionImage: null, errors: { global: "API Key 缺失。请配置 VITE_GEMINI_API_KEY。" } };
    }

    // --- VIVE 摩登衣橱混搭引擎 (Premium Polish) ---
    const fabrics = [
        "Lustrous Silk Brocade with gold embroidery",
        "Heavy Glossy Satin",
        "Rich Embossed Velvet",
        "Intricate French Chantilly Lace",
        "Luxurious Wool Tweed",
        "Supple High-Gloss Leather"
    ];
    const colors = [
        "Deep Imperial Red",
        "Midnight Jet Black",
        "Antique Champagne Gold",
        "Royal Emerald Green",
        "Classic Pearl White",
        "Rich Burgundy Wine"
    ];

    const vintageStyles = [
        "High-collar sleeveless Qipao with gold piping and side slits",
        "Traditional Silk Qipao with hand-embroidered floral motifs",
        "Vintage 1930s Evening Cheongsam with a velvet cape",
        "Art Deco Geometric Pattern Dress with fringe details",
        "Double-breasted vintage coat over a fitted silk dress"
    ];

    const modernStyles = [
        "High-fashion Sharp-shouldered Blazer with floor-length trousers",
        "Architectural Asymmetrical Silk Dress with sculptural pleats",
        "Premium Tweed Set with gold-button details (High-end Chic)",
        "Draped Silk Slip Dress with a heavy tailored wool overcoat",
        "Luxe Corseted Bodice with high-waisted wide-leg wool pants",
        "Feminine Tuxedo (Le Smoking) in high-sheen satin and wool"
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
      **Character Reference**: 
      - Use the provided image as a visual reference for facial features and ethnicity.
      - Create a new artistic interpretation that captures the essence of the subject.
      - **Style**: Cinematic High-Fashion Portrait (Shanghai 1930s Aesthetic).
      
      Concept: "Double Life / Timeless Encounter".
      Aspect Ratio: 3:4 (Portrait).
      
      **CRITICAL COMPOSITION**:
      - **HEADROOM**: Leave significant EMPTY SPACE at the TOP of the image (about 15-20% of the frame height) for text overlay.
      - Position the subjects' HEADS in the UPPER-MIDDLE section, NOT at the very top edge.
      - Subjects should be positioned slightly LOWER in the frame than typical portraits.
      - Two women posing together intimately (back-to-back, or holding hands).
      - Natural interaction, cinematic lighting.
      
      OUTFITS (High Fashion & Heavy Texture):
      - Woman 1 (Vintage 1930s): ${generatedVintage}, 1930s finger waves hair.
      - Woman 2 (Modern 2026): ${generatedModern}, sleek modern hair.
      
      **CRITICAL RESTRICTIONS**:
      - **NO TEXT**. DO NOT generate any letters, words, logos, or magazine titles.
      - **NO TYPOGRAPHY**. The image must be a CLEAN photograph only.
      - **NO BORDERS** or frames.
      
      STYLE:
      - **Heaviness & Quality**: Use textures like Velvet, Wool, and Satin. AVOID plastic, neon, or futuristic silver metal.
      - VIVE Brand Atmosphere (Luxury, Timeless, Shanghai).
      - Masterpiece, 8k resolution, photorealistic skin texture.
    `;

    try {
        console.log(`[Fusion] 请求 APIYI gemini-3-pro-image-preview...`);

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

        // 检查 finishReason
        const candidate = data.candidates?.[0];
        if (candidate?.finishReason === 'SAFETY') {
            console.error("[Fusion] Blocked by Safety Filters");
            return { fusionImage: null, errors: { global: "AI生成被安全策略拦截，请尝试换一张照片。" } };
        }

        // 提取图片 Base64
        if (candidate?.content?.parts?.[0]?.inlineData?.data) {
            const imageBase64 = candidate.content.parts[0].inlineData.data;
            const mimeType = candidate.content.parts[0].inlineData.mimeType || 'image/jpeg';
            console.log("[Fusion] 收到 Base64 图片");
            return {
                fusionImage: `data:${mimeType};base64,${imageBase64}`,
                errors: null
            };
        }

        // 兼容下划线命名
        if (candidate?.content?.parts?.[0]?.inline_data?.data) {
            const imageBase64 = candidate.content.parts[0].inline_data.data;
            const mimeType = candidate.content.parts[0].inline_data.mime_type || 'image/jpeg';
            return {
                fusionImage: `data:${mimeType};base64,${imageBase64}`,
                errors: null
            };
        }

        // 如果返回的是文本
        if (candidate?.content?.parts?.[0]?.text) {
            const text = candidate.content.parts[0].text;
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
