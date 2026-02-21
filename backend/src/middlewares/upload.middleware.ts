import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /^image\/(jpeg|png|gif|webp)$/i;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
  },
});

export const uploadSingleImage = upload.single('image');
