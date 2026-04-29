import Database from '../db/database.js';
import produto from '../entities/produto.js';

export default class produtoRepository {
    #banco;

    constructor(){
        this.#banco = new Database();
    }

    async listar(incluirInativos = false){
        let sql = "select * from produto";
        
        if (!incluirInativos) {
            sql += " where ativo = 1";
        }

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

    async verificarNomeExistente(nome, marcaId, idIgnorar = 0) {
        let sql = "SELECT id FROM produto WHERE LOWER(nome) = LOWER(?) AND marcaId = ? AND id != ?";
        let rows = await this.#banco.ExecutaComando(sql, [nome, marcaId, idIgnorar]);
        return rows.length > 0; 
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

    async reativar(id){
        let sql = "update produto set ativo = 1 where id = ?";
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

    async relatorioGiroProdutos(filtros) {
        
        let tipoJoinVendas = "INNER JOIN"; 
        
        if (filtros.ordem === "menos_vendidos" || filtros.ordem === "alfabetica") {
            tipoJoinVendas = "LEFT JOIN";
        }

        let sql = `
            SELECT 
                p.id,
                p.nome as produtoNome,
                m.nome as marcaNome,
                p.quantidadeEstoque as estoqueAtual,
                COALESCE(SUM(vendas.quantidade), 0) as quantidadeVendida,
                COALESCE(SUM(vendas.quantidade * vendas.valorCobrado), 0) as faturamentoTotal
            FROM produto p
            LEFT JOIN marca m ON p.marcaId = m.id
            
            -- Subquery: Isola perfeitamente apenas as vendas do período escolhido
            ${tipoJoinVendas} (
                SELECT cp.produtoId, cp.quantidade, cp.valorCobrado
                FROM comanda_produto cp
                INNER JOIN comanda c ON cp.comandaId = c.id
                WHERE c.status = 'PAGA'
                -- AQUI_ENTRA_O_FILTRO_DE_DATA
            ) vendas ON p.id = vendas.produtoId
            
            WHERE p.ativo = 1
        `;

        let params = [];
        let dataFiltro = "";

        // Filtro de Data
        if (filtros.dataInicio && filtros.dataFim) {
            dataFiltro = " AND c.dataFechamento BETWEEN ? AND ? ";
            params.push(`${filtros.dataInicio} 00:00:00`, `${filtros.dataFim} 23:59:59`);
        } else if (filtros.dataInicio) {
            dataFiltro = " AND c.dataFechamento >= ? ";
            params.push(`${filtros.dataInicio} 00:00:00`);
        } else if (filtros.dataFim) {
            dataFiltro = " AND c.dataFechamento <= ? ";
            params.push(`${filtros.dataFim} 23:59:59`);
        }

        sql = sql.replace("-- AQUI_ENTRA_O_FILTRO_DE_DATA", dataFiltro);

        // Filtro de Marca
        if (filtros.marcaId) {
            sql += " AND p.marcaId = ? ";
            params.push(filtros.marcaId);
        }

        // Filtro de Estoque Baixo
        if (filtros.estoqueBaixo === 'true') {
            sql += " AND p.quantidadeEstoque < 5 ";
        }

        sql += " GROUP BY p.id, p.nome, m.nome, p.quantidadeEstoque ";

        // Filtro de Ordenação
        if (filtros.ordem === "mais_vendidos") {
            sql += " ORDER BY quantidadeVendida DESC, faturamentoTotal DESC ";
        } else if (filtros.ordem === "maior_faturamento") {
            sql += " ORDER BY faturamentoTotal DESC, quantidadeVendida DESC ";
        } else if (filtros.ordem === "menos_vendidos") {
            sql += " ORDER BY quantidadeVendida ASC, p.nome ASC ";
        } else {
            sql += " ORDER BY p.nome ASC ";
        }

        const rows = await this.#banco.ExecutaComando(sql, params);
        return rows;
    }
}