import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

export async function enviarCodigoVerificacao(destinatario, codigo) {
    const mailOptions = {
        from: `"Victor Uematsu Barbearia" <${process.env.EMAIL_USER}>`,
        to: destinatario,
        subject: 'Seu código de verificação',
        html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#18181b;color:#fff;border-radius:12px;padding:32px;">
                <div style="text-align:center;margin-bottom:24px;">
                    <span style="font-size:28px;font-weight:900;letter-spacing:2px;color:#E4B77D;">VICTOR UEMATSU</span>
                    <p style="color:#71717a;margin:4px 0 0;font-size:13px;">Barbearia</p>
                </div>
                <h2 style="color:#E4B77D;margin:0 0 8px;font-size:20px;">Código de Verificação</h2>
                <p style="color:#a1a1aa;margin:0 0 24px;font-size:14px;">Use o código abaixo para redefinir sua senha. Ele é válido por <strong style="color:#fff;">10 minutos</strong>.</p>
                <div style="background:#27272a;border:2px solid #E4B77D44;border-radius:10px;padding:28px;text-align:center;margin-bottom:24px;">
                    <span style="font-size:42px;font-weight:900;letter-spacing:16px;color:#E4B77D;">${codigo}</span>
                </div>
                <p style="color:#52525b;font-size:12px;text-align:center;">Se você não solicitou esta alteração, ignore este e-mail. Sua senha não será modificada.</p>
            </div>
        `,
    };
    await transporter.sendMail(mailOptions);
}
