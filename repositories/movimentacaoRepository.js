import Database from '../db/database.js';

export default class MovimentacaoRepository {
    #banco;

    constructor() {
        this.#banco = new Database();
    }

    async registrar(dados) {
        // 1. Grava o registro de auditoria (Histórico)
        let sqlHistorico = `INSERT INTO movimentacao_estoque (produtoId, usuarioId, tipo, quantidade, motivo) VALUES (?, ?, ?, ?, ?)`;
        let paramsHistorico = [dados.produtoId, dados.usuarioId, dados.tipo, dados.quantidade, dados.motivo];
        await this.#banco.ExecutaComandoNonQuery(sqlHistorico, paramsHistorico);

        // 2. Atualiza matematicamente o saldo na tabela produto
        let sqlAtualizaEstoque = "";
        if (dados.tipo === 'ENTRADA') {
            sqlAtualizaEstoque = "UPDATE produto SET quantidadeEstoque = quantidadeEstoque + ? WHERE id = ?";
        } else {
            sqlAtualizaEstoque = "UPDATE produto SET quantidadeEstoque = quantidadeEstoque - ? WHERE id = ?";
        }
        let paramsEstoque = [dados.quantidade, dados.produtoId];

        return await this.#banco.ExecutaComandoNonQuery(sqlAtualizaEstoque, paramsEstoque);
    }

    // Traz o histórico detalhado de um produto específico
    async listarPorProduto(produtoId) {
        let sql = `
            SELECT m.*, c.nome as responsavel 
            FROM movimentacao_estoque m
            INNER JOIN cliente c ON m.usuarioId = c.id
            WHERE m.produtoId = ?
            ORDER BY m.dataMovimentacao DESC
        `;
        return await this.#banco.ExecutaComando(sql, [produtoId]);
    }
}