
// compressionWorker.js
self.onmessage = async (e) => {
    const { file, maxWidth, quality } = e.data;

    try {
        // 1. Create bitmap from file (efficient decoding)
        const bitmap = await createImageBitmap(file);

        // 2. Calculate dimensions
        let { width, height } = bitmap;
        if (width > height) {
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }
        } else {
            if (height > maxWidth) {
                width = Math.round((width * maxWidth) / height);
                height = maxWidth;
            }
        }

        // 3. Use OffscreenCanvas
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0, width, height);

        // 4. Compress to Blob/Base64
        // OffscreenCanvas converts to Blob easily
        const blob = await canvas.convertToBlob({
            type: 'image/jpeg',
            quality: quality || 0.7
        });

        // 5. Convert Blob to Base64 to send back (or just send Blob if logic allows, but App expects Base64)
        const reader = new FileReader();
        reader.onloadend = () => {
            self.postMessage({ base64: reader.result });
        };
        reader.onerror = () => {
            self.postMessage({ error: "FileReader failed in worker" });
        };
        reader.readAsDataURL(blob);

    } catch (err) {
        self.postMessage({ error: err.message });
    }
};
