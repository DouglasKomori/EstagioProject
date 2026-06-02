import AuthMiddleware from "../middlewares/authMiddleware.js";
import UsuarioRepository from "../repositories/usuarioRepository.js";
import CodigoVerificacaoRepository from "../repositories/codigoVerificacaoRepository.js";
import { enviarCodigoVerificacao } from "../services/emailService.js";
import bcrypt from 'bcryptjs';

export default class AutenticacaoController {

    #usuarioRepository;
    #codigoRepo;

    constructor() {
        this.#usuarioRepository = new UsuarioRepository();
        this.#codigoRepo = new CodigoVerificacaoRepository();
    }

    async usuario(req, res) {
        try {
            if(req.usuarioLogado) {
                const { senha: _, ...usuarioSemSenha } = req.usuarioLogado;
                return res.status(200).json(usuarioSemSenha);
            } else {
                throw new Error("Erro ao obter o usuário!");
            }
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
                let usuario = await this.#usuarioRepository.buscarPorEmailComSenha(email);

                if (!usuario || !usuario.ativo) {
                    return res.status(404).json({msg: "Email ou senha incorretos."});
                }

                let senhaValida = false;
                if (usuario.senha.startsWith('$2')) {
                    senhaValida = await bcrypt.compare(senha, usuario.senha);
                } else {
                    const crypto = await import('crypto');
                    const senhaHash = crypto.createHash('sha256').update(senha).digest('hex');
                    senhaValida = senhaHash === usuario.senha;
                    if (senhaValida) {
                        const novoHash = await bcrypt.hash(senha, 12);
                        await this.#usuarioRepository.alterarSenha(usuario.id, novoHash);
                    }
                }

                if(senhaValida) {
                    let auth = new AuthMiddleware();
                    let token = auth.gerarToken(
                        usuario.id,
                        usuario.email,
                        usuario.nome,
                        usuario.telefone,
                        usuario.perfil
                    );
                    const isProducao = process.env.NODE_ENV === 'production';
                    res.cookie("token", token, { httpOnly: true, secure: isProducao, sameSite: 'strict' });
                    const { senha: _, ...usuarioSemSenha } = usuario;
                    return res.status(200).json({token: token, usuario: usuarioSemSenha});
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
                return res.status(404).json({ msg: "E-mail não cadastrado. Verifique o endereço informado." });
            }

            const codigo = await this.#codigoRepo.gerarESalvar(email);
            await enviarCodigoVerificacao(email, codigo);

            return res.status(200).json({ msg: "Código enviado! Verifique sua caixa de entrada." });
        } catch (ex) {
            console.error("=== ERRO AO ENVIAR CÓDIGO ===", ex.message);
            return res.status(500).json({ msg: "Erro ao enviar código. Tente novamente." });
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

            const hash = await bcrypt.hash(novaSenha, 12);
            await this.#usuarioRepository.alterarSenhaByEmail(email, hash);

            return res.status(200).json({ msg: "Senha redefinida com sucesso! Faça login com a nova senha." });
        } catch (ex) {
            console.error("Erro ao redefinir senha:", ex);
            return res.status(500).json({ msg: "Erro ao redefinir a senha." });
        }
    }
}
