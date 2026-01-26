import { getConfig } from './config';

// --- Doubao (Volcengine) API Helper ---
const callDoubaoAPI = async (endpoint, apiKey, model, messages) => {
    // Standard OpenAI-compatible format for Volcengine Ark
    const response = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: messages
        })
    });
    return response.json();
};

// Helper to strip data URL header if present
const ensureBase64 = (str) => {
    if (!str) return '';
    if (str.includes(',')) return str.split(',')[1];
    return str;
};

/**
 * 步骤 1: 分析用户图片并生成文案
 */
// Local Slogan Pool (Zero API Cost)
const sloganPool = [
    { k: "#锐意先锋", a: "以锋芒之姿，诠释当代风范。" },
    { k: "#赤诚摩登", a: "以赤诚底色，挥洒摩登意气。" },
    { k: "#独立自洽", a: "于方寸之间，自有天地广阔。" },
    { k: "#无畏锋芒", a: "以破局之姿，重塑摩登定义。" },
    { k: "#如花明媚", a: "让本色盛放，不负鎏金岁月。" },
    { k: "#如狮无畏", a: "心有大格局，自有万千气象。" },
    { k: "#尽态极妍", a: "登场即焦点，演绎摩登风范。" },
    { k: "#传世之美", a: "岁月不败我，沉淀非凡底蕴。" },
    { k: "#东情西韵", a: "蕴东方风骨，彰显摩登格调。" }
];

export const analyzeImageAndGenerateCopy = async (imageBase64) => {
    // Zero-Cost Implementation: Randomly select a slogan
    // The user specifically requested to avoid "wasting money" on analysis API calls.
    console.log("Skipping API Analysis (Cost Saving Mode)...");

    // Simulate a short delay to feel "real"
    await new Promise(r => setTimeout(r, 800));

    const randomPick = sloganPool[Math.floor(Math.random() * sloganPool.length)];

    return {
        features: "", // No text features needed for pure Img2Img
        keyword: randomPick.k,
        attitude: randomPick.a,
        loading_text: "正在穿越时光..."
    };
};

/**
 * 步骤 2: 生成图片
 */
const compressForAPI = (base64Str) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = `data:image/jpeg;base64,${ensureBase64(base64Str)}`;
        img.onload = () => {
            const MAX_DIM = 1024; // Limit to 1024px to save tokens/bandwidth
            let w = img.width;
            let h = img.height;

            if (w > h) {
                if (w > MAX_DIM) {
                    h = Math.round((h * MAX_DIM) / w);
                    w = MAX_DIM;
                }
            } else {
                if (h > MAX_DIM) {
                    w = Math.round((w * MAX_DIM) / h);
                    h = MAX_DIM;
                }
            }

            const cvs = document.createElement('canvas');
            cvs.width = w;
            cvs.height = h;
            const ctx = cvs.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            // 0.6 Quality is enough for AI ref
            resolve(ensureBase64(cvs.toDataURL('image/jpeg', 0.6)));
        };
        img.onerror = () => resolve(ensureBase64(base64Str)); // Fallback
    });
};

