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
            let lista = await this.#repository.listar();
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

        const usuarios = await this.#repository.listar();
        const emailJaExiste = usuarios.some(u => u.email === email);
        if (emailJaExiste) {
            return res.status(400).json({ erro: "Este email já está cadastrado." });
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
}