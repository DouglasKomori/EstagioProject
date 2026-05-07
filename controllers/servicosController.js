import ServicosRepository from "../repositories/servicosRepository.js";

export default class ServicosController {
    #repoServicos;

    constructor(){
        this.#repoServicos = new ServicosRepository();
    }

    async listar(req,res){
        try{
            const incluirInativos = req.query.inativos === 'true';
            let lista = await this.#repoServicos.listar(incluirInativos);
            
            if(lista.length === 0){
                return res.status(404).json({msg: "Nenhum serviço encontrado!"});
            }
            return res.status(200).json(lista);
        }
        catch(exception){
            console.log(exception);
            return res.status(500).json({msg: "Erro ao listar os serviços!"});
        }
    }

    async cadastrar(req, res){
        try{
            let {nome, descricao, valor, tempoEstimadoMinutos} = req.body;
            if(!nome || !descricao || !valor || !tempoEstimadoMinutos){
                return res.status(400).json({msg: "Informe nome, descrição, valor e tempo estimado para cadastrar um serviço!"});
            }

            const existe = await this.#repoServicos.verificarNomeExistente(nome);
            if (existe) {
                return res.status(400).json({msg: "Já existe um serviço cadastrado com este nome!"});
            }

            const result = await this.#repoServicos.cadastrar({nome, descricao, valor, tempoEstimadoMinutos});
            if(result){
                return res.status(201).json({msg: "Serviço cadastrado com sucesso!"});
            }
            else{
                return res.status(400).json({msg: "Não foi possível cadastrar o serviço!"});
            }
        }
        catch(exception){
            console.log(exception);
            return res.status(500).json({msg: "Erro ao cadastrar o serviço!"});
        }
    }

    async alterar(req,res){
        try{
            let id = req.params.id;
            let {nome, descricao, valor, tempoEstimadoMinutos} = req.body;
            if(!id || !nome || !descricao || !valor || !tempoEstimadoMinutos){
                return res.status(400).json({msg: "Informe id, nome, descrição, valor e tempo estimado para alterar um serviço!"});
            }

            const existe = await this.#repoServicos.verificarNomeExistente(nome, id);
            if (existe) {
                return res.status(400).json({msg: "Este nome já está sendo usado por outro serviço!"});
            }

            const result = await this.#repoServicos.alterar({id, nome, descricao, valor, tempoEstimadoMinutos});
            if(result){
                return res.status(200).json({msg: "Serviço alterado com sucesso!"});
            }
            else{
                return res.status(400).json({msg: "Não foi possível alterar o serviço!"});
            }
        }
        catch(exception){
            console.log(exception);
            return res.status(500).json({msg: "Erro ao alterar o serviço!"});
        }
    }

    async excluir(req, res){
        try{
            let id = req.params.id;
            if(!id){
                return res.status(400).json({msg: "Informe o id para excluir um serviço!"});
            }
            const result = await this.#repoServicos.excluir(id);
            if(result){
                return res.status(200).json({msg: "Serviço excluído com sucesso!"});
            }
            else{
                return res.status(400).json({msg: "Não foi possível excluir o serviço!"});
            }
        }
        catch(exception){
            console.log(exception);
            return res.status(500).json({msg: "Erro ao excluir o serviço!"});
        }
    }

    async reativar(req,res){
        try{
            let id = req.params.id;
            if(!id){
                return res.status(400).json({msg: "Informe o id para reativar um serviço!"});
            }
            const result = await this.#repoServicos.reativar(id);
            if(result){
                return res.status(200).json({msg: "Serviço reativado com sucesso!"});
            }
            else{
                return res.status(400).json({msg: "Não foi possível reativar o serviço!"});
            }
        }
        catch(exception){
            console.log(exception);
            return res.status(500).json({msg: "Erro ao reativar o serviço!"});
        }
    }

    async consultarPorId(req,res){
        try{
            let id = req.params.id;
            if(!id){
                return res.status(400).json({msg: "Informe o id para consultar um serviço!"});
            }
            const result = await this.#repoServicos.consultarPorId(id);
            if(result){
                return res.status(200).json(result);
            }
            else{
                return res.status(404).json({msg: "Serviço não encontrado!"});
            }
        }
        catch(exception){
            console.log(exception);
            return res.status(500).json({msg: "Erro ao consultar o serviço!"});
        }
    }

    async getRelatorioServicos(req, res){
        try{
            const { dataInicio, dataFim, profissionalId, ordenacao } = req.query;

            if ((dataInicio && !dataFim) || (!dataInicio && dataFim)) {
                return res.status(400).json({msg: "Informe dataInicio e dataFim juntos para filtrar por período!"});
            }

            if (dataInicio && dataFim) {
                const inicio = new Date(dataInicio);
                const fim    = new Date(dataFim);

                if (isNaN(inicio) || isNaN(fim)) {
                    return res.status(400).json({msg: "Datas inválidas! Use o formato AAAA-MM-DD."});
                }
                if (fim < inicio) {
                    return res.status(400).json({msg: "A dataInicio deve ser anterior à dataFim!"});
                }
                const diffDias = (fim - inicio) / (1000 * 60 * 60 * 24);
                if (diffDias > 366) {
                    return res.status(400).json({msg: "O intervalo máximo permitido é de 1 ano!"});
                }
            }

            const [servicos, kpis] = await Promise.all([
                this.#repoServicos.getRelatorioServicos({ dataInicio, dataFim, profissionalId, ordenacao }),
                this.#repoServicos.getKPIsServicos({ dataInicio, dataFim, profissionalId }),
            ]);

            return res.status(200).json({ servicos, kpis });
        }
        catch(exception){
            console.log(exception);
            return res.status(500).json({msg: "Erro ao gerar o relatório de serviços!"});
        }
    }

    async getDetalheServicoPorProfissional(req, res){
        try{
            const { servicoId } = req.params;
            const { dataInicio, dataFim } = req.query;

            if (!servicoId) {
                return res.status(400).json({msg: "Informe o id do serviço para consultar o detalhamento!"});
            }

            const detalhes = await this.#repoServicos.getDetalheServicoPorProfissional({ servicoId, dataInicio, dataFim });
            return res.status(200).json(detalhes);
        }
        catch(exception){
            console.log(exception);
            return res.status(500).json({msg: "Erro ao buscar o detalhamento por profissional!"});
        }
    }

    async getProfissionais(req, res){
        try{
            const profissionais = await this.#repoServicos.getProfissionais();

            if (profissionais.length === 0) {
                return res.status(404).json({msg: "Nenhum profissional encontrado!"});
            }
            return res.status(200).json(profissionais);
        }
        catch(exception){
            console.log(exception);
            return res.status(500).json({msg: "Erro ao buscar os profissionais!"});
        }
    }
}