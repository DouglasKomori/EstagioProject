import Base from "./base.js";

export default class Servicos extends Base {
    #id;
    #nome;
    #descricao;
    #valor;
    #tempoEstimadoMinutos;
    #excluido;

    get id() {
        return this.#id;
    }

    set id(value){
        this.#id = value;
    }

    get nome(){
        return this.#nome;
    }

    set nome(value){
        this.#nome = value;
    }

    get descricao(){
        return this.#descricao;
    }

    set descricao(value){
        this.#descricao = value;
    }

    get valor(){
        return this.#valor;
    }

    set valor(value){
        this.#valor = value;
    }

    get tempoEstimadoMinutos(){
        return this.#tempoEstimadoMinutos;
    }

    set tempoEstimadoMinutos(value){
        this.#tempoEstimadoMinutos = value;
    }

    get excluido(){
        return this.#excluido;
    }
    set excluido(value){
        this.#excluido = value;
    }

    constructor() {
        super();
        this.#id = 0;
        this.#nome = "";
        this.#descricao = "";
        this.#valor = 0.0;
        this.#tempoEstimadoMinutos = 0;
        this.#excluido = false;
    }
}