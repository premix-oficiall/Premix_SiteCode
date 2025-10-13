const Gestor = require('../models/Gestor');
const client = require('../config/mercadoPagoConfig');
const { Payment } = require('mercadopago');

exports.webhookMercadoPago = async (req, res) => {
  try {
    console.log('🔄 WEBHOOK RECEBIDO - HEADERS:', req.headers);
    console.log('🔄 WEBHOOK RECEBIDO - BODY:', JSON.stringify(req.body, null, 2));
    
    // Responde IMEDIATAMENTE para o Mercado Pago
    res.status(200).send('OK');
    
    const { type, topic, data, resource, action, id } = req.body;

    console.log('📊 Tipo de webhook:', type || topic);
    console.log('📊 Ação:', action);
    console.log('📊 Resource:', resource);
    console.log('📊 ID:', id);

    // ✅ CORREÇÃO: Agora lida com merchant_order também
    if (type === 'payment' || topic === 'payment') {
      console.log('💰 Processando webhook de PAGAMENTO');
      await processarPagamento(data || id);
      
    } else if (type === 'merchant_order' || topic === 'merchant_order') {
      console.log('📦 Processando webhook de MERCHANT ORDER');
      await processarMerchantOrder(resource);
      
    } else {
      console.log('🔍 Webhook de tipo desconhecido:', type || topic);
      console.log('🔍 Body completo:', JSON.stringify(req.body, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
  }
};

// ✅ FUNÇÃO PARA PROCESSAR PAGAMENTOS
async function processarPagamento(paymentData) {
  try {
    let paymentId;
    
    if (typeof paymentData === 'object' && paymentData.id) {
      paymentId = paymentData.id;
    } else if (typeof paymentData === 'string') {
      paymentId = paymentData;
    } else {
      paymentId = paymentData;
    }
    
    console.log('💰 Processando pagamento ID:', paymentId);
    
    const payment = new Payment(client);
    const paymentDetails = await payment.get({ id: paymentId });
    
    console.log('📊 Status do pagamento:', paymentDetails.status);
    console.log('📊 External Reference:', paymentDetails.external_reference);
    console.log('📊 Payment Details:', JSON.stringify(paymentDetails, null, 2));
    
    if (paymentDetails.status === 'approved') {
      await ativarGestor(paymentDetails.external_reference);
    } else {
      console.log('📊 Pagamento NÃO aprovado. Status:', paymentDetails.status);
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar pagamento:', error);
  }
}

// ✅ NOVA FUNÇÃO PARA PROCESSAR MERCHANT ORDERS - CORRIGIDA
async function processarMerchantOrder(resourceUrl) {
  try {
    console.log('📦 Buscando merchant order da URL:', resourceUrl);
    
    // ✅ CORREÇÃO: Usa fetch direto na API do MP
    const response = await fetch(resourceUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const orderDetails = await response.json();
    
    console.log('📊 Merchant Order Status:', orderDetails.status);
    console.log('📊 Payments:', orderDetails.payments);
    console.log('📊 Order Details:', JSON.stringify(orderDetails, null, 2));
    
    // Se tem pagamentos, processa o primeiro
    if (orderDetails.payments && orderDetails.payments.length > 0) {
      const paymentId = orderDetails.payments[0].id;
      console.log('💰 Payment ID encontrado na order:', paymentId);
      
      // Processa o pagamento
      await processarPagamento(paymentId);
    } else {
      console.log('📊 Nenhum pagamento encontrado na order');
      
      // ✅ Tenta buscar por external_reference direto na order
      if (orderDetails.external_reference) {
        console.log('🔍 External Reference na order:', orderDetails.external_reference);
        await ativarGestor(orderDetails.external_reference);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar merchant order:', error);
    
    // ✅ CORREÇÃO: Tenta método alternativo
    console.log('🔄 Tentando método alternativo...');
    await tentarMetodoAlternativo(resourceUrl);
  }
}

// ✅ MÉTODO ALTERNATIVO PARA MERCHANT ORDERS
async function tentarMetodoAlternativo(resourceUrl) {
  try {
    // Extrai o ID da URL de forma mais robusta
    const urlParts = resourceUrl.split('/');
    const merchantOrderId = urlParts[urlParts.length - 1];
    
    console.log('🔄 Tentando com ID extraído:', merchantOrderId);
    
    // Tenta buscar informações básicas via API
    const apiUrl = `https://api.mercadopago.com/merchant_orders/${merchantOrderId}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
      }
    });
    
    if (response.ok) {
      const orderData = await response.json();
      console.log('✅ Dados da order obtidos:', JSON.stringify(orderData, null, 2));
      
      if (orderData.payments && orderData.payments.length > 0) {
        const paymentId = orderData.payments[0].id;
        console.log('💰 Payment ID encontrado:', paymentId);
        await processarPagamento(paymentId);
      } else if (orderData.external_reference) {
        console.log('🔍 External Reference encontrado:', orderData.external_reference);
        await ativarGestor(orderData.external_reference);
      }
    } else {
      console.log('❌ Falha ao buscar order:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Erro no método alternativo:', error);
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
