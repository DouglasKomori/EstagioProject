import express from 'express';
import UsuarioController from '../controllers/usuarioController.js';
import AuthMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();
let ctrl = new UsuarioController();
let auth = new AuthMiddleware();

router.get("/", auth.validarToken, (req, res) => {
    //comentarios do swagger
    // #swagger.tags = ['Usuário']
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

export default router;