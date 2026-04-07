import BloqueioRepository from "../repositories/bloqueioRepository.js";

export default class BloqueioController {
    #repoBloqueio;

    constructor() {
        this.#repoBloqueio = new BloqueioRepository();
    }

    async listar(req, res) {
        try {
            const incluirInativos = req.query.inativos === 'true';
            let lista = await this.#repoBloqueio.listar(incluirInativos);
            
            if (lista.length === 0) {
                return res.status(404).json({ msg: "Nenhum bloqueio de agenda encontrado!" });
            }
            return res.status(200).json(lista);
        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao listar os bloqueios!" });
        }
    }

    async cadastrar(req, res) {
        try {
            let { dataInicio, dataFim, motivo, profissionalId } = req.body;

            if (!dataInicio || !dataFim || !profissionalId) {
                return res.status(400).json({ msg: "Data de Início, Data de Fim e Profissional são obrigatórios!" });
            }

            if (new Date(dataInicio) >= new Date(dataFim)) {
                return res.status(400).json({ msg: "A data final deve ser maior que a data inicial." });
            }

            const temConflito = await this.#repoBloqueio.verificarConflito(profissionalId, dataInicio, dataFim);
            if (temConflito) {
                return res.status(400).json({ msg: "Este profissional já possui um bloqueio cadastrado neste período." });
            }

            const result = await this.#repoBloqueio.cadastrar({ dataInicio, dataFim, motivo, profissionalId });
            if (result) return res.status(201).json({ msg: "Bloqueio de agenda cadastrado com sucesso!" });
            else return res.status(400).json({ msg: "Não foi possível cadastrar o bloqueio." });

        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao cadastrar o bloqueio!" });
        }
    }

    async alterar(req, res) {
        try {
            let id = req.params.id;
            let { dataInicio, dataFim, motivo, profissionalId } = req.body;

            if (!id || !dataInicio || !dataFim || !profissionalId) {
                return res.status(400).json({ msg: "Dados incompletos para alterar o bloqueio." });
            }

            if (new Date(dataInicio) >= new Date(dataFim)) {
                return res.status(400).json({ msg: "A data final deve ser maior que a data inicial." });
            }

            const temConflito = await this.#repoBloqueio.verificarConflito(profissionalId, dataInicio, dataFim, id);
            if (temConflito) {
                return res.status(400).json({ msg: "Este profissional já possui outro bloqueio neste período." });
            }

            const result = await this.#repoBloqueio.alterar({ id, dataInicio, dataFim, motivo, profissionalId });
            if (result) return res.status(200).json({ msg: "Bloqueio alterado com sucesso!" });
            else return res.status(400).json({ msg: "Não foi possível alterar o bloqueio." });

        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao alterar o bloqueio!" });
        }
    }

    async excluir(req, res) {
        try {
            let id = req.params.id;
            if (!id) return res.status(400).json({ msg: "Informe o ID para excluir o bloqueio!" });
            
            const result = await this.#repoBloqueio.excluir(id);
            if (result) return res.status(200).json({ msg: "Bloqueio inativado com sucesso!" });
            else return res.status(400).json({ msg: "Não foi possível inativar o bloqueio." });
        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao inativar o bloqueio!" });
        }
    }

    async reativar(req, res) {
        try {
            let id = req.params.id;
            if (!id) return res.status(400).json({ msg: "Informe o ID para reativar o bloqueio!" });
            
            const result = await this.#repoBloqueio.reativar(id);
            if (result) return res.status(200).json({ msg: "Bloqueio reativado com sucesso!" });
            else return res.status(400).json({ msg: "Não foi possível reativar o bloqueio." });
        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao reativar o bloqueio!" });
        }
    }

    async consultarPorId(req, res) {
        try {
            let id = req.params.id;
            if (!id) return res.status(400).json({ msg: "Informe o ID para consultar." });
            
            const result = await this.#repoBloqueio.consultarPorId(id);
            if (result) return res.status(200).json(result);
            else return res.status(404).json({ msg: "Bloqueio não encontrado!" });
        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao consultar o bloqueio!" });
        }
    }
}