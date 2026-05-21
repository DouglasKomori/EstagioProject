import express from 'express';
import AuthMiddleware from '../middlewares/authMiddleware.js';
import { gerarQrCode } from '../controllers/pixController.js';

const router = express.Router();
const auth = new AuthMiddleware();

router.get('/qrcode', auth.validarToken, (req, res) => gerarQrCode(req, res));

export default router;
