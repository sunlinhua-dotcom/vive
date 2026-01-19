
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

// 用户指定的模型名称
const MODEL_NAME = "gemini-3.0-flash-image-preview";
// Google 官方 Base URL
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

console.log(`=== Testing Model: ${MODEL_NAME} ===`);
console.log(`Using Key: ${API_KEY.substring(0, 8)}...`);

const testModel = async () => {
    try {
        const url = `${BASE_URL}/${MODEL_NAME}:generateContent?key=${API_KEY}`;

        console.log(`Sending request to: ${url.replace(API_KEY, '***')}`);

        const response = await axios.post(url, {
            contents: [{
                parts: [{ text: "Hello, draw a cat." }]
            }]
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log("\n✅ Success! The model exists and responded.");
        console.log(response.data);

    } catch (error) {
        console.error("\n❌ Request Failed:");
        if (error.response) {
            console.error(`Status: ${error.response.status} ${error.response.statusText}`);
            console.error("Error Details:", JSON.stringify(error.response.data, null, 2));

            if (error.response.status === 404) {
                console.log("\n[结论] Google官方返回 404 Not Found。");
                console.log("说明 'gemini-3.0-flash-image-preview' 这个模型名在官方接口下不存在或无权访问。");
                console.log("提示：这个名字可能是【代理商自定义】的，如果直连 Google，通常应使用 'gemini-2.0-flash-exp' 或 'gemini-1.5-flash'。");
            }
        } else {
            console.error(error.message);
        }
    }
};

testModel();
