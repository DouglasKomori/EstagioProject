import Base from "./base.js";

export default class Movimentacao extends Base {
    #id;
    #produtoId;
    #usuarioId;
    #tipo;
    #quantidade;
    #motivo;
    #datamovimentacao;

    get id() {
        return this.#id;
    }
    set id(value) {
        this.#id = value;
    }
    get produtoId() {
        return this.#produtoId;
    }
    set produtoId(value) {
        this.#produtoId = value;
    }
    get usuarioId() {
        return this.#usuarioId;
    }
    set usuarioId(value) {
        this.#usuarioId = value;
    }
    get tipo() {
        return this.#tipo;
    }
    set tipo(value) {
        this.#tipo = value;
    }
    get quantidade() {
        return this.#quantidade;
    }
    set quantidade(value) {
        this.#quantidade = value;
    }
    get motivo() {
        return this.#motivo;
    }
    set motivo(value) {
        this.#motivo = value;
    }
    get datamovimentacao() {
        return this.#datamovimentacao;
    }
    set datamovimentacao(value) {
        this.#datamovimentacao = value;
    }
    
    constructor() {
        super();
        this.#id = 0;
        this.#produtoId = 0;
        this.#usuarioId = 0;
        this.#tipo = "";
        this.#quantidade = 0;
        this.#motivo = "";
        this.#datamovimentacao = new Date();
    }
}