import axios from 'axios';

const IMGBB_API_KEY = 'cdeaa7645e5c5fb32d06eceff4257fe7';

/**
 * Uploads an image file directly to ImgBB CDN and returns the direct image URL.
 */
export const uploadToImgBB = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, formData);
    
    if (response.data && response.data.success && response.data.data.url) {
      return response.data.data.url;
    }
    throw new Error('Upload to ImgBB failed');
  } catch (err) {
    console.error('ImgBB upload error:', err);
    throw err;
  }
};
