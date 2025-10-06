const Gestor = require('../models/Gestor');
const client = require('../config/mercadoPagoConfig');
const { Payment } = require('mercadopago');

exports.webhookMercadoPago = async (req, res) => {
  try {
    console.log('🔄 WEBHOOK RECEBIDO:', req.body);
    
    // Responde IMEDIATAMENTE para o Mercado Pago
    res.status(200).send('OK');
    
    const { type, data } = req.body;

    if (type === 'payment') {
      console.log('💰 Processando pagamento ID:', data.id);
      
      // Busca detalhes do pagamento
      const payment = new Payment(client);
      const paymentDetails = await payment.get({ id: data.id });
      
      console.log('📊 Status do pagamento:', paymentDetails.status);
      
      if (paymentDetails.status === 'approved') {
        const gestorId = paymentDetails.external_reference;
        
        console.log('✅ Pagamento aprovado para gestor:', gestorId);
        
        // ATIVA O GESTOR
        await Gestor.findByIdAndUpdate(gestorId, { 
          isActive: true 
        });
        
        console.log('🎉 Gestor ativado com sucesso!');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
  }
};