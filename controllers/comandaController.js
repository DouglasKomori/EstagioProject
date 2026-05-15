import ComandaRepository from "../repositories/comandaRepository.js";
import CaixaRepository from "../repositories/caixaRepository.js";
import MovimentacaoRepository from "../repositories/movimentacaoRepository.js"; 
import ProdutoRepository from "../repositories/produtoRepository.js";

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
                
                const repoProduto = new ProdutoRepository();
                const produtoBanco = await repoProduto.consultarPorId(idItem);

                if (!produtoBanco) {
                    return res.status(404).json({ msg: "Produto não encontrado no cadastro." });
                }

                // Soma a quantidade que já está lançada nesta comanda para o mesmo produto
                const qtdJaNaComanda = await this.#repo.quantidadeProdutoNaComanda(comandaId, idItem);
                const qtdTotalDesejada = qtdJaNaComanda + Number(quantidade);

                if (produtoBanco.quantidadeEstoque < qtdTotalDesejada) {
                    const disponivel = produtoBanco.quantidadeEstoque - qtdJaNaComanda;
                    return res.status(400).json({ 
                        msg: `Estoque insuficiente para "${produtoBanco.nome}". Disponível: ${disponivel >= 0 ? disponivel : 0} un. (Estoque: ${produtoBanco.quantidadeEstoque}, já na ficha: ${qtdJaNaComanda}).`
                    });
                }

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
            const repoCaixa = new CaixaRepository();
            const caixaAberto = await repoCaixa.buscarCaixaAberto();
            
            if (!caixaAberto) {
                return res.status(400).json({ msg: "Abra o caixa do dia antes de receber pagamentos!" });
            }

            const detalhes = await this.#repo.consultarDetalhes(id);

            if (!detalhes) {
                return res.status(404).json({ msg: "Comanda não encontrada." });
            }

            // Validação de estoque antes de finalizar (segurança extra)
            if (detalhes.produtos && detalhes.produtos.length > 0) {
                const repoProduto = new ProdutoRepository();

                for (const item of detalhes.produtos) {
                    const produtoBanco = await repoProduto.consultarPorId(item.produtoId);
                    
                    if (!produtoBanco) {
                        return res.status(404).json({ msg: `Produto ${item.produtoNome} não encontrado no cadastro.` });
                    }

                    if (produtoBanco.quantidadeEstoque < item.quantidade) {
                        return res.status(400).json({ 
                            msg: `Estoque insuficiente para o produto: ${item.produtoNome}. Disponível: ${produtoBanco.quantidadeEstoque}, Tentando vender: ${item.quantidade}.` 
                        });
                    }
                }
            }

            if (detalhes.produtos && detalhes.produtos.length > 0) {
                const repoMovimentacao = new MovimentacaoRepository();
                const usuarioLogadoId = req.usuarioLogado.id;

                for (const produto of detalhes.produtos) {
                    const dadosMovimentacao = {
                        produtoId: produto.produtoId,
                        usuarioId: usuarioLogadoId,
                        tipo: 'SAIDA',
                        quantidade: produto.quantidade,
                        motivo: `Venda finalizada na Ficha #${detalhes.numero_comanda}`
                    };

                    await repoMovimentacao.registrar(dadosMovimentacao);
                }
            }

            const result = await this.#repo.fecharComanda(id, caixaAberto.id);
            
            if (result) return res.status(200).json({ msg: "Comanda finalizada e paga!" });
            else return res.status(400).json({ msg: "Erro ao finalizar comanda." });

        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro interno ao finalizar." });
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

    async relatorio(req, res) {
        try {
            let { dataInicio, dataFim, profissionalId, tipo } = req.query;

            let lista = await this.#repo.relatorioFaturamento(dataInicio, dataFim, profissionalId, tipo);
            return res.status(200).json(lista);
        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao gerar relatório de faturamento." });
        }
    }
}