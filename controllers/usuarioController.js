import Usuario from '../entities/usuario.js';
import UsuarioRepository from '../repositories/usuarioRepository.js';
import crypto from 'crypto';

export default class UsuarioController {
    #repository;

    constructor(){
        this.#repository = new UsuarioRepository();
    }

    async listar(req,res){
        try{
            const incluirInativos = req.query.inativos === 'true';
            let lista = await this.#repository.listar(incluirInativos);
            
            if(lista.length > 0)
                res.status(200).json(lista);
            else 
                res.status(404).json({msg: "Nenhum usuário foi encontrado!"});
        }
        catch(exception){
            console.log(exception);
            res.status(500).json({erro: "Erro ao listar os usuários"});
        }
    }

    async cadastrar(req, res) {
        try {
            const { nome, email, senha, telefone } = req.body;

            if (!nome || !email || !senha) {
                return res.status(400).json({ erro: "Os campos nome, email e senha são obrigatórios." });
            }
            
            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexEmail.test(email)) {
                return res.status(400).json({ erro: "Formato de e-mail inválido. Certifique-se de usar '@' e '.'" });
            }
            
            const emailJaExiste = await this.#repository.verificarEmailExistente(email);
            if (emailJaExiste) {
                return res.status(400).json({ erro: "Este email já está cadastrado por outro cliente." });
            }

            const crypto = await import('crypto'); 
            const senhaHash = crypto.createHash('sha256').update(senha).digest('hex');

            const usuario = new Usuario();
            usuario.nome = nome;
            usuario.email = email;
            usuario.senha = senhaHash;
            usuario.telefone = telefone || null; 

            const resultado = await this.#repository.cadastrar(usuario);
            
            if (resultado) {
                return res.status(201).json({ msg: "Usuário cadastrado com sucesso!" });
            } else {
                return res.status(400).json({ erro: "Não foi possível cadastrar o usuário no banco de dados." });
            }

        } catch (exception) {
            console.error("Erro no catch do cadastrar:", exception);
            return res.status(500).json({ erro: "Erro interno no servidor ao cadastrar o usuário." });
        }
    }

    async cadastrarAdmin(req, res) {
        try {
            const { nome, email, senha, telefone } = req.body;

            if (!nome || !email || !senha) {
                return res.status(400).json({ erro: "Os campos nome, email e senha são obrigatórios para gerar o acesso." });
            }

            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexEmail.test(email)) {
                return res.status(400).json({ erro: "Formato de e-mail inválido. Certifique-se de usar '@' e '.'" });
            }

            const emailJaExiste = await this.#repository.verificarEmailExistente(email);
            if (emailJaExiste) {
                return res.status(400).json({ erro: "Este e-mail já possui um acesso no sistema." });
            }

            const crypto = await import('crypto'); 
            const senhaHash = crypto.createHash('sha256').update(senha).digest('hex');

            const Usuario = (await import('../entities/usuario.js')).default;
            const usuario = new Usuario();
            usuario.nome = nome;
            usuario.email = email;
            usuario.senha = senhaHash;
            usuario.telefone = telefone || null; 
            
            usuario.perfil = "FUNCIONARIO"; 

            const resultado = await this.#repository.cadastrar(usuario);
            
            if (resultado) {
                return res.status(201).json({ msg: "Acesso de Administrador gerado com sucesso!" });
            } else {
                return res.status(400).json({ erro: "Não foi possível gerar o acesso no banco de dados." });
            }

        } catch (exception) {
            console.error("Erro ao cadastrarAdmin:", exception);
            return res.status(500).json({ erro: "Erro interno ao gerar o acesso." });
        }
    }

    async alterar(req,res){
        try{
            let id = req.params.id;
            let {nome, email, telefone} = req.body;

            if(!id || !nome || !email){
                return res.status(400).json({msg: "Informe id, nome e email para alterar um usuário!"});
            }

            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regexEmail.test(email)) {
                return res.status(400).json({ erro: "Formato de e-mail inválido. Certifique-se de usar '@' e '.'" });
            }

            const emailJaExiste = await this.#repository.verificarEmailExistente(email, id);
            if (emailJaExiste) {
                return res.status(400).json({ erro: "Este e-mail já está em uso por outro usuário." });
            }

            let Usuario = (await import('../entities/usuario.js')).default;
            let usuario = new Usuario();
            usuario.id = id;
            usuario.nome = nome;
            usuario.email = email;
            usuario.telefone = telefone;

            const resultado = await this.#repository.alterar(usuario);
            if(resultado){
                return res.status(200).json({msg: "Usuário alterado com sucesso!"});
            }
            else{
                return res.status(400).json({msg: "Não foi possível alterar o usuário!"});
            }
        }
        catch(exception){
            console.log(exception);
            res.status(500).json({ erro: "Erro ao alterar o usuário!" });
        }
    }

    async excluir(req, res) {
        try {
            let id = req.params.id;

            if (!id) {
                return res.status(400).json({ msg: "Informe o ID para inativar o utilizador!" });
            }

            const resultado = await this.#repository.excluir(id);
            
            if (resultado) {
                return res.status(200).json({ msg: "Utilizador inativado com sucesso!" });
            } else {
                return res.status(400).json({ msg: "Não foi possível inativar o utilizador!" });
            }
        } catch (exception) {
            console.log(exception);
            return res.status(500).json({ erro: "Erro ao inativar o utilizador!" });
        }
    }

    async reativar(req, res) {
        try {
            let id = req.params.id;

            if (!id) {
                return res.status(400).json({ erro: "Informe o ID para reativar o utilizador!" });
            }

            const resultado = await this.#repository.reativar(id);
            
            if (resultado) {
                return res.status(200).json({ msg: "Utilizador reativado com sucesso!" });
            } else {
                return res.status(400).json({ erro: "Não foi possível reativar o utilizador!" });
            }
        } catch (exception) {
            console.log(exception);
            return res.status(500).json({ erro: "Erro ao reativar o utilizador!" });
        }
    }
}