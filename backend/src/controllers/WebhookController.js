const Gestor = require('../models/Gestor');
const client = require('../config/mercadoPagoConfig');
const { Payment } = require('mercadopago');

exports.webhookMercadoPago = async (req, res) => {
  try {
    console.log('🔄 WEBHOOK RECEBIDO - BODY COMPLETO:', JSON.stringify(req.body, null, 2));
    
    // Responde IMEDIATAMENTE para o Mercado Pago
    res.status(200).send('OK');
    
    const { type, data } = req.body;

    if (type === 'payment') {
      console.log('💰 Processando pagamento ID:', data.id);
      
      try {
        // Busca detalhes do pagamento
        const payment = new Payment(client);
        const paymentDetails = await payment.get({ id: data.id });
        
        console.log('📊 DETALHES COMPLETOS DO PAGAMENTO:', JSON.stringify(paymentDetails, null, 2));
        console.log('📊 Status do pagamento:', paymentDetails.status);
        console.log('📊 External Reference:', paymentDetails.external_reference);
        
        if (paymentDetails.status === 'approved') {
          const gestorId = paymentDetails.external_reference;
          
          if (!gestorId) {
            console.log('❌ ERRO: external_reference está vazio!');
            return;
          }
          
          console.log('✅ Pagamento aprovado para gestor:', gestorId);
          
          // ATIVA O GESTOR
          const gestorAtualizado = await Gestor.findByIdAndUpdate(
            gestorId, 
            { 
              isActive: true,
              paymentStatus: 'approved',
              dataAtivacao: new Date()
            },
            { new: true }
          );
          
          if (gestorAtualizado) {
            console.log('🎉 Gestor ativado com sucesso:', gestorAtualizado._id);
            console.log('📝 Dados atualizados:', {
              isActive: gestorAtualizado.isActive,
              paymentStatus: gestorAtualizado.paymentStatus
            });
          } else {
            console.log('❌ Gestor não encontrado com ID:', gestorId);
          }
        } else {
          console.log('📊 Pagamento NÃO aprovado. Status:', paymentDetails.status);
        }
      } catch (paymentError) {
        console.error('❌ Erro ao buscar detalhes do pagamento:', paymentError);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
  }
};
