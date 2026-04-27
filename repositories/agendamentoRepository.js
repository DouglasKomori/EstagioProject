import Database from '../db/database.js';
import Agendamento from '../entities/agendamento.js';

export default class AgendamentoRepository {
    #banco;

    constructor() {
        this.#banco = new Database();
    }

    async listarPorData(dataInicio, dataFim) {
        let sql = `
            SELECT a.*, 
                   c.nome as clienteNome, 
                   p.nome as profissionalNome,
                   GROUP_CONCAT(s.nome SEPARATOR ' + ') as nomesServicos
            FROM agendamento a
            INNER JOIN cliente c ON a.clienteId = c.id
            INNER JOIN pessoa p ON a.profissionalId = p.id
            LEFT JOIN agendamento_servico aserv ON a.id = aserv.agendamentoId
            LEFT JOIN servico s ON aserv.servicoId = s.id
            WHERE a.dataHora BETWEEN ? AND ? AND a.ativo = 1
            GROUP BY a.id
            ORDER BY a.dataHora ASC
        `;
        return await this.#banco.ExecutaComando(sql, [dataInicio, dataFim]);
    }

    async listarPorCliente(clienteId) {
        let sql = `
            SELECT a.*, 
                   p.nome as profissionalNome,
                   GROUP_CONCAT(s.nome SEPARATOR ' + ') as nomesServicos
            FROM agendamento a
            INNER JOIN pessoa p ON a.profissionalId = p.id
            LEFT JOIN agendamento_servico aserv ON a.id = aserv.agendamentoId
            LEFT JOIN servico s ON aserv.servicoId = s.id
            WHERE a.clienteId = ? 
              AND a.ativo = 1
              -- REGRA DAS 3 HORAS: Só mostra se a hora do agendamento 
              -- for maior que (Agora - 3 horas)
              AND a.dataHora > DATE_SUB(NOW(), INTERVAL 3 HOUR)
            GROUP BY a.id
            ORDER BY a.dataHora ASC
        `;
        return await this.#banco.ExecutaComando(sql, [clienteId]);
    }

    async listarHorariosOcupados(profissionalId, dataInicio, dataFim) {
        let sql = `
            SELECT 
                a.dataHora, 
                COALESCE(SUM(s.tempoEstimadoMinutos), 30) as tempoTotal
            FROM agendamento a
            LEFT JOIN agendamento_servico aserv ON a.id = aserv.agendamentoId
            LEFT JOIN servico s ON aserv.servicoId = s.id
            WHERE a.profissionalId = ? 
              AND a.dataHora BETWEEN ? AND ? 
              AND a.status = 'AGENDADO' 
              AND a.ativo = 1
            GROUP BY a.id, a.dataHora
        `;
        return await this.#banco.ExecutaComando(sql, [profissionalId, dataInicio, dataFim]);
    }

    async cadastrar(agendamento) {
        try {
            await this.#banco.AbreTransacao();

            let sqlAgendamento = "INSERT INTO agendamento (dataHora, clienteId, profissionalId, status, observacao, ativo) VALUES (?, ?, ?, ?, ?, 1)";
            let paramsAgendamento = [agendamento.dataHora, agendamento.clienteId, agendamento.profissionalId, agendamento.status, agendamento.observacao];
            await this.#banco.ExecutaComandoNonQuery(sqlAgendamento, paramsAgendamento);

            let lastIdRow = await this.#banco.ExecutaComando("SELECT LAST_INSERT_ID() as id");
            let agendamentoId = lastIdRow[0].id;

            if (agendamento.servicos && agendamento.servicos.length > 0) {
                let sqlServico = "INSERT INTO agendamento_servico (agendamentoId, servicoId) VALUES (?, ?)";
                for (let servico of agendamento.servicos) {
                    await this.#banco.ExecutaComandoNonQuery(sqlServico, [agendamentoId, servico.id]);
                }
            }

            await this.#banco.Commit();
            return true;
        } catch (error) {
            await this.#banco.Rollback();
            throw error;
        }
    }

    async alterarStatus(id, status) {
        let sql = "UPDATE agendamento SET status = ? WHERE id = ?";
        let result = await this.#banco.ExecutaComandoNonQuery(sql, [status, id]);
        return result;
    }

    async buscarPorId(id) {
        const sql = "SELECT * FROM agendamento WHERE id = ?";
        const rows = await this.#banco.ExecutaComando(sql, [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    async emitirRelatorioAgenda(filtros) {
        let sql = `
            SELECT 
                a.id, 
                a.dataHora, 
                a.status, 
                c.nome AS clienteNome, 
                c.telefone AS clienteTelefone,
                p.nome AS profissionalNome,
                GROUP_CONCAT(s.nome SEPARATOR ', ') AS servicos
            FROM agendamento a
            INNER JOIN cliente c ON a.clienteId = c.id
            INNER JOIN pessoa p ON a.profissionalId = p.id
            LEFT JOIN agendamento_servico aserv ON a.id = aserv.agendamentoId
            LEFT JOIN servico s ON aserv.servicoId = s.id
            WHERE 1=1
        `;

        let params = [];

        if (filtros.dataInicio && filtros.dataFim) {
            sql += " AND a.dataHora BETWEEN ? AND ?";
            params.push(`${filtros.dataInicio} 00:00:00`, `${filtros.dataFim} 23:59:59`);
        } else if (filtros.dataInicio) {
            sql += " AND a.dataHora >= ?";
            params.push(`${filtros.dataInicio} 00:00:00`);
        } else if (filtros.dataFim) {
            sql += " AND a.dataHora <= ?";
            params.push(`${filtros.dataFim} 23:59:59`);
        }

        if (filtros.profissionalId) {
            sql += " AND a.profissionalId = ?";
            params.push(filtros.profissionalId);
        }

        if (filtros.status) {
            sql += " AND a.status = ?";
            params.push(filtros.status);
        }

        if (filtros.clienteNome) {
            sql += " AND c.nome LIKE ?";
            params.push(`%${filtros.clienteNome}%`);
        }

        sql += " GROUP BY a.id, a.dataHora, a.status, c.nome, c.telefone, p.nome";
        sql += " ORDER BY a.dataHora ASC";

        const rows = await this.#banco.ExecutaComando(sql, params);
        return rows;
    }
}