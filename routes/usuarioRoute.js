import express from 'express';
import UsuarioController from '../controllers/usuarioController.js';
import AuthMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();
let ctrl = new UsuarioController();
let auth = new AuthMiddleware();

router.get("/", auth.validarFuncionario, (req, res) => {
    //comentarios do swagger
    // #swagger.tags = ['Usuário - FUNCIONARIO']
    // #swagger.summary = 'Listar todos os usuários'

    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    ctrl.listar(req, res)
});

router.post("/",  (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]
    */
    // #swagger.tags = ['Usuário']
    // #swagger.summary = 'Cadastra um novo usuário'
    /* #swagger.requestBody = {
        required: true,
        content: {
            "application/json": {
                schema: {
                    $ref: '#/components/schemas/usuario'
                }
            }
        }
    }
    */
    ctrl.cadastrar(req, res);
});


router.post("/admin", auth.validarAdmin, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }]*/
    // #swagger.tags = ['Usuário - FUNCIONARIO']
    // #swagger.summary = 'Cadastra um novo usuário com perfil de ADMIN'
    ctrl.cadastrarAdmin(req, res);
});


router.put("/:id", auth.validarFuncionario, (req,res) => {
    /* #swagger.security = [{
    "bearerAuth": []
    }] */
    // #swagger.tags = ['Usuário - FUNCIONARIO']
    // #swagger.summary = "Altera um Usuário"
    ctrl.alterar(req,res);
});

router.put("/:id/reativar", auth.validarFuncionario, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }] */
    // #swagger.tags = ['Usuário - FUNCIONARIO']
    // #swagger.summary = "Reativa um Usuário"
    ctrl.reativar(req, res);
});

router.delete("/:id", auth.validarFuncionario, (req, res) => {
    /* #swagger.security = [{
        "bearerAuth": []
    }] */
    // #swagger.tags = ['Usuário - FUNCIONARIO']
    // #swagger.summary = "Inativa um Usuário (Exclusão Lógica)"
    ctrl.excluir(req, res);
});

export default router;