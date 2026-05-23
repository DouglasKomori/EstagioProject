import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarConfirmacaoAgendamento(destinatario, { nomeCliente, dataHora, servicos, profissional }) {
    const dataFormatada = new Date(dataHora).toLocaleDateString('pt-BR', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo'
    });
    await resend.emails.send({
        from: 'Victor Uematsu Barbearia <onboarding@resend.dev>',
        to: destinatario,
        subject: `Agendamento confirmado — ${dataFormatada}`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#18181b;color:#fff;border-radius:12px;padding:32px;">
                <div style="text-align:center;margin-bottom:24px;">
                    <span style="font-size:28px;font-weight:900;letter-spacing:2px;color:#E4B77D;">VICTOR UEMATSU</span>
                    <p style="color:#71717a;margin:4px 0 0;font-size:13px;">Barbearia</p>
                </div>
                <h2 style="color:#E4B77D;margin:0 0 8px;font-size:20px;">Agendamento Confirmado!</h2>
                <p style="color:#a1a1aa;margin:0 0 24px;font-size:14px;">Olá, <strong style="color:#fff;">${nomeCliente}</strong>! Seu horário foi reservado com sucesso.</p>
                <div style="background:#27272a;border:1px solid #3f3f46;border-radius:10px;padding:20px;margin-bottom:20px;">
                    <p style="margin:0 0 10px;color:#71717a;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Detalhes</p>
                    <p style="margin:0 0 8px;font-size:15px;"><span style="color:#71717a;">📅 </span><strong>${dataFormatada}</strong></p>
                    <p style="margin:0 0 8px;font-size:15px;"><span style="color:#71717a;">✂️ </span>${servicos}</p>
                    <p style="margin:0;font-size:15px;"><span style="color:#71717a;">💈 </span>${profissional}</p>
                </div>
                <p style="color:#a1a1aa;font-size:13px;">Para cancelar, acesse o app com até 2 horas de antecedência.</p>
                <p style="color:#52525b;font-size:12px;text-align:center;margin-top:24px;">Barbearia Victor Uematsu · Presidente Prudente - SP</p>
            </div>
        `,
    });
}

export async function enviarCodigoVerificacao(destinatario, codigo) {
    await resend.emails.send({
        from: 'Victor Uematsu Barbearia <onboarding@resend.dev>',
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
    });
}
