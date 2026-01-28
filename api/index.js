const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Support large base64 images

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Image generation endpoint
app.post('/api/generate-image', async (req, res) => {
    try {
        const { imageBase64 } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: 'Missing imageBase64' });
        }

        // Get API credentials from environment variables (server-side only)
        const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL || 'https://api.apiyi.com/v1beta';
        const GEMINI_IMAGE_KEY = process.env.GEMINI_IMAGE_KEY;
        const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image-preview';

        if (!GEMINI_IMAGE_KEY) {
            console.error('Missing GEMINI_IMAGE_KEY environment variable');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Build the prompt (same as frontend logic)
        const vintagePool = [
            "Cinnabar Red Velvet Cheongsam with sophisticated gold dragon embroidery",
            "Wine Red Silk Qipao featuring golden geometric Art Deco patterns",
            "Midnight Black Silk Qipao with hand-painted gold magnolia flowers",
            "Black Lace Cheongsam with a golden satin underlayer, sheer sleeves",
            "Dusty Pink Silk Qipao with pearl trimmings and white floral embroidery",
            "Muted Lavender Satin Cheongsam with silver thread sketching",
            "Champagne Gold Silk Qipao, fully sequined, glimmering under warm light",
            "Silver Grey Damask Qipao with subtle cloud patterns"
        ];

        const modernPool = [
            "Modern Red Power Suit with sharp lapels and a black silk camisole",
            "Deep Burgundy Velvet Evening Gown, off-shoulder, minimalist cut",
            "Structured Black Blazer with gold buttons, paired with wide-leg trousers",
            "Black Halter-neck Jumpsuit with a metallic gold belt",
            "Pale Pink Oversized Cashmere Coat draped over a white slip dress",
            "Lilac Grey Silk Shirt tucked into a high-waisted pencil skirt",
            "Silver Satin Bias-cut Dress, flowing and liquid-like texture",
            "Charcoal Grey Wool Trench Coat worn over shoulders, chic and effortless"
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

        // Get prompt template from environment or use default
        const promptTemplate = process.env.IMAGE_GENERATION_PROMPT || `**CRITICAL MISSION**: 
Create a "Parallel Life" cinematic portrait featuring **THE SAME PERSON** in two different timelines (1920 and 2026).

**1. IDENTITY (STRICT)**:
- BOTH figures MUST be the **IDENTICAL SAME PERSON**. 
- **MANDATORY**: Preserve the **EXACT facial bone structure**, jawline contour, and chin shape from the source image for BOTH characters.
- **1920s Version**: Wearing {{style1920}}.
- **2026s Version**: Wearing {{style2026}}.

**2. ENVIRONMENT**:
- **Scene**: {{scene}}
- Art Deco Interior, warm amber lighting.

**3. COMPOSITION**:
- **Magazine Cover Style**:
  - **ATMOSPHERE**: Generate a **FAINT, GOLDEN textual logo "VIVE"**.
  - **POSITION**: **VERTICAL: STRICTLY AT TOP 25% (1/4) LINE**. NOT at the top edge. Leave breathing room above.
  - **SIZE**: **MASSIVE**. The text MUST span **85% of the IMAGE WIDTH**.
  - **Style**: Standard Serif Font. Faint Golden Color. 
  - **Scene Depth**: **High Ceiling**. Ensure the background extends to the very top.
  - **Composition**: Cinematic wide shot. Subject positioned naturally low. 
  - **Headroom**: The massive VIVE text dominates the upper quarter of the image.
- **Camera**: Eye-level or slightly low angle.`;

        const fusionPrompt = promptTemplate
            .replace('{{style1920}}', style1920)
            .replace('{{style2026}}', style2026)
            .replace('{{scene}}', selectedScene);

        // Ensure base64 data is clean
        const base64Data = imageBase64.includes('base64,')
            ? imageBase64.split('base64,')[1]
            : imageBase64;

        console.log(`[API] Calling Gemini API: ${GEMINI_IMAGE_MODEL}`);

        // Call Gemini API
        const response = await fetch(`${GEMINI_BASE_URL}/models/${GEMINI_IMAGE_MODEL}:generateContent`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GEMINI_IMAGE_KEY}`,
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

        if (data.error) {
            console.error('[API] Gemini error:', data.error);
            return res.status(500).json({ error: data.error.message || 'Gemini API error' });
        }

        const candidate = data.candidates?.[0];
        if (candidate?.finishReason === 'SAFETY') {
            return res.json({ fusionImage: null, errors: { global: "Safety Block" } });
        }

        const b64 = candidate?.content?.parts?.[0]?.inlineData?.data ||
            candidate?.content?.parts?.[0]?.inline_data?.data;

        if (b64) {
            return res.json({
                fusionImage: `data:image/jpeg;base64,${b64}`,
                errors: null
            });
        }

        throw new Error("No image data in response");

    } catch (error) {
        console.error('[API] Error:', error);
        res.status(500).json({
            error: error.message || 'Internal server error',
            fusionImage: null,
            errors: { global: error.message }
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 VIVE API Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});
