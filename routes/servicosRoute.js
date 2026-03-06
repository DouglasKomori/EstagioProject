import express from 'express';
import AuthMiddleware from '../middlewares/authMiddleware.js';
import ServicosController from '../controllers/servicosController.js';

const router = express.Router();
const auth = new AuthMiddleware();
const ctrl = new ServicosController();

router.get("/", auth.validarToken, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Servicos']
    // #swagger.summary = "Lista todos os Serviços"
    ctrl.listar(req,res);
});

router.post("/", auth.validarToken, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Servicos']
    // #swagger.summary = "Cadastra um novo Serviço"
    ctrl.cadastrar(req,res);
});

export default router;