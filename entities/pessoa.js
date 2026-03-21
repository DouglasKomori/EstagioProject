import Base from "./base.js";

export default class Pessoa extends Base {
    #id;
    #nome;
    #tipoPessoa; 
    #telefone;
    #email;
    #ativo;
    
    #cpf;
    #dataNascimento;

    #cnpj;
    #nomeFantasia;

    get id() 
    { return this.#id; } set id(value) { this.#id = value; }
    get nome() { return this.#nome; } set nome(value) { this.#nome = value; }
    get tipoPessoa() { return this.#tipoPessoa; } set tipoPessoa(value) { this.#tipoPessoa = value; }
    get telefone() { return this.#telefone; } set telefone(value) { this.#telefone = value; }
    get email() { return this.#email; } set email(value) { this.#email = value; }
    get ativo() { return this.#ativo; } set ativo(value) { this.#ativo = value; }

    get cpf() { return this.#cpf; } set cpf(value) { this.#cpf = value; }
    get dataNascimento() { return this.#dataNascimento; } set dataNascimento(value) { this.#dataNascimento = value; }

    get cnpj() { return this.#cnpj; } set cnpj(value) { this.#cnpj = value; }
    get nomeFantasia() { return this.#nomeFantasia; } set nomeFantasia(value) { this.#nomeFantasia = value; }

    constructor() {
        super();
        this.#id = 0;
        this.#nome = "";
        this.#tipoPessoa = "PF"; 
        this.#telefone = "";
        this.#email = "";
        this.#ativo = true;
        this.#cpf = "";
        this.#dataNascimento = null;
        this.#cnpj = "";
        this.#nomeFantasia = "";
    }
}