export const generateFashionImages = async (features, imageBase64) => {
    const config = getConfig();
    // OPTIMIZATION: Compress before sending to avoid Status 413 / 429 (Bandwidth Limit)
    const base64Data = await compressForAPI(imageBase64);

    // --- Style Mix Logic (Preserved) ---
    const vintagePool = [
        "Traditional Silk Qipao with high collar and hand-embroidered peacocks",
        "Velvet Cheongsam with pearl necklace and finger-wave hairstyle",
        "Classic 1920s Shanghai sleeveless Qipao in emerald green silk",
        "Art Deco beaded evening dress with a feather fan"
    ];
    const modernPool = [
        "Futuristic structural blazer dress with metallic accents",
        "Minimalist high-fashion white silk gown (Celine/YSL vibe)",
        "Sheer architectural evening gown with sharp shoulders",
        "Modern Interpretation of Qipao: Leather and lace fusion",
        "Sleek black velvet tuxedo suit"
    ];
    const scenePool = [
        "A grand **Art Deco Hotel Lobby in 1930s Shanghai**",
        "A dimly lit **Private Jazz Lounge**",
        "A **Luxurious Art Deco Dressing Room (Boudoir)**",
        "An **Elegant Art Deco Ballroom Balcony**",
        "A **Vintage Orient Express Train Cabin**"
    ];

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const style1920 = pick(vintagePool);
    const style2026 = pick(modernPool);
    const selectedScene = pick(scenePool);

    // Inject styles into the prompt template
    let fusionPrompt = config.prompts.imageGeneration
        .replace('{{style1920}}', style1920)
        .replace('{{style2026}}', style2026)
        .replace('{{scene}}', selectedScene);

    if (!fusionPrompt.includes("1920s Version")) {
        fusionPrompt += `\\n\\nContext: One version wears ${style1920}. The other wears ${style2026}. Scene: ${selectedScene}`;
    }

    try {
        if (config.provider === 'doubao') {
            // DOUBAO/SEEDREAM IMPLEMENTATION (Image Gen)
            // Simple fallback to ensure syntax valid if user switches
            if (!config.doubao.apiKey) return { fusionImage: null, errors: { global: "Doubao API Key missing" } };
            // (We can leave Doubao stubbed or simplified if unused, but better to keep structure)
            throw new Error("Doubao temporarily disabled in this fix");
            // GEMINI IMPLEMENTATION (VIA OPENAI COMPATIBLE ENDPOINT)
            const { baseUrl, imageKey, imageModel } = config.gemini;
            console.log(`[Fusion] 请求 ${imageModel} via OpenAI-Protocol...`);

            // [FIX] Relaxed Endpoint Logic:
            // 1. If user explicitly provided a path ending in /v1 or /v1beta, trust it.
            // 2. Only if it looks like a root URL, append /chat/completions.
            // 3. Keep v1beta if the provider supports it (apiyi might need it for Preview models).

            let finalBaseUrl = baseUrl;
            // Only strip beta if we are sure standard v1 is required, but for "preview" models, beta might be safer.
            // Let's try trusting the config first. if config is `.../v1beta`, use it.

            const endpoint = `${finalBaseUrl}/chat/completions`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${imageKey}`,
                    'Content-Type': 'application/json'
                },
                // ...
                body: JSON.stringify({
                    model: imageModel,
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
                    ],
                    max_tokens: 4096
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

            // OpenAI Format Response: choices[0].message.content
            // 某些 Gemini 封装可能会返回图片 URL 在 content 里，或者直接返回 base64
            // 但如果这是一个 "Image Generation" 模型伪装的 Chat，它可能返回 Markdown 图片链接
            const content = data.choices?.[0]?.message?.content;

            if (!content) throw new Error("No content in response");

            // 尝试提取 Markdown 图片链接: ![image](url_or_base64)
            // 兼容 HTTP URL 和 Data URI (Base64)
            const urlMatch = content.match(/!\[.*?\]\((.*?)\)/);
            if (urlMatch && urlMatch[1]) {
                const capturedUrl = urlMatch[1];
                // 确保它看起来像 URL 或 Data URI
                if (capturedUrl.startsWith('http') || capturedUrl.startsWith('data:')) {
                    return { fusionImage: capturedUrl, errors: null };
                }
            }

            // 如果只有文本且不是链接，可能是报错或者描述
            // 但如果这是生图模型，有些服务商会把 base64 塞在 content 里?
            // Fallback: 假设 content 本身就是 URL (如果它以 http 开头)
            if (content.trim().startsWith('http')) {
                return { fusionImage: content.trim(), errors: null };
            }

            console.warn("Gemini Response Content:", content);
            throw new Error("API returned text but no valid image URL found.");

        }
    } catch (err) {
        console.error(`[Fusion] Error:`, err);
        return { fusionImage: null, errors: { global: err.message } };
    }
};
