import Database from '../db/database.js';
import Usuario from '../entities/usuario.js';

export default class UsuarioRepository {
    #banco;

    constructor(){
        this.#banco = new Database();
    }

    async validarAcesso(email, senha) {

    const sql = "select * from cliente where email = ? and senha = ? and ativo = 1";
    const valores = [email, senha];

    const row = await this.#banco.ExecutaComando(sql, valores);

    if(row.length > 0) {
            return this.toMap(row[0]);
        }

        return null;
    }

        async buscarPorId(id) {
        const sql = "select * from cliente where id = ?";
        const params = [id];
        
        const rows = await this.#banco.ExecutaComando(sql, params);

        if(rows.length > 0) {
            const row = rows[0];
            const usuario = this.toMap(row);

            return usuario;
        }

        return null;
    }

    async listar(){
        let sql = "select * from cliente";
        const rows = await this.#banco.ExecutaComando(sql);
        let usuarios = [];

        for(let i = 0; i<rows.length; i++){
            const row = rows[i];
            usuarios.push(this.toMap(row));
        }
        return usuarios;
    }

async cadastrar(usuario){
        const sql = "insert into cliente (nome, email, senha, telefone, perfil) values (?, ?, ?, ?, ?)";
        
        const perfilDefinitivo = usuario.perfil ? usuario.perfil : 'CLIENTE';

        const params = [usuario.nome, usuario.email, usuario.senha, usuario.telefone,perfilDefinitivo];
        
        const result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }

async alterar(usuario){
        const sql = "update cliente set nome = ?, email = ?, senha = ?, telefone = ? where id = ?";
        const params = [usuario.nome, usuario.email, usuario.senha, usuario.telefone, parseInt(usuario.id)];
        
        console.log("Parâmetros do SQL:", params);

        const result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }

    async excluir(id) {
        const sql = "update cliente set ativo = 0 where id = ?";
        const params = [parseInt(id)]; 
        const result = await this.#banco.ExecutaComandoNonQuery(sql, params);
        return result;
    }

    toMap(row){
        let usuario = new Usuario();
        usuario.id = row["id"];
        usuario.nome = row["nome"];
        usuario.email = row["email"];
        usuario.senha = row["senha"];
        usuario.telefone = row["telefone"];
        usuario.ativo = row["ativo"] === undefined ? true : (row["ativo"] === 1 || row["ativo"] === true);
        usuario.perfil = row["perfil"] || "CLIENTE";
        return usuario;
    }
}