import express from 'express';
import AutenticacaoController from '../controllers/autenticacaoController.js';
import AuthMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

let ctrl = new AutenticacaoController();
let auth = new AuthMiddleware();
router.get("/usuario", auth.validarToken, (req, res) => {
    // #swagger.tags = ['Autenticação']
    // #swagger.summary = 'Obtem as informações do usuário através da cookie'

    ctrl.usuario(req, res);
});
router.post("/token", (req, res) => {
    // #swagger.tags = ['Autenticação']
    // #swagger.summary = 'Gera um token de acesso através das credenciais de um usuário'

    ctrl.token(req, res);
});

export default router;