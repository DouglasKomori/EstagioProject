import PessoaRepository from "../repositories/pessoaRepository.js";

export default class PessoaController {
    #repoPessoa;

    constructor() {
        this.#repoPessoa = new PessoaRepository();
    }

    async listar(req, res) {
        try {
            let lista = await this.#repoPessoa.listar();
            if(lista.length === 0){
                return res.status(404).json({msg: "Nenhum registro encontrado!"});
            }
            return res.status(200).json(lista);
        } catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: "Erro ao listar as pessoas!"});
        }
    }

    async cadastrar(req, res) {
        try {
            let { nome, tipoPessoa, telefone, email, cpf, dataNascimento, cnpj, nomeFantasia } = req.body;
            
            if(!nome || !tipoPessoa) {
                return res.status(400).json({msg: "Nome e Tipo da pessoa são obrigatórios!"});
            }

            if(tipoPessoa === 'PF' && !cpf) {
                return res.status(400).json({msg: "Para Pessoa Física, o CPF é obrigatório!"});
            }

            if(tipoPessoa === 'PJ' && !cnpj) {
                return res.status(400).json({msg: "Para Pessoa Jurídica, o CNPJ é obrigatório!"});
            }
            
            const result = await this.#repoPessoa.cadastrar({
                nome, tipoPessoa, telefone, email, cpf, dataNascimento, cnpj, nomeFantasia
            });
            
            if(result){
                return res.status(201).json({msg: "Cadastro realizado com sucesso!"});
            } else {
                return res.status(400).json({msg: "Não foi possível realizar o cadastro!"});
            }
        } catch(exception) {
            console.log(exception);
            if(exception.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({msg: "Este documento (CPF/CNPJ) já está cadastrado no sistema."});
            }
            return res.status(500).json({msg: "Erro ao realizar o cadastro!"});
        }
    }

    async alterar(req, res) {
        try {
            let id = req.params.id;
            let { nome, tipoPessoa, telefone, email, cpf, dataNascimento, cnpj, nomeFantasia } = req.body;
            
            if(!id || !nome || !tipoPessoa){
                return res.status(400).json({msg: "Informe o ID, nome e tipo para alterar!"});
            }
            
            const result = await this.#repoPessoa.alterar({
                id, nome, tipoPessoa, telefone, email, cpf, dataNascimento, cnpj, nomeFantasia
            });
            
            if(result){
                return res.status(200).json({msg: "Cadastro alterado com sucesso!"});
            } else {
                return res.status(400).json({msg: "Não foi possível alterar o cadastro!"});
            }
        } catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: "Erro ao alterar o cadastro!"});
        }
    }

    async excluir(req, res) {
        try {
            let id = req.params.id;
            if(!id){ return res.status(400).json({msg: "Informe o id para excluir!"}); }
            
            const result = await this.#repoPessoa.excluir(id);
            if(result){
                return res.status(200).json({msg: "Cadastro inativado com sucesso!"});
            } else {
                return res.status(400).json({msg: "Não foi possível excluir o cadastro!"});
            }
        } catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: "Erro ao excluir o cadastro!"});
        }
    }

    async consultarPorId(req, res) {
        try {
            let id = req.params.id;
            if(!id){ return res.status(400).json({msg: "Informe o id para consultar!"}); }
            
            const result = await this.#repoPessoa.consultarPorId(id);
            if(result){
                return res.status(200).json(result);
            } else {
                return res.status(404).json({msg: "Cadastro não encontrado!"});
            }
        } catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: "Erro ao consultar o cadastro!"});
        }
    }
}