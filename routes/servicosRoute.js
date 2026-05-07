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

router.put("/:id/reativar", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Servicos - FUNCIONARIO']
    // #swagger.summary = "Reativa um Serviço"
    ctrl.reativar(req,res);
});

router.put("/:id", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Servicos - FUNCIONARIO']
    // #swagger.summary = "Altera um Serviço"
    ctrl.alterar(req,res);
});

router.delete("/:id", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Servicos - FUNCIONARIO']
    // #swagger.summary = "Inativa um Serviço (Exclusão Lógica)"
    ctrl.excluir(req,res);
});

router.get("/relatorio/profissionais", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Servicos - RELATORIO']
    // #swagger.summary = "Lista todos os Profissionais ativos (para filtro do relatório)"
    ctrl.getProfissionais(req,res);
});

router.get("/relatorio/detalhe/:servicoId", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Servicos - RELATORIO']
    // #swagger.summary = "Detalhamento de um Serviço por Profissional"
    // #swagger.description = "Parâmetros de query opcionais: dataInicio (AAAA-MM-DD), dataFim (AAAA-MM-DD)"
    ctrl.getDetalheServicoPorProfissional(req,res);
});

router.get("/relatorio", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Servicos - RELATORIO']
    // #swagger.summary = "Emite o Relatório de Serviços com filtros"
    // #swagger.description = "Parâmetros de query opcionais: dataInicio (AAAA-MM-DD), dataFim (AAAA-MM-DD), profissionalId (number), ordenacao ('frequencia' | 'receita' | 'nome')"
    ctrl.getRelatorioServicos(req,res);
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
