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
    // #swagger.tags = ['Servicos - CLIENTE']
    // #swagger.summary = "Lista todos os Serviços"
    ctrl.listar(req,res);
});

router.post("/", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Servicos - FUNCIONARIO']
    // #swagger.summary = "Cadastra um novo Serviço"
    ctrl.cadastrar(req,res);
});

router.put("/:id", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Servicos - FUNCIONARIO']
    // #swagger.summary = "Altera um Serviço"
    ctrl.alterar(req,res);
});

router.put("/:id/reativar", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Servicos - FUNCIONARIO']
    // #swagger.summary = "Reativa um Serviço"
    ctrl.reativar(req,res);
});

router.delete("/:id", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Servicos - FUNCIONARIO']
    // #swagger.summary = "Inativa um Serviço (Exclusão Lógica)"
    ctrl.excluir(req,res);
});

router.get("/:id", auth.validarToken, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []  
    }] */
    // #swagger.tags = ['Servicos - CLIENTE']
    // #swagger.summary = "Consulta um Serviço por ID"
    ctrl.consultarPorId(req,res);
});

export default router;