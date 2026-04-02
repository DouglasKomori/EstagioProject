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
        let sql = `SELECT dataHora FROM agendamento 
                   WHERE profissionalId = ? 
                   AND dataHora BETWEEN ? AND ? 
                   AND status = 'AGENDADO' 
                   AND ativo = 1`;
        return await this.#banco.ExecutaComando(sql, [profissionalId, dataInicio, dataFim]);
    }

    async cadastrar(agendamento) {
        try {
            await this.#banco.AbreTransacao();

            // 1. Grava o Agendamento (Usando os nomes EXATOS do diagrama)
            let sqlAgendamento = "INSERT INTO agendamento (dataHora, clienteId, profissionalId, status, observacao, ativo) VALUES (?, ?, ?, ?, ?, 1)";
            let paramsAgendamento = [agendamento.dataHora, agendamento.clienteId, agendamento.profissionalId, agendamento.status, agendamento.observacao];
            await this.#banco.ExecutaComandoNonQuery(sqlAgendamento, paramsAgendamento);

            // 2. Pega o ID gerado
            let lastIdRow = await this.#banco.ExecutaComando("SELECT LAST_INSERT_ID() as id");
            let agendamentoId = lastIdRow[0].id;

            // 3. Grava os Serviços Filhos (Exatamente com os nomes do diagrama)
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
}