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

pool.on('connect', (client) => {
    client.query("SET timezone = 'America/Sao_Paulo'");
});

function converterPlaceholders(sql) {
    let i = 0;
    return sql.replace(/\?/g, () => `$${++i}`);
}

const COLUNAS_CAMEL = {
    tipopessoa: 'tipoPessoa', datanascimento: 'dataNascimento', nomefantasia: 'nomeFantasia',
    tempoestimadominutos: 'tempoEstimadoMinutos', precocusto: 'precoCusto', precovenda: 'precoVenda',
    quantidadeestoque: 'quantidadeEstoque', marcaid: 'marcaId', usuarioid: 'usuarioId',
    dataabertura: 'dataAbertura', datafechamento: 'dataFechamento', saldoinicial: 'saldoInicial',
    saldofinal: 'saldoFinal', diasemana: 'diaSemana', horainicio: 'horaInicio', horafim: 'horaFim',
    profissionalid: 'profissionalId', datainicio: 'dataInicio', datafim: 'dataFim',
    datahora: 'dataHora', clienteid: 'clienteId', servicoid: 'servicoId',
    agendamentoid: 'agendamentoId', caixaid: 'caixaId', comandaid: 'comandaId',
    produtoid: 'produtoId', valorcobrado: 'valorCobrado', datamovimentacao: 'dataMovimentacao',
    profissionalnome: 'profissionalNome', clientenome: 'clienteNome', clientetelefone: 'clienteTelefone',
    nomesservicos: 'nomesServicos', serviconome: 'servicoNome', receitatotal: 'receitaTotal',
    ticketmedio: 'ticketMedio', primeiraocorrencia: 'primeiraOcorrencia', ultimaocorrencia: 'ultimaOcorrencia',
    totalservicosdistintos: 'totalServicosDistintos', totalexecucoes: 'totalExecucoes',
    totalclientesatendidos: 'totalClientesAtendidos', precobase: 'precoBase',
    totalservicos: 'totalServicos', totalprodutos: 'totalProdutos',
    produtonome: 'produtoNome', marcanome: 'marcaNome', estoqueatual: 'estoqueAtual',
    quantidadevendida: 'quantidadeVendida', faturamentototal: 'faturamentoTotal',
    formapagamento: 'formaPagamento', valorrecebido: 'valorRecebido',
    totaldinheiro: 'totalDinheiro', totalcredito: 'totalCredito',
    totaldebito: 'totalDebito', totalpix: 'totalPix',
};

function normalizarRow(row) {
    const normalizado = {};
    for (const [key, value] of Object.entries(row)) {
        const novaClave = COLUNAS_CAMEL[key] || key;
        normalizado[novaClave] = value;
    }
    return normalizado;
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
        return result.rows.map(normalizarRow);
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
