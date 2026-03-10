import Base from "./base.js";

export default class produto extends Base {
    #id;
    #nome;
    #descricao;
    #precoCusto;
    #precoVenda;
    #quantidadeEstoque;
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
    get descricao() {
        return this.#descricao;
    }
    set descricao(value) {
        this.#descricao = value;
    }
    get precoCusto() {
        return this.#precoCusto;
    }
    set precoCusto(value) {
        this.#precoCusto = value;
    }
    get precoVenda() {
        return this.#precoVenda;
    }
    set precoVenda(value) {
        this.#precoVenda = value;
    }
    get quantidadeEstoque() {
        return this.#quantidadeEstoque;
    }
    set quantidadeEstoque(value) {
        this.#quantidadeEstoque = value;
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
        this.#descricao = "";
        this.#precoCusto = 0;
        this.#precoVenda = 0;
        this.#quantidadeEstoque = 0;
        this.#ativo = true;
    }
}