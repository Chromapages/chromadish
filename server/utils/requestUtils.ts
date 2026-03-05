export const getImageFromRequest = async (req: any): Promise<{ base64: string; mimeType: string } | null> => {
    const { imageBase64, imageUrl } = req.body;
    if (req.file) return { base64: req.file.buffer.toString('base64'), mimeType: req.file.mimetype };
    if (imageBase64) {
        const matches = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) return { base64: matches[2], mimeType: matches[1] };
        return { base64: imageBase64, mimeType: 'image/png' };
    }
    if (imageUrl) {
        try {
            const response = await fetch(imageUrl);
            if (!response.ok) return null;
            const buffer = await response.arrayBuffer();
            return { base64: Buffer.from(buffer).toString('base64'), mimeType: response.headers.get('content-type') || 'image/png' };
        } catch (e) {
            console.error('Failed to fetch image url:', e);
            return null;
        }
    }
    return null;
};
