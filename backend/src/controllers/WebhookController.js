const Gestor = require('../models/Gestor');
const client = require('../config/mercadoPagoConfig');
const { Payment } = require('mercadopago');

// ✅ ADICIONE ISSO - fetch para Node.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.webhookMercadoPago = async (req, res) => {
  try {
    console.log('🎯🎯🎯 WEBHOOK INICIADO 🎯🎯🎯');
    console.log('🔄 WEBHOOK RECEBIDO - HEADERS:', req.headers);
    console.log('🔄 WEBHOOK RECEBIDO - BODY:', JSON.stringify(req.body, null, 2));
    
    // Responde IMEDIATAMENTE para o Mercado Pago
    res.status(200).send('OK');
    
    const { type, topic, data, resource, action, id } = req.body;

    console.log('📊 Tipo de webhook:', type || topic);
    console.log('📊 Ação:', action);
    console.log('📊 Resource:', resource);
    console.log('📊 ID:', id);

    // ✅ CORREÇÃO: Processa merchant_order primeiro
    if (type === 'merchant_order' || topic === 'merchant_order') {
      console.log('📦 Processando webhook de MERCHANT ORDER');
      await processarMerchantOrder(resource);
      
    } else if (type === 'payment' || topic === 'payment') {
      console.log('💰 Processando webhook de PAGAMENTO');
      await processarPagamento(data || id);
      
    } else {
      console.log('🔍 Webhook de tipo desconhecido:', type || topic);
    }
    
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
  }
};

// ✅✅✅ FUNÇÃO COM DEBUG SUPER DETALHADO
async function processarPagamento(paymentData) {
  try {
    console.log('💰💰💰 INICIANDO PROCESSAMENTO DE PAGAMENTO 💰💰💰');
    
    let paymentId;
    
    if (typeof paymentData === 'object' && paymentData.id) {
      paymentId = paymentData.id;
    } else if (typeof paymentData === 'string') {
      paymentId = paymentData;
    } else {
      paymentId = paymentData;
    }
    
    console.log('🔍 Payment ID recebido:', paymentId);
    
    const payment = new Payment(client);
    const paymentDetails = await payment.get({ id: paymentId });
    
    console.log('📊📊📊 DETALHES COMPLETOS DO PAGAMENTO 📊📊📊');
    console.log('ID:', paymentDetails.id);
    console.log('Status:', paymentDetails.status);
    console.log('Status Detail:', paymentDetails.status_detail);
    console.log('External Reference:', paymentDetails.external_reference);
    console.log('Transaction Amount:', paymentDetails.transaction_amount);
    console.log('Date Approved:', paymentDetails.date_approved);
    console.log('Payment Method:', paymentDetails.payment_method_id);
    
    // ✅✅✅ VERIFICAÇÃO CRÍTICA: Só ativa se APROVADO
    if (paymentDetails.status === 'approved') {
      console.log('✅✅✅ PAGAMENTO APROVADO ENCONTRADO! ✅✅✅');
      console.log('🔍 External Reference para ativar:', paymentDetails.external_reference);
      
      if (!paymentDetails.external_reference) {
        console.log('❌❌❌ ERRO CRÍTICO: external_reference está VAZIO!');
        return;
      }
      
      await ativarGestor(paymentDetails.external_reference);
    } else {
      console.log('❌ Pagamento NÃO aprovado. Status:', paymentDetails.status);
      console.log('💡 Motivo:', paymentDetails.status_detail);
      console.log('⏸️ Gestor NÃO será ativado');
    }
    
  } catch (error) {
    console.error('❌❌❌ ERRO AO PROCESSAR PAGAMENTO:', error.message);
    console.error('🔍 Stack trace:', error.stack);
  }
}

