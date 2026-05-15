import pkg from 'pg';
import 'dotenv/config';

const { Pool } = pkg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
});

function converterPlaceholders(sql) {
    let i = 0;
    return sql.replace(/\?/g, () => `$${++i}`);
}

export default class Database {
    #transactionClient = null;

    async AbreTransacao() {
        this.#transactionClient = await pool.connect();
        await this.#transactionClient.query('BEGIN');
    }

    async Commit() {
        await this.#transactionClient.query('COMMIT');
        this.#transactionClient.release();
        this.#transactionClient = null;
    }

    async Rollback() {
        try {
            await this.#transactionClient.query('ROLLBACK');
        } finally {
            this.#transactionClient.release();
            this.#transactionClient = null;
        }
    }

    async ExecutaComando(sql, valores = []) {
        const sqlConvertido = converterPlaceholders(sql);
        const executor = this.#transactionClient || pool;
        const result = await executor.query(sqlConvertido, valores);
        return result.rows;
    }

    async ExecutaComandoNonQuery(sql, valores = []) {
        const sqlConvertido = converterPlaceholders(sql);
        const executor = this.#transactionClient || pool;
        const result = await executor.query(sqlConvertido, valores);
        return result.rowCount > 0;
    }

    async ExecutaComandoLastInserted(sql, valores = []) {
        const sqlComReturning = sql.trimEnd().replace(/;$/, '') + ' RETURNING id';
        const sqlConvertido = converterPlaceholders(sqlComReturning);
        const executor = this.#transactionClient || pool;
        const result = await executor.query(sqlConvertido, valores);
        return result.rows[0].id;
    }
}
