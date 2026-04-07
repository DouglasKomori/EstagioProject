import AgendamentoRepository from "../repositories/agendamentoRepository.js";
import BloqueioRepository from "../repositories/bloqueioRepository.js"; 

export default class AgendamentoController {
    #repo;
    #repoBloqueio;

    constructor() {
        this.#repo = new AgendamentoRepository();
        this.#repoBloqueio = new BloqueioRepository();
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
            const usuarioLogado = req.usuarioLogado; 
            
            let { dataHora, clienteId, profissionalId, observacao, servicos } = req.body;
            
            if (usuarioLogado.perfil === 'CLIENTE') {
                clienteId = usuarioLogado.id;
            }

            if(!dataHora || !clienteId || !profissionalId || !servicos || servicos.length === 0) {
                return res.status(400).json({msg: "Data, Cliente, Profissional e pelo menos 1 serviço são obrigatórios!"});
            }

            const dataAgendamento = new Date(dataHora);
            const bloqueios = await this.#repoBloqueio.listar(false); 
            
            const profissionalBloqueado = bloqueios.some(b => {
                if (b.profissionalId !== Number(profissionalId)) return false;
                const inicio = new Date(b.dataInicio);
                const fim = new Date(b.dataFim);
                return dataAgendamento >= inicio && dataAgendamento < fim;
            });

            if (profissionalBloqueado) {
                return res.status(400).json({msg: "O profissional selecionado possui um bloqueio de agenda (imprevisto/ausência) neste horário."});
            }

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
            const usuarioLogado = req.usuarioLogado;

            if (!usuarioLogado) {
                return res.status(401).json({ msg: "Usuário não identificado. Faça login novamente." });
            }

            const agendamento = await this.#repo.buscarPorId(id);
            if (!agendamento) return res.status(404).json({ msg: "Agendamento não encontrado!" });

            if (usuarioLogado.perfil === 'CLIENTE') {
                const agora = new Date();
                const horaAgendamento = new Date(agendamento.dataHora);

                const diferencaMinutos = (horaAgendamento - agora) / (1000 * 60);

                if (diferencaMinutos < 120) {
                    return res.status(403).json({ 
                        msg: "Cancelamento permitido apenas com 2h de antecedência. Entre em contato com a barbearia." 
                    });
                }
            }

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
            
            if (!data || !profissionalId) return res.status(200).json([]);

            let dataInicio = `${data} 00:00:00`;
            let dataFim = `${data} 23:59:59`;

            let rows = await this.#repo.listarHorariosOcupados(profissionalId, dataInicio, dataFim);
            let ocupados = rows.map(r => {
                const d = new Date(r.dataHora);
                return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            });

            const bloqueios = await this.#repoBloqueio.listar(false);
            const bloqueiosDoProfissional = bloqueios.filter(b => b.profissionalId == profissionalId);

            const gradeHorarios = [
                "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
                "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", 
                "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"
            ];

            gradeHorarios.forEach(horaStr => {
                const [h, m] = horaStr.split(':').map(Number);
                
                const dataSlot = new Date(`${data}T00:00:00`);
                dataSlot.setHours(h, m, 0, 0);

                const taBloqueado = bloqueiosDoProfissional.some(b => {
                    const inicio = new Date(b.dataInicio);
                    const fim = new Date(b.dataFim);
                    return dataSlot >= inicio && dataSlot < fim; 
                });

                if (taBloqueado && !ocupados.includes(horaStr)) {
                    ocupados.push(horaStr);
                }
            });

            return res.status(200).json(ocupados);
        } catch (exception) {
            console.error("Erro ao buscar horários ocupados:", exception);
            return res.status(500).json([]);
        }
    }
}