import CaixaRepository from "../repositories/caixaRepository.js";

export default class CaixaController {
    #repo;

    constructor() {
        this.#repo = new CaixaRepository();
    }

    async statusAtual(req, res) {
        try {
            const caixa = await this.#repo.buscarCaixaAberto();
            if (caixa) {
                return res.status(200).json({ aberto: true, caixa });
            } else {
                return res.status(200).json({ aberto: false });
            }
        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao verificar status do caixa." });
        }
    }

    async abrir(req, res) {
        try {
            let { saldoInicial } = req.body;
            
            let profissionalId = req.usuarioLogado.id; 

            if (saldoInicial === undefined || saldoInicial === null) {
                return res.status(400).json({ msg: "Informe o saldo inicial (fundo de troco)." });
            }

            if (Number(saldoInicial) < 0) {
                return res.status(400).json({ msg: "O saldo inicial não pode ser negativo!" });
            }

            const caixaExistente = await this.#repo.buscarCaixaAberto();
            if (caixaExistente) {
                return res.status(400).json({ msg: "Atenção: Já existe um caixa aberto no momento!" });
            }

            const result = await this.#repo.abrir(Number(saldoInicial), profissionalId);
            if (result) {
                return res.status(201).json({ msg: "Caixa aberto com sucesso!" });
            } else {
                return res.status(400).json({ msg: "Erro ao abrir o caixa no banco de dados." });
            }

        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro interno ao tentar abrir o caixa." });
        }
    }

    async resumo(req, res) {
        try {
            const caixa = await this.#repo.buscarCaixaAberto();
            if (!caixa) return res.status(400).json({ msg: "Não há nenhum caixa aberto no momento." });

            const faturamento = await this.#repo.calcularFaturamento(caixa.id);
            const saldoFinalEsperado = Number(caixa.saldoInicial) + Number(faturamento);

            return res.status(200).json({
                saldoInicial: Number(caixa.saldoInicial),
                faturamento: Number(faturamento),
                saldoFinalEsperado: saldoFinalEsperado,
                dataAbertura: caixa.dataAbertura
            });
        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao gerar resumo do caixa." });
        }
    }

    async fechar(req, res) {
        try {
            const caixa = await this.#repo.buscarCaixaAberto();
            if (!caixa) return res.status(400).json({ msg: "Não há caixa aberto." });

            const faturamento = await this.#repo.calcularFaturamento(caixa.id);
            const saldoFinalEsperado = Number(caixa.saldoInicial) + Number(faturamento);

            const result = await this.#repo.fechar(caixa.id, saldoFinalEsperado);
            
            if (result) return res.status(200).json({ msg: "Caixa fechado com sucesso! Bom descanso." });
            else return res.status(400).json({ msg: "Erro ao tentar fechar o caixa." });
        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro interno ao fechar o caixa." });
        }
    }

    async historico(req, res) {
        try {
            const limite = parseInt(req.query.limite) || 30;
            const lista = await this.#repo.listarHistorico(limite);
            return res.status(200).json(lista);
        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao buscar histórico de caixas." });
        }
    }

    async movimentacoes(req, res) {
        try {
            const caixa = await this.#repo.buscarCaixaAberto();
            if (!caixa) {
                return res.status(400).json({ msg: "Não há caixa aberto no momento." });
            }

            const lista = await this.#repo.listarMovimentacoes(caixa.id);
            return res.status(200).json(lista);
        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao buscar movimentações do caixa." });
        }
    }

    async historicoDetalhes(req, res) {
        try {
            const caixaId = parseInt(req.params.id);
            if (!caixaId || isNaN(caixaId)) {
                return res.status(400).json({ msg: "ID do caixa inválido." });
            }

            const detalhes = await this.#repo.buscarDetalhesHistorico(caixaId);
            return res.status(200).json(detalhes);
        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao buscar detalhes do histórico." });
        }
    }
}