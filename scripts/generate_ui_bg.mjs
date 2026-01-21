
import fs from 'fs';
import path from 'path';
import https from 'https';

// Load env vars manually to avoid dependencies
const envContent = fs.readFileSync(path.resolve('.env'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) env[key.trim()] = val.trim();
});

const API_KEY = env.VITE_GEMINI_API_KEY;
const BASE_URL = env.VITE_GEMINI_BASE_URL;

if (!API_KEY) {
    console.error("API Key not found in .env");
    process.exit(1);
}

const prompt = `
Generate a luxurious, abstract Art Deco background texture for a high-end mobile app.
Color palette: Deep Coffee/Black background with glowing Champagne Gold geometric lines.
Style: 1930s Shanghai vintage glamour meets futuristic "Portal" vibes.
Atmosphere: Cinematic, moody, expensive, mysterious.
Composition: Central area should be slightly darker to allow for foreground content.
No text. 8k resolution, high texture detail (velvet/gold foil).
`;

const payload = {
    contents: [{
        parts: [{ text: prompt }]
    }],
    generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: {
            aspectRatio: "9:16",
            imageSize: "1K" // Or generic size
        }
    }
};

console.log("Generating UI Background with Gemini API...");

const req = https.request(`${BASE_URL}/models/gemini-3-pro-image-preview:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
}, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API Error:", json.error);
                return;
            }

            // Check for image data (handling both underscore and camelCase)
            const parts = json.candidates?.[0]?.content?.parts?.[0];
            let imageBase64;

            if (parts?.inlineData?.data) {
                imageBase64 = parts.inlineData.data;
            } else if (parts?.inline_data?.data) {
                imageBase64 = parts.inline_data.data;
            }

            if (imageBase64) {
                const buffer = Buffer.from(imageBase64, 'base64');
                fs.writeFileSync('public/ui-background.jpg', buffer);
                console.log("Success! Background saved to public/ui-background.jpg");
            } else {
                console.error("No image data found in response:", JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.error("Parse Error:", e);
            console.log("Raw Response:", data);
        }
    });
});

req.on('error', (e) => console.error("Request Error:", e));
req.write(JSON.stringify(payload));
req.end();
