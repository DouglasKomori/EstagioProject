import express from 'express';
import AuthMiddleware from '../middlewares/authMiddleware.js';
import MarcaController from '../controllers/marcaController.js';

const router = express.Router();
const auth = new AuthMiddleware();
const ctrl = new MarcaController();

router.get("/", auth.validarToken, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Marcas - CLIENTE']
    // #swagger.summary = "Lista todas as Marcas"
    ctrl.listar(req,res);
});


router.post("/", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []   
    }] */
    // #swagger.tags = ['Marcas - FUNCIONARIO']
    // #swagger.summary = "Cadastra uma nova Marca"
    ctrl.cadastrar(req,res);
});

router.put("/:id", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Marcas - FUNCIONARIO']
    // #swagger.summary = "Altera uma Marca"
    ctrl.alterar(req,res);
});

router.delete("/:id", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Marcas - FUNCIONARIO']
    // #swagger.summary = "Inativa uma Marca (Exclusão Lógica)"
    ctrl.excluir(req,res);
});

router.get("/:id", auth.validarToken, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Marcas - CLIENTE']
    // #swagger.summary = "Consulta uma Marca por ID"
    ctrl.consultarPorId(req,res);
});

export default router;