import marcaRepository from "../repositories/marcaRepository.js";

export default class MarcaController{
    #repoMarca;

    constructor(){
        this.#repoMarca = new marcaRepository();
    }

    async listar(req, res){
        try{
            let lista = await this.#repoMarca.listar();
            if(lista.length === 0){
                return res.status(404).json({msg: "Nenhuma marca encontrada!"});
            } else {
                return res.status(200).json(lista);
            }       
        }
        catch(exception){
            console.log(exception);
            return res.status(500).json({msg: "Erro ao listar as marcas!"});
        }
    }

    async cadastrar (req,res){
        try{
            let {nome} = req.body;
            if(!nome){
                return res.status(400).json({msg: "Informe o nome para cadastrar uma marca!"});
            }
            const result = await this.#repoMarca.cadastrar({nome});
            if(result){
                return res.status(201).json({msg: "Marca cadastrada com sucesso!"});
            }
            else{
                return res.status(400).json({msg: "Não foi possível cadastrar a marca!"});
            }
        }
        catch(exception){
            console.log(exception);
            return res.status(500).json({msg: "Erro ao cadastrar a marca!"});
        }
    }

    async alterar(req, res){
        try{
            let id = req.params.id;
            let {nome} = req.body;
            if(!id || !nome){
                return res.status(400).json({msg: "Informe id e nome para alterar uma marca!"});
            }
            const result = await this.#repoMarca.alterar({id, nome});
            if(result){
                return res.status(200).json({msg: "Marca alterada com sucesso!"});
            }
            else{
                return res.status(400).json({msg: "Não foi possível alterar a marca!"});
            }
        }
        catch(exception){
            console.log(exception);
            return res.status(500).json({msg: "Erro ao alterar a marca!"});
        }
    }

    async excluir(req,res){
        try{
            let id = req.params.id;
            if(!id){
                return res.status(400).json({msg: "Informe o id para excluir uma marca!"});
            }
            const result = await this.#repoMarca.excluir(id);
            if(result){
                return res.status(200).json({msg: "Marca excluída com sucesso!"});
            }
            else{
                return res.status(400).json({msg: "Não foi possível excluir a marca!"});
            }
        }
        catch(exception){
            console.log(exception);
            return res.status(500).json({msg: "Erro ao excluir a marca!"});
        }
    }

async consultarPorId(req, res){
        try{
            let id = req.params.id;
            if(!id){
                return res.status(400).json({msg: "Informe o id para consultar uma marca!"});
            }
            const result = await this.#repoMarca.consultarPorId(id);
            
            if(result){
                return res.status(200).json(result);
            }
            else{
                return res.status(404).json({msg: "Marca não encontrada!"});
            }
        }
        catch(exception){
            console.log(exception);
            return res.status(500).json({msg: "Erro ao consultar a marca!"});
        }
    }

}