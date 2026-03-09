import Database from '../db/database.js';
import Servicos from '../entities/servicos.js';

export default class ServicosRepository {
    #banco;

    constructor(){
        this.#banco = new Database();
    }

    async listar(){
        let sql = "select * from servico where excluido = 0";

        let rows = await this.#banco.ExecutaComando(sql);
        let lista = [];
        for(let i = 0; i < rows.length; i++){
            let row = rows[i];
            let s = new Servicos();
            s.id = row["id"];
            s.nome = row["nome"];
            s.descricao = row["descricao"];
            s.valor = row["valor"];
            s.tempoEstimadoMinutos = row["tempoEstimadoMinutos"];
            s.excluido = row["excluido"];
            lista.push(s);
        }
        return lista;
    }

    async cadastrar(servico){
        let sql = "insert into servico (nome, descricao, valor, tempoEstimadoMinutos, excluido) values (?, ?, ?, ?, 0)";
        let params = [servico.nome, servico.descricao, servico.valor, servico.tempoEstimadoMinutos];
        let result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }

    async alterar(servico){
        let sql = "update servico set nome = ?, descricao = ?, valor = ?, tempoEstimadoMinutos = ? where id = ?";
        let params = [servico.nome, servico.descricao, servico.valor, servico.tempoEstimadoMinutos, servico.id];
        let result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }

    async excluir(id){
        let sql = "update servico set excluido = 1 where id = ?";
        let params = [id];
        let result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }
}