-- 1. MARCA
CREATE TABLE marca (
    id    SERIAL PRIMARY KEY,
    nome  VARCHAR(100) NOT NULL,
    ativo SMALLINT NOT NULL DEFAULT 1
);

-- 2. SERVICO
CREATE TABLE servico (
    id                   SERIAL PRIMARY KEY,
    nome                 VARCHAR(100) NOT NULL,
    descricao            VARCHAR(255),
    valor                DECIMAL(10,2) NOT NULL,
    tempoEstimadoMinutos INT,
    excluido             SMALLINT NOT NULL DEFAULT 0
);

-- 3. PESSOA
CREATE TABLE pessoa (
    id         SERIAL PRIMARY KEY,
    nome       VARCHAR(100) NOT NULL,
    tipoPessoa CHAR(2),
    telefone   VARCHAR(20),
    email      VARCHAR(100),
    ativo      SMALLINT NOT NULL DEFAULT 1
);

CREATE TABLE pessoa_fisica (
    pessoa_id      INT PRIMARY KEY REFERENCES pessoa(id) ON DELETE CASCADE,
    cpf            VARCHAR(20) UNIQUE,
    dataNascimento DATE
);

CREATE TABLE pessoa_juridica (
    pessoa_id    INT PRIMARY KEY REFERENCES pessoa(id) ON DELETE CASCADE,
    cnpj         VARCHAR(20) UNIQUE,
    nomeFantasia VARCHAR(100)
);

-- 4. CLIENTE
CREATE TABLE cliente (
    id       SERIAL PRIMARY KEY,
    nome     VARCHAR(100) NOT NULL,
    email    VARCHAR(100) UNIQUE,
    senha    VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    ativo    SMALLINT NOT NULL DEFAULT 1,
    perfil   VARCHAR(20) NOT NULL DEFAULT 'CLIENTE'
);

-- 5. PRODUTO
CREATE TABLE produto (
    id                SERIAL PRIMARY KEY,
    nome              VARCHAR(100) NOT NULL,
    descricao         TEXT,
    precoCusto        DECIMAL(10,2),
    precoVenda        DECIMAL(10,2),
    quantidadeEstoque INT NOT NULL DEFAULT 0,
    ativo             SMALLINT NOT NULL DEFAULT 1,
    marcaId           INT REFERENCES marca(id)
);

-- 6. CAIXA
CREATE TABLE caixa (
    id             SERIAL PRIMARY KEY,
    usuarioId      INT REFERENCES cliente(id),
    dataAbertura   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dataFechamento TIMESTAMP,
    saldoInicial   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    saldoFinal     DECIMAL(10,2),
    status         VARCHAR(10) NOT NULL DEFAULT 'ABERTO'
);

-- 7. DISPONIBILIDADE E BLOQUEIO
CREATE TABLE disponibilidade (
    id             SERIAL PRIMARY KEY,
    diaSemana      INT NOT NULL,
    horaInicio     TIME NOT NULL,
    horaFim        TIME NOT NULL,
    ativo          SMALLINT NOT NULL DEFAULT 1,
    profissionalId INT REFERENCES pessoa(id)
);

CREATE TABLE bloqueio_agenda (
    id             SERIAL PRIMARY KEY,
    dataInicio     TIMESTAMP NOT NULL,
    dataFim        TIMESTAMP NOT NULL,
    motivo         VARCHAR(255),
    profissionalId INT REFERENCES pessoa(id),
    ativo          SMALLINT NOT NULL DEFAULT 1
);

-- 8. AGENDAMENTO
CREATE TABLE agendamento (
    id             SERIAL PRIMARY KEY,
    dataHora       TIMESTAMP NOT NULL,
    clienteId      INT REFERENCES cliente(id),
    profissionalId INT REFERENCES pessoa(id),
    status         VARCHAR(20) NOT NULL DEFAULT 'AGENDADO',
    observacao     TEXT,
    ativo          SMALLINT NOT NULL DEFAULT 1
);

CREATE TABLE agendamento_servico (
    id            SERIAL PRIMARY KEY,
    agendamentoId INT NOT NULL REFERENCES agendamento(id) ON DELETE CASCADE,
    servicoId     INT NOT NULL REFERENCES servico(id) ON DELETE CASCADE
);

-- 9. COMANDA
CREATE TABLE comanda (
    id             SERIAL PRIMARY KEY,
    numero_comanda VARCHAR(50) NOT NULL,
    clienteId      INT REFERENCES cliente(id),
    status         VARCHAR(20) NOT NULL DEFAULT 'ABERTA',
    dataAbertura   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dataFechamento TIMESTAMP,
    caixaId        INT REFERENCES caixa(id)
);

CREATE TABLE comanda_servico (
    id             SERIAL PRIMARY KEY,
    comandaId      INT REFERENCES comanda(id),
    servicoId      INT REFERENCES servico(id),
    profissionalId INT REFERENCES pessoa(id),
    valorCobrado   DECIMAL(10,2)
);

CREATE TABLE comanda_produto (
    id           SERIAL PRIMARY KEY,
    comandaId    INT REFERENCES comanda(id),
    produtoId    INT REFERENCES produto(id),
    quantidade   INT NOT NULL DEFAULT 1,
    valorCobrado DECIMAL(10,2)
);

-- 10. CODIGO DE VERIFICACAO (redefinição de senha)
CREATE TABLE codigo_verificacao (
    id        SERIAL PRIMARY KEY,
    email     VARCHAR(100) NOT NULL,
    codigo    VARCHAR(6) NOT NULL,
    expiracao TIMESTAMP NOT NULL,
    usado     SMALLINT NOT NULL DEFAULT 0
);

-- 11. MOVIMENTACAO DE ESTOQUE
CREATE TABLE movimentacao_estoque (
    id               SERIAL PRIMARY KEY,
    produtoId        INT REFERENCES produto(id),
    usuarioId        INT REFERENCES cliente(id),
    tipo             VARCHAR(10) NOT NULL,
    quantidade       INT NOT NULL,
    motivo           VARCHAR(255),
    dataMovimentacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
