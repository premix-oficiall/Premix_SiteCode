const Gestor = require('../models/Gestor');
const client = require('../config/mercadoPagoConfig');
const { Payment, MerchantOrder } = require('mercadopago');

exports.webhookMercadoPago = async (req, res) => {
  try {
    console.log('🔄 WEBHOOK RECEBIDO - HEADERS:', req.headers);
    console.log('🔄 WEBHOOK RECEBIDO - BODY:', req.body);
    
    // Responde IMEDIATAMENTE para o Mercado Pago
    res.status(200).send('OK');
    
    const { type, topic, data, resource, action } = req.body;

    console.log('📊 Tipo de webhook:', type || topic);
    console.log('📊 Ação:', action);
    console.log('📊 Resource:', resource);

    // ✅ CORREÇÃO: Agora lida com merchant_order também
    if (type === 'payment' || topic === 'payment') {
      console.log('💰 Processando webhook de PAGAMENTO');
      await processarPagamento(data);
      
    } else if (type === 'merchant_order' || topic === 'merchant_order') {
      console.log('📦 Processando webhook de MERCHANT ORDER');
      await processarMerchantOrder(resource);
      
    } else {
      console.log('🔍 Webhook de tipo desconhecido:', type || topic);
    }
    
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
  }
};

// ✅ FUNÇÃO PARA PROCESSAR PAGAMENTOS
async function processarPagamento(paymentData) {
  try {
    console.log('💰 Processando pagamento ID:', paymentData.id);
    
    const payment = new Payment(client);
    const paymentDetails = await payment.get({ id: paymentData.id });
    
    console.log('📊 Status do pagamento:', paymentDetails.status);
    console.log('📊 External Reference:', paymentDetails.external_reference);
    
    if (paymentDetails.status === 'approved') {
      await ativarGestor(paymentDetails.external_reference);
    } else {
      console.log('📊 Pagamento NÃO aprovado. Status:', paymentDetails.status);
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar pagamento:', error);
  }
}

// ✅ NOVA FUNÇÃO PARA PROCESSAR MERCHANT ORDERS
async function processarMerchantOrder(resourceUrl) {
  try {
    console.log('📦 Buscando merchant order:', resourceUrl);
    
    // Extrai o ID da URL
    const merchantOrderId = resourceUrl.split('/').pop();
    console.log('📦 Merchant Order ID:', merchantOrderId);
    
    const merchantOrder = new MerchantOrder(client);
    const orderDetails = await merchantOrder.get({ id: merchantOrderId });
    
    console.log('📊 Merchant Order Status:', orderDetails.status);
    console.log('📊 Payments:', orderDetails.payments);
    
    // Se tem pagamentos, processa o primeiro
    if (orderDetails.payments && orderDetails.payments.length > 0) {
      const paymentId = orderDetails.payments[0].id;
      console.log('💰 Payment ID encontrado na order:', paymentId);
      
      // Processa o pagamento
      await processarPagamento({ id: paymentId });
    } else {
      console.log('📊 Nenhum pagamento encontrado na order');
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar merchant order:', error);
  }
}

// ✅ FUNÇÃO PARA ATIVAR GESTOR
async function ativarGestor(gestorId) {
  try {
    if (!gestorId) {
      console.log('❌ ERRO: external_reference está vazio!');
      return;
    }
    
    // ⚠️ CORREÇÃO: Garante que é string e remove caracteres extras
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
    
    // ATIVA O GESTOR
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
    
  } catch (error) {
    console.error('❌ Erro ao ativar gestor:', error);
  }
}
