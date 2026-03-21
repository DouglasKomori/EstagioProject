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
        let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        if(token) {
            try {
                let payload = jwt.verify(token, SECRET);
                let usuarioRepository = new UsuarioRepository();
                let usuario = await usuarioRepository.buscarPorId(payload.id);
                
                if(usuario && usuario.ativo) {
                    req.usuarioLogado = usuario; 
                    next();
                } else {
                    return res.status(401).json({msg: "Usuário não encontrado ou inativo"});
                }
            } catch(ex) {
                return res.status(401).json({msg: "Token inválido ou expirado!"});
            }
        } else {
            return res.status(401).json({msg: "Acesso negado. Token não encontrado!"});
        }
    }

    async validarFuncionario(req, res, next) {
        const authHeader = req.headers.authorization;
        let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        if(token) {
            try {
                let payload = jwt.verify(token, SECRET);
                let usuarioRepository = new UsuarioRepository();
                let usuario = await usuarioRepository.buscarPorId(payload.id);
                
                if(usuario && usuario.ativo) {
                    if(usuario.perfil === 'ADMIN' || usuario.perfil === 'FUNCIONARIO') {
                        req.usuarioLogado = usuario; 
                        next();
                    } else {
                        return res.status(403).json({msg: "Acesso negado. Requer privilégios de Funcionário."});
                    }
                } else {
                    return res.status(401).json({msg: "Usuário não encontrado ou inativo"});
                }
            } catch(ex) {
                return res.status(401).json({msg: "Token inválido ou expirado!"});
            }
        } else {
            return res.status(401).json({msg: "Acesso negado. Token não encontrado!"});
        }
    }

    async validarAdmin(req, res, next) {
        const authHeader = req.headers.authorization;
        let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

        if(token) {
            try {
                let payload = jwt.verify(token, SECRET);
                let usuarioRepository = new UsuarioRepository();
                let usuario = await usuarioRepository.buscarPorId(payload.id);
                
                if(usuario && usuario.ativo) {
                    if(usuario.perfil === 'ADMIN') {
                        req.usuarioLogado = usuario; 
                        next();
                    } else {
                        return res.status(403).json({msg: "Acesso negado. Esta área é restrita ao Administrador."});
                    }
                } else {
                    return res.status(401).json({msg: "Usuário não encontrado ou inativo"});
                }
            } catch(ex) {
                return res.status(401).json({msg: "Token inválido ou expirado!"});
            }
        } else {
            return res.status(401).json({msg: "Acesso negado. Token não encontrado!"});
        }
    }
}