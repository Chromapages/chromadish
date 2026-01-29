
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Failed to read file as base64 string.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Processes an image file for Gemini API consumption.
 * Checks if the format is supported, and converts if necessary.
 * Returns the base64 string (without prefix) and the mime type.
 */
export const processImageForGemini = async (file: File): Promise<{ base64: string; mimeType: string }> => {
  const supportedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];

  // If supported, return as is
  if (supportedTypes.includes(file.type)) {
    const base64 = await fileToBase64(file);
    return { base64, mimeType: file.type };
  }

  // Otherwise, convert to PNG using Canvas
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        // Convert to PNG data URL
        const dataUrl = canvas.toDataURL('image/png');
        const base64 = dataUrl.split(',')[1];

        resolve({ base64, mimeType: 'image/png' });
      };
      img.onerror = (err) => reject(new Error('Failed to load image for conversion: ' + err));
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(new Error('Failed to read file: ' + err));
    reader.readAsDataURL(file);
  });
};
