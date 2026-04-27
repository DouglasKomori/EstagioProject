import express from 'express';
import AuthMiddleware from '../middlewares/authMiddleware.js';
import AgendaController from '../controllers/agendamentoController.js';

const router = express.Router();
const auth = new AuthMiddleware();
const ctrl = new AgendaController();

router.get("/meus", auth.validarToken, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Agendas - CLIENTE']
    // #swagger.summary = "Lista as Agendas do usuário logado"
    ctrl.listarMeusAgendamentos(req,res);
});

router.get("/", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Agendas - CLIENTE']
    // #swagger.summary = "Lista todas as Agendas"
    ctrl.listarPorData(req,res);
});

router.post("/", auth.validarToken, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Agendas - FUNCIONARIO']
    // #swagger.summary = "Cadastra uma nova Agenda"
    ctrl.cadastrar(req,res);
});

router.get("/ocupados", auth.validarToken, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Agendas - FUNCIONARIO']
    // #swagger.summary = "Lista os horários ocupados para um profissional em uma data específica (para evitar conflitos de agendamento)"
    ctrl.listarHorariosOcupados(req,res);
});

router.get("/relatorio/agenda", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Agendas - FUNCIONARIO']
    // #swagger.summary = "Emite o relatório da agenda filtrado por Data, Profissional, Status ou Cliente"
    ctrl.emitirRelatorioAgenda(req,res);
});


router.put("/:id/status", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Agendas - FUNCIONARIO']
    // #swagger.summary = "Altera uma Agenda"
    ctrl.alterarStatus(req,res);
});

router.put("/:id/cancelar", auth.validarToken, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Agendas - FUNCIONARIO']
    // #swagger.summary = "Cancela uma Agenda (Inativa o agendamento)"
    ctrl.cancelar(req,res);
});


export default router;