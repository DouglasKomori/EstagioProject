import express from 'express';
import AuthMiddleware from '../middlewares/authMiddleware.js';
import PessoaController from '../controllers/pessoaController.js';

const router = express.Router();
const auth = new AuthMiddleware();
const ctrl = new PessoaController();


router.get("/", auth.validarAdmin, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Pessoas - ADMIN']
    // #swagger.summary = "Lista todas as Pessoas"
    ctrl.listar(req,res);
});

router.post("/", auth.validarAdmin, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Pessoas - ADMIN']
    // #swagger.summary = "Cadastra uma nova Pessoa"
    ctrl.cadastrar(req,res);
});

router.get("/profissionais", auth.validarToken, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Pessoas - CLIENTE']
    // #swagger.summary = "Lista os Profissionais (Pessoas Físicas) disponíveis para agendamento"
    ctrl.listarProfissionais(req,res);
});

router.put("/:id", auth.validarAdmin, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Pessoas - ADMIN']
    // #swagger.summary = "Altera uma Pessoa"
    ctrl.alterar(req,res);
});

router.delete("/:id", auth.validarAdmin, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []    
    }] */
    // #swagger.tags = ['Pessoas - ADMIN']
    // #swagger.summary = "Inativa uma Pessoa (Exclusão Lógica)"
    ctrl.excluir(req,res);
});

router.put("/:id/reativar", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Pessoas - FUNCIONÁRIO']
    // #swagger.summary = "Reativa uma Pessoa inativada"
    ctrl.reativar(req,res);
});

router.get("/:id", auth.validarAdmin, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Pessoas - ADMIN']
    // #swagger.summary = "Consulta uma Pessoa por ID"
    ctrl.consultarPorId(req,res);
});


export default router;