
// Web Worker for Image Compression
self.onmessage = async (e) => {
    const { imageBitmap, quality, targetSize } = e.data;

    try {
        // Create an OffscreenCanvas
        const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageBitmap, 0, 0);

        // Calculate scaling if needed (e.g., max 2048px)
        const maxDim = 2048;
        let width = imageBitmap.width;
        let height = imageBitmap.height;

        if (width > maxDim || height > maxDim) {
            const scale = maxDim / Math.max(width, height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);

            // Resize canvas
            const scaledCanvas = new OffscreenCanvas(width, height);
            const scaledCtx = scaledCanvas.getContext('2d');
            scaledCtx.drawImage(imageBitmap, 0, 0, width, height); // Draw original to scaled

            // Use scaled canvas for blobs
            const blob = await scaledCanvas.convertToBlob({
                type: 'image/jpeg',
                quality: 0.8 // Default heavy compression for speed
            });
            // Convert Blob to ArrayBuffer to send back
            const buffer = await blob.arrayBuffer();
            self.postMessage({ buffer, width, height, type: 'image/jpeg' }, [buffer]);

        } else {
            const blob = await canvas.convertToBlob({
                type: 'image/jpeg',
                quality: 0.85
            });
            const buffer = await blob.arrayBuffer();
            self.postMessage({ buffer, width, height, type: 'image/jpeg' }, [buffer]);
        }

    } catch (error) {
        self.postMessage({ error: error.message });
    }
};
