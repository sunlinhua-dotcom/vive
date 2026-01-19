
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// 手动解析 .env 获取 Key
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
let API_KEY = '';
envContent.split('\n').forEach(line => {
    const match = line.match(/^VITE_GEMINI_API_KEY=(.*)$/);
    if (match) API_KEY = match[1].trim();
});

// 测试模型 (不使用 response_mime_type，让模型自由返回)
const MODEL_NAME = "gemini-2.0-flash-exp-image-generation";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

console.log(`=== Testing Image Generation Model ===`);
console.log(`Model: ${MODEL_NAME}`);
console.log(`Key: ${API_KEY.substring(0, 8)}...\n`);

const testImageGen = async () => {
    try {
        const url = `${BASE_URL}/${MODEL_NAME}:generateContent?key=${API_KEY}`;

        console.log(`Sending image generation request...`);

        // 不使用 response_mime_type，让模型自动决定返回格式
        const response = await axios.post(url, {
            contents: [{
                parts: [{
                    text: "Generate an image of a beautiful red rose on a white background. Return the image directly."
                }]
            }]
            // 注意：不设置 generationConfig.response_mime_type
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000 // 60秒超时
        });

        console.log("\n✅ Success! Response received.");

        // 检查返回内容
        if (response.data.candidates && response.data.candidates[0]) {
            const parts = response.data.candidates[0].content.parts;
            for (const part of parts) {
                if (part.inline_data) {
                    console.log(`  -> 返回了图片数据! MIME: ${part.inline_data.mime_type}`);
                    console.log(`  -> Base64 长度: ${part.inline_data.data.length} chars`);
                    // 保存图片到文件
                    const imgBuffer = Buffer.from(part.inline_data.data, 'base64');
                    fs.writeFileSync('test-output.jpg', imgBuffer);
                    console.log(`  -> 图片已保存到 test-output.jpg`);
                } else if (part.text) {
                    console.log(`  -> 返回了文本: ${part.text.substring(0, 100)}...`);
                }
            }
        } else {
            console.log("响应结构:", JSON.stringify(response.data, null, 2).substring(0, 500));
        }

    } catch (error) {
        console.error("\n❌ Request Failed:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error("Error:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
};

testImageGen();
