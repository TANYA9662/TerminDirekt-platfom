import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create folder if don't exist
const uploadDir = path.join(process.cwd(), 'public/uploads/companies');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const safeName = file.originalname.replace(/\s+/g, '-').replace(ext, '');
    cb(null, `${timestamp}-${safeName}${ext}`);
  }
});

const upload = multer({ storage });

export default upload;


