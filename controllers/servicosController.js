import ServicosRepository from "../repositories/servicosRepository.js";

export default class ServicosController {
    #repoServicos;

    constructor(){
        this.#repoServicos = new ServicosRepository();
    }

    async listar(req,res){
        try{
            let lista = await this.#repoServicos.listar();
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
}