
// 测试 APIYI 的 gemini-3-pro-image-preview 接口
const API_KEY = 'sk-g8JehwXjfoWKeHxvDdAe2277FeA24c0094B7E6Fe5566346b';
const BASE_URL = 'https://api.apiyi.com/v1beta';
const MODEL = 'gemini-3-pro-image-preview';

async function testAPIYI() {
    console.log("=== Testing APIYI gemini-3-pro-image-preview ===");

    try {
        const response = await fetch(`${BASE_URL}/models/${MODEL}:generateContent`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Generate an image of a beautiful blue butterfly on a white background." }
                    ]
                }],
                generationConfig: {
                    responseModalities: ["IMAGE"],
                    imageConfig: {
                        aspectRatio: "1:1",
                        imageSize: "1K"
                    }
                }
            })
        });

        const data = await response.json();

        console.log("\n=== Full Response ===");
        console.log(JSON.stringify(data, null, 2));

        // 检查各种可能的结构
        if (data.error) {
            console.log("\n❌ API Error:", data.error);
        } else if (data.candidates) {
            console.log("\n✅ Candidates found!");
            console.log("Structure:", Object.keys(data.candidates[0]));
            if (data.candidates[0].content) {
                console.log("Content parts:", data.candidates[0].content.parts?.length);
                data.candidates[0].content.parts?.forEach((part, i) => {
                    console.log(`Part ${i}:`, Object.keys(part));
                    if (part.inline_data) {
                        console.log(`  -> inline_data.mime_type:`, part.inline_data.mime_type);
                        console.log(`  -> inline_data.data length:`, part.inline_data.data?.length);
                    }
                    if (part.inlineData) {
                        console.log(`  -> inlineData.mimeType:`, part.inlineData.mimeType);
                        console.log(`  -> inlineData.data length:`, part.inlineData.data?.length);
                    }
                });
            }
        } else {
            console.log("\n⚠️ Unknown response structure");
        }

    } catch (error) {
        console.error("Request failed:", error.message);
    }
}

testAPIYI();
