const Gestor = require('../models/Gestor');
const client = require('../config/mercadoPagoConfig');
const { Payment } = require('mercadopago');

exports.webhookMercadoPago = async (req, res) => {
  try {
    console.log('🔄 WEBHOOK RECEBIDO - HEADERS:', req.headers);
    console.log('🔄 WEBHOOK RECEBIDO - BODY:', req.body);
    
    // Responde IMEDIATAMENTE para o Mercado Pago
    res.status(200).send('OK');
    
    const { type, data } = req.body;

    if (type === 'payment') {
      console.log('💰 Processando pagamento ID:', data.id);
      
      try {
        // Busca detalhes do pagamento
        const payment = new Payment(client);
        const paymentDetails = await payment.get({ id: data.id });
        
        console.log('📊 Status do pagamento:', paymentDetails.status);
        console.log('📊 External Reference:', paymentDetails.external_reference);
        console.log('📊 Payment ID:', paymentDetails.id);
        
        if (paymentDetails.status === 'approved') {
          let gestorId = paymentDetails.external_reference;
          
          console.log('🔍 Gestor ID recebido:', gestorId);
          
          if (!gestorId) {
            console.log('❌ ERRO: external_reference está vazio!');
            return;
          }
          
          // ⚠️ CORREÇÃO CRÍTICA: Garante que é string e remove caracteres extras
          gestorId = gestorId.toString().trim();
          console.log('🔍 Gestor ID processado:', gestorId);
          
          // VERIFICA SE O GESTOR EXISTE ANTES DE ATUALIZAR
          const gestorExistente = await Gestor.findById(gestorId);
          console.log('🔍 Gestor encontrado no banco:', gestorExistente ? 'SIM' : 'NÃO');
          
          if (!gestorExistente) {
            console.log('❌ Gestor não encontrado no banco com ID:', gestorId);
            return;
          }
          
          console.log('🔍 Status atual do gestor:', {
            isActive: gestorExistente.isActive,
            usuario: gestorExistente.usuario,
            email: gestorExistente.email
          });
          
          // ATIVA O GESTOR - CORREÇÃO: Usa updateOne para garantir
          const resultado = await Gestor.updateOne(
            { _id: gestorId },
            { 
              $set: {
                isActive: true,
                paymentStatus: 'approved',
                dataAtivacao: new Date(),
                ultimoPagamento: new Date()
              }
            }
          );
          
          console.log('📝 Resultado da atualização:', {
            matchedCount: resultado.matchedCount,
            modifiedCount: resultado.modifiedCount
          });
          
          if (resultado.modifiedCount > 0) {
            console.log('🎉 Gestor ativado com sucesso!');
            
            // VERIFICAÇÃO FINAL
            const gestorVerificado = await Gestor.findById(gestorId);
            console.log('✅ VERIFICAÇÃO FINAL - Gestor ativado:', {
              _id: gestorVerificado._id,
              usuario: gestorVerificado.usuario,
              isActive: gestorVerificado.isActive,
              paymentStatus: gestorVerificado.paymentStatus,
              dataAtivacao: gestorVerificado.dataAtivacao
            });
          } else {
            console.log('⚠️ Nenhum documento foi modificado');
          }
        } else {
          console.log('📊 Pagamento NÃO aprovado. Status:', paymentDetails.status);
        }
      } catch (paymentError) {
        console.error('❌ Erro ao buscar detalhes do pagamento:', paymentError);
      }
    } else {
      console.log('📊 Tipo de webhook não é payment:', type);
    }
    
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
  }
};
