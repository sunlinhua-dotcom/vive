
import 'dotenv/config'; // Load env vars BEFORE other imports
import express from 'express';
import cors from 'cors'; // Enable CORS for local dev
import bodyParser from 'body-parser';
import { analyzeImageAndGenerateCopy, generateFashionImages } from './src/services/gemini.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3004;

// Increase limit for image uploads
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors());

// In-memory Task Store (For MVP. In prod use Redis/DB)
const tasks = {};

// --- API Endpoints ---

// Root Check
app.get('/', (req, res) => {
    res.send('✅ VIVE Background Worker is Running. Please return to localhost:3003 to use the app.');
});

// 1. Submit Task - Returns Task ID immediately
app.post('/api/generate', async (req, res) => {
    try {
        const { imageDataUrl } = req.body;
        if (!imageDataUrl) {
            return res.status(400).json({ error: 'No image provided' });
        }

        const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Initialize Task State
        tasks[taskId] = {
            id: taskId,
            status: 'processing', // processing | completed | failed
            progress: 0,
            result: null,
            createdAt: Date.now()
        };

        // Start Background Process (Do NOT await this)
        processBackgroundTask(taskId, imageDataUrl);

        // Return immediately to client
        res.json({ taskId, message: 'Task submitted successfully' });

    } catch (error) {
        console.error("Submit error:", error);
        res.status(500).json({ error: 'Submission failed' });
    }
});

// 2. Check Status
app.get('/api/status/:taskId', (req, res) => {
    const { taskId } = req.params;
    const task = tasks[taskId];

    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
});

// --- Background Worker Logic ---

async function processBackgroundTask(taskId, imageDataUrl) {
    console.log(`[${taskId}] Starting background processing...`);
    const task = tasks[taskId];

    try {
        // Step 1: Analyze
        task.progress = 10;
        console.log(`[${taskId}] Analyzing image...`);
        // Note: We need to adapt the imported services to work in Node environment
        // Assuming gemini.js functions are compatible or we'll mock/adapt them.
        // For this implementation plan, we assume they are pure JS functions using fetch.

        const analysis = await analyzeImageAndGenerateCopy(imageDataUrl);
        task.progress = 40;
        task.analysis = analysis; // Save intermediate result

        // Step 2: Generate
        console.log(`[${taskId}] Generating fashion image...`);
        const images = await generateFashionImages(analysis.features, imageDataUrl);
        task.progress = 80;

        if (!images.fusionImage) {
            throw new Error(images.errors?.global || "AI Generation Failed");
        }

        // Step 3: Composition (Simplified for Node)
        // In a real Node environment, we might use 'sharp' or 'canvas'.
        // For now, we'll store the fusion string directly. 
        // If imageCompositor uses Browser Canvas, we might need to skip complex composition 
        // or replace it with a server-side equivalent. 
        // For this immediate step, we will return the generated image directly.

        const finalImage = images.fusionImage;

        // Complete
        task.result = {
            fusionImage: finalImage,
            month: new Date().toLocaleString('en-US', { month: 'long' }).toUpperCase(),
            year: new Date().getFullYear(),
            keyword: analysis.keyword,
            attitude: analysis.attitude
        };
        task.status = 'completed';
        task.progress = 100;
        console.log(`[${taskId}] Completed successfully.`);

    } catch (error) {
        console.error(`[${taskId}] Failed:`, error);
        task.status = 'failed';
        task.error = error.message;
    }
}

app.listen(PORT, () => {
    console.log(`Background Worker Server running on http://localhost:${PORT}`);
});
