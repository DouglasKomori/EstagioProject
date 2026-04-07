import Database from '../db/database.js';

export default class BloqueioRepository {
    #banco;

    constructor() {
        this.#banco = new Database();
    }

    async listar(incluirInativos = false) {
        let sql = `
            SELECT b.*, p.nome as profissionalNome 
            FROM bloqueio_agenda b
            INNER JOIN pessoa p ON b.profissionalId = p.id
        `;
        
        if (!incluirInativos) {
            sql += " WHERE b.ativo = 1";
        }
        
        sql += " ORDER BY b.dataInicio DESC";

        return await this.#banco.ExecutaComando(sql);
    }

    async verificarConflito(profissionalId, dataInicio, dataFim, idIgnorar = 0) {
        let sql = `
            SELECT id FROM bloqueio_agenda 
            WHERE profissionalId = ? 
            AND ativo = 1 
            AND id != ? 
            AND (dataInicio < ? AND dataFim > ?)
        `;

        let rows = await this.#banco.ExecutaComando(sql, [profissionalId, idIgnorar, dataFim, dataInicio]);
        return rows.length > 0;
    }

    async cadastrar(bloqueio) {
        let sql = "INSERT INTO bloqueio_agenda (dataInicio, dataFim, motivo, profissionalId, ativo) VALUES (?, ?, ?, ?, 1)";
        let params = [bloqueio.dataInicio, bloqueio.dataFim, bloqueio.motivo, bloqueio.profissionalId];
        return await this.#banco.ExecutaComandoNonQuery(sql, params);
    }

    async alterar(bloqueio) {
        let sql = "UPDATE bloqueio_agenda SET dataInicio = ?, dataFim = ?, motivo = ?, profissionalId = ? WHERE id = ?";
        let params = [bloqueio.dataInicio, bloqueio.dataFim, bloqueio.motivo, bloqueio.profissionalId, bloqueio.id];
        return await this.#banco.ExecutaComandoNonQuery(sql, params);
    }

    async excluir(id) {
        let sql = "UPDATE bloqueio_agenda SET ativo = 0 WHERE id = ?";
        return await this.#banco.ExecutaComandoNonQuery(sql, [id]);
    }

    async reativar(id) {
        let sql = "UPDATE bloqueio_agenda SET ativo = 1 WHERE id = ?";
        return await this.#banco.ExecutaComandoNonQuery(sql, [id]);
    }

    async consultarPorId(id) {
        let sql = "SELECT * FROM bloqueio_agenda WHERE id = ? AND ativo = 1";
        let rows = await this.#banco.ExecutaComando(sql, [id]);
        return rows.length > 0 ? rows[0] : null;
    }
}