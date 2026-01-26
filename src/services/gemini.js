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
        // 1. Old Money / Quiet Luxury
        "Cream white cashmere turtleneck with a satin champagne midi skirt (Old Money Aesthetic)",
        "Tailored oversized beige blazer with a silk camisole and wide-leg trousers (The Row Vibe)",
        "Navy blue tweed jacket set with gold buttons (Chanel Inspired Classic)",

        // 2. Modern Minimalist / High Fashion
        "Sleek black architectural evening gown with an asymmetric neckline (Modern Minimalist)",
        "Minimalist white silk slip dress draped with a structured tuxedo blazer (Celine Style)",
        "Sculptural off-shoulder cocktail dress in deep emerald velvet (Loewe Vibe)",

        // 3. Power Dressing / Chic
        "Sharp burgundy velvet jumpsuit with a plunging neckline (Power Dressing)",
        "Sheer organza blouse with high-waisted cigarette pants (Saint Laurent Vibe)",
        "Structured leather trench coat dress in warm cognac color (Modern City Chic)",

        // 4. Red Carpet / Glamour
        "Flowing silver-grey chiffon gown with a cape detail (Ethereal Modernity)",
        "Pearl-embellished halter neck evening dress (Modern Gatsby)",
        "Strapless black velvet gown with a dramatic side slit and diamond choker (Classic Hollywood 2026)"
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

    let diagnosticEndpoint = "Initializing...";
    let diagnosticKey = "N/A";

    try {
        const { baseUrl, imageKey, imageModel } = config.gemini;
        diagnosticKey = imageKey;

        let cleanBaseUrl = baseUrl.trim().replace(/\/+$/, '');
        const endpoint = cleanBaseUrl.replace('/v1beta', '/v1');
        diagnosticEndpoint = `${endpoint}/chat/completions`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 55000);

        const response = await fetch(diagnosticEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${imageKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
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

        if (data.error) {
            throw {
                message: data.error.message || JSON.stringify(data.error),
                diagnostic: {
                    url: diagnosticEndpoint,
                    keySample: diagnosticKey ? `${diagnosticKey.substring(0, 8)}...` : 'MISSING',
                    rawError: data.error.message || "API_ERROR_NO_MSG"
                }
            };
        }

        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error("No content in response");

        const urlMatch = content.match(/!\[.*?\]\((.*?)\)/);
        if (urlMatch && urlMatch[1]) {
            const capturedUrl = urlMatch[1];
            if (capturedUrl.startsWith('http') || capturedUrl.startsWith('data:')) {
                return { fusionImage: capturedUrl, errors: null };
            }
        }

        if (content.trim().startsWith('http')) {
            return { fusionImage: content.trim(), errors: null };
        }

        throw new Error("API returned text but no valid image URL found.");

    } catch (err) {
        console.error(`[Fusion] Error:`, err);

        if (err.diagnostic) return { fusionImage: null, errors: { global: err.message, diagnostic: err.diagnostic } };

        return {
            fusionImage: null,
            errors: {
                global: err.message,
                diagnostic: {
                    url: diagnosticEndpoint,
                    keySample: diagnosticKey ? `${diagnosticKey.substring(0, 8)}...` : 'N/A',
                    rawError: err.message || "UNKNOWN_ERR"
                }
            }
        };
    }
};
