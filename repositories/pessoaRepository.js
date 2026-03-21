import Database from '../db/database.js';
import Pessoa from '../entities/pessoa.js';

export default class PessoaRepository {
    #banco;

    constructor() {
        this.#banco = new Database();
    }

    async listar() {
        let sql = `
            SELECT p.*, pf.cpf, pf.dataNascimento, pj.cnpj, pj.nomeFantasia 
            FROM pessoa p 
            LEFT JOIN pessoa_fisica pf ON p.id = pf.pessoa_id 
            LEFT JOIN pessoa_juridica pj ON p.id = pj.pessoa_id 
            WHERE p.ativo = 1
        `;
        let rows = await this.#banco.ExecutaComando(sql);
        let lista = [];
        
        for(let i = 0; i < rows.length; i++){
            let row = rows[i];
            let p = new Pessoa();
            p.id = row["id"];
            p.nome = row["nome"];
            p.tipoPessoa = row["tipoPessoa"];
            p.telefone = row["telefone"];
            p.email = row["email"];
            p.ativo = row["ativo"];
            
            p.cpf = row["cpf"] || "";
            p.dataNascimento = row["dataNascimento"] || null;
            p.cnpj = row["cnpj"] || "";
            p.nomeFantasia = row["nomeFantasia"] || "";

            lista.push(p);
        }
        return lista;
    }

    async cadastrar(pessoa) {
        try {
            await this.#banco.AbreTransacao();

            let sqlPai = "INSERT INTO pessoa (nome, tipoPessoa, telefone, email, ativo) VALUES (?, ?, ?, ?, 1)";
            let paramsPai = [pessoa.nome, pessoa.tipoPessoa, pessoa.telefone, pessoa.email];
            await this.#banco.ExecutaComandoNonQuery(sqlPai, paramsPai);

            let lastIdRow = await this.#banco.ExecutaComando("SELECT LAST_INSERT_ID() as id");
            let pessoaId = lastIdRow[0].id;

            if (pessoa.tipoPessoa === 'PF') {
                let sqlFilho = "INSERT INTO pessoa_fisica (pessoa_id, cpf, dataNascimento) VALUES (?, ?, ?)";
                let paramsFilho = [pessoaId, pessoa.cpf, pessoa.dataNascimento || null];
                await this.#banco.ExecutaComandoNonQuery(sqlFilho, paramsFilho);
            } else {
                let sqlFilho = "INSERT INTO pessoa_juridica (pessoa_id, cnpj, nomeFantasia) VALUES (?, ?, ?)";
                let paramsFilho = [pessoaId, pessoa.cnpj, pessoa.nomeFantasia];
                await this.#banco.ExecutaComandoNonQuery(sqlFilho, paramsFilho);
            }

            await this.#banco.Commit();
            return true;

        } catch (error) {
            await this.#banco.Rollback();
            throw error;
        }
    }

    async alterar(pessoa) {
        try {
            await this.#banco.AbreTransacao();

            let sqlPai = "UPDATE pessoa SET nome = ?, tipoPessoa = ?, telefone = ?, email = ? WHERE id = ?";
            let paramsPai = [pessoa.nome, pessoa.tipoPessoa, pessoa.telefone, pessoa.email, pessoa.id];
            await this.#banco.ExecutaComandoNonQuery(sqlPai, paramsPai);

            if (pessoa.tipoPessoa === 'PF') {
                let sqlFilho = "UPDATE pessoa_fisica SET cpf = ?, dataNascimento = ? WHERE pessoa_id = ?";
                await this.#banco.ExecutaComandoNonQuery(sqlFilho, [pessoa.cpf, pessoa.dataNascimento || null, pessoa.id]);
            } else {
                let sqlFilho = "UPDATE pessoa_juridica SET cnpj = ?, nomeFantasia = ? WHERE pessoa_id = ?";
                await this.#banco.ExecutaComandoNonQuery(sqlFilho, [pessoa.cnpj, pessoa.nomeFantasia, pessoa.id]);
            }

            await this.#banco.Commit();
            return true;

        } catch (error) {
            await this.#banco.Rollback();
            throw error;
        }
    }

    async excluir(id) {
        let sql = "UPDATE pessoa SET ativo = 0 WHERE id = ?";
        let result = await this.#banco.ExecutaComandoNonQuery(sql, [id]);
        return result;
    }

    async consultarPorId(id) {
        let sql = `
            SELECT p.*, pf.cpf, pf.dataNascimento, pj.cnpj, pj.nomeFantasia 
            FROM pessoa p 
            LEFT JOIN pessoa_fisica pf ON p.id = pf.pessoa_id 
            LEFT JOIN pessoa_juridica pj ON p.id = pj.pessoa_id 
            WHERE p.id = ? AND p.ativo = 1
        `;
        let rows = await this.#banco.ExecutaComando(sql, [id]);
        
        if(rows.length > 0){
            let row = rows[0];
            let p = new Pessoa();
            p.id = row["id"];
            p.nome = row["nome"];
            p.tipoPessoa = row["tipoPessoa"];
            p.telefone = row["telefone"];
            p.email = row["email"];
            p.ativo = row["ativo"];
            p.cpf = row["cpf"] || "";
            p.dataNascimento = row["dataNascimento"] || null;
            p.cnpj = row["cnpj"] || "";
            p.nomeFantasia = row["nomeFantasia"] || "";
            return p;
        }
        return null;
    }
}