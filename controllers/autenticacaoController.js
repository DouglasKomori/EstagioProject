import AuthMiddleware from "../middlewares/authMiddleware.js";
import UsuarioRepository from "../repositories/usuarioRepository.js";
import CodigoVerificacaoRepository from "../repositories/codigoVerificacaoRepository.js";
import { enviarCodigoVerificacao } from "../services/emailService.js";

export default class AutenticacaoController {

    #usuarioRepository;
    #codigoRepo;

    constructor() {
        this.#usuarioRepository = new UsuarioRepository();
        this.#codigoRepo = new CodigoVerificacaoRepository();
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
                const crypto = await import('crypto');
                const senhaHash = crypto.createHash('sha256').update(senha).digest('hex');

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

                    res.cookie("token", token, { httpOnly: true });
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

    async enviarCodigo(req, res) {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ msg: "Informe o e-mail." });

            const usuario = await this.#usuarioRepository.buscarPorEmail(email);
            if (!usuario) {
                // Resposta genérica para não revelar quais e-mails existem
                return res.status(200).json({ msg: "Se este e-mail estiver cadastrado, você receberá o código em breve." });
            }

            const codigo = await this.#codigoRepo.gerarESalvar(email);
            await enviarCodigoVerificacao(email, codigo);

            return res.status(200).json({ msg: "Código enviado! Verifique sua caixa de entrada." });
        } catch (ex) {
            console.error("Erro ao enviar código:", ex);
            return res.status(500).json({ msg: "Erro ao enviar o código de verificação." });
        }
    }

    async redefinirSenha(req, res) {
        try {
            const { email, codigo, novaSenha } = req.body;

            if (!email || !codigo || !novaSenha) {
                return res.status(400).json({ msg: "Informe o e-mail, o código e a nova senha." });
            }

            if (novaSenha.length < 6) {
                return res.status(400).json({ msg: "A nova senha deve ter pelo menos 6 caracteres." });
            }

            const codigoValido = await this.#codigoRepo.verificar(email, codigo);
            if (!codigoValido) {
                return res.status(400).json({ msg: "Código inválido ou expirado. Solicite um novo." });
            }

            await this.#codigoRepo.marcarUsado(codigoValido.id);

            const crypto = await import('crypto');
            const hash = crypto.createHash('sha256').update(novaSenha).digest('hex');
            await this.#usuarioRepository.alterarSenhaByEmail(email, hash);

            return res.status(200).json({ msg: "Senha redefinida com sucesso! Faça login com a nova senha." });
        } catch (ex) {
            console.error("Erro ao redefinir senha:", ex);
            return res.status(500).json({ msg: "Erro ao redefinir a senha." });
        }
    }
}
