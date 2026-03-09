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

router.post("/", auth.validarAdmin, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Servicos - ADMIN']
    // #swagger.summary = "Cadastra um novo Serviço"
    ctrl.cadastrar(req,res);
});

router.put("/:id", auth.validarAdmin, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Servicos - ADMIN']
    // #swagger.summary = "Altera um Serviço"
    ctrl.alterar(req,res);
});

router.delete("/:id", auth.validarAdmin, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Servicos - ADMIN']
    // #swagger.summary = "Inativa um Serviço (Exclusão Lógica)"
    ctrl.excluir(req,res);
});

export default router;