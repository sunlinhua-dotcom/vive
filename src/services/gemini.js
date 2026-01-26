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
export const generateFashionImages = async (features, imageBase64) => {
    const config = getConfig();
    const base64Data = ensureBase64(imageBase64);

    // --- Style Mix Logic (Preserved) ---
    const vintagePool = [
        "Traditional Silk Qipao with high collar and hand-embroidered peacocks",
        "Velvet Cheongsam with pearl necklace and finger-wave hairstyle",
        "Classic 1920s Shanghai sleeveless Qipao in emerald green silk",
        "Art Deco beaded evening dress with a feather fan"
    ];
    const modernPool = [
        "Contemporary tailored white suit with a silk camisole (Old Money aesthetic)",
        "Elegant black evening gown with asymmetric neckline (Modern Minimalist)",
        "Chic tweed jacket paired with a flowing satin skirt (Modern Classic)",
        "Sophisticated jumpsuit in deep burgundy velvet (Power Dressing)",
        "Modern simplified Qipao with geometric cuts (New Chinese Style)",
        "Sheer architectural evening gown with sharp shoulders (High Fashion)",
        "Minimalist white silk slip dress with a blazer (Celine Vibe)"
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
        fusionPrompt += `\n\nContext: One version wears ${style1920}. The other wears ${style2026}. Scene: ${selectedScene}`;
    }

    try {
        // GEMINI IMPLEMENTATION (VIA OPENAI COMPATIBLE ENDPOINT)
        const { baseUrl, imageKey, imageModel } = config.gemini;
        console.log(`[Fusion] 请求 ${imageModel} via OpenAI-Protocol...`);

        // 这个服务商 apiyi.com 封装了 Gemini 为 OpenAI 格式 (v1/chat/completions)
        // 即使是 "Gemini Image" 模型，通常也是通过 Chat 接口传图片 (Vision)
        const endpoint = baseUrl.endsWith('/v1beta') ? baseUrl.replace('/v1beta', '/v1') : baseUrl;

        // Timeout Controller (55s)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 55000);

        const response = await fetch(`${endpoint}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${imageKey}`,
                'Content-Type': 'application/json'
            },
            signal: controller.signal,
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

        clearTimeout(timeoutId);

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

    } catch (err) {
        console.error(`[Fusion] Error:`, err);
        return { fusionImage: null, errors: { global: err.message } };
    }
};
