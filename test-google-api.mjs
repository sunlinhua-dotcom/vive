
import axios from 'axios';
import fs from 'fs';
import path from 'path';

// 手动解析 .env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envConfig = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // 去除引号
        envConfig[key] = value;
    }
});

const API_KEY = envConfig.VITE_GEMINI_API_KEY;
const BASE_URL = envConfig.VITE_GEMINI_BASE_URL;

console.log("=== Google API Connectivity Test ===");
console.log(`Endpoint: ${BASE_URL}`);
console.log(`Key Masked: ${API_KEY ? API_KEY.substring(0, 8) + '...' : 'MISSING'}`);

if (!API_KEY || !BASE_URL) {
    console.error("Error: API Key or Base URL missing in .env");
    process.exit(1);
}

const testConnection = async () => {
    try {
        console.log("\nSending test request to Google Gemini...");

        // 构造请求，模拟前端的调用方式
        // 注意：Google 官方 OpenAI 兼容接口通常路径是 /chat/completions
        // 完整的 URL 会是 BASE_URL + 'chat/completions'
        // 但如果 BASE_URL 已经包含了 /openai/，则 axios 会自动处理拼接

        // 修正：确保 URL 拼接正确
        // 如果 BASE_URL 是 https://generativelanguage.googleapis.com/v1beta/openai/
        // 那么请求应该是 to /chat/completions

        const response = await axios.post('chat/completions', {
            model: "gemini-2.0-flash-exp", // 使用一个轻量级模型测试
            messages: [
                { role: "user", content: "Say 'Hello from Google API' if you can read this." }
            ]
        }, {
            baseURL: BASE_URL, // .env 里的地址
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            timeout: 10000 // 10秒超时
        });

        console.log("\n✅ Success! API Response:");
        console.log(response.data.choices[0].message.content);
        console.log("\n配置验证通过。本地环境可以连接 Google 官方 API。");

    } catch (error) {
        console.error("\n❌ Connection Failed:");
        if (error.response) {
            // 服务器返回了错误状态码
            console.error(`Status: ${error.response.status}`);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));

            if (error.response.status === 404) {
                console.error("提示：404 可能是 Base URL 不正确。Google OpenAI 兼容接口通常是 v1beta/openai/");
            }
        } else if (error.code === 'ECONNABORTED') {
            console.error("超时：连接 Google 服务器超时。请检查您的网络是否开启了 VPN/代理，因为 Google 在国内无法直连。");
        } else {
            console.error("Error:", error.message);
        }
    }
};

testConnection();
