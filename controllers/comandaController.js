import ComandaRepository from "../repositories/comandaRepository.js";

export default class ComandaController {
    #repo;

    constructor() {
        this.#repo = new ComandaRepository();
    }

    async abrirComanda(req, res) {
        try {
            let { numero_comanda, clienteId } = req.body;

            if (!numero_comanda || !clienteId) {
                return res.status(400).json({ msg: "Número da comanda e Cliente são obrigatórios!" });
            }

            const jaAberta = await this.#repo.buscarAbertaPorNumero(numero_comanda);
            if (jaAberta) {
                return res.status(400).json({ msg: `A comanda n.º ${numero_comanda} já está em uso!` });
            }

            const result = await this.#repo.abrir({ numero_comanda, clienteId });
            if (result) return res.status(201).json({ msg: "Comanda aberta com sucesso!" });
            else return res.status(400).json({ msg: "Erro ao abrir comanda." });

        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro interno no servidor." });
        }
    }

    async adicionarItem(req, res) {
        try {
            let { comandaId, tipo, idItem, profissionalId, quantidade, valor } = req.body;

            if (tipo === 'SERVICO') {
                await this.#repo.adicionarServico({ comandaId, servicoId: idItem, profissionalId, valorCobrado: valor });
            } else {
                await this.#repo.adicionarProduto({ comandaId, produtoId: idItem, quantidade, valorCobrado: valor });
            }

            return res.status(200).json({ msg: "Item adicionado à comanda!" });
        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao adicionar item." });
        }
    }

    async consultar(req, res) {
        try {
            let id = req.params.id;
            const dados = await this.#repo.consultarDetalhes(id);
            if (dados) res.status(200).json(dados);
            else res.status(404).json({ msg: "Comanda não encontrada." });
        } catch (exception) {
            return res.status(500).json({ msg: "Erro ao consultar." });
        }
    }

    async finalizarComanda(req, res) {
        try {
            let id = req.params.id;
            const result = await this.#repo.fecharComanda(id);
            if (result) res.status(200).json({ msg: "Comanda finalizada e paga!" });
            else res.status(400).json({ msg: "Erro ao finalizar comanda." });
        } catch (exception) {
            return res.status(500).json({ msg: "Erro ao finalizar." });
        }
    }

    async listarAbertas(req, res) {
        try {
            let lista = await this.#repo.listarAbertas();
            return res.status(200).json(lista);
        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao listar comandas abertas." });
        }
    }

    async removerItem(req, res) {
        try {
            let { tipo, id } = req.params;
            
            let result;
            if (tipo.toUpperCase() === 'SERVICO') {
                result = await this.#repo.removerServico(id);
            } else {
                result = await this.#repo.removerProduto(id);
            }

            if (result) return res.status(200).json({ msg: "Item removido com sucesso!" });
            else return res.status(400).json({ msg: "Não foi possível remover o item." });
        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao remover item da comanda." });
        }
    }

    async cancelarComanda(req, res) {
        try {
            let id = req.params.id;
            const result = await this.#repo.cancelar(id);
            if (result) res.status(200).json({ msg: "Ficha cancelada com sucesso!" });
            else res.status(400).json({ msg: "Erro ao cancelar ficha." });
        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao cancelar a comanda." });
        }
    }
}