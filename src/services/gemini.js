
import axios from 'axios';
import { compressImage } from '../utils/imageUtils';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Google Native OpenAI-Compatible Endpoint: https://generativelanguage.googleapis.com/v1beta/openai/
axios.defaults.timeout = 180000; // 3分钟超时
const BASE_URL = import.meta.env.VITE_GEMINI_BASE_URL;

// 创建一个用于 OpenAI 兼容接口的 axios 实例 (主要用于 Chat/分析)
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
    },
    timeout: 0 // 移除超时限制
});

/**
 * 步骤 1: 分析用户图片并生成文案
 * 注意：切换到 Google 官方 API 后，模型名称必须使用官方标准名。
 * 推荐使用 gemini-1.5-flash 或 gemini-2.0-flash-exp
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

        console.log("正在调用 Gemini (Official) 分析图片...");

        // 使用 Google 官方支持的模型名
        // gemini-1.5-flash 是目前性价比最高的 Vision 模型
        const response = await apiClient.post('/chat/completions', {
            model: "gemini-1.5-flash",
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
        // 出错兜底
        return {
            features: "Asian woman, oval face, almond eyes, elegant features, black hair",
            keyword: "#传奇的摩登",
            attitude: "优雅是永不过时的经典",
            loading_text: "正在为您回溯百年前的摩登时光..."
        };
    }
};

/**
 * 步骤 2: 生成图片 (使用 Google Native API + Gemini 2.0 Flash Exp)
 * 只有 Native API + gemini-2.0-flash-exp 才支持直接返回 Base64 图片数据
 */
export const generateFashionImages = async (features, imageBase64) => {
    // 压缩图片以符合 API 大小限制 (稍微压一下，太大会报错)
    const compressedImage = await compressImage(imageBase64, 1024);
    const base64Data = compressedImage.split(',')[1];

    if (!API_KEY) {
        return { fusionImage: null, errors: { global: "API Key 缺失。请在 Zeabur/Vercel 环境变量中配置 VITE_GEMINI_API_KEY。" } };
    }

    // --- VIVE 摩登衣橱混搭引擎 (无限组合) ---
    // 材质库 (注重质感、重工)
    const fabrics = ["Rich Velvet", "Heavy Silk Satin", "Structured Wool Tweed", "French Lace", "Brocade with Gold Thread", "Matte Leather", "Sequined Fabric"];
    // 颜色库 (VIVE 品牌色系 & 高级灰调，拒绝荧光/银色)
    const colors = ["Deep Crimson Red", "Jet Black", "Champagne Gold", "Dark Emerald Green", "Navy Blue", "Pearl White", "Burgundy", "Chocolate Brown"];

    // Vintage 款式库 (1930s Shanghai)
    const vintageStyles = [
        "Cheongsam with high mandarin collar and cap sleeves",
        "Sleeveless Qipao with floor-length hem",
        "Qipao paired with a faux fur shawl",
        "Qipao with intricate peony embroidery",
        "Art Deco style dress with geometric patterns"
    ];

    // Modern 款式库 (2026 High Fashion - Heavy/Bold Style)
    // 拒绝 futuristic，强调剪裁和力量感
    const modernStyles = [
        "Oversized Sharp Blazer with wide-leg trousers (Power Suit)",
        "Structured Asymmetrical Dress with architectural details",
        "Old Money Aesthetic Tweed Set",
        "Minimalist Slip Dress combined with a heavy wool coat",
        "High-waisted tailored pants with a corset top",
        "All-black Tuxedo style suit for women (Le Smoking)"
    ];

    // 随机抽取函数
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const color1 = pick(colors);
    const fabric1 = pick(fabrics);
    const vintageItem = pick(vintageStyles);
    const color2 = Math.random() > 0.5 ? color1 : pick(colors);
    const fabric2 = pick(fabrics);
    const modernItem = pick(modernStyles);

    const generatedVintage = `${color1} ${fabric1} ${vintageItem}`;
    const generatedModern = `${color2} ${fabric2} ${modernItem}`;

    console.log(`[Fusion] Native Style: ${generatedVintage} | ${generatedModern}`);

    // Google Native Prompt
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
        console.log(`[Fusion] 请求 Google Native API (gemini-2.0-flash-exp)...`);

        // 使用 Google 原生端点 (绕过 /openai/ wrapper)
        // 这个模型集成了生图能力，是目前官方最强版本
        const nativeUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`;

        const nativePayload = {
            contents: [{
                parts: [
                    { text: fusionPrompt },
                    { inline_data: { mime_type: "image/jpeg", data: base64Data } }
                ]
            }],
            generationConfig: {
                response_mime_type: "image/jpeg"
            }
        };

        // 直接用 axios 调用原生 URL
        const res = await axios.post(nativeUrl, nativePayload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 180000 // 3分钟超时
        });

        if (res.data.candidates && res.data.candidates.length > 0) {
            const part = res.data.candidates[0].content.parts[0];

            // 情况 A: 直接返回了 Base64 图片数据
            if (part.inline_data && part.inline_data.data) {
                console.log("[Fusion] 收到 Base64 图片数据");
                return {
                    fusionImage: `data:${part.inline_data.mime_type || 'image/jpeg'};base64,${part.inline_data.data}`,
                    errors: null
                };
            }

            // 情况 B: 返回了文本
            if (part.text) {
                console.warn("[Fusion] API返回了文本而非图片:", part.text.substring(0, 100));
                return { fusionImage: null, errors: { global: `AI未生成图片，返回文本: ${part.text.substring(0, 50)}...` } };
            }
        }

        return { fusionImage: null, errors: { global: "API响应格式不符合预期" } };

    } catch (err) {
        const msg = err.response ? JSON.stringify(err.response.data) : err.message;
        console.error(`[Fusion] Native API Error:`, msg);
        let userMsg = "生成失败";
        if (msg.includes("SAFETY")) userMsg = "图片内容触发生命安全拦截";
        if (msg.includes("429")) userMsg = "请求过于频繁，请稍后再试";
        // 如果是 404，可能是 gemini-2.0-flash-exp 暂时不可用，建议切回 imagen
        return { fusionImage: null, errors: { global: `${userMsg} (${err.message})` } };
    }
};
