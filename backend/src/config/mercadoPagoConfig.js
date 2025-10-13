const { MercadoPagoConfig } = require('mercadopago');

// ✅ CONFIGURAÇÃO CORRIGIDA para v2.x
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: { 
    timeout: 5000 
  }
});

console.log('✅ Mercado Pago configurado - Token:', process.env.MERCADOPAGO_ACCESS_TOKEN ? 'PRESENTE' : 'AUSENTE');

module.exports = client;
