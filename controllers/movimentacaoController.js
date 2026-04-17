import MovimentacaoRepository from "../repositories/movimentacaoRepository.js";
import ProdutoRepository from "../repositories/produtoRepository.js"; 

export default class MovimentacaoController {
    #repo;
    #repoProduto;

    constructor() {
        this.#repo = new MovimentacaoRepository();
        this.#repoProduto = new ProdutoRepository();
    }

    async movimentar(req, res) {
        try {
            let { produtoId, tipo, quantidade, motivo } = req.body;
            let usuarioId = req.usuarioLogado.id;

            if (!produtoId || !tipo || !quantidade || !motivo) {
                return res.status(400).json({ msg: "Preencha todos os campos da movimentação." });
            }

            if (quantidade <= 0) {
                return res.status(400).json({ msg: "A quantidade deve ser maior que zero." });
            }

            if (tipo === 'SAIDA') {
                const produto = await this.#repoProduto.consultarPorId(produtoId);
                if (!produto) return res.status(404).json({ msg: "Produto não encontrado." });

                if (produto.quantidadeEstoque < quantidade) {
                    return res.status(400).json({ 
                        msg: `Estoque insuficiente! Você tentou retirar ${quantidade}, mas só existem ${produto.quantidadeEstoque} no sistema.` 
                    });
                }
            }

            const dados = { produtoId, usuarioId, tipo, quantidade, motivo };
            const result = await this.#repo.registrar(dados);

            if (result) return res.status(201).json({ msg: "Estoque atualizado com sucesso!" });
            else return res.status(400).json({ msg: "Erro ao atualizar o estoque." });

        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro interno ao movimentar estoque." });
        }
    }

    async listar(req, res) {
        try {
            let produtoId = req.params.produtoId;
            const historico = await this.#repo.listarPorProduto(produtoId);
            return res.status(200).json(historico);
        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao buscar histórico do produto." });
        }
    }
}