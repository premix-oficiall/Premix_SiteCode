const Gestor = require('../models/Gestor');
const client = require('../config/mercadoPagoConfig');
const { Payment } = require('mercadopago');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.webhookMercadoPago = async (req, res) => {
  try {
    console.log('🎯🎯🎯 WEBHOOK INICIADO 🎯🎯🎯');
    console.log('🔄 WEBHOOK RECEBIDO - BODY:', JSON.stringify(req.body, null, 2));
    
    // Responde IMEDIATAMENTE para o Mercado Pago
    res.status(200).send('OK');
    
    const { type, topic, data, action, id } = req.body;

    console.log('📊 Tipo de webhook:', type || topic);
    console.log('📊 Ação:', action);
    console.log('📊 ID:', id);

    // ✅ CORREÇÃO: Processa ambos os tipos
    if (type === 'merchant_order' || topic === 'merchant_order') {
      console.log('📦 Processando webhook de MERCHANT ORDER');
      await processarMerchantOrder(data?.id || resource);
      
    } else if (type === 'payment' || topic === 'payment') {
      console.log('💰 Processando webhook de PAGAMENTO');
      console.log('🔍 Ação do pagamento:', action);
      
      // ✅ Processa tanto created quanto updated
      if (action === 'payment.updated' || action === 'payment.created') {
        await processarPagamento(data?.id || id);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
  }
};

// ✅✅✅ FUNÇÃO CORRIGIDA - COM RETRY
async function processarPagamento(paymentId) {
  try {
    console.log('💰💰💰 INICIANDO PROCESSAMENTO DE PAGAMENTO 💰💰💰');
    console.log('🔍 Payment ID:', paymentId);
    
    // ✅ AGUARDA 3 SEGUNDOS para o pagamento ser processado
    console.log('⏳ Aguardando processamento do pagamento...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const payment = new Payment(client);
    const paymentDetails = await payment.get({ id: paymentId });
    
    console.log('📊📊📊 DETALHES DO PAGAMENTO 📊📊📊');
    console.log('Status:', paymentDetails.status);
    console.log('External Reference:', paymentDetails.external_reference);
    
    // ✅✅✅ Só ativa se APROVADO
    if (paymentDetails.status === 'approved') {
      console.log('✅✅✅ PAGAMENTO APROVADO! ✅✅✅');
      await ativarGestor(paymentDetails.external_reference);
    } else {
      console.log('❌ Status não aprovado:', paymentDetails.status);
      
      // ✅ TENTA NOVAMENTE se estiver pendente
      if (paymentDetails.status === 'pending' || paymentDetails.status === 'in_process') {
        console.log('🔄 Tentando novamente em 5 segundos...');
        setTimeout(() => processarPagamento(paymentId), 5000);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar pagamento:', error.message);
    
    // ✅ TENTA NOVAMENTE se não encontrou
    if (error.message.includes('not found') || error.message.includes('404')) {
      console.log('🔄 Pagamento não encontrado - tentando novamente em 3 segundos...');
      setTimeout(() => processarPagamento(paymentId), 3000);
    }
  }
}

// ✅ FUNÇÃO PARA ATIVAR GESTOR (MANTIDA)
async function ativarGestor(gestorId) {
  try {
    console.log('🎯 TENTANDO ATIVAR GESTOR:', gestorId);
    
    if (!gestorId) {
      console.log('❌ external_reference vazio!');
      return;
    }
    
    const gestor = await Gestor.findById(gestorId);
    if (!gestor) {
      console.log('❌ Gestor não encontrado:', gestorId);
      return;
    }
    
    console.log('🔍 Gestor antes:', gestor.usuario, '- isActive:', gestor.isActive);
    
    // ✅ ATUALIZA para true
    const resultado = await Gestor.updateOne(
      { _id: gestorId },
      { 
        $set: {
          isActive: true,
          paymentStatus: 'approved',
          dataAtivacao: new Date()
        }
      }
    );
    
    console.log('📝 Resultado:', resultado);
    
    if (resultado.modifiedCount > 0) {
      console.log('✅✅✅ GESTOR ATIVADO COM SUCESSO! ✅✅✅');
    }
    
  } catch (error) {
    console.error('❌ Erro ao ativar gestor:', error);
  }
}

// ✅ FUNÇÃO MERCHANT ORDER (SIMPLIFICADA)
async function processarMerchantOrder(resourceUrl) {
  try {
    console.log('📦 Buscando merchant order:', resourceUrl);
    
    const orderId = resourceUrl.split('/').pop();
    const response = await fetch(`https://api.mercadolibre.com/merchant_orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      }
    });
    
    if (response.ok) {
      const order = await response.json();
      console.log('📊 Order Status:', order.order_status);
      
      // Se tem pagamentos, processa
      if (order.payments?.length > 0) {
        for (const payment of order.payments) {
          await processarPagamento(payment.id);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro merchant order:', error);
  }
}

