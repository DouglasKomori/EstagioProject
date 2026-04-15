import Database from '../db/database.js';

export default class CaixaRepository {
    #banco;

    constructor() {
        this.#banco = new Database();
    }

    async buscarCaixaAberto() {
        let sql = "SELECT * FROM caixa WHERE status = 'ABERTO'";
        let rows = await this.#banco.ExecutaComando(sql);
        return rows.length > 0 ? rows[0] : null;
    }

    async abrir(saldoInicial, usuarioId) {
        let sql = "INSERT INTO caixa (saldoInicial, usuarioId, status) VALUES (?, ?, 'ABERTO')";
        let params = [saldoInicial, usuarioId];
        return await this.#banco.ExecutaComandoNonQuery(sql, params);
    }

    async calcularFaturamento(caixaId) {
        let sqlServicos = `
            SELECT COALESCE(SUM(cs.valorCobrado), 0) as totalServicos
            FROM comanda_servico cs
            INNER JOIN comanda c ON cs.comandaId = c.id
            WHERE c.caixaId = ?
        `;
        let resServicos = await this.#banco.ExecutaComando(sqlServicos, [caixaId]);

        let sqlProdutos = `
            SELECT COALESCE(SUM(cp.valorCobrado * cp.quantidade), 0) as totalProdutos
            FROM comanda_produto cp
            INNER JOIN comanda c ON cp.comandaId = c.id
            WHERE c.caixaId = ?
        `;
        let resProdutos = await this.#banco.ExecutaComando(sqlProdutos, [caixaId]);
        
        return Number(resServicos[0].totalServicos) + Number(resProdutos[0].totalProdutos);
    }

    async fechar(idCaixa, saldoFinalCalculado) {
        let sql = "UPDATE caixa SET status = 'FECHADO', dataFechamento = NOW(), saldoFinal = ? WHERE id = ?";
        return await this.#banco.ExecutaComandoNonQuery(sql, [saldoFinalCalculado, idCaixa]);
    }
}