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
export const analyzeImageAndGenerateCopy = async (imageBase64) => {
    const config = getConfig();
    const base64Data = ensureBase64(imageBase64);

    try {
        if (config.provider === 'doubao') {
            // DOUBAO IMPLEMENTATION (Text Analysis)
            // Note: Doubao vision models might differ. Assuming standard multimodal endpoint or placeholder.
            // For now, if no vision model in Doubao config, fall back or error.
            if (!config.doubao.apiKey) throw new Error("Doubao API Key missing");
            console.log("Calling Doubao for Analysis...");

            // Construct OpenAI-compatible vision message
            const messages = [
                {
                    role: "user",
                    content: [
                        { type: "text", text: config.prompts.textAnalysis },
                        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Data}` } }
                    ]
                }
            ];

            const data = await callDoubaoAPI(config.doubao.baseUrl, config.doubao.apiKey, config.doubao.model, messages);
            const content = data.choices?.[0]?.message?.content || '{}';
            const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();

            let parsed = {};
            try {
                parsed = JSON.parse(cleanContent);
            } catch (e) {
                console.warn("Doubao JSON Parse Failed, trying regex...", e);
                const match = cleanContent.match(/\{[\s\S]*\}/);
                if (match) {
                    try { parsed = JSON.parse(match[0]); } catch (e2) { /* ignore */ }
                }
            }

            return {
                features: parsed.features || "Asian woman, elegant features",
                keyword: parsed.keyword || "#摩登双妹",
                attitude: parsed.attitude || "优雅永不过时",
                loading_text: parsed.loading_text || "正在穿越时光..."
            };

        } else {
            // GEMINI IMPLEMENTATION (Original)
            const { baseUrl, textKey, textModel } = config.gemini;
            console.log(`正在调用 ${textModel} 分析图片...`);

            const response = await fetch(`${baseUrl}/models/${textModel}:generateContent`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${textKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: config.prompts.textAnalysis },
                            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
                        ]
                    }]
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);

            const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
            let parsed = {};
            try {
                parsed = JSON.parse(cleanContent);
            } catch (e) {
                const match = cleanContent.match(/\{[\s\S]*\}/);
                if (match) parsed = JSON.parse(match[0]);
            }

            return {
                features: parsed.features || "Asian woman, elegant features",
                keyword: parsed.keyword || "#摩登双妹",
                attitude: parsed.attitude || "优雅永不过时",
                loading_text: parsed.loading_text || "正在穿越时光..."
            };
        }

    } catch (error) {
        console.error(`${config.provider.toUpperCase()} Analysis Error:`, error);
        // Fallback
        return {
            features: "Asian woman, elegant features",
            keyword: "#传奇的摩登",
            attitude: "优雅是永不过时的经典",
            loading_text: "正在为您回溯百年前的摩登时光..."
        };
    }
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

    // Fallback if {{tags}} missing in config but needed logic exists
    // (Simplification: We assume the config prompt has the placeholders or is generic enough)

    // Add specific style details if the prompt is generic, or rely on the user editing the prompt in Admin to include placeholders.
    // For safety, let's append the style context if prompt looks short.
    if (!fusionPrompt.includes("Woman A")) {
        fusionPrompt += `\n\nContext: Woman A wears ${style1920}. Woman B wears ${style2026}. Scene: ${selectedScene}`;
    }

    try {
        if (config.provider === 'doubao') {
            // DOUBAO/SEEDREAM IMPLEMENTATION (Image Gen)
            if (!config.doubao.apiKey) return { fusionImage: null, errors: { global: "Doubao API Key missing" } };

            console.log("Calling Doubao (SeeDream)...");

            // CRITICAL FIX: Doubao is Text-to-Image only.
            // We MUST inject the analyzed facial features into the prompt, otherwise it generates a generic person.
            const doubaoPrompt = `${fusionPrompt}\n\n**CRITICAL VISUAL REQUIREMENT**:\nBoth women MUST share the same face based on these features: ${features}.\nThey are the same person in parallel universes.`;

            // Seedream Payload (Strictly following user documentation)
            // Note: Seedream is Text-to-Image. It does NOT support 'image_url' for standard generation.
            // We rely on the prompt to carry the style.
            const response = await fetch(`${config.doubao.baseUrl}/images/generations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.doubao.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: config.doubao.imageModel, // e.g. seedream-4-5-251128
                    prompt: doubaoPrompt,
                    size: "2048x2048", // Method 2: Precise pixels (User docs recommend this or "4K")
                    quality: "standard",
                    n: 1,
                    response_format: "b64_json" // Prefer Base64 to avoid URL access issues
                })
            });
            const data = await response.json();

            // Handle various response formats
            if (data.data?.[0]?.b64_json) {
                return { fusionImage: `data:image/jpeg;base64,${data.data[0].b64_json}`, errors: null };
            } else if (data.data?.[0]?.url) {
                return { fusionImage: data.data[0].url, errors: null };
            }

            console.error("Doubao Unknown Response:", data);

            // Helpful error handling for common 503/400
            if (data.error) {
                throw new Error(`${data.error.message} (Provider Error)`);
            }
            throw new Error("Doubao Image API Response Unknown");

        } else {
            // GEMINI IMPLEMENTATION
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
        }

    } catch (err) {
        console.error(`[Fusion] Error:`, err);
        return { fusionImage: null, errors: { global: err.message } };
    }
};
