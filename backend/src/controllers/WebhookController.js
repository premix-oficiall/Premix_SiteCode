const Gestor = require('../models/Gestor');
const client = require('../config/mercadoPagoConfig');
const { Payment } = require('mercadopago');

// ✅ ADICIONE ISSO - fetch para Node.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

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

// ✅ FUNÇÃO CORRIGIDA PARA PROCESSAR PAGAMENTOS
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
    
    // ✅✅✅ CORREÇÃO CRÍTICA: Só ativa se APROVADO
    if (paymentDetails.status === 'approved') {
      console.log('✅ PAGAMENTO APROVADO - Ativando gestor');
      await ativarGestor(paymentDetails.external_reference);
    } else {
      console.log('❌ Pagamento NÃO aprovado. Status:', paymentDetails.status);
      console.log('⏸️ Gestor NÃO será ativado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar pagamento:', error);
  }
}

// ✅✅✅ FUNÇÃO CRITICAMENTE CORRIGIDA - MERCHANT ORDERS
async function processarMerchantOrder(resourceUrl) {
  try {
    console.log('📦 Buscando merchant order da URL:', resourceUrl);
    
    // ✅ CORREÇÃO: Usa o access token do environment
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('❌ ACCESS TOKEN não configurado!');
      return;
    }

    console.log('🔑 Token sendo usado (primeiros 20 chars):', accessToken.substring(0, 20) + '...');
    
    // ✅ CORREÇÃO: Extrai o ID da URL
    const merchantOrderId = resourceUrl.split('/').pop();
    console.log('🔍 Merchant Order ID extraído:', merchantOrderId);
    
    // ✅ CORREÇÃO: URL direta da API
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
    console.log('📊 Headers da resposta:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      // ✅ Tenta método alternativo se der erro 401
      if (response.status === 401) {
        console.log('🔄 Tentando método alternativo...');
        await tentarMetodoAlternativo(merchantOrderId);
      }
      return;
    }
    
    const orderDetails = await response.json();
    
    console.log('📊 Dados da Merchant Order:', {
      id: orderDetails.id,
      status: orderDetails.status,
      order_status: orderDetails.order_status,
      paid_amount: orderDetails.paid_amount,
      total_amount: orderDetails.total_amount,
      payments: orderDetails.payments?.length || 0
    });
    
    // ✅ Processa pagamentos se existirem
    if (orderDetails.payments && orderDetails.payments.length > 0) {
      console.log('💰 Pagamentos encontrados:', orderDetails.payments.length);
      
      for (const paymentInfo of orderDetails.payments) {
        console.log('🔍 Processando pagamento ID:', paymentInfo.id);
        await processarPagamento(paymentInfo.id);
      }
    } else {
      console.log('❌ NENHUM PAGAMENTO ENCONTRADO - Order ainda não foi paga');
      console.log('💡 Status atual:', orderDetails.order_status);
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar merchant order:', error.message);
    console.error('🔍 Stack trace:', error.stack);
  }
}

// ✅ MÉTODO ALTERNATIVO PARA ERRO 401
async function tentarMetodoAlternativo(merchantOrderId) {
  try {
    console.log('🔄 Método alternativo para Merchant Order:', merchantOrderId);
    
    // Tenta buscar informações básicas de forma diferente
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    const response = await fetch(`https://api.mercadopago.com/merchant_orders/${merchantOrderId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const orderData = await response.json();
      console.log('✅ Método alternativo funcionou!');
      
      if (orderData.payments && orderData.payments.length > 0) {
        for (const paymentInfo of orderData.payments) {
          await processarPagamento(paymentInfo.id);
        }
      }
    } else {
      console.log('❌ Método alternativo também falhou:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Erro no método alternativo:', error);
  }
}

// ✅ FUNÇÃO PARA ATIVAR GESTOR (MANTIDA)
async function ativarGestor(gestorId) {
  try {
    if (!gestorId) {
      console.log('❌ ERRO: external_reference está vazio!');
      return;
    }
    
    gestorId = gestorId.toString().trim();
    console.log('🔍 Gestor ID processado:', gestorId);
    
    const gestorExistente = await Gestor.findById(gestorId);
    console.log('🔍 Gestor encontrado no banco:', gestorExistente ? 'SIM' : 'NÃO');
    
    if (!gestorExistente) {
      console.log('❌ Gestor não encontrado no banco com ID:', gestorId);
      return;
    }
    
    console.log('🔍 Status atual do gestor:', {
      isActive: gestorExistente.isActive,
      usuario: gestorExistente.usuario
    });
    
    // ⚠️ CORREÇÃO: Só atualiza se NÃO estiver ativo
    if (gestorExistente.isActive) {
      console.log('ℹ️ Gestor já está ativo - Nenhuma ação necessária');
      return;
    }
    
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
    } else {
      console.log('⚠️ Nenhum documento foi modificado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao ativar gestor:', error);
  }
}
