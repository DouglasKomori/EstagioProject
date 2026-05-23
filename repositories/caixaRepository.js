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

    async contarComandasAbertas() {
        let sql = "SELECT COUNT(*) as total FROM comanda WHERE status = 'ABERTA'";
        let rows = await this.#banco.ExecutaComando(sql);
        return Number(rows[0].total);
    }

    async fechar(idCaixa, saldoFinalCalculado) {
        let sql = "UPDATE caixa SET status = 'FECHADO', dataFechamento = NOW(), saldoFinal = ? WHERE id = ?";
        return await this.#banco.ExecutaComandoNonQuery(sql, [saldoFinalCalculado, idCaixa]);
    }

    async listarHistorico(limite = 30) {
        let sql = `
            SELECT 
                id, 
                dataAbertura, 
                dataFechamento, 
                saldoInicial, 
                saldoFinal,
                (saldoFinal - saldoInicial) as faturamento
            FROM caixa 
            WHERE status = 'FECHADO' 
            ORDER BY dataFechamento DESC 
            LIMIT ?
        `;
        return await this.#banco.ExecutaComando(sql, [limite]);
    }

    async listarMovimentacoes(caixaId) {
        // Serviços realizados nas comandas deste caixa
        let sqlServicos = `
            SELECT 
                cs.id                                       AS id,
                'servico'                                   AS tipo,
                s.nome                                      AS descricao,
                p.nome                                      AS profissional,
                cli.nome                                    AS cliente,
                1                                           AS quantidade,
                cs.valorCobrado                             AS valor,
                COALESCE(c.dataFechamento, c.dataAbertura)  AS dataHora
            FROM comanda_servico cs
            INNER JOIN comanda c      ON cs.comandaId = c.id
            INNER JOIN servico s      ON cs.servicoId = s.id
            LEFT  JOIN pessoa p       ON cs.profissionalId = p.id
            LEFT  JOIN cliente cli    ON c.clienteId = cli.id
            WHERE c.caixaId = ?
        `;

        // Produtos vendidos nas comandas deste caixa
        let sqlProdutos = `
            SELECT 
                cp.id                                       AS id,
                'produto'                                   AS tipo,
                prod.nome                                   AS descricao,
                NULL                                        AS profissional,
                cli.nome                                    AS cliente,
                cp.quantidade                               AS quantidade,
                (cp.valorCobrado * cp.quantidade)           AS valor,
                COALESCE(c.dataFechamento, c.dataAbertura)  AS dataHora
            FROM comanda_produto cp
            INNER JOIN comanda c      ON cp.comandaId = c.id
            INNER JOIN produto prod   ON cp.produtoId = prod.id
            LEFT  JOIN cliente cli    ON c.clienteId = cli.id
            WHERE c.caixaId = ?
        `;

        const servicos = await this.#banco.ExecutaComando(sqlServicos, [caixaId]);
        const produtos = await this.#banco.ExecutaComando(sqlProdutos, [caixaId]);

        // Junta e ordena por data/hora decrescente (mais recente primeiro)
        const todas = [...servicos, ...produtos].sort(
            (a, b) => new Date(b.dataHora) - new Date(a.dataHora)
        );

        return todas;
    }

    async faturamentoPorForma(caixaId) {
        let sql = `
            SELECT
                COALESCE(SUM(CASE WHEN c.forma_pagamento = 'DINHEIRO' THEN (COALESCE(ts.total, 0) + COALESCE(tp.total, 0)) ELSE 0 END), 0) AS totaldinheiro,
                COALESCE(SUM(CASE WHEN c.forma_pagamento = 'CREDITO'  THEN (COALESCE(ts.total, 0) + COALESCE(tp.total, 0)) ELSE 0 END), 0) AS totalcredito,
                COALESCE(SUM(CASE WHEN c.forma_pagamento = 'DEBITO'   THEN (COALESCE(ts.total, 0) + COALESCE(tp.total, 0)) ELSE 0 END), 0) AS totaldebito,
                COALESCE(SUM(CASE WHEN c.forma_pagamento = 'PIX'      THEN (COALESCE(ts.total, 0) + COALESCE(tp.total, 0)) ELSE 0 END), 0) AS totalpix
            FROM comanda c
            LEFT JOIN (
                SELECT comandaId, SUM(valorCobrado) AS total FROM comanda_servico GROUP BY comandaId
            ) ts ON ts.comandaId = c.id
            LEFT JOIN (
                SELECT comandaId, SUM(valorCobrado * quantidade) AS total FROM comanda_produto GROUP BY comandaId
            ) tp ON tp.comandaId = c.id
            WHERE c.caixaId = ? AND c.status = 'PAGA'
        `;
        let rows = await this.#banco.ExecutaComando(sql, [caixaId]);
        return rows[0] || { totalDinheiro: 0, totalCredito: 0, totalDebito: 0, totalPix: 0 };
    }

    async buscarDetalhesHistorico(caixaId) {
        // Serviços agrupados por nome + profissional
        let sqlServicos = `
            SELECT 
                s.nome                          AS nome,
                p.nome                          AS profissional,
                COUNT(*)                        AS quantidade,
                SUM(cs.valorCobrado)            AS valor
            FROM comanda_servico cs
            INNER JOIN comanda c      ON cs.comandaId = c.id
            INNER JOIN servico s      ON cs.servicoId = s.id
            LEFT  JOIN pessoa p       ON cs.profissionalId = p.id
            WHERE c.caixaId = ?
            GROUP BY s.id, p.id
            ORDER BY quantidade DESC
        `;

        // Produtos agrupados por nome
        let sqlProdutos = `
            SELECT 
                prod.nome                                   AS nome,
                SUM(cp.quantidade)                          AS quantidade,
                SUM(cp.valorCobrado * cp.quantidade)        AS valor
            FROM comanda_produto cp
            INNER JOIN comanda c      ON cp.comandaId = c.id
            INNER JOIN produto prod   ON cp.produtoId = prod.id
            WHERE c.caixaId = ?
            GROUP BY prod.id
            ORDER BY quantidade DESC
        `;

        const servicos = await this.#banco.ExecutaComando(sqlServicos, [caixaId]);
        const produtos = await this.#banco.ExecutaComando(sqlProdutos, [caixaId]);

        return { servicos, produtos };
    }
}