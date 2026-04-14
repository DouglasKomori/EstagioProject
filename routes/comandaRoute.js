import express from 'express';
import AuthMiddleware from '../middlewares/authMiddleware.js';
import ComandaController from '../controllers/comandaController.js';

const router = express.Router();
const auth = new AuthMiddleware();
const ctrl = new ComandaController();

router.get("/", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Comandas - FUNCIONARIO']
    // #swagger.summary = "Lista todas as comandas abertas"
    ctrl.listarAbertas(req,res);
});

router.post("/abrir", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */   
    // #swagger.tags = ['Comandas - FUNCIONARIO']
    // #swagger.summary = "Abre uma nova comanda"
    ctrl.abrirComanda(req,res);
});

router.post("/adicionar-item", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []    
    }] */
    // #swagger.tags = ['Comandas - FUNCIONARIO']
    // #swagger.summary = "Adiciona um serviço ou produto à comanda"
    ctrl.adicionarItem(req,res);
});

router.get("/relatorio/faturamento", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Comandas - FUNCIONARIO']
    // #swagger.summary = "Gera um relatório de faturamento por período"
    ctrl.relatorio(req,res);
});

router.get("/:id", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Comandas - FUNCIONARIO']
    // #swagger.summary = "Consulta os detalhes de uma comanda por ID"
    ctrl.consultar(req,res);
});

router.put("/:id/finalizar", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Comandas - FUNCIONARIO']
    // #swagger.summary = "Finaliza e paga uma comanda"
    ctrl.finalizarComanda(req,res);
});

router.delete("/remover-item/:tipo/:id", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Comandas - FUNCIONARIO']
    // #swagger.summary = "Remove um item (serviço ou produto) da comanda"
    ctrl.removerItem(req,res);
});

router.put("/:id/cancelar", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Comandas - FUNCIONARIO']
    // #swagger.summary = "Cancela uma comanda"
    ctrl.cancelarComanda(req,res);
});

export default router;