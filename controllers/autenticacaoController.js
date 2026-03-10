import AuthMiddleware from "../middlewares/authMiddleware.js";
import UsuarioRepository from "../repositories/usuarioRepository.js";

export default class AutenticacaoController {

    #usuarioRepository;

    constructor() {
        this.#usuarioRepository = new UsuarioRepository();
    }

    async usuario(req, res) {
        try {
            if(req.usuarioLogado)
                return res.status(200).json(req.usuarioLogado);
            else
                throw new Error("Erro ao obter o usuário!");
        }
        catch(ex) {
            console.log(ex);
            return res.status(500).json({msg: "Erro ao buscar o usuário logado"})
        }
    }

    async token(req, res) {
        try {
            let {email, senha} = req.body;
            
            if(email && senha) {
                // Converte a senha digitada no Swagger para Hash ANTES de ir pro banco
                const crypto = await import('crypto');
                const senhaHash = crypto.createHash('sha256').update(senha).digest('hex');

                //Chama o repository passando o email e a senha já criptografada
                let usuario = await this.#usuarioRepository.validarAcesso(email, senhaHash);
                
                if(usuario) {
                    let auth = new AuthMiddleware();
                    
                    let token = auth.gerarToken(
                        usuario.id, 
                        usuario.email, 
                        usuario.nome, 
                        usuario.telefone, 
                        usuario.perfil
                    );
                    
                    res.cookie("token", token, {
                        httpOnly: true,
                    })
                    
                    return res.status(200).json({token: token, usuario: usuario});
                }
                else {
                    return res.status(404).json({msg: "Email ou senha incorretos."});
                }
            }
            else {
                return res.status(400).json({msg: "Informe um e-mail e uma senha para gerar um token de acesso!"});
            }
        }
        catch(exception) {
            console.log(exception);
            return res.status(500).json({msg: "Erro ao gerar token de acesso"})
        }
    }
}