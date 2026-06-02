import AgendamentoRepository from "../repositories/agendamentoRepository.js";
import BloqueioRepository from "../repositories/bloqueioRepository.js";
import { enviarConfirmacaoAgendamento } from "../services/emailService.js";

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
                data = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo' }).format(new Date());
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

            const agendamentoId = await this.#repo.cadastrar({
                dataHora, clienteId, profissionalId, status: "AGENDADO", observacao, servicos
            });

            if(agendamentoId){
                // Envia e-mail de confirmação sem bloquear a resposta
                this.#repo.buscarDetalhesParaEmail(agendamentoId).then(detalhes => {
                    if (!detalhes) {
                        console.warn('[Email] Detalhes do agendamento não encontrados para o ID:', agendamentoId);
                        return;
                    }
                    if (!detalhes.clienteEmail) {
                        console.warn('[Email] Cliente sem e-mail cadastrado. ID agendamento:', agendamentoId);
                        return;
                    }
                    console.log('[Email] Enviando para:', detalhes.clienteEmail);
                    enviarConfirmacaoAgendamento(detalhes.clienteEmail, {
                        nomeCliente: detalhes.clienteNome,
                        dataHora: detalhes.dataHora,
                        servicos: detalhes.nomesServicos || "Serviço",
                        profissional: detalhes.profissionalNome,
                    }).then(() => {
                        console.log('[Email] Enviado com sucesso para:', detalhes.clienteEmail);
                    }).catch(err => {
                        console.error('[Email] Falha no envio. Destinatário:', detalhes.clienteEmail, '| Erro:', err?.message || err);
                    });
                }).catch(err => console.error('[Email] Erro ao buscar detalhes do agendamento:', err));

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
                if (agendamento.clienteid !== usuarioLogado.id) {
                    return res.status(403).json({ msg: "Acesso negado." });
                }

                const agora = new Date();
                const horaAgendamento = new Date(agendamento.datahora);

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
            if (!clienteId) return res.status(401).json({ msg: "Sessão expirada. Faça login novamente." });
            const lista = await this.#repo.listarPorCliente(clienteId);
            if (lista && lista.length > 0) return res.status(200).json(lista);
            else return res.status(404).json({ msg: "Você ainda não tem agendamentos." });
        } catch (exception) {
            console.error("Erro ao listar agendamentos do cliente:", exception);
            return res.status(500).json({ msg: "Erro interno ao buscar seus agendamentos." });
        }
    }

    async reagendar(req, res) {
        try {
            const id = req.params.id;
            const { dataHora } = req.body;
            const usuarioLogado = req.usuarioLogado;

            if (!dataHora) return res.status(400).json({ msg: "Informe a nova data e hora." });

            // Valida que o horário está no padrão de 30 em 30 minutos (:00 ou :30)
            const novaData = new Date(dataHora);
            const minutos = novaData.getMinutes();
            if (minutos !== 0 && minutos !== 30) {
                return res.status(400).json({ msg: "O horário deve ser em ponto ou meia hora (ex: 14:00 ou 14:30)." });
            }

            const agendamento = await this.#repo.buscarPorId(id);
            if (!agendamento) return res.status(404).json({ msg: "Agendamento não encontrado." });

            if (usuarioLogado.perfil === 'CLIENTE' && agendamento.clienteId !== usuarioLogado.id) {
                return res.status(403).json({ msg: "Acesso negado." });
            }

            const agora = new Date();
            const horaAgendamento = new Date(agendamento.dataHora);
            if ((horaAgendamento - agora) / (1000 * 60) < 120) {
                return res.status(403).json({ msg: "Reagendamento só é permitido com 2h de antecedência." });
            }

            // Verifica se o novo horário já está ocupado por outro cliente
            const temConflito = await this.#repo.verificarConflitoHorario(
                agendamento.profissionalId, dataHora, Number(id)
            );
            if (temConflito) {
                return res.status(409).json({ msg: "Este horário já está ocupado com outro cliente. Escolha um horário diferente." });
            }

            const result = await this.#repo.reagendar(id, dataHora);
            if (result) return res.status(200).json({ msg: "Agendamento reagendado com sucesso!" });
            else return res.status(400).json({ msg: "Não foi possível reagendar." });
        } catch (exception) {
            console.error(exception);
            return res.status(500).json({ msg: "Erro ao reagendar." });
        }
    }

    async listarHistoricoCliente(req, res) {
        try {
            const clienteId = req.usuarioLogado.id;
            if (!clienteId) return res.status(401).json({ msg: "Sessão expirada. Faça login novamente." });
            const lista = await this.#repo.listarHistoricoPorCliente(clienteId);
            return res.status(200).json(lista || []);
        } catch (exception) {
            console.error("Erro ao listar histórico:", exception);
            return res.status(500).json({ msg: "Erro interno ao buscar histórico." });
        }
    }

    async listarHorariosOcupados(req, res) {
        try {
            let { data, profissionalId } = req.query;
            
            if (!data || !profissionalId) return res.status(200).json([]);

            let dataInicio = `${data} 00:00:00`;
            let dataFim = `${data} 23:59:59`;

            let rows = await this.#repo.listarHorariosOcupados(profissionalId, dataInicio, dataFim);
            let ocupados = [];

            rows.forEach(r => {
                let dataAtual = new Date(r.dataHora);
                let tempoTotal = parseInt(r.tempoTotal) || 30;
                
                let blocosConsumidos = Math.ceil(tempoTotal / 30);

                for (let i = 0; i < blocosConsumidos; i++) {
                    let h = String(dataAtual.getHours()).padStart(2, '0');
                    let m = String(dataAtual.getMinutes()).padStart(2, '0');
                    let slotStr = `${h}:${m}`;
                    
                    if (!ocupados.includes(slotStr)) {
                        ocupados.push(slotStr);
                    }
                    
                    dataAtual.setMinutes(dataAtual.getMinutes() + 30);
                }
            });

            const bloqueios = await this.#repoBloqueio.listar(false);
            const bloqueiosDoProfissional = bloqueios.filter(b => b.profissionalId == profissionalId);

            const gradeHorarios = [];
            for (let h = 0; h < 24; h++) {
                for (let m = 0; m < 60; m += 30) {
                    gradeHorarios.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
                }
            }

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
    async emitirRelatorioAgenda(req, res) {
        try {
            const { dataInicio, dataFim, profissionalId, status, clienteNome } = req.query;
            
            const filtros = {};
            if (dataInicio) filtros.dataInicio = dataInicio;
            if (dataFim) filtros.dataFim = dataFim;
            if (profissionalId) filtros.profissionalId = profissionalId;
            if (status) filtros.status = status;
            if (clienteNome) filtros.clienteNome = clienteNome;

            let lista = await this.#repo.emitirRelatorioAgenda(filtros);
            
            return res.status(200).json(lista);
        } catch (exception) {
            console.error("Erro ao emitir relatório de agenda:", exception);
            return res.status(500).json({ erro: "Erro interno ao gerar o relatório de agendamentos." });
        }
    }
}