
// Image Compression Worker
self.onmessage = async (e) => {
    const { file, maxWidth, quality } = e.data;

    try {
        // Use ImageBitmap for multi-threaded decoding
        const bitmap = await createImageBitmap(file);

        let width = bitmap.width;
        let height = bitmap.height;

        // Calculate aspect ratio scale
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

        // Use OffscreenCanvas for off-main-thread drawing
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0, width, height);

        // Export to WebP Blob (much faster and smaller)
        const blob = await canvas.convertToBlob({
            type: 'image/webp',
            quality: quality
        });

        // Convert Blob to Base64 to return
        const reader = new FileReader();
        reader.onloadend = () => {
            self.postMessage({ base64: reader.result });
        };
        reader.readAsDataURL(blob);

        // Cleanup
        bitmap.close();

    } catch (error) {
        self.postMessage({ error: error.message });
    }
};
