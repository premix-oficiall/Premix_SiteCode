const { MercadoPagoConfig } = require('mercadopago');

// Configuração nova da versão 2.x
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
});

console.log('✅ Mercado Pago v2.9.0 configurado!');

module.exports = client;