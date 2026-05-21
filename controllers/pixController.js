import QRCode from 'qrcode';

function crc16(str) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function gerarPayloadPix(chave, nome, cidade, valor) {
    const f = (id, v) => `${id}${String(v.length).padStart(2, '0')}${v}`;
    const pixInfo = f('00', 'BR.GOV.BCB.PIX') + f('01', chave);
    const merchantAccount = f('26', pixInfo);
    const valorStr = Number(valor).toFixed(2);
    const payload = [
        '000201',
        merchantAccount,
        '52040000',
        '5303986',
        f('54', valorStr),
        '5802BR',
        f('59', nome.slice(0, 25)),
        f('60', cidade.slice(0, 15)),
        f('62', f('05', '***')),
        '6304'
    ].join('');
    return payload + crc16(payload);
}

export async function gerarQrCode(req, res) {
    try {
        const { valor } = req.query;

        if (!valor || isNaN(Number(valor)) || Number(valor) <= 0) {
            return res.status(400).json({ msg: "Valor inválido." });
        }

        const chave  = process.env.PIX_KEY;
        const nome   = process.env.PIX_NOME   || 'BARBEARIA';
        const cidade = process.env.PIX_CIDADE  || 'SAO PAULO';

        if (!chave) {
            return res.status(500).json({ msg: "Chave PIX não configurada no servidor." });
        }

        const payload    = gerarPayloadPix(chave, nome, cidade, Number(valor));
        const qrCodeData = await QRCode.toDataURL(payload, { errorCorrectionLevel: 'M', width: 300 });

        return res.json({ payload, qrCode: qrCodeData });
    } catch (e) {
        console.error('Erro ao gerar QR Code PIX:', e);
        return res.status(500).json({ msg: "Erro ao gerar QR Code." });
    }
}
