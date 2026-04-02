import Base from "./base.js";

export default class Agendamento extends Base {
    #id;
    #dataHora;
    #clienteId;
    #profissionalId;
    #status;
    #observacao;
    #ativo;
    #servicos; 

    get id() { return this.#id; } set id(value) { this.#id = value; }
    get dataHora() { return this.#dataHora; } set dataHora(value) { this.#dataHora = value; }
    get clienteId() { return this.#clienteId; } set clienteId(value) { this.#clienteId = value; }
    get profissionalId() { return this.#profissionalId; } set profissionalId(value) { this.#profissionalId = value; }
    get status() { return this.#status; } set status(value) { this.#status = value; }
    get observacao() { return this.#observacao; } set observacao(value) { this.#observacao = value; }
    get ativo() { return this.#ativo; } set ativo(value) { this.#ativo = value; }
    get servicos() { return this.#servicos; } set servicos(value) { this.#servicos = value; }

    constructor() {
        super();
        this.#id = 0;
        this.#dataHora = null;
        this.#clienteId = 0;
        this.#profissionalId = 0;
        this.#status = "AGENDADO";
        this.#observacao = "";
        this.#ativo = true;
        this.#servicos = []; 
    }
}