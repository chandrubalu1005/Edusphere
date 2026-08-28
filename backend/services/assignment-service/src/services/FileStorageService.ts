import multer, { diskStorage } from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'assignments');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = diskStorage({
  destination: (req, _file, cb) => {
    const assignmentId = req.params.id;
    const dir = path.join(UPLOAD_DIR, assignmentId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

export const fileUploadMiddleware = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    const allowed = ['pdf','doc','docx','zip','txt','py','js','ts','java','cpp','c','cs','rb','go','rs'];
    if (allowed.includes(ext)) return cb(null, true);
    cb(new Error(`File type .${ext} not allowed`));
  },
});

export class FileStorageService {
  static getFileUrl(assignmentId: string, filename: string): string {
    return `/uploads/assignments/${assignmentId}/${filename}`;
  }
}
