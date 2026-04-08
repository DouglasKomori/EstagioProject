import DisponibilidadeRepository from "../repositories/disponibilidadeRepository.js";

export default class DisponibilidadeController {
    #repo;

    constructor() {
        this.#repo = new DisponibilidadeRepository();
    }

    async listar(req, res) {
        try {
            // Permite filtrar passando ?profissionalId=1 na URL
            const profissionalId = req.query.profissionalId || null;
            let lista = await this.#repo.listar(profissionalId);
            
            return res.status(200).json(lista);
        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao listar disponibilidades!" });
        }
    }

    async cadastrar(req, res) {
        try {
            let { diaSemana, horaInicio, horaFim, profissionalId } = req.body;

            if (diaSemana === undefined || !horaInicio || !horaFim || !profissionalId) {
                return res.status(400).json({ msg: "Dia da semana, Horários e Profissional são obrigatórios!" });
            }

            if (horaInicio >= horaFim) {
                return res.status(400).json({ msg: "A hora de fim deve ser maior que a hora de início." });
            }

            const temConflito = await this.#repo.verificarConflito(profissionalId, diaSemana, horaInicio, horaFim);
            if (temConflito) {
                return res.status(400).json({ msg: "Este profissional já possui um turno que entra em conflito com este horário nesse mesmo dia." });
            }

            const result = await this.#repo.cadastrar({ diaSemana, horaInicio, horaFim, profissionalId });
            if (result) {
                return res.status(201).json({ msg: "Turno adicionado com sucesso!" });
            } else {
                return res.status(400).json({ msg: "Não foi possível salvar a disponibilidade." });
            }
        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao cadastrar disponibilidade!" });
        }
    }

    async excluir(req, res) {
        try {
            let id = req.params.id;
            if (!id) return res.status(400).json({ msg: "Informe o ID para remover!" });
            
            const result = await this.#repo.excluir(id);
            if (result) return res.status(200).json({ msg: "Turno removido com sucesso!" });
            else return res.status(400).json({ msg: "Não foi possível remover o turno." });
        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao remover disponibilidade!" });
        }
    }
}