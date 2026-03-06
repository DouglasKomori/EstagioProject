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
        // 1. Extrai os dados diretamente do corpo da requisição de forma limpa
        const { nome, email, senha, telefone } = req.body;

        // 2. Validação simples: verifica se os campos obrigatórios vieram vazios ou nulos
        if (!nome || !email || !senha) {
            return res.status(400).json({ erro: "Os campos nome, email e senha são obrigatórios." });
        }

        // 3. Verifica se o email já está cadastrado
        const usuarios = await this.#repository.listar();
        const emailJaExiste = usuarios.some(u => u.email === email);
        if (emailJaExiste) {
            return res.status(400).json({ erro: "Este email já está cadastrado." });
        }

        // 4. Hash simples da senha (mantive o seu crypto para não quebrar seu código)
        const crypto = await import('crypto'); // Garantindo o import caso não esteja no topo do arquivo
        const senhaHash = crypto.createHash('sha256').update(senha).digest('hex');

        // 5. Monta o objeto do usuário
        const usuario = new Usuario();
        usuario.nome = nome;
        usuario.email = email;
        usuario.senha = senhaHash;
        usuario.telefone = telefone || null; // Se não mandar telefone, salva como nulo

        // 6. Envia para o repositório salvar no banco
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