
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

// 要测试的模型列表 (Nano Banana Pro 的可能官方名称)
const MODELS_TO_TEST = [
    "gemini-3-pro-image-preview",
    "gemini-3.0-flash-image",
    "gemini-2.5-flash-image-preview",
    "gemini-2.5-flash-preview-04-17", // 最新版 (2.5 Flash 官方确认名)
    "imagen-4.0-generate-001"
];

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

console.log(`=== Testing Nano Banana Pro (Gemini 3 Image) Models ===`);
console.log(`Using Key: ${API_KEY.substring(0, 8)}...\n`);

const testModel = async (modelName) => {
    try {
        const url = `${BASE_URL}/${modelName}:generateContent?key=${API_KEY}`;
        console.log(`Testing: ${modelName}...`);

        const response = await axios.post(url, {
            contents: [{
                parts: [{ text: "Hello, draw a simple blue circle." }]
            }],
            generationConfig: {
                response_mime_type: "image/jpeg" // 明确要求返回图片
            }
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 15000
        });

        console.log(`  ✅ ${modelName} - SUCCESS!`);
        // 检查是否返回了图片数据
        if (response.data.candidates && response.data.candidates[0]?.content?.parts[0]?.inline_data) {
            console.log(`     -> 返回了 Base64 图片数据!`);
        } else if (response.data.candidates && response.data.candidates[0]?.content?.parts[0]?.text) {
            console.log(`     -> 返回了文本: ${response.data.candidates[0].content.parts[0].text.substring(0, 50)}...`);
        }
        return true;

    } catch (error) {
        if (error.response) {
            if (error.response.status === 404) {
                console.log(`  ❌ ${modelName} - 404 Not Found`);
            } else if (error.response.status === 400) {
                // 400 可能说明模型存在但参数不对，也是一种"存在"的证明
                console.log(`  ⚠️ ${modelName} - 400 Bad Request (模型可能存在，但参数有误)`);
                console.log(`     Detail: ${JSON.stringify(error.response.data?.error?.message || '').substring(0, 100)}`);
            } else {
                console.log(`  ⚠️ ${modelName} - ${error.response.status} ${error.response.statusText}`);
            }
        } else {
            console.log(`  ❌ ${modelName} - Network Error: ${error.message}`);
        }
        return false;
    }
};

const runTests = async () => {
    for (const model of MODELS_TO_TEST) {
        await testModel(model);
    }
    console.log("\n=== Testing Complete ===");
};

runTests();
