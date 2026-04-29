import express from 'express';
import AuthMiddleware from '../middlewares/authMiddleware.js';
import ProdutoController from '../controllers/produtoController.js';

const router = express.Router();
const auth = new AuthMiddleware();
const ctrl = new ProdutoController();

router.get("/", auth.validarToken, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Produtos - CLIENTE']
    // #swagger.summary = "Lista todos os Produtos"
    ctrl.listar(req,res);
});

router.post("/", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Produtos - FUNCIONARIO']
    // #swagger.summary = "Cadastra um novo Produto"
    ctrl.cadastrar(req,res);
});

router.get("/relatorio/giro", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Produtos - FUNCIONARIO']
    // #swagger.summary = "Gera um relatório de giro de estoque dos Produtos"
    ctrl.emitirRelatorioGiro(req,res);
});

router.put("/:id", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []    
    }] */
    // #swagger.tags = ['Produtos - FUNCIONARIO']
    // #swagger.summary = "Altera um Produto"
    ctrl.alterar(req,res);
});

router.put("/:id/reativar", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []    
    }] */
    // #swagger.tags = ['Produtos - FUNCIONARIO']
    // #swagger.summary = "Reativa um Produto"
    ctrl.reativar(req,res);
});

router.delete("/:id", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []   
    }] */
    // #swagger.tags = ['Produtos - FUNCIONARIO']
    // #swagger.summary = "Inativa um Produto (Exclusão Lógica)"
    ctrl.excluir(req,res);
});

router.get("/:id", auth.validarToken, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Produtos - CLIENTE']
    // #swagger.summary = "Consulta um Produto por ID"
    ctrl.consultarPorId(req,res);
});

export default router;