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

router.post("/", auth.validarAdmin, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Produtos - ADMIN']
    // #swagger.summary = "Cadastra um novo Produto"
    ctrl.cadastrar(req,res);
});

router.put("/:id", auth.validarAdmin, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []    
    }] */
    // #swagger.tags = ['Produtos - ADMIN']
    // #swagger.summary = "Altera um Produto"
    ctrl.alterar(req,res);
});

router.delete("/:id", auth.validarAdmin, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []   
    }] */
    // #swagger.tags = ['Produtos - ADMIN']
    // #swagger.summary = "Inativa um Produto (Exclusão Lógica)"
    ctrl.excluir(req,res);
});

export default router;