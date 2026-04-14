import Database from '../db/database.js';

export default class ComandaRepository {
    #banco;

    constructor() {
        this.#banco = new Database();
    }

    async abrir(comanda) {
        let sql = "INSERT INTO comanda (numero_comanda, clienteId, status) VALUES (?, ?, 'ABERTA')";
        let params = [comanda.numero_comanda, comanda.clienteId];
        return await this.#banco.ExecutaComandoNonQuery(sql, params);
    }

    async buscarAbertaPorNumero(numero) {
        let sql = "SELECT * FROM comanda WHERE numero_comanda = ? AND status = 'ABERTA'";
        let rows = await this.#banco.ExecutaComando(sql, [numero]);
        return rows.length > 0 ? rows[0] : null;
    }

    async adicionarServico(item) {
        let sql = `INSERT INTO comanda_servico (comandaId, servicoId, profissionalId, valorCobrado) 
                   VALUES (?, ?, ?, ?)`;
        let params = [item.comandaId, item.servicoId, item.profissionalId, item.valorCobrado];
        return await this.#banco.ExecutaComandoNonQuery(sql, params);
    }

    async adicionarProduto(item) {
        let sql = `INSERT INTO comanda_produto (comandaId, produtoId, quantidade, valorCobrado) 
                   VALUES (?, ?, ?, ?)`;
        let params = [item.comandaId, item.produtoId, item.quantidade, item.valorCobrado];
        return await this.#banco.ExecutaComandoNonQuery(sql, params);
    }

    async consultarDetalhes(idComanda) {
        let sqlHeader = `
            SELECT c.*, cli.nome as clienteNome 
            FROM comanda c 
            INNER JOIN cliente cli ON c.clienteId = cli.id 
            WHERE c.id = ?`;
        let header = await this.#banco.ExecutaComando(sqlHeader, [idComanda]);

        if (header.length === 0) return null;


        let sqlServicos = `
            SELECT cs.*, s.nome as servicoNome, p.nome as profissionalNome 
            FROM comanda_servico cs
            INNER JOIN servico s ON cs.servicoId = s.id
            INNER JOIN pessoa p ON cs.profissionalId = p.id
            WHERE cs.comandaId = ?`;
        let servicos = await this.#banco.ExecutaComando(sqlServicos, [idComanda]);


        let sqlProdutos = `
            SELECT cp.*, pr.nome as produtoNome 
            FROM comanda_produto cp
            INNER JOIN produto pr ON cp.produtoId = pr.id
            WHERE cp.comandaId = ?`;
        let produtos = await this.#banco.ExecutaComando(sqlProdutos, [idComanda]);

        return {
            ...header[0],
            servicos,
            produtos
        };
    }

    async fecharComanda(idComanda) {
        let sql = "UPDATE comanda SET status = 'PAGA', dataFechamento = NOW() WHERE id = ?";
        return await this.#banco.ExecutaComandoNonQuery(sql, [idComanda]);
    }

    async listarAbertas() {
        let sql = `
            SELECT c.*, cli.nome as clienteNome 
            FROM comanda c
            INNER JOIN cliente cli ON c.clienteId = cli.id 
            WHERE c.status = 'ABERTA'
            ORDER BY c.dataAbertura DESC
        `;
        return await this.#banco.ExecutaComando(sql);
    }

    async removerServico(idItem) {
        let sql = "DELETE FROM comanda_servico WHERE id = ?";
        return await this.#banco.ExecutaComandoNonQuery(sql, [idItem]);
    }

    async removerProduto(idItem) {
        let sql = "DELETE FROM comanda_produto WHERE id = ?";
        return await this.#banco.ExecutaComandoNonQuery(sql, [idItem]);
    }
    
    async cancelar(idComanda) {
        let sql = "UPDATE comanda SET status = 'CANCELADA', dataFechamento = NOW() WHERE id = ?";
        return await this.#banco.ExecutaComandoNonQuery(sql, [idComanda]);
    }

    async relatorioFaturamento(dataInicio, dataFim, profissionalId) {
        let sql = `
            SELECT
                c.id as comandaId,
                c.numero_comanda,
                c.dataFechamento,
                cli.nome as clienteNome,
                cs.valorCobrado,
                s.nome as servicoNome,
                p.nome as profissionalNome,
                p.id as profissionalId
            FROM comanda_servico cs
            INNER JOIN comanda c ON cs.comandaId = c.id
            INNER JOIN servico s ON cs.servicoId = s.id
            INNER JOIN pessoa p ON cs.profissionalId = p.id
            INNER JOIN cliente cli ON c.clienteId = cli.id
            WHERE c.status = 'PAGA'
        `;
        
        let params = [];

        if (dataInicio && dataFim) {
            sql += " AND DATE(c.dataFechamento) BETWEEN ? AND ?";
            params.push(dataInicio, dataFim);
        }
        
        if (profissionalId) {
            sql += " AND p.id = ?";
            params.push(profissionalId);
        }

        sql += " ORDER BY c.dataFechamento DESC";

        return await this.#banco.ExecutaComando(sql, params);
    }
}