import jwt from 'jsonwebtoken';
import UsuarioRepository from '../repositories/usuarioRepository.js';

const SECRET = "BARBERUEMATSU";

export default class AuthMiddleware {

    gerarToken(id, email, nome, telefone, perfil) {
        let jsonWebToken = jwt.sign(
        {
            id: id,
            nome: nome,
            email: email,
            telefone: telefone,
            perfil: perfil
        }, 
        SECRET, 
        {
            expiresIn: '8h' 
        });

        return jsonWebToken;
    }

    async validarToken(req, res, next) {
        const authHeader = req.headers.authorization;
        const cookieToken = req.cookies ? req.cookies.token : null;
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1]; 
        } else if (cookieToken) {
            token = cookieToken;
        }

        if(token) {
            try {
                let payload = jwt.verify(token, SECRET);
                let usuarioRepository = new UsuarioRepository();
                let usuario = await usuarioRepository.buscarPorId(payload.id);
                
                if(usuario) {
                    if(usuario.ativo) {
                        req.usuarioLogado = usuario; 
                        next();
                    } else {
                        return res.status(401).json({msg: "Usuário inativo"});
                    }
                } else {
                    return res.status(404).json({msg: "Usuário não encontrado"});
                }
            } catch(ex) {
                console.log(ex);
                return res.status(401).json({msg: "Token inválido ou expirado!"});
            }
        } else {
            return res.status(401).json({msg: "Acesso negado. Token não encontrado!"});
        }
    }

    async validarAdmin(req, res, next) {
        const authHeader = req.headers.authorization;
        const cookieToken = req.cookies ? req.cookies.token : null;
        let token = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1]; 
        } else if (cookieToken) {
            token = cookieToken;
        }

        if(token) {
            try {
                let payload = jwt.verify(token, SECRET);
                let usuarioRepository = new UsuarioRepository();
                let usuario = await usuarioRepository.buscarPorId(payload.id);
                
                if(usuario) {
                    if(usuario.ativo) {
                        if(usuario.perfil === 'ADMIN') {
                            req.usuarioLogado = usuario; 
                            next();
                        } else {
                            return res.status(403).json({msg: "Acesso negado. Requer privilégios de Administrador."});
                        }
                    } else {
                        return res.status(401).json({msg: "Usuário inativo"});
                    }
                } else {
                    return res.status(404).json({msg: "Usuário não encontrado"});
                }
            } catch(ex) {
                console.log(ex);
                return res.status(401).json({msg: "Token inválido ou expirado!"});
            }
        } else {
            return res.status(401).json({msg: "Acesso negado. Token não encontrado!"});
        }
    }
}