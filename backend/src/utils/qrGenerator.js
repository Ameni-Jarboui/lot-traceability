const QRCode = require('qrcode');

async function generateQrCode(code) {
    const qrDataUrl = await QRCode.toDataURL(code, {
        errorCorrectionLevel: 'H',
        width: 300,
    });
    return qrDataUrl;
}

function generateLotCode(produit) {
    const prefix = produit.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}

module.exports = { generateQrCode, generateLotCode };