const client = require('../config/mercadoPagoConfig');
const { Preference } = require('mercadopago');
const Gestor = require('../models/Gestor');

exports.criarPreferenciaPagamento = async (req, res) => {
  try {
    // ✅ VERIFICAÇÃO DETALHADA DO TOKEN
    console.log('🔑 VERIFICAÇÃO TOKEN:', {
      token: process.env.MERCADOPAGO_ACCESS_TOKEN ? 'PRESENTE' : 'AUSENTE',
      inicio: process.env.MERCADOPAGO_ACCESS_TOKEN?.substring(0, 20),
      tamanho: process.env.MERCADOPAGO_ACCESS_TOKEN?.length
    });

    const { gestorId, plano } = req.body;

    console.log('🎯 Criando pagamento para:', { gestorId, plano });

    // Valores dos planos CORRETOS
    const planos = {
      'unitario': 15.00,
      'premium': 70.00, 
      'enterprise': 250.00
    };

    const preference = new Preference(client);

    const requestBody = {
      items: [
        {
          id: `plano-${plano}`,
          title: `Plano ${plano} - PremiX`,
          description: `Assinatura do plano ${plano} - PremiX`,
          unit_price: planos[plano],
          quantity: 1,
          currency_id: 'BRL'
        }
      ],
      back_urls: {
        success: 'https://premix-frontend.onrender.com/pages/success.html',
        failure: 'https://premix-frontend.onrender.com/pages/error.html',
        pending: 'https://premix-frontend.onrender.com/pages/pending.html'
      },
      auto_return: 'approved',
      external_reference: gestorId.toString(),
      notification_url: 'https://premix-sitecode1.onrender.com/api/webhooks/mercadopago',
      // ✅ CONFIGURAÇÕES IMPORTANTES
      binary_mode: true,
      expires: false,
      statement_descriptor: "PREMIX",
      payment_methods: {
        excluded_payment_types: [
          { id: 'ticket' }, // Exclui boleto
          { id: 'atm' }     // Exclui caixa eletrônico
        ],
        installments: 1,
        default_installments: 1
      }
    };

    console.log('📦 Enviando para MP:', JSON.stringify(requestBody, null, 2));

    const result = await preference.create({ body: requestBody });
    
    console.log('✅ RESPOSTA DO MERCADO PAGO:', {
      id: result.id,
      status: result.status,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      date_created: result.date_created
    });

    // ✅ USA SEMPRE SANDBOX PARA TESTES
    const checkoutUrl = result.sandbox_init_point || result.init_point;
    
    if (!checkoutUrl) {
      throw new Error('URL de checkout não retornada pelo Mercado Pago');
    }

    console.log('🌐 URL para redirecionamento:', checkoutUrl);

    res.json({
      success: true,
      id: result.id,
      init_point: checkoutUrl,
      sandbox_init_point: checkoutUrl,
      details: {
        preference_id: result.id,
        plan: plano,
        amount: planos[plano]
      }
    });

  } catch (error) {
    console.error('❌ ERRO NO MERCADO PAGO:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Erro ao criar pagamento',
      details: error.message,
      step: 'criacao_preference'
    });
  }
};

// Criar pagamento para conta existente
exports.criarPagamentoExistente = async (req, res) => {
  try {
    // ✅ VERIFICAÇÃO DO TOKEN
    console.log('🔑 VERIFICAÇÃO TOKEN (CONTA EXISTENTE):', {
      token: process.env.MERCADOPAGO_ACCESS_TOKEN ? 'PRESENTE' : 'AUSENTE'
    });

    const { gestorId, plano } = req.body;

    console.log('🎯 Criando pagamento para conta existente:', { gestorId, plano });

    // Verifica se o gestor existe
    const gestor = await Gestor.findById(gestorId);
    if (!gestor) {
      return res.status(404).json({ 
        success: false,
        error: "Conta não encontrada" 
      });
    }

    // Valores dos planos CORRETOS
    const planos = {
      'unitario': 15.00,
      'premium': 70.00, 
      'enterprise': 250.00
    };

    const preference = new Preference(client);

    const requestBody = {
      items: [
        {
          id: `plano-${plano}-existente`,
          title: `Plano ${plano} - PremiX (Conta Existente)`,
          description: `Assinatura do plano ${plano} para conta existente - PremiX`,
          unit_price: planos[plano],
          quantity: 1,
          currency_id: 'BRL'
        }
      ],
      back_urls: {
        success: 'https://premix-frontend.onrender.com/pages/success.html',
        failure: 'https://premix-frontend.onrender.com/pages/error.html',
        pending: 'https://premix-frontend.onrender.com/pages/pending.html'
      },
      auto_return: 'approved',
      external_reference: gestorId.toString(),
      notification_url: 'https://premix-sitecode1.onrender.com/api/webhooks/mercadopago',
      // ✅ CONFIGURAÇÕES IMPORTANTES
      binary_mode: true,
      expires: false,
      statement_descriptor: "PREMIX",
      payment_methods: {
        excluded_payment_types: [
          { id: 'ticket' },
          { id: 'atm' }
        ],
        installments: 1,
        default_installments: 1
      }
    };

    console.log('📦 Enviando pagamento existente para MP:', JSON.stringify(requestBody, null, 2));

    const result = await preference.create({ body: requestBody });
    
    console.log('✅ PAGAMENTO EXISTENTE CRIADO:', {
      id: result.id,
      sandbox_init_point: result.sandbox_init_point
    });

    const checkoutUrl = result.sandbox_init_point || result.init_point;
    
    if (!checkoutUrl) {
      throw new Error('URL de checkout não retornada pelo Mercado Pago');
    }

    res.json({
      success: true,
      id: result.id,
      init_point: checkoutUrl,
      sandbox_init_point: checkoutUrl,
      details: {
        preference_id: result.id,
        plan: plano,
        amount: planos[plano],
        gestor: gestor.usuario
      }
    });

  } catch (error) {
    console.error('❌ ERRO AO CRIAR PAGAMENTO EXISTENTE:', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ 
      success: false,
      error: 'Erro ao processar pagamento',
      details: error.message,
      step: 'pagamento_existente'
    });
  }
};

// Função extra para verificar pagamento (opcional)
exports.verificarPagamento = async (req, res) => {
  try {
    res.json({ message: 'Função de verificação' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


