import express from 'express';
import AuthMiddleware from '../middlewares/authMiddleware.js';
import CaixaController from '../controllers/caixaController.js';

const router = express.Router();
const auth = new AuthMiddleware();
const ctrl = new CaixaController();

router.get("/status", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Caixa - FUNCIONARIO'] 
    // #swagger.summary = "Verifica se o caixa está aberto e retorna os dados do caixa aberto"
    ctrl.statusAtual(req,res);
});

router.post("/abrir", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []    
    }] */
    // #swagger.tags = ['Caixa - FUNCIONARIO']
    // #swagger.summary = "Abre o caixa para o dia, informando o saldo inicial (fundo de troco)"
    ctrl.abrir(req,res);
});

router.get("/resumo", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Caixa - FUNCIONARIO']
    // #swagger.summary = "Gera um resumo do caixa aberto, incluindo faturamento total e saldo final calculado"
    ctrl.resumo(req,res);
});

router.put("/fechar", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Caixa - FUNCIONARIO']
    // #swagger.summary = "Fecha o caixa aberto, calculando o saldo final e registrando a data de fechamento"
    ctrl.fechar(req,res);
});

router.get("/historico", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Caixa - FUNCIONARIO']
    // #swagger.summary = "Lista os últimos 30 caixas fechados, com detalhes de faturamento e datas"
    ctrl.historico(req,res);
});

export default router;