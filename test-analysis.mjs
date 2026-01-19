
// 测试 APIYI 的分析接口
const API_KEY = 'sk-g8JehwXjfoWKeHxvDdAe2277FeA24c0094B7E6Fe5566346b';
const BASE_URL = 'https://api.apiyi.com/v1beta';

async function testAnalysis() {
    console.log("=== Testing Analysis API ===");

    const prompt = `
      你是一个精通面相学和时尚摄影的专家。请分析一张假设的自拍照。
      
      请完成以下任务，并以json格式返回：
      1. 'features': 用精确的英文描述面部特征。
      2. 'keyword': 为用户生成一个"摩登关键词"，格式为"#XXXX"（例如 #明媚的玫瑰）
      3. 'attitude': 用一句简短的话总结用户的"摩登态度"，要在15个字以内。
      4. 'loading_text': 生成一句优美的等待文案。
      请直接返回JSON对象。
    `;

    try {
        const response = await fetch(`${BASE_URL}/models/gemini-3-flash-preview:generateContent`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();
        console.log("\n=== Raw Response ===");
        console.log(JSON.stringify(data, null, 2));

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            const text = data.candidates[0].content.parts[0].text;
            console.log("\n=== Extracted Text ===");
            console.log(text);

            // 尝试解析 JSON
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                const parsed = JSON.parse(cleanText);
                console.log("\n=== Parsed JSON ===");
                console.log("keyword:", parsed.keyword);
                console.log("attitude:", parsed.attitude);
                console.log("features:", parsed.features);
                console.log("loading_text:", parsed.loading_text);
            } catch (e) {
                console.log("JSON Parse Error:", e.message);
            }
        }

    } catch (error) {
        console.error("Request failed:", error.message);
    }
}

testAnalysis();
