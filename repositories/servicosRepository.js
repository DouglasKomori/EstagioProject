import Database from '../db/database.js';
import Servicos from '../entities/servicos.js';

export default class ServicosRepository {
    #banco;

    constructor(){
        this.#banco = new Database();
    }

    async listar(incluirInativos = false){
        let sql = "select * from servico";
        
        if (!incluirInativos) {
            sql += " where excluido = 0";
        }

        let rows = await this.#banco.ExecutaComando(sql);
        let lista = [];
        for(let i = 0; i < rows.length; i++){
            let row = rows[i];
            let s = new Servicos();
            s.id = row["id"];
            s.nome = row["nome"];
            s.descricao = row["descricao"];
            s.valor = row["valor"];
            s.tempoEstimadoMinutos = row["tempoestimadominutos"] || row["tempoEstimadoMinutos"];
            s.excluido = row["excluido"];
            lista.push(s);
        }
        return lista;
    }

    async verificarNomeExistente(nome, idIgnorar = 0) {
        let sql = "SELECT id FROM servico WHERE LOWER(nome) = LOWER(?) AND id != ?";
        let rows = await this.#banco.ExecutaComando(sql, [nome, idIgnorar]);
        return rows.length > 0; 
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

    async reativar(id){
        let sql = "update servico set excluido = 0 where id = ?";
        let params = [id];
        let result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }

    async consultarPorId(id){
        let sql = "select * from servico where id = ? and excluido = 0";
        let params = [id];
        let rows = await this.#banco.ExecutaComando(sql, params);
        if(rows.length > 0){
            let row = rows[0];
            let s = new Servicos();
            s.id = row["id"];
            s.nome = row["nome"];
            s.descricao = row["descricao"];
            s.valor = row["valor"];
            s.tempoEstimadoMinutos = row["tempoestimadominutos"] || row["tempoEstimadoMinutos"];
            s.excluido = row["excluido"];
            return s;
        }
        return null;
    }

    async getRelatorioServicos({ dataInicio, dataFim, profissionalId, ordenacao = 'frequencia' }){
        let sql = `
            SELECT
                s.id                        AS servicoId,
                s.nome                      AS servicoNome,
                s.valor                     AS precoBase,
                COUNT(cs.id)                AS frequencia,
                SUM(cs.valorCobrado)        AS receitaTotal,
                AVG(cs.valorCobrado)        AS ticketMedio,
                MIN(c.dataFechamento)       AS primeiraOcorrencia,
                MAX(c.dataFechamento)       AS ultimaOcorrencia
            FROM comanda_servico cs
            INNER JOIN servico s ON cs.servicoId = s.id
            INNER JOIN comanda c ON cs.comandaId = c.id
            WHERE c.status = 'PAGA'
        `;

        let params = [];

        if (dataInicio) {
            sql += " AND DATE(c.dataFechamento) >= ?";
            params.push(dataInicio);
        }
        if (dataFim) {
            sql += " AND DATE(c.dataFechamento) <= ?";
            params.push(dataFim);
        }
        if (profissionalId) {
            sql += " AND cs.profissionalId = ?";
            params.push(profissionalId);
        }

        sql += " GROUP BY s.id, s.nome, s.valor";

        if (ordenacao === 'receita') {
            sql += " ORDER BY receitaTotal DESC";
        } else if (ordenacao === 'nome') {
            sql += " ORDER BY s.nome ASC";
        } else {
            sql += " ORDER BY frequencia DESC";
        }

        let rows = await this.#banco.ExecutaComando(sql, params);
        return rows;
    }

    async getDetalheServicoPorProfissional({ servicoId, dataInicio, dataFim }){
        let sql = `
            SELECT
                p.id                  AS profissionalId,
                p.nome                AS profissionalNome,
                COUNT(cs.id)          AS frequencia,
                SUM(cs.valorCobrado)  AS receitaTotal,
                AVG(cs.valorCobrado)  AS ticketMedio
            FROM comanda_servico cs
            INNER JOIN pessoa  p ON cs.profissionalId = p.id
            INNER JOIN comanda c ON cs.comandaId      = c.id
            WHERE c.status     = 'PAGA'
              AND cs.servicoId = ?
        `;

        let params = [servicoId];

        if (dataInicio) {
            sql += " AND DATE(c.dataFechamento) >= ?";
            params.push(dataInicio);
        }
        if (dataFim) {
            sql += " AND DATE(c.dataFechamento) <= ?";
            params.push(dataFim);
        }

        sql += " GROUP BY p.id, p.nome ORDER BY frequencia DESC";

        let rows = await this.#banco.ExecutaComando(sql, params);
        return rows;
    }

    async getKPIsServicos({ dataInicio, dataFim, profissionalId }){
        let sql = `
            SELECT
                COUNT(DISTINCT cs.servicoId) AS totalServicosDistintos,
                COUNT(cs.id)                 AS totalExecucoes,
                SUM(cs.valorCobrado)         AS receitaTotal,
                AVG(cs.valorCobrado)         AS ticketMedio,
                COUNT(DISTINCT c.clienteId)  AS totalClientesAtendidos
            FROM comanda_servico cs
            INNER JOIN comanda c ON cs.comandaId = c.id
            WHERE c.status = 'PAGA'
        `;

        let params = [];

        if (dataInicio) {
            sql += " AND DATE(c.dataFechamento) >= ?";
            params.push(dataInicio);
        }
        if (dataFim) {
            sql += " AND DATE(c.dataFechamento) <= ?";
            params.push(dataFim);
        }
        if (profissionalId) {
            sql += " AND cs.profissionalId = ?";
            params.push(profissionalId);
        }

        let rows = await this.#banco.ExecutaComando(sql, params);
        return rows.length > 0 ? rows[0] : null;
    }

    async getProfissionais(){
        let sql = `
            SELECT id, nome
            FROM pessoa
            WHERE ativo = 1
              AND tipoPessoa = 'PF'
            ORDER BY nome ASC
        `;
        let rows = await this.#banco.ExecutaComando(sql);
        return rows;
    }
}