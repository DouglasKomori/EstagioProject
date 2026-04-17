import express from 'express';
import AuthMiddleware from '../middlewares/authMiddleware.js';
import MovimentacaoController from '../controllers/movimentacaoController.js';

const router = express.Router();
const auth = new AuthMiddleware();
const ctrl = new MovimentacaoController();

router.post("/", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Movimentações - FUNCIONARIO']
    // #swagger.summary = "Realiza uma movimentação de estoque"
    ctrl.movimentar(req,res);
});

router.get("/:produto", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Movimentações - FUNCIONARIO']
    // #swagger.summary = "Consulta o histórico de movimentações de um produto"
    ctrl.consultar(req,res);
});

export default router;