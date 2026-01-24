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

const BASE_URL = getEnv('VITE_GEMINI_BASE_URL') || 'https://apiyi.com/v1';

// 1. 文案 API (Flash)
// 优先读取环境变量，本地开发可使用 fallback
const TEXT_API_KEY = getEnv('VITE_GEMINI_TEXT_API_KEY') || 'sk-zu5cm3pPZaEyIwz85a5bCb76546f4b1d92BaA08aAc3f7404';
const TEXT_MODEL = 'gemini-3-flash-preview';

// 2. 图形 API (Pro Image)
// 优先读取环境变量，本地开发可使用 fallback
const IMAGE_API_KEY = getEnv('VITE_GEMINI_IMAGE_API_KEY') || 'sk-qMB7fSJhKZmebuFL0b823fE2Af274cCc9a1e62A5990aF1F6';
const IMAGE_MODEL = 'gemini-3-pro-image-preview';

// Conditional import or mock for compressImage
// In Node, we assume the image is already compressed/processed by the client


// Helper to strip data URL header if present
const ensureBase64 = (str) => {
    if (!str) return '';
    if (str.includes(',')) return str.split(',')[1];
    return str;
};

/**
 * 步骤 1: 分析用户图片并生成文案
 * 使用模型: gemini-3-flash-preview
 */
