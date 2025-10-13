const client = require('../config/mercadopagoConfig');
const { Preference } = require('mercadopago');
const Gestor = require('../models/Gestor');

exports.criarPreferenciaPagamento = async (req, res) => {
  try {
    const { gestorId, plano } = req.body;

    console.log('🎯 Criando pagamento para:', { gestorId, plano });

    // Valores dos planos
    const planos = {
      'unitario': 15.00,
      'light': 70.00, 
      'premium': 200.00
    };

    const preference = new Preference(client);

    const requestBody = {
      items: [
        {
          id: `plano-${plano}`,
          title: `Plano ${plano} - PremiX`,
          description: `Assinatura do plano ${plano}`,
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
      // ✅ CORREÇÃO: Configurações importantes para sandbox
      binary_mode: true,
      expires: false,
      statement_descriptor: "PREMIX",
      payment_methods: {
        excluded_payment_types: [],
        installments: 1
      }
    };

    console.log('📦 Enviando para MP:', JSON.stringify(requestBody, null, 2));

    const result = await preference.create({ body: requestBody });
    
    console.log('✅ Resposta do MP:', {
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point
    });

    // ✅ CORREÇÃO: Retorna SEMPRE sandbox_init_point para testes
    res.json({
      success: true,
      id: result.id,
      init_point: result.sandbox_init_point, // ⬅️ USA SANDBOX
      sandbox_init_point: result.sandbox_init_point
    });

  } catch (error) {
    console.error('❌ Erro no Mercado Pago:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao criar pagamento',
      details: error.message 
    });
  }
};

// Criar pagamento para conta existente
exports.criarPagamentoExistente = async (req, res) => {
  try {
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

    // Valores dos planos
    const planos = {
      'unitario': 15.00,
      'light': 70.00, 
      'premium': 200.00
    };

    const preference = new Preference(client);

    const requestBody = {
      items: [
        {
          id: `plano-${plano}-existente`,
          title: `Plano ${plano} - PremiX (Conta Existente)`,
          description: `Assinatura do plano ${plano} para conta existente`,
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
      // ✅ CORREÇÃO: Configurações importantes para sandbox
      binary_mode: true,
      expires: false,
      statement_descriptor: "PREMIX",
      payment_methods: {
        excluded_payment_types: [],
        installments: 1
      }
    };

    console.log('📦 Enviando pagamento existente para MP:', JSON.stringify(requestBody, null, 2));

    const result = await preference.create({ body: requestBody });
    
    console.log('✅ Pagamento existente criado:', {
      id: result.id,
      sandbox_init_point: result.sandbox_init_point
    });

    // ✅ CORREÇÃO: Retorna SEMPRE sandbox_init_point para testes
    res.json({
      success: true,
      id: result.id,
      init_point: result.sandbox_init_point, // ⬅️ USA SANDBOX
      sandbox_init_point: result.sandbox_init_point
    });

  } catch (error) {
    console.error('❌ Erro ao criar pagamento existente:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao processar pagamento',
      details: error.message 
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
