const Contato = require('../models/Contato');

// Criar novo contato
exports.criarContato = async (req, res) => {
  try {
    console.log('📥 Dados recebidos:', req.body);
    
    const { nome, telefone, empresa, mensagem, termos, novidades } = req.body;

    // Validação básica
    if (!nome || !telefone || !empresa || !mensagem) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos os campos obrigatórios devem ser preenchidos.' 
      });
    }

    if (!termos) {
      return res.status(400).json({ 
        success: false, 
        message: 'Você deve aceitar os termos de uso.' 
      });
    }

    // Validação de telefone (formato brasileiro)
    const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (!telefoneRegex.test(telefone)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Telefone em formato inválido. Use: (11) 99999-9999' 
      });
    }

    // Criar novo contato
    const novoContato = new Contato({
      nome,
      telefone,
      empresa,
      mensagem,
      aceitouTermos: termos,
      aceitouNovidades: novidades || false
    });

    await novoContato.save();
    
    console.log('✅ Contato salvo no MongoDB:', novoContato._id);

    res.status(201).json({ 
      success: true, 
      message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
      data: {
        id: novoContato._id,
        nome: novoContato.nome,
        empresa: novoContato.empresa,
        dataEnvio: novoContato.dataEnvio
      }
    });

  } catch (error) {
    console.error('❌ Erro ao salvar contato:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao enviar mensagem. Tente novamente mais tarde.',
      error: error.message
    });
  }
};

// Listar todos os contatos
exports.listarContatos = async (req, res) => {
  try {
    const contatos = await Contato.find().sort({ dataEnvio: -1 });
    
    console.log(`📋 ${contatos.length} contatos encontrados`);

    res.status(200).json({ 
      success: true, 
      total: contatos.length,
      data: contatos 
    });

  } catch (error) {
    console.error('❌ Erro ao buscar contatos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar contatos.',
      error: error.message
    });
  }
};

// Buscar contato por ID
exports.buscarContatoPorId = async (req, res) => {
  try {
    const contato = await Contato.findById(req.params.id);
    
    if (!contato) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contato não encontrado.' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: contato 
    });

  } catch (error) {
    console.error('❌ Erro ao buscar contato:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar contato.',
      error: error.message
    });
  }
};

// Estatísticas de contatos
exports.estatisticas = async (req, res) => {
  try {
    const total = await Contato.countDocuments();
    const pendentes = await Contato.countDocuments({ status: 'pendente' });
    
    res.status(200).json({
      success: true,
      data: {
        total,
        pendentes
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar estatísticas.',
      error: error.message
    });
  } 
};

// ✅ FUNÇÕES ADICIONAIS PARA AS ROTAS QUE ESTAVAM FALTANDO:

// Deletar contato
exports.deletarContato = async (req, res) => {
  try {
    const contato = await Contato.findByIdAndDelete(req.params.id);
    
    if (!contato) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contato não encontrado.' 
      });
    }

    console.log('🗑️ Contato deletado:', req.params.id);

    res.status(200).json({ 
      success: true, 
      message: 'Contato deletado com sucesso.' 
    });

  } catch (error) {
    console.error('❌ Erro ao deletar contato:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        success: false, 
        message: 'ID inválido.' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Erro ao deletar contato.',
      error: error.message
    });
  }
};

// Atualizar status do contato
exports.atualizarStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    console.log('📝 Atualizando status:', { id: req.params.id, status });

    // Validar status
    if (!['pendente', 'lido', 'respondido'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status inválido. Use: pendente, lido ou respondido.' 
      });
    }

    const contato = await Contato.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contato) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contato não encontrado.' 
      });
    }

    console.log('✅ Status atualizado:', contato._id);

    res.status(200).json({ 
      success: true, 
      message: 'Status atualizado com sucesso.',
      data: contato 
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar status:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        success: false, 
        message: 'ID inválido.' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar status.',
      error: error.message
    });
  }
};
