import Database from '../db/database.js';
import Pessoa from '../entities/pessoa.js';

export default class PessoaRepository {
    #banco;

    constructor() {
        this.#banco = new Database();
    }

    async listar(incluirInativos = false) {
        let sql = `
            SELECT p.*, pf.cpf, pf.dataNascimento, pj.cnpj, pj.nomeFantasia 
            FROM pessoa p 
            LEFT JOIN pessoa_fisica pf ON p.id = pf.pessoa_id 
            LEFT JOIN pessoa_juridica pj ON p.id = pj.pessoa_id 
        `;

        if (!incluirInativos) {
            sql += " WHERE p.ativo = 1";
        }

        let rows = await this.#banco.ExecutaComando(sql);
        let lista = [];
        
        for(let i = 0; i < rows.length; i++){
            let row = rows[i];
            let p = new Pessoa();
            p.id = row["id"];
            p.nome = row["nome"];
            p.tipoPessoa = row["tipopessoa"] || row["tipoPessoa"];
            p.telefone = row["telefone"];
            p.email = row["email"];
            p.ativo = row["ativo"] === undefined ? true : (row["ativo"] === 1 || row["ativo"] === true);

            p.cpf = row["cpf"] || "";
            p.dataNascimento = row["datanascimento"] || row["dataNascimento"] || null;
            p.cnpj = row["cnpj"] || "";
            p.nomeFantasia = row["nomefantasia"] || row["nomeFantasia"] || "";

            lista.push(p);
        }
        return lista;
    }

    async listarProfissionais() {
        // Busca apenas as Pessoas Físicas (Equipe) que estão ativas
        let sql = "SELECT * FROM pessoa WHERE tipoPessoa = 'PF' AND ativo = 1";
        const rows = await this.#banco.ExecutaComando(sql);
        
        let lista = [];
        for(let i = 0; i < rows.length; i++){
            let row = rows[i];
            let p = new Pessoa();
            p.id = row["id"];
            p.nome = row["nome"];
            p.tipoPessoa = row["tipopessoa"] || row["tipoPessoa"];
            p.telefone = row["telefone"];
            p.email = row["email"];
            p.ativo = row["ativo"];
            lista.push(p);
        }
        return lista;
    }

    async cadastrar(pessoa) {
        try {
            await this.#banco.AbreTransacao();

            let sqlPai = "INSERT INTO pessoa (nome, tipoPessoa, telefone, email, ativo) VALUES (?, ?, ?, ?, 1)";
            let paramsPai = [pessoa.nome, pessoa.tipoPessoa, pessoa.telefone, pessoa.email];
            let pessoaId = await this.#banco.ExecutaComandoLastInserted(sqlPai, paramsPai);

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
        try {
            await this.#banco.AbreTransacao();
            await this.#banco.ExecutaComandoNonQuery("UPDATE pessoa SET ativo = 0 WHERE id = ?", [id]);
            await this.#banco.ExecutaComandoNonQuery(
                `UPDATE cliente SET ativo = 0
                 WHERE LOWER(email) = LOWER((SELECT email FROM pessoa WHERE id = ? AND email IS NOT NULL))
                   AND perfil IN ('FUNCIONARIO', 'ADMIN')`,
                [id]
            );
            await this.#banco.Commit();
            return true;
        } catch (error) {
            await this.#banco.Rollback();
            throw error;
        }
    }

    async reativar(id) {
        try {
            await this.#banco.AbreTransacao();
            await this.#banco.ExecutaComandoNonQuery("UPDATE pessoa SET ativo = 1 WHERE id = ?", [id]);
            await this.#banco.ExecutaComandoNonQuery(
                `UPDATE cliente SET ativo = 1
                 WHERE LOWER(email) = LOWER((SELECT email FROM pessoa WHERE id = ? AND email IS NOT NULL))
                   AND perfil IN ('FUNCIONARIO', 'ADMIN')`,
                [id]
            );
            await this.#banco.Commit();
            return true;
        } catch (error) {
            await this.#banco.Rollback();
            throw error;
        }
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
            p.tipoPessoa = row["tipopessoa"] || row["tipoPessoa"];
            p.telefone = row["telefone"];
            p.email = row["email"];
            p.ativo = row["ativo"];
            p.cpf = row["cpf"] || "";
            p.dataNascimento = row["datanascimento"] || row["dataNascimento"] || null;
            p.cnpj = row["cnpj"] || "";
            p.nomeFantasia = row["nomefantasia"] || row["nomeFantasia"] || "";
            return p;
        }
        return null;
    }
}