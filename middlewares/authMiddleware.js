import jwt from 'jsonwebtoken';
import UsuarioRepository from '../repositories/usuarioRepository.js';

const SECRET = "BARBERUEMATSU";

export default class AuthMiddleware {

    gerarToken(id, email, nome, telefone) {
        let jsonWebToken = jwt.sign(
        {
            id: id,
            nome: nome,
            email: email,
            telefone: telefone
        }, 
        SECRET, 
        {
            expiresIn: '8h' // Alterado para string '8h' (8 horas). Pode usar '1d' para 1 dia.
        });

        return jsonWebToken;
    }

    async validarToken(req, res, next) {
        // 1. Tenta pegar o token do Header (Swagger/React) ou dos Cookies
        const authHeader = req.headers.authorization;
        const cookieToken = req.cookies ? req.cookies.token : null;

        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            // O Header vem como "Bearer eyJhbGciOi...", então separamos pelo espaço e pegamos a parte 2
            token = authHeader.split(' ')[1]; 
        } else if (cookieToken) {
            token = cookieToken;
        }

        if(token) {
            try {
                // validar o token e recupera as informações do usuário
                let payload = jwt.verify(token, SECRET);
                let usuarioRepository = new UsuarioRepository();
                
                // valida o nosso usuário no banco de dados
                let usuario = await usuarioRepository.buscarPorId(payload.id);
                
                if(usuario) {
                    if(usuario.ativo) {
                        req.usuarioLogado = usuario; // Tudo certo, passa os dados pra frente
                        next();
                    }
                    else {
                        return res.status(401).json({msg: "Usuário inativo"});
                    }
                }
                else {
                    return res.status(404).json({msg: "Usuário não encontrado"});
                }
            }
            catch(ex) {
                console.log(ex);
                return res.status(401).json({msg: "Token inválido ou expirado!"});
            }
        }
        else {
            return res.status(401).json({msg: "Acesso negado. Token não encontrado!"});
        }
    }
}