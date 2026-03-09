import Base from "./base.js";


export default class Usuario extends Base {
    #id;
    #nome;
    #email;
    #senha;
    #telefone;
    #ativo;
    #perfil;

    get id(){
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
    get email(){
        return this.#email;
    }
    set email(value){
        this.#email = value;
    }
    get senha(){
        return this.#senha;
    }
    set senha(value){
        this.#senha = value;
    }
    get telefone(){
        return this.#telefone;
    }
    set telefone(value){
        this.#telefone = value;
    }

    get ativo(){
        return this.#ativo;
    }

    set ativo(value){
        this.#ativo = value;
    }

    get perfil(){
        return this.#perfil;
    }

    set perfil(value){
        this.#perfil = value;
    }

    constructor(){
        super();
        this.#id = 0;
        this.#nome = "";
        this.#email = "";
        this.#senha = "";
        this.#telefone = "";
        this.#ativo = true;
        this.#perfil = "CLIENTE";
    }
}