const Gestor = require('../models/Gestor');
const client = require('../config/mercadopagoConfig');
const { Payment } = require('mercadopago');

// ✅ ADICIONE ISSO NO TOPO - fetch para Node.js
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
    
    const response = await fetch(resourceUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const orderDetails = await response.json();
    
    console.log('📊 Merchant Order Status:', orderDetails.status);
    console.log('📊 Order Status:', orderDetails.order_status);
    console.log('📊 Paid Amount:', orderDetails.paid_amount, '/', orderDetails.total_amount);
    console.log('📊 Payments:', orderDetails.payments?.length || 0);
    
    // ✅ CORREÇÃO: Verificação mais flexível para sandbox
    if (orderDetails.payments && orderDetails.payments.length > 0) {
      console.log('💰 Processando pagamentos encontrados...');
      
      for (const paymentInfo of orderDetails.payments) {
        console.log('🔍 Verificando pagamento ID:', paymentInfo.id);
        await processarPagamento(paymentInfo.id);
      }
    } else {
      console.log('❌ NENHUM PAGAMENTO ENCONTRADO - Order ainda não foi paga');
      console.log('💡 Status atual:', orderDetails.order_status);
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