// ✅✅✅ FUNÇÃO CRITICAMENTE CORRIGIDA - MERCHANT ORDERS
async function processarMerchantOrder(resourceUrl) {
  try {
    console.log('🔄🔄🔄 INICIANDO PROCESSAMENTO MERCHANT ORDER 🔄🔄🔄');
    console.log('📦 Buscando merchant order da URL:', resourceUrl);
    
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('❌ ACCESS TOKEN não configurado!');
      return;
    }

    console.log('🔑 Token (20 chars):', accessToken.substring(0, 20) + '...');
    
    const merchantOrderId = resourceUrl.split('/').pop();
    console.log('🔍 Merchant Order ID:', merchantOrderId);
    
    const apiUrl = `https://api.mercadolibre.com/merchant_orders/${merchantOrderId}`;
    console.log('🌐 Fazendo request para:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('📊 Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API:', response.status, errorText);
      return;
    }
    
    const orderDetails = await response.json();
    
    console.log('📊📊📊 DETALHES COMPLETOS DA ORDER 📊📊📊');
    console.log('ID:', orderDetails.id);
    console.log('Status:', orderDetails.status);
    console.log('Order Status:', orderDetails.order_status);
    console.log('Paid Amount:', orderDetails.paid_amount);
    console.log('Total Amount:', orderDetails.total_amount);
    console.log('Payments Count:', orderDetails.payments?.length || 0);
    console.log('External Reference:', orderDetails.external_reference);
    
    // ✅ VERIFICAÇÃO DETALHADA
    if (orderDetails.payments && orderDetails.payments.length > 0) {
      console.log('💰💰💰 PAGAMENTOS ENCONTRADOS 💰💰💰');
      console.log('Quantidade de pagamentos:', orderDetails.payments.length);
      
      for (const paymentInfo of orderDetails.payments) {
        console.log('🔍🔍🔍 PROCESSANDO PAGAMENTO 🔍🔍🔍');
        console.log('Payment ID:', paymentInfo.id);
        console.log('Payment Status:', paymentInfo.status);
        console.log('Payment Status Detail:', paymentInfo.status_detail);
        
        await processarPagamento(paymentInfo.id);
      }
    } else {
      console.log('❌ NENHUM PAGAMENTO ENCONTRADO NA ORDER');
      console.log('💡 Status atual da order:', orderDetails.order_status);
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar merchant order:', error.message);
    console.error('🔍 Stack trace:', error.stack);
  }
}

// ✅✅✅ FUNÇÃO PARA ATIVAR GESTOR COM DEBUG
async function ativarGestor(gestorId) {
  try {
    console.log('🎯🎯🎯 TENTANDO ATIVAR GESTOR 🎯🎯🎯');
    console.log('🔍 Gestor ID recebido:', gestorId);
    
    if (!gestorId) {
      console.log('❌❌❌ ERRO CRÍTICO: external_reference está VAZIO!');
      return;
    }
    
    gestorId = gestorId.toString().trim();
    console.log('🔍 Gestor ID processado:', gestorId);
    
    const gestorExistente = await Gestor.findById(gestorId);
    console.log('🔍 Gestor encontrado no banco:', gestorExistente ? 'SIM' : 'NÃO');
    
    if (!gestorExistente) {
      console.log('❌❌❌ Gestor não encontrado no banco com ID:', gestorId);
      return;
    }
    
    console.log('🔍 Status atual do gestor:', {
      _id: gestorExistente._id,
      usuario: gestorExistente.usuario,
      email: gestorExistente.email,
      isActive: gestorExistente.isActive
    });
    
    // ⚠️ CORREÇÃO: Só atualiza se NÃO estiver ativo
    if (gestorExistente.isActive) {
      console.log('ℹ️ Gestor já está ativo - Nenhuma ação necessária');
      return;
    }
    
    console.log('🔄 Atualizando gestor para isActive: true...');
    
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
      console.log('✅✅✅ GESTOR ATIVADO COM SUCESSO! ✅✅✅');
      
      // VERIFICAÇÃO FINAL
      const gestorAtualizado = await Gestor.findById(gestorId);
      console.log('🔍 Status FINAL do gestor:', {
        _id: gestorAtualizado._id,
        usuario: gestorAtualizado.usuario, 
        isActive: gestorAtualizado.isActive,
        dataAtivacao: gestorAtualizado.dataAtivacao
      });
    } else {
      console.log('⚠️ Nenhum documento foi modificado - gestor já estava ativo?');
    }
    
  } catch (error) {
    console.error('❌❌❌ ERRO AO ATIVAR GESTOR:', error.message);
    console.error('🔍 Stack trace:', error.stack);
  }
}
