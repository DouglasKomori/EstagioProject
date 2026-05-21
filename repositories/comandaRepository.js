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
        // Verifica se o produto já existe nesta comanda
        let sqlExiste = `
            SELECT id, quantidade FROM comanda_produto 
            WHERE comandaId = ? AND produtoId = ?
        `;
        let existe = await this.#banco.ExecutaComando(sqlExiste, [item.comandaId, item.produtoId]);

        if (existe.length > 0) {
            // Produto já na ficha, soma a quantidade e atualiza o valor unitário
            let sqlUpdate = `
                UPDATE comanda_produto 
                SET quantidade = quantidade + ?, valorCobrado = ?
                WHERE id = ?
            `;
            return await this.#banco.ExecutaComandoNonQuery(sqlUpdate, [
                item.quantidade, item.valorCobrado, existe[0].id
            ]);
        } else {
            // Produto novo na ficha, insere normalmente
            let sqlInsert = `
                INSERT INTO comanda_produto (comandaId, produtoId, quantidade, valorCobrado) 
                VALUES (?, ?, ?, ?)
            `;
            return await this.#banco.ExecutaComandoNonQuery(sqlInsert, [
                item.comandaId, item.produtoId, item.quantidade, item.valorCobrado
            ]);
        }
    }

    async quantidadeProdutoNaComanda(comandaId, produtoId) {
        let sql = `
            SELECT COALESCE(SUM(quantidade), 0) AS total
            FROM comanda_produto
            WHERE comandaId = ? AND produtoId = ?
        `;
        let rows = await this.#banco.ExecutaComando(sql, [comandaId, produtoId]);
        return Number(rows[0].total);
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

    async fecharComanda(idComanda, caixaId, formaPagamento, valorRecebido, troco) {
        let sql = "UPDATE comanda SET status = 'PAGA', dataFechamento = NOW(), caixaId = ?, forma_pagamento = ?, valor_recebido = ?, troco = ? WHERE id = ?";
        return await this.#banco.ExecutaComandoNonQuery(sql, [caixaId, formaPagamento, valorRecebido, troco, idComanda]);
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
        let sqlGet = "SELECT comandaId FROM comanda_servico WHERE id = ?";
        let rows = await this.#banco.ExecutaComando(sqlGet, [idItem]);
        const comandaId = rows.length > 0 ? rows[0].comandaId : null;
        let sql = "DELETE FROM comanda_servico WHERE id = ?";
        const success = await this.#banco.ExecutaComandoNonQuery(sql, [idItem]);
        return { success, comandaId };
    }

    async removerProduto(idItem) {
        let sqlGet = "SELECT comandaId FROM comanda_produto WHERE id = ?";
        let rows = await this.#banco.ExecutaComando(sqlGet, [idItem]);
        const comandaId = rows.length > 0 ? rows[0].comandaId : null;
        let sql = "DELETE FROM comanda_produto WHERE id = ?";
        const success = await this.#banco.ExecutaComandoNonQuery(sql, [idItem]);
        return { success, comandaId };
    }

    async buscarAbertaPorClienteId(clienteId) {
        let sql = `
            SELECT c.id FROM comanda c
            WHERE c.clienteId = ? AND c.status = 'ABERTA'
            ORDER BY c.dataAbertura DESC LIMIT 1`;
        let rows = await this.#banco.ExecutaComando(sql, [clienteId]);
        if (rows.length === 0) return null;
        return this.consultarDetalhes(rows[0].id);
    }
    
    async cancelar(idComanda) {
        let sql = "UPDATE comanda SET status = 'CANCELADA', dataFechamento = NOW() WHERE id = ?";
        return await this.#banco.ExecutaComandoNonQuery(sql, [idComanda]);
    }

    async relatorioFaturamento(dataInicio, dataFim, profissionalId, tipo) {
        const partes = [];
        const params = [];

        const mostrarServicos = !tipo || tipo === 'SERVICO';
        const mostrarProdutos = (!tipo || tipo === 'PRODUTO') && !profissionalId;

        if (mostrarServicos) {
            let cond = "c.status = 'PAGA'";
            if (profissionalId) { cond += " AND p.id = ?"; params.push(profissionalId); }
            if (dataInicio && dataFim) { cond += " AND DATE(c.dataFechamento) BETWEEN ? AND ?"; params.push(dataInicio, dataFim); }
            partes.push(`
                SELECT c.id as comandaId, c.numero_comanda, c.dataFechamento,
                    cli.nome as clienteNome, cs.valorCobrado as valorCobrado,
                    s.nome as servicoNome, p.nome as profissionalNome,
                    p.id as profissionalId, 'SERVICO' as tipo
                FROM comanda_servico cs
                INNER JOIN comanda c ON cs.comandaId = c.id
                INNER JOIN servico s ON cs.servicoId = s.id
                INNER JOIN pessoa p ON cs.profissionalId = p.id
                INNER JOIN cliente cli ON c.clienteId = cli.id
                WHERE ${cond}
            `);
        }

        if (mostrarProdutos) {
            let cond = "c.status = 'PAGA'";
            if (dataInicio && dataFim) { cond += " AND DATE(c.dataFechamento) BETWEEN ? AND ?"; params.push(dataInicio, dataFim); }
            partes.push(`
                SELECT c.id as comandaId, c.numero_comanda, c.dataFechamento,
                    cli.nome as clienteNome, (cp.valorCobrado * cp.quantidade) as valorCobrado,
                    CONCAT(pr.nome, ' (', cp.quantidade, 'x)') as servicoNome,
                    'Balcão / Barbearia' as profissionalNome,
                    NULL as profissionalId, 'PRODUTO' as tipo
                FROM comanda_produto cp
                INNER JOIN comanda c ON cp.comandaId = c.id
                INNER JOIN produto pr ON cp.produtoId = pr.id
                INNER JOIN cliente cli ON c.clienteId = cli.id
                WHERE ${cond}
            `);
        }

        if (partes.length === 0) return [];

        const sql = `(${partes.join(') UNION ALL (')}) ORDER BY dataFechamento DESC`;
        return await this.#banco.ExecutaComando(sql, params);
    }
}