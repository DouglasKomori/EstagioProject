import Database from '../db/database.js';

function gerarCodigo() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

export default class CodigoVerificacaoRepository {
    #banco;

    constructor() {
        this.#banco = new Database();
    }

    async gerarESalvar(email) {
        // Invalida todos os códigos anteriores do mesmo e-mail
        await this.#banco.ExecutaComandoNonQuery(
            "UPDATE codigo_verificacao SET usado = 1 WHERE email = ? AND usado = 0",
            [email]
        );

        const codigo = gerarCodigo();
        const expiracao = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

        await this.#banco.ExecutaComandoNonQuery(
            "INSERT INTO codigo_verificacao (email, codigo, expiracao, usado) VALUES (?, ?, ?, 0)",
            [email, codigo, expiracao.toISOString()]
        );

        return codigo;
    }

    async verificar(email, codigo) {
        const rows = await this.#banco.ExecutaComando(
            "SELECT * FROM codigo_verificacao WHERE email = ? AND codigo = ? AND usado = 0 AND expiracao > NOW()",
            [email, codigo]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    async marcarUsado(id) {
        await this.#banco.ExecutaComandoNonQuery(
            "UPDATE codigo_verificacao SET usado = 1 WHERE id = ?",
            [id]
        );
    }
}
