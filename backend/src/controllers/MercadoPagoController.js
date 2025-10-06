const client = require('../config/mercadoPagoConfig');
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
          title: `Plano ${plano} - PremiX`,
          unit_price: planos[plano],
          quantity: 1,
          currency_id: 'BRL'
        }
      ],
      back_urls: {
        success: 'http://localhost:5500/success.html',
        failure: 'http://localhost:5500/error.html',
        pending: 'http://localhost:5500/pending.html'
      },
      external_reference: gestorId.toString(),
      // Linha ~30 - notification_url
      notification_url: 'https://premix-sitecode1.onrender.com/api/webhooks/mercadopago'
    };

    console.log('📦 Enviando para MP:', requestBody);

    const result = await preference.create({ body: requestBody });
    
    console.log('✅ Resposta do MP:', result);

    res.json({
      success: true,
      id: result.id,
      init_point: result.init_point,
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
          title: `Plano ${plano} - PremiX (Conta Existente)`,
          unit_price: planos[plano],
          quantity: 1,
          currency_id: 'BRL'
        }
      ],
        back_urls: {
          success: 'https://premix-frontend.onrender.com/success.html',  // SEU FRONTEND REAL
          failure: 'https://premix-frontend.onrender.com/error.html',
          pending: 'https://premix-frontend.onrender.com/pending.html'
        },
      external_reference: gestorId.toString(),
       notification_url: 'https://premix-sitecode1.onrender.com/api/webhooks/mercadopago'
    };

    console.log('📦 Enviando pagamento existente para MP:', requestBody);

    const result = await preference.create({ body: requestBody });
    
    console.log('✅ Pagamento existente criado:', result);

    res.json({
      success: true,
      id: result.id,
      init_point: result.init_point,
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

