import express from 'express';
import AuthMiddleware from '../middlewares/authMiddleware.js';
import BloqueioController from '../controllers/bloqueioController.js';

const router = express.Router();
const auth = new AuthMiddleware();
const ctrl = new BloqueioController();

router.get("/", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Bloqueios - CLIENTE']
    // #swagger.summary = "Lista todos os bloqueios"
    ctrl.listar(req,res);
});

router.post("/", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []   
    }] */
    // #swagger.tags = ['Bloqueios - FUNCIONARIO']
    // #swagger.summary = "Cadastra um novo bloqueio"
    ctrl.cadastrar(req,res);
});

router.put("/:id", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Bloqueios - FUNCIONARIO']
    // #swagger.summary = "Altera um bloqueio"
    ctrl.alterar(req,res);
});

router.delete("/:id", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */  
    // #swagger.tags = ['Bloqueios - FUNCIONARIO']
    // #swagger.summary = "Inativa um bloqueio (Exclusão Lógica)"
    ctrl.excluir(req,res);
});

router.put("/:id/reativar", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Bloqueios - FUNCIONARIO']
    // #swagger.summary = "Reativa um bloqueio inativo"
    ctrl.reativar(req,res);
});

router.get("/:id", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Bloqueios - FUNCIONARIO']
    // #swagger.summary = "Consulta um bloqueio por ID"
    ctrl.consultarPorId(req,res);
});

export default router;