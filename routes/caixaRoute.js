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

router.get("/movimentacoes", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Caixa - FUNCIONARIO']
    // #swagger.summary = "Lista todas as movimentações (serviços e produtos) do caixa aberto em tempo real"
    ctrl.movimentacoes(req,res);
});

router.get("/historico", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Caixa - FUNCIONARIO']
    // #swagger.summary = "Lista os caixas fechados. Use ?limite=3 para restringir a quantidade (padrão: 30)"
    ctrl.historico(req,res);
});

router.get("/historico/:id/detalhes", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Caixa - FUNCIONARIO']
    // #swagger.summary = "Retorna o detalhamento de um caixa fechado: serviços realizados e produtos vendidos"
    ctrl.historicoDetalhes(req,res);
});

export default router;