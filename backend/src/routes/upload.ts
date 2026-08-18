import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Ensure the local uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer disk storage on company server/cloud
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate safe unique filename: file_<timestamp>_<random>.<extension>
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\u0E00-\u0E7F-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `${cleanName}_${uniqueSuffix}${ext}`);
  }
});

// File filter to allow images, videos, PDFs, and warehouse office documents
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = /\.(jpg|jpeg|png|gif|webp|svg|mp4|webm|mov|avi|mkv|pdf|doc|docx|xls|xlsx|ppt|pptx|csv|txt|zip)$/i;
  const extname = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.test(extname)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${extname} is not supported. Supported: Images, Videos, PDFs, Excel, Word documents.`));
  }
};

// 100MB size limit for large video lessons & PDF manuals
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter
});

/**
 * POST /api/upload
 * Upload a single file (image, video, document, etc.) directly to Company Cloud/Server
 */
router.post('/', upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided for upload.' });
    }

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    
    // Relative and Absolute URLs
    const relativeUrl = `/uploads/${req.file.filename}`;
    const fullUrl = `${protocol}://${host}${relativeUrl}`;

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully to company server.',
      url: relativeUrl,
      fullUrl: fullUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (err: any) {
    console.error('File upload error:', err);
    return res.status(500).json({ message: err.message || 'Server error during file upload.' });
  }
});

/**
 * POST /api/upload/base64
 * Upload a base64-encoded string directly to Company Cloud/Server
 */
router.post('/base64', (req: Request, res: Response) => {
  try {
    const { data, filename } = req.body;
    if (!data || typeof data !== 'string') {
      return res.status(400).json({ message: 'Base64 data is required.' });
    }

    // Extract mime type and base64 payload
    const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = '.png';

    if (matches && matches.length === 3) {
      const mime = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
      if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
      else if (mime.includes('png')) ext = '.png';
      else if (mime.includes('gif')) ext = '.gif';
      else if (mime.includes('webp')) ext = '.webp';
      else if (mime.includes('pdf')) ext = '.pdf';
      else if (mime.includes('mp4')) ext = '.mp4';
    } else {
      buffer = Buffer.from(data, 'base64');
    }

    const cleanName = (filename || 'upload').replace(/[^a-zA-Z0-9_\u0E00-\u0E7F-]/g, '_');
    const savedFilename = `${cleanName}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadDir, savedFilename);

    fs.writeFileSync(filePath, buffer);

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const relativeUrl = `/uploads/${savedFilename}`;
    const fullUrl = `${protocol}://${host}${relativeUrl}`;

    return res.status(201).json({
      success: true,
      url: relativeUrl,
      fullUrl: fullUrl,
      filename: savedFilename,
      size: buffer.length
    });
  } catch (err: any) {
    console.error('Base64 upload error:', err);
    return res.status(500).json({ message: err.message || 'Server error during base64 upload.' });
  }
});

/**
 * GET /api/upload/status
 * Storage health check & stats
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(uploadDir);
    return res.json({
      status: 'online',
      storageDirectory: uploadDir,
      totalFiles: files.length,
      maxFileSizeMB: 100
    });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
