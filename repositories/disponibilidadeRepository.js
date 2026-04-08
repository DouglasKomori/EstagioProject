import Database from '../db/database.js';

export default class DisponibilidadeRepository {
    #banco;

    constructor() {
        this.#banco = new Database();
    }

    async listar(profissionalId = null) {
        let sql = `
            SELECT d.*, p.nome as profissionalNome 
            FROM disponibilidade d
            INNER JOIN pessoa p ON d.profissionalId = p.id
            WHERE d.ativo = 1
        `;
        let params = [];
        
        // Se passar um ID, filtra só daquele barbeiro. Se não, traz de todos.
        if (profissionalId) {
            sql += " AND d.profissionalId = ?";
            params.push(profissionalId);
        }
        
        sql += " ORDER BY d.profissionalId, d.diaSemana, d.horaInicio";
        return await this.#banco.ExecutaComando(sql, params);
    }

    // REGRA DE SEGURANÇA: Evita que o barbeiro cadastre horários que se encavalam no mesmo dia
    async verificarConflito(profissionalId, diaSemana, horaInicio, horaFim, idIgnorar = 0) {
        let sql = `
            SELECT id FROM disponibilidade 
            WHERE profissionalId = ? 
            AND diaSemana = ? 
            AND ativo = 1 
            AND id != ? 
            AND (horaInicio < ? AND horaFim > ?)
        `;
        let rows = await this.#banco.ExecutaComando(sql, [profissionalId, diaSemana, idIgnorar, horaFim, horaInicio]);
        return rows.length > 0;
    }

    async cadastrar(disp) {
        let sql = "INSERT INTO disponibilidade (diaSemana, horaInicio, horaFim, profissionalId, ativo) VALUES (?, ?, ?, ?, 1)";
        let params = [disp.diaSemana, disp.horaInicio, disp.horaFim, disp.profissionalId];
        return await this.#banco.ExecutaComandoNonQuery(sql, params);
    }

    async excluir(id) {
        let sql = "UPDATE disponibilidade SET ativo = 0 WHERE id = ?";
        return await this.#banco.ExecutaComandoNonQuery(sql, [id]);
    }
}