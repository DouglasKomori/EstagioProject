import produtoRepository from "../repositories/produtoRepository.js";

export default class ProdutoController {
    #repoProdutos;

    constructor(){
        this.#repoProdutos = new produtoRepository();
    }

    async listar(req,res){
        try{
            let lista = await this.#repoProdutos.listar();
            if(lista.length === 0){
                return res.status(404).json({msg: "Nenhum produto encontrado!"});
            }
            else{
                return res.status(200).json(lista);
            }
        }
        catch(exception){
            console.log(exception);
            return res.status(500).json({msg: "Erro ao listar os produtos!"});
        }
    }

    async cadastrar(req, res){
        try{
            let {nome, descricao, precoCusto, precoVenda, quantidadeEstoque, marcaId} = req.body;
            
            if(!nome || !descricao || !precoCusto || !precoVenda || !quantidadeEstoque || !marcaId){
                return res.status(400).json({msg: "Informe nome, descrição, preço de custo, preço de venda, quantidade em estoque e a marca para cadastrar um produto!"});
            }
            
            const result = await this.#repoProdutos.cadastrar({nome, descricao, precoCusto, precoVenda, quantidadeEstoque, marcaId});
            if(result){
                return res.status(201).json({msg: "Produto cadastrado com sucesso!"});
            }
            else{
                return res.status(400).json({msg: "Não foi possível cadastrar o produto!"});
            }
        }
        catch(exception){
            console.log(exception);
            return res.status(500).json({msg: "Erro ao cadastrar o produto!"});
        }
    }

    async alterar(req, res){
        try{
            let id = req.params.id;
            
            let {nome, descricao, precoCusto, precoVenda, quantidadeEstoque, marcaId} = req.body;
            
            if(!id || !nome || !descricao || !precoCusto || !precoVenda || !quantidadeEstoque || !marcaId){
                return res.status(400).json({msg: "Informe id, nome, descrição, preço de custo, preço de venda, quantidade em estoque e a marca para alterar um produto!"});
            }

            const result = await this.#repoProdutos.alterar({id, nome, descricao, precoCusto, precoVenda, quantidadeEstoque, marcaId});
            if(result){
                return res.status(200).json({msg: "Produto alterado com sucesso!"});
            }
            else{
                return res.status(400).json({msg: "Não foi possível alterar o produto!"});
            }
        }
        catch(exception){
            console.log(exception);
            return res.status(500).json({msg: "Erro ao alterar o produto!"});
        }
    }

    async excluir(req, res){
        try{
            let id = req.params.id;
            if(!id){
                return res.status(400).json({msg: "Informe o id para excluir um produto!"});
            }
            const result = await this.#repoProdutos.excluir(id);
            if(result){
                return res.status(200).json({msg: "Produto excluído com sucesso!"});
            }
            else{
                return res.status(400).json({msg: "Não foi possível excluir o produto!"});
            }
        }
        catch(exception){
            console.log(exception);
            return res.status(500).json({msg: "Erro ao excluir o produto!"});
        }
    }
}