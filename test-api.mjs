
import axios from 'axios';

const API_KEY = 'sk-Yijg6QsrHpx4UTCQE6HqTRXJQ2Giqo9XvOvCoU5ZCAHFwuUA';
const BASE_URL = 'https://yinli.one/v1';

async function testImageGen() {
    console.log('Testing Image Generation API...');

    const payload = {
        model: "gemini-3-pro-image-preview",
        prompt: "A vintage Shanghai style poster of a beautiful woman, 1930s style",
        n: 1,
        size: "1024x1024"
        // 不加 response_format，默认测试 url
    };

    try {
        const res = await axios.post(`${BASE_URL}/images/generations`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            // 这里的 validateStatus 允许我们捕获 4xx 5xx 错误并查看 body
            validateStatus: () => true
        });

        console.log(`Status: ${res.status}`);
        console.log('Body:', JSON.stringify(res.data, null, 2));

        if (res.status !== 200) {
            console.error("API Call Failed!");
            // 如果是 404，可能是路径不对，尝试 chat 接口
            if (res.status === 404) {
                console.log("\nAttempting Fallback: Chat Completions for Image...");
                await testChatImage();
            }
        } else {
            console.log("SUCCESS! API is working with /images/generations");
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function testChatImage() {
    // 某些代理只开放了 chat 接口，需要通过 prompt 触发画图
    // 但通常这比较少见。我们主要测试它是否支持。
    console.log("Skipping chat test for now, focusing on fixing generation endpoint first.");
}

testImageGen();
