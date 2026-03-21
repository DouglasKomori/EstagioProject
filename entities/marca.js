import Base from "./base.js";

export default class Marca extends Base {
    #id;
    #nome;
    #ativo;

    get id() {
        return this.#id;
    }
    set id(value) {
        this.#id = value;
    }
    get nome() {
        return this.#nome;
    }
    set nome(value) {
        this.#nome = value;
    }
    get ativo() {
        return this.#ativo;
    }
    set ativo(value) {
        this.#ativo = value;
    }

    constructor(){
        super();
        this.#id = 0;
        this.#nome = "";
        this.#ativo = true;
    }
}