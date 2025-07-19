/**
 * Image compression and processing utilities
 */

export interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: 'jpeg' | 'png' | 'webp';
  maxSizeBytes?: number;
}

/**
 * Compress an image file to a base64 data URL
 */
export const compressImage = (
  file: File,
  options: CompressImageOptions = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 400,
      maxHeight = 400,
      quality = 0.8,
      outputFormat = 'jpeg',
      maxSizeBytes = 500 * 1024 // 500KB default
    } = options;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }

    // Check file size
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      reject(new Error('Image file too large (max 10MB)'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64
        const mimeType = `image/${outputFormat}`;
        let dataUrl = canvas.toDataURL(mimeType, quality);

        // If still too large, reduce quality iteratively
        let currentQuality = quality;
        while (dataUrl.length * 0.75 > maxSizeBytes && currentQuality > 0.1) {
          currentQuality -= 0.1;
          dataUrl = canvas.toDataURL(mimeType, currentQuality);
        }

        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file before processing
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check if it's an image
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'Image file too large (max 10MB)' };
  }

  // Check supported formats
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!supportedFormats.includes(file.type)) {
    return { valid: false, error: 'Unsupported image format. Please use JPEG, PNG, WebP, or GIF' };
  }

  return { valid: true };
};

/**
 * Get file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Convert data URL to estimated file size
 */
export const getDataUrlSize = (dataUrl: string): number => {
  // Remove data URL prefix to get just the base64 data
  const base64 = dataUrl.split(',')[1];
  // Each base64 character represents 6 bits, so multiply by 0.75 to get bytes
  return Math.round(base64.length * 0.75);
};