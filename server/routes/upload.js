import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth.js';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 파일 저장 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // 한글 깨짐 방지: latin1 -> utf8 변환
        const decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(decodedName));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    },
    fileFilter: (req, file, cb) => {
        const decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        console.log(`[Upload] Processing file: ${decodedName} (${file.mimetype})`);

        if (file.mimetype.startsWith('image/') ||
            file.mimetype.startsWith('audio/') ||
            file.mimetype.startsWith('video/') ||
            file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            console.error(`[Upload] Rejected file type: ${file.mimetype}`);
            cb(new Error('이미지, 오디오, 비디오, PDF 파일만 업로드 가능합니다.'), false);
        }
    }
});

/**
 * POST /api/upload
 * 파일 업로드 (스크린샷, 이미지 등)
 */
router.post('/', (req, res, next) => {
    console.log('[Upload] Request received');
    upload.array('files')(req, res, (err) => {
        if (err) {
            console.error('[Upload] Error:', err);
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
}, (req, res) => {
    if (!req.files || req.files.length === 0) {
        console.warn('[Upload] No files in request');
        return res.status(400).json({ success: false, message: '파일이 업로드되지 않았습니다.' });
    }

    console.log(`[Upload] Successfully uploaded ${req.files.length} files`);
    const files = req.files.map(file => {
        const decodedName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        return {
            filename: file.filename,
            originalname: decodedName, // 클라이언트에게 보낼 때 변환된 이름 사용
            path: file.path,
            size: file.size,
            mimetype: file.mimetype
        };
    });

    res.json({ success: true, files });
});

export default router;
