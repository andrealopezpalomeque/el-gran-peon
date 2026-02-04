import cloudinary from '../config/cloudinary.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

function createUploader(folderFn) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req) => ({
      folder: folderFn(req),
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    }),
  });

  return multer({ storage });
}

const productImageUploader = createUploader((req) => {
  const folder = req.body.folder || req.body.productId || 'unsorted';
  return `el-gran-peon/products/${folder}`;
});

const categoryImageUploader = createUploader(() => 'el-gran-peon/categories');

export const uploadProductImage = [
  productImageUploader.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ninguna imagen.' });
    }

    res.json({
      url: req.file.path,
      publicId: req.file.filename,
    });
  },
];

export const uploadCategoryImage = [
  categoryImageUploader.single('image'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ninguna imagen.' });
    }

    res.json({
      url: req.file.path,
      publicId: req.file.filename,
    });
  },
];

export async function deleteImage(req, res) {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ error: 'publicId es requerido.' });
    }

    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Error del servidor.' });
  }
}
