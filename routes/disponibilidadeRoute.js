import express from 'express';
import AuthMiddleware from '../middlewares/authMiddleware.js';
import DisponibilidadeController from '../controllers/disponibilidadeController.js';

const router = express.Router();
const auth = new AuthMiddleware();
const ctrl = new DisponibilidadeController();

router.get("/", auth.validarToken, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Disponibilidades - FUNCIONARIO']
    // #swagger.summary = "Lista todas as disponibilidades"
    ctrl.listar(req,res);
});

router.post("/", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Disponibilidades - FUNCIONARIO']
    // #swagger.summary = "Cadastra uma nova disponibilidade"
    ctrl.cadastrar(req,res);
});

router.delete("/:id", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Disponibilidades - FUNCIONARIO']
    // #swagger.summary = "Exclui uma disponibilidade"
    ctrl.excluir(req,res);
});

export default router;