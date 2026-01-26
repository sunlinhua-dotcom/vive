
// Web Worker for Image Compression (Off Main Thread)
// Context: Self (Worker)

self.onmessage = async (e) => {
    try {
        const { file, maxWidth, quality } = e.data;

        if (!file) throw new Error("No file provided");

        // 1. Decode Image Bitmap (Low overhead)
        const bitmap = await createImageBitmap(file);

        let { width, height } = bitmap;
        const targetMax = maxWidth || 1024;

        // 2. Calculate Aspect Ratio Preserved Dimensions
        if (width > height) {
            if (width > targetMax) {
                height = Math.round((height * targetMax) / width);
                width = targetMax;
            }
        } else {
            if (height > targetMax) {
                width = Math.round((width * targetMax) / height);
                height = targetMax;
            }
        }

        // 3. Render to OffscreenCanvas
        // Note: Requires browser support (Chrome 69+, iOS 16.4+)
        if (typeof OffscreenCanvas === 'undefined') {
            throw new Error("Browser does not support OffscreenCanvas");
        }

        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(bitmap, 0, 0, width, height);

        // 4. Compress to Blob
        const blob = await canvas.convertToBlob({
            type: 'image/jpeg',
            quality: quality || 0.7
        });

        // 5. Convert to Base64 String
        const reader = new FileReader();
        reader.onload = () => {
            self.postMessage({ base64: reader.result });
        };
        reader.onerror = () => {
            throw new Error("FileReader failed to create Data URL");
        };
        reader.readAsDataURL(blob);

    } catch (err) {
        console.error("Worker Compression Error:", err);
        self.postMessage({ error: err.message || "Unknown worker error" });
    }
};
