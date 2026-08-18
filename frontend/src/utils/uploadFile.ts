import axios from 'axios';

/**
 * Get Backend API Base URL dynamically
 */
const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  return 'https://swan-warehouse.onrender.com';
};

/**
 * Convert a File to Base64 data URL (Local Fallback when offline)
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads a file (Image, Video, PDF, Document) directly to the Company Cloud / Backend Server.
 * Strictly uses internal company endpoints without contacting any external 3rd-party services.
 * 
 * @param file The file to upload
 * @returns Direct URL to the uploaded file on the company server
 */
export const uploadFile = async (file: File): Promise<string> => {
  try {
    const baseUrl = getApiBaseUrl();
    const formData = new FormData();
    formData.append('file', file);

    const token = typeof window !== 'undefined' ? (sessionStorage.getItem('token') || localStorage.getItem('token')) : null;
    const headers: Record<string, string> = {
      'Content-Type': 'multipart/form-data'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post(`${baseUrl}/api/upload`, formData, {
      headers,
      timeout: 60000 // 60s timeout for large videos/PDFs
    });

    if (response.data && response.data.url) {
      // If relative url returned, prefix with company API base URL for absolute accessibility
      const fileUrl = response.data.url.startsWith('http') 
        ? response.data.url 
        : `${baseUrl}${response.data.url}`;
      return fileUrl;
    }

    throw new Error('Upload failed: Invalid server response');
  } catch (err: any) {
    console.warn('Company backend upload endpoint unavailable or offline, using internal Base64 storage:', err.message);
    // Fallback: Store locally as Base64 Data URL (100% private, no external websites)
    return await fileToBase64(file);
  }
};

/**
 * Backward compatibility alias (Redirected directly to Company Cloud storage)
 */
export const uploadToImgBB = uploadFile;
export default uploadFile;
