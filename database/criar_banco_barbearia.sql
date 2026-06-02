-- =====================================================================
-- SISTEMA BARBEARIA — Schema PostgreSQL
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. MARCA
-- ---------------------------------------------------------------------
CREATE TABLE marca (
    id    SERIAL       PRIMARY KEY,
    nome  VARCHAR(100) NOT NULL,
    ativo SMALLINT     NOT NULL DEFAULT 1
);

-- ---------------------------------------------------------------------
-- 2. SERVICO
-- ---------------------------------------------------------------------
CREATE TABLE servico (
    id                   SERIAL        PRIMARY KEY,
    nome                 VARCHAR(100)  NOT NULL,
    descricao            VARCHAR(255),
    valor                DECIMAL(10,2),
    tempoEstimadoMinutos INT,
    excluido             SMALLINT      NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------
-- 3. PESSOA (profissionais e demais pessoas do sistema)
-- ---------------------------------------------------------------------
CREATE TABLE pessoa (
    id         SERIAL       PRIMARY KEY,
    nome       VARCHAR(100) NOT NULL,
    tipoPessoa CHAR(2),
    telefone   VARCHAR(20),
    email      VARCHAR(100),
    ativo      SMALLINT     NOT NULL DEFAULT 1
);

CREATE TABLE pessoa_fisica (
    pessoa_id      INT  PRIMARY KEY,
    cpf            VARCHAR(20) UNIQUE,
    dataNascimento DATE,
    CONSTRAINT fk_pessoafisica_pessoa
        FOREIGN KEY (pessoa_id) REFERENCES pessoa (id)
        ON DELETE CASCADE
);

CREATE TABLE pessoa_juridica (
    pessoa_id    INT  PRIMARY KEY,
    cnpj         VARCHAR(20) UNIQUE,
    nomeFantasia VARCHAR(100),
    CONSTRAINT fk_pessoajuridica_pessoa
        FOREIGN KEY (pessoa_id) REFERENCES pessoa (id)
        ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- 4. CLIENTE (usuários autenticados: clientes e administradores)
-- ---------------------------------------------------------------------
CREATE TABLE cliente (
    id       SERIAL       PRIMARY KEY,
    nome     VARCHAR(100) NOT NULL,
    email    VARCHAR(100) UNIQUE,
    senha    VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    ativo    SMALLINT     NOT NULL DEFAULT 1,
    perfil   VARCHAR(20)  NOT NULL DEFAULT 'CLIENTE'
);

-- ---------------------------------------------------------------------
-- 5. PRODUTO
-- ---------------------------------------------------------------------
CREATE TABLE produto (
    id                SERIAL        PRIMARY KEY,
    nome              VARCHAR(100)  NOT NULL,
    descricao         TEXT,
    precoCusto        DECIMAL(10,2),
    precoVenda        DECIMAL(10,2),
    quantidadeEstoque INT           NOT NULL DEFAULT 0,
    ativo             SMALLINT      NOT NULL DEFAULT 1,
    marcaId           INT,
    CONSTRAINT fk_produto_marca
        FOREIGN KEY (marcaId) REFERENCES marca (id)
        ON DELETE SET NULL
);

-- ---------------------------------------------------------------------
-- 6. CAIXA
-- ---------------------------------------------------------------------
CREATE TABLE caixa (
    id             SERIAL        PRIMARY KEY,
    usuarioId      INT,
    dataAbertura   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dataFechamento TIMESTAMP,
    saldoInicial   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    saldoFinal     DECIMAL(10,2),
    status         VARCHAR(10)   NOT NULL DEFAULT 'ABERTO'
                       CHECK (status IN ('ABERTO', 'FECHADO')),
    CONSTRAINT fk_caixa_usuario
        FOREIGN KEY (usuarioId) REFERENCES cliente (id)
        ON DELETE SET NULL
);

-- ---------------------------------------------------------------------
-- 7. DISPONIBILIDADE E BLOQUEIO DE AGENDA
-- ---------------------------------------------------------------------
CREATE TABLE disponibilidade (
    id             SERIAL   PRIMARY KEY,
    diaSemana      INT      NOT NULL, -- 0=Dom, 1=Seg, ..., 6=Sab
    horaInicio     TIME     NOT NULL,
    horaFim        TIME     NOT NULL,
    ativo          SMALLINT NOT NULL DEFAULT 1,
    profissionalId INT,
    CONSTRAINT fk_disponibilidade_profissional
        FOREIGN KEY (profissionalId) REFERENCES pessoa (id)
        ON DELETE CASCADE
);

CREATE TABLE bloqueio_agenda (
    id             SERIAL        PRIMARY KEY,
    dataInicio     TIMESTAMP     NOT NULL,
    dataFim        TIMESTAMP     NOT NULL,
    motivo         VARCHAR(255),
    profissionalId INT,
    ativo          SMALLINT      NOT NULL DEFAULT 1,
    CONSTRAINT fk_bloqueio_profissional
        FOREIGN KEY (profissionalId) REFERENCES pessoa (id)
        ON DELETE SET NULL
);

-- ---------------------------------------------------------------------
-- 8. AGENDAMENTO
-- ---------------------------------------------------------------------
CREATE TABLE agendamento (
    id             SERIAL      PRIMARY KEY,
    dataHora       TIMESTAMP   NOT NULL,
    clienteId      INT,
    profissionalId INT,
    status         VARCHAR(20) NOT NULL DEFAULT 'AGENDADO',
    observacao     TEXT,
    ativo          SMALLINT    NOT NULL DEFAULT 1,
    CONSTRAINT fk_agendamento_cliente
        FOREIGN KEY (clienteId) REFERENCES cliente (id)
        ON DELETE SET NULL,
    CONSTRAINT fk_agendamento_profissional
        FOREIGN KEY (profissionalId) REFERENCES pessoa (id)
        ON DELETE SET NULL
);

CREATE TABLE agendamento_servico (
    agendamentoId INT NOT NULL,
    servicoId     INT NOT NULL,
    PRIMARY KEY (agendamentoId, servicoId),
    CONSTRAINT fk_agservico_agendamento
        FOREIGN KEY (agendamentoId) REFERENCES agendamento (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_agservico_servico
        FOREIGN KEY (servicoId) REFERENCES servico (id)
        ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- 9. COMANDA
-- ---------------------------------------------------------------------
CREATE TABLE comanda (
    id              SERIAL        PRIMARY KEY,
    numero_comanda  INT           NOT NULL,
    clienteId       INT,
    status          VARCHAR(20)   NOT NULL DEFAULT 'ABERTA'
                        CHECK (status IN ('ABERTA', 'PAGA', 'CANCELADA')),
    dataAbertura    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dataFechamento  TIMESTAMP,
    caixaId         INT,
    forma_pagamento VARCHAR(20),
    valor_recebido  DECIMAL(10,2),
    troco           DECIMAL(10,2),
    CONSTRAINT fk_comanda_cliente
        FOREIGN KEY (clienteId) REFERENCES cliente (id)
        ON DELETE SET NULL,
    CONSTRAINT fk_comanda_caixa
        FOREIGN KEY (caixaId) REFERENCES caixa (id)
        ON DELETE SET NULL
);

CREATE TABLE comanda_servico (
    id             SERIAL        PRIMARY KEY,
    comandaId      INT,
    servicoId      INT,
    profissionalId INT,
    valorCobrado   DECIMAL(10,2),
    CONSTRAINT fk_cmdservico_comanda
        FOREIGN KEY (comandaId) REFERENCES comanda (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_cmdservico_servico
        FOREIGN KEY (servicoId) REFERENCES servico (id)
        ON DELETE SET NULL,
    CONSTRAINT fk_cmdservico_profissional
        FOREIGN KEY (profissionalId) REFERENCES pessoa (id)
        ON DELETE SET NULL
);

CREATE TABLE comanda_produto (
    id           SERIAL        PRIMARY KEY,
    comandaId    INT,
    produtoId    INT,
    quantidade   INT           NOT NULL DEFAULT 1,
    valorCobrado DECIMAL(10,2),
    CONSTRAINT fk_cmdproduto_comanda
        FOREIGN KEY (comandaId) REFERENCES comanda (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_cmdproduto_produto
        FOREIGN KEY (produtoId) REFERENCES produto (id)
        ON DELETE SET NULL
);

-- ---------------------------------------------------------------------
-- 10. CÓDIGO DE VERIFICAÇÃO (recuperação de senha por e-mail)
-- ---------------------------------------------------------------------
CREATE TABLE codigo_verificacao (
    id        SERIAL       PRIMARY KEY,
    email     VARCHAR(100) NOT NULL,
    codigo    VARCHAR(6)   NOT NULL,
    expiracao TIMESTAMP    NOT NULL,
    usado     SMALLINT     NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------
-- 11. MOVIMENTAÇÃO DE ESTOQUE
-- ---------------------------------------------------------------------
CREATE TABLE movimentacao_estoque (
    id               SERIAL       PRIMARY KEY,
    produtoId        INT,
    usuarioId        INT,
    tipo             VARCHAR(10)  NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA')),
    quantidade       INT          NOT NULL,
    motivo           VARCHAR(255),
    dataMovimentacao TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movimentacao_produto
        FOREIGN KEY (produtoId) REFERENCES produto (id)
        ON DELETE SET NULL,
    CONSTRAINT fk_movimentacao_usuario
        FOREIGN KEY (usuarioId) REFERENCES cliente (id)
        ON DELETE SET NULL
);
