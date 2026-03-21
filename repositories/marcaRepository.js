import Database from '../db/database.js';
import Marca from '../entities/marca.js';

export default class marcaRepository{
    #banco;

    constructor(){
        this.#banco = new Database();
    }

    async listar(){
        let sql = "select * from marca where ativo = 1";

        let rows = await this.#banco.ExecutaComando(sql);
        let lista = [];
        for(let i = 0; i < rows.length; i++){
            let row = rows[i];
            let m = new Marca();
            m.id = row.id;
            m.nome = row.nome;
            m.ativo = row.ativo;
            lista.push(m);
        }
        return lista;
    }

    async cadastrar(marca){
        let sql = "insert into marca (nome, ativo) values (?, 1)";
        
        let params = [marca.nome];
        let result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }

    async alterar(marca){
        let sql = "update marca set nome = ? where id = ?";
        let params = [marca.nome, marca.id];
        let result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }

    async excluir(id){
        let sql = "update marca set ativo = 0 where id = ?";
        let params = [id];
        let result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }

    async consultarPorId(id){
        let sql = "select * from marca where id = ? and ativo = 1";
        let params = [id];
        let rows = await this.#banco.ExecutaComando(sql, params);
        
        if(rows.length > 0){
            let row = rows[0];
            let m = new Marca();
            m.id = row.id;
            m.nome = row.nome;
            m.ativo = row.ativo;
            return m;
        }
        return null;
    }

}  