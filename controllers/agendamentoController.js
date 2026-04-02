import AgendamentoRepository from "../repositories/agendamentoRepository.js";

export default class AgendamentoController {
    #repo;

    constructor() {
        this.#repo = new AgendamentoRepository();
    }

    async listarPorData(req, res) {
        try {
            let data = req.query.data;
            if (!data) {
                data = new Date().toISOString().split('T')[0]; 
            }

            let dataInicio = `${data} 00:00:00`;
            let dataFim = `${data} 23:59:59`;

            let lista = await this.#repo.listarPorData(dataInicio, dataFim);
            return res.status(200).json(lista);
        } catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: "Erro ao listar agendamentos!"});
        }
    }

    async cadastrar(req, res) {
        try {
            // 1. Pegamos quem está fazendo a requisição a partir do Token
            const usuarioLogado = req.usuarioLogado; 
            
            let { dataHora, clienteId, profissionalId, observacao, servicos } = req.body;
            
            // 2. REGRA DE SEGURANÇA: 
            // Se quem está logado for um CLIENTE, ignoramos o que veio do front-end 
            // e forçamos o ID dele baseado no Token.
            if (usuarioLogado.perfil === 'CLIENTE') {
                clienteId = usuarioLogado.id;
            }

            // 3. Validação
            if(!dataHora || !clienteId || !profissionalId || !servicos || servicos.length === 0) {
                return res.status(400).json({msg: "Data, Cliente, Profissional e pelo menos 1 serviço são obrigatórios!"});
            }

            // 4. Salva no banco
            const result = await this.#repo.cadastrar({
                dataHora, clienteId, profissionalId, status: "AGENDADO", observacao, servicos
            });
            
            if(result){
                return res.status(201).json({msg: "Agendamento realizado com sucesso!"});
            } else {
                return res.status(400).json({msg: "Não foi possível realizar o agendamento!"});
            }
        } catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: "Erro ao realizar o agendamento!"});
        }
    }

    async alterarStatus(req, res) {
        try {
            let id = req.params.id;
            let { status } = req.body; 
            
            if(!id || !status){
                return res.status(400).json({msg: "Informe o ID e o novo status!"});
            }
            
            const result = await this.#repo.alterarStatus(id, status);
            if(result){
                return res.status(200).json({msg: "Status atualizado com sucesso!"});
            } else {
                return res.status(400).json({msg: "Não foi possível atualizar o agendamento!"});
            }
        } catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: "Erro ao atualizar o status!"});
        }
    }
    
    async cancelar(req, res) {
        try {
            const id = req.params.id;
            const usuarioLogado = req.usuarioLogado; // Pegamos do Token via Middleware

            if (!usuarioLogado) {
                return res.status(401).json({ msg: "Usuário não identificado. Faça login novamente." });
            }

            // 1. Busca o agendamento para verificar a hora
            const agendamento = await this.#repo.buscarPorId(id);
            if (!agendamento) return res.status(404).json({ msg: "Agendamento não encontrado!" });

            // 2. Lógica de Tempo (Apenas para Clientes)
            if (usuarioLogado.perfil === 'CLIENTE') {
                const agora = new Date();
                const horaAgendamento = new Date(agendamento.dataHora);
                
                // Diferença em milissegundos convertida para minutos
                const diferencaMinutos = (horaAgendamento - agora) / (1000 * 60);

                if (diferencaMinutos < 120) {
                    return res.status(403).json({ 
                        msg: "Cancelamento permitido apenas com 2h de antecedência. Entre em contato com a barbearia." 
                    });
                }
            }

            // 3. Se passou (ou é Admin), cancela
            await this.#repo.alterarStatus(id, 'CANCELADO');
            return res.status(200).json({ msg: "Agendamento cancelado com sucesso!" });
            

        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao cancelar agendamento." });
        }

        
    }

    async listarMeusAgendamentos(req, res) {
        try {
            const clienteId = req.usuarioLogado.id; 

            if (!clienteId) {
                return res.status(401).json({ msg: "Sessão expirada. Faça login novamente." });
            }

            const lista = await this.#repo.listarPorCliente(clienteId);
            
            if (lista && lista.length > 0) {
                return res.status(200).json(lista);
            } else {
                return res.status(404).json({ msg: "Você ainda não tem agendamentos." });
            }
        } catch (exception) {
            console.error("Erro ao listar agendamentos do cliente:", exception);
            return res.status(500).json({ msg: "Erro interno ao buscar seus agendamentos." });
        }
    }

    async listarHorariosOcupados(req, res) {
        try {
            let { data, profissionalId } = req.query;
            
            // Se o Front-end não mandar o barbeiro, devolvemos uma lista vazia
            if (!data || !profissionalId) return res.status(200).json([]);

            let dataInicio = `${data} 00:00:00`;
            let dataFim = `${data} 23:59:59`;

            let rows = await this.#repo.listarHorariosOcupados(profissionalId, dataInicio, dataFim);
            
            // Extrai apenas a hora e minuto para o Front-end comparar facilmente
            let ocupados = rows.map(r => {
                const d = new Date(r.dataHora);
                return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            });

            return res.status(200).json(ocupados);
        } catch (exception) {
            console.error("Erro ao buscar horários ocupados:", exception);
            return res.status(500).json([]);
        }
    }
}