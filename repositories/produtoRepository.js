import Database from '../db/database.js';
import produto from '../entities/produto.js';

export default class produtoRepository {
    #banco;

    constructor(){
        this.#banco = new Database();
    }

    async listar(){
        let sql = "select * from produto where ativo = 1";

        let rows = await this.#banco.ExecutaComando(sql);
        let lista = [];
        for(let i = 0; i < rows.length; i++){
            let row = rows[i];
            let p = new produto();
            p.id = row.id;
            p.nome = row.nome;
            p.descricao = row.descricao;
            p.precoCusto = row.precoCusto;
            p.precoVenda = row.precoVenda;
            p.quantidadeEstoque = row.quantidadeEstoque;
            p.marcaId = row.marcaId;
            p.ativo = row.ativo;
            lista.push(p);
        }
        return lista;
    }

    async cadastrar(produto){
        let sql = "insert into produto (nome, descricao, precoCusto, precoVenda, quantidadeEstoque, marcaId, ativo) values (?, ?, ?, ?, ?, ?, 1)";
        
        let params = [produto.nome, produto.descricao, produto.precoCusto, produto.precoVenda, produto.quantidadeEstoque, produto.marcaId];
        let result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }

    async alterar(produto){
        let sql = "update produto set nome = ?, descricao = ?, precoCusto = ?, precoVenda = ?, quantidadeEstoque = ?, marcaId = ? where id = ?";
        
        let params = [produto.nome, produto.descricao, produto.precoCusto, produto.precoVenda, produto.quantidadeEstoque, produto.marcaId, produto.id];
        let result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }

    async excluir(id){
        let sql = "update produto set ativo = 0 where id = ?";
        let params = [id];
        let result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }

    async consultarPorId(id){
        let sql = "select * from produto where id = ? and ativo = 1";
        let params = [id];
        let rows = await this.#banco.ExecutaComando(sql, params);
        if(rows.length > 0){
            let row = rows[0];
            let p = new produto();
            p.id = row.id;
            p.nome = row.nome;
            p.descricao = row.descricao;
            p.precoCusto = row.precoCusto;
            p.precoVenda = row.precoVenda;
            p.quantidadeEstoque = row.quantidadeEstoque;
            p.marcaId = row.marcaId; 
            return p;
        }
        return null;
    }

}