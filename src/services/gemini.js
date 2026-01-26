import { getConfig } from './config';



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

export const analyzeImageAndGenerateCopy = async () => {
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
        fusionPrompt += `\n\nContext: One version wears ${style1920}. The other wears ${style2026}. Scene: ${selectedScene}`;
    }

    try {
        // GEMINI IMPLEMENTATION (Exclusive)
        const { baseUrl, imageKey, imageModel } = config.gemini;
        console.log(`[Fusion] 请求 ${imageModel}...`);

        const response = await fetch(`${baseUrl}/models/${imageModel}:generateContent`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${imageKey}`,
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
                    imageConfig: { aspectRatio: "3:4", imageSize: "1K" }
                }
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

        const candidate = data.candidates?.[0];
        if (candidate?.finishReason === 'SAFETY') return { fusionImage: null, errors: { global: "Safety Block" } };

        let b64 = candidate?.content?.parts?.[0]?.inlineData?.data || candidate?.content?.parts?.[0]?.inline_data?.data;
        if (b64) return { fusionImage: `data:image/jpeg;base64,${b64}`, errors: null };

        throw new Error("No image data in response");

    } catch (err) {
        console.error(`[Fusion] Error:`, err);
        return { fusionImage: null, errors: { global: err.message } };
    }
};