export const analyzeImageAndGenerateCopy = async (imageBase64) => {
    try {
        // Assume input is already compressed from App.jsx
        const base64Data = ensureBase64(imageBase64);

        const prompt = `
      You are the Chief Copywriter for the luxury brand "VIVE (双妹)".
      
      **TASK 1: VISUAL ANALYSIS (For Artist)**
      Analyze the uploaded selfie for facial structure to help an artist recreate the face.
      - **'features'**: RETURN A JSON STRING. Precisely describe the anatomy: Face shape, eye shape/distance, nose structure, lip shape, and distinctive marks. (Strictly anatomical, no flowery language).

      **TASK 2: BRAND COPYWRITING (The Core Task)**
      Analyze the **Vibe / Spirit / Aura** of the person in the photo.
      - IGNORE Gender and Age. (A young girl can be #Sharp, an old man can be #Vibrant).
      - Focus on the *ENERGY*: Is it sharp? Gentle? Proud? Calm? Fiery? Elegant?
      
      **CRITICAL INSTRUCTION: STRICT SELECTION ONLY**
      - You must **SELECT** one entry EXACTLY as written from the **Brand Reference Library** below.
      - **DO NOT** edit, rewrite, or modify the text. 
      - **DO NOT** invent new keywords. 
      - The output "keyword" and "attitude" must match the library 100%.

      **BRAND REFERENCE LIBRARY (Strict Pool):**
      1. #锐意先锋 | 以锋芒之姿，诠释当代风范。
      2. #赤诚摩登 | 以赤诚底色，挥洒摩登意气。
      3. #独立自洽 | 于方寸之间，自有天地广阔。
      4. #无畏锋芒 | 以破局之姿，重塑摩登定义。
      5. #如花明媚 | 让本色盛放，不负鎏金岁月。
      6. #如狮无畏 | 心有大格局，自有万千气象。
      7. #尽态极妍 | 登场即焦点，演绎摩登风范。
      8. #传世之美 | 岁月不败我，沉淀非凡底蕴。
      9. #东情西韵 | 蕴东方风骨，彰显摩登格调。

      **OUTPUT FORMAT (JSON):**
      {
        "features": "...",
        "keyword": "#selected_keyword", 
        "attitude": "selected_attitude",
        "loading_text": "Generating a poetic loading message about time travel..."
      }
    `;

        console.log(`正在调用 ${TEXT_MODEL} 分析图片...`);

        // 使用用户指定的新文案 API
        const response = await fetch(`${BASE_URL}/models/${TEXT_MODEL}:generateContent`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TEXT_API_KEY}`,
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
 * 步骤 2: 生成图片 (使用 APIYI + gemini-3-pro-image-preview)
 */
export const generateFashionImages = async (features, imageBase64) => {
    // Assume input is already compressed from App.jsx
    const base64Data = ensureBase64(imageBase64);

    if (!IMAGE_API_KEY) {
        return { fusionImage: null, errors: { global: "Image API Key 缺失。" } };
    }

    // --- VIVE 摩登衣橱混搭引擎 (Double Life / 1920s vs 2026s) ---
    // User Request: "1920老上海年代的用户 和 2026年年代的用户的合拍照 在art deco装修风格的室内"

    // 1920s Vintage Style (Woman 1)
    const vintagePool = [
        "Traditional Silk Qipao with high collar and hand-embroidered peacocks",
        "Velvet Cheongsam with pearl necklace and finger-wave hairstyle",
        "Classic 1920s Shanghai sleeveless Qipao in emerald green silk",
        "Art Deco beaded evening dress with a feather fan (Shanghai socialite style)"
    ];

    // 2026s Modern Style (Woman 2)
    const modernPool = [
        "Futuristic structural blazer dress with metallic accents",
        "Minimalist high-fashion white silk gown (Celine/YSL vibe)",
        "Sheer architectural evening gown with sharp shoulders",
        "Modern Interpretation of Qipao: Leather and lace fusion",
        "Sleek black velvet tuxedo suit (Le Smoking style)"
    ];

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const style1920 = pick(vintagePool);
    const style2026 = pick(modernPool);

    // Random Scene Variations (Art Deco Theme)
    const scenePool = [
        "A grand **Art Deco Hotel Lobby in 1930s Shanghai**, marble floors, palm plants, geometric gold railings",
        "A dimly lit **Private Jazz Lounge**, velvet booth seating, amber lighting, vintage crystal glassware",
        "A **Luxurious Art Deco Dressing Room (Boudoir)**, triple mirrors, perfume bottles, satin drapes",
        "An **Elegant Art Deco Ballroom Balcony**, overlooking a party, theatrical curtains, cinematic depth",
        "A **Vintage Orient Express Train Cabin**, mahogany wood, brass fittings, plush seating, passing city lights outside"
    ];
    const selectedScene = pick(scenePool);

    console.log(`[Fusion] 1920s: ${style1920} | 2026s: ${style2026} | Scene: ${selectedScene}`);

    // 核心 Prompt - 终极版 (Double Life)
    const fusionPrompt = `
      **CRITICAL MISSION**: 
      Create a "Double Life" cinematic portrait featuring **TWO WOMEN** (Twin Sisters) posing together in a luxurious room.
      
      **1. IDENTITY & GENDER (MANDATORY)**:
      - **FORCE FEMALE**: Regardless of the uploaded photo's gender (even if male/child), verify the facial features but transform them into **TWO SOPHISTICATED ADULT WOMEN**.
      - Both women must share the *same facial identity* (based on the user's face) but look like sisters.
      - **Authentic Face**: Do not make them look like generic AI models. Preserve the unique eye shape/nose/mouth of the user, just feminized.

      **2. THE TWO FIGURES (Timeline Clash)**:
      - **Woman A (Left/Front) - The 1920s Soul**:
        - Outfit: ${style1920}.
        - Hair/Makeup: Vintage 1930s Shanghai finger waves, red lips, retro vibe.
        - Attitude: Classic, reserved, mysterious.
      
      - **Woman B (Right/Back) - The 2026s Modern Spirit**:
        - Outfit: ${style2026}.
        - Hair/Makeup: Sleek, modern, sharp, minimalist high-fashion.
        - Attitude: Confident, edgy, futuristic.

      **3. ENVIRONMENT (Art Deco Interior)**:
        - **Scene**: ${selectedScene}.
        - Details: Consistent with the chosen scene. Geometric patterns, luxurious textures, warm amber lighting. 
        - **NOT a flat graphic background**. It must be a 3D realistic ROOM with depth.

      **4. CRITICAL COMPOSITION (Unified Space & "Magazine Cover")**:
      - **ONE SINGLE IMAGE**: Generate a complete, continuous Art Deco interior scene. Do NOT create a collage or split screen.
      - **Composition**: The women stand in a high-ceilinged room. 
      - **HEADROOM (Top 25%)**: The upper part of the image MUST be the room's high ceiling (e.g., elegant molding, upper curtains, or dim amber ambiance). It should be relatively **UNCLUTTERED** to allow for a Logo overlay later.
      - **SUBJECT POSITION**: Position the women in the **BOTTOM 3/4** of the frame. Their heads should be below the top quarter line.
      - **NO TEXT**: The AI must NOT generate any text. The image must be a **clean photograph** without any magazine logos, titles, or watermarks.
      - **FULL BLEED**: Covers the entire canvas.
      
      **5. Quality**:
      - Masterpiece, 8k resolution, photorealistic skin texture, dramatic cinematic lighting.
    `;

    try {
        console.log(`[Fusion] 请求 ${IMAGE_MODEL}...`);

        const response = await fetch(`${BASE_URL}/models/${IMAGE_MODEL}:generateContent`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${IMAGE_API_KEY}`,
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
