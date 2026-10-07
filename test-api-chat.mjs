
import axios from 'axios';

const API_KEY = process.env.YINLI_API_KEY;
if (!API_KEY) throw new Error('YINLI_API_KEY is not set');
const BASE_URL = 'https://yinli.one/v1';

async function testChatCompletion() {
    const payload = {
        model: "gemini-3-pro-image-preview",
        messages: [
            { role: "user", content: "Generate an image of a cute cat" } // 明确用 Generate image
        ]
    };

    try {
        const res = await axios.post(`${BASE_URL}/chat/completions`, payload, {
            headers: { 'Authorization': `Bearer ${API_KEY}` },
            validateStatus: () => true
        });

        if (res.data.choices && res.data.choices[0]) {
            console.log("CONTENT:", res.data.choices[0].message.content);
        } else {
            console.log("FULL BODY:", JSON.stringify(res.data, null, 2));
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}
testChatCompletion();
