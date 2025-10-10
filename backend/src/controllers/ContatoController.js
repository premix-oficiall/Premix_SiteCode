const Contato = require('../models/Contato');

// Criar novo contato
exports.criarContato = async (req, res) => {
  try {
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
    console.error('Erro ao salvar contato:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao enviar mensagem. Tente novamente mais tarde.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Listar todos os contatos (com filtros opcionais)
exports.listarContatos = async (req, res) => {
  try {
    const { status, dataInicio, dataFim, empresa } = req.query;
    
    // Construir filtro
    let filtro = {};
    
    if (status) {
      filtro.status = status;
    }
    
    if (dataInicio || dataFim) {
      filtro.dataEnvio = {};
      if (dataInicio) filtro.dataEnvio.$gte = new Date(dataInicio);
      if (dataFim) filtro.dataEnvio.$lte = new Date(dataFim);
    }
    
    if (empresa) {
      filtro.empresa = { $regex: empresa, $options: 'i' }; // busca case-insensitive
    }

    const contatos = await Contato.find(filtro)
      .sort({ dataEnvio: -1 })
      .select('-__v'); // Remove campo __v do mongoose

    res.status(200).json({ 
      success: true, 
      total: contatos.length,
      data: contatos 
    });

  } catch (error) {
    console.error('Erro ao buscar contatos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar contatos.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Buscar contato por ID
exports.buscarContatoPorId = async (req, res) => {
  try {
    const contato = await Contato.findById(req.params.id).select('-__v');
    
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
    console.error('Erro ao buscar contato:', error);
    
    // Erro de ID inválido
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        success: false, 
        message: 'ID inválido.' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar contato.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Atualizar status do contato
exports.atualizarStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
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
      { new: true, runValidators: true }
    ).select('-__v');

    if (!contato) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contato não encontrado.' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Status atualizado com sucesso.',
      data: contato 
    });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        success: false, 
        message: 'ID inválido.' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar status.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

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

    res.status(200).json({ 
      success: true, 
      message: 'Contato deletado com sucesso.' 
    });

  } catch (error) {
    console.error('Erro ao deletar contato:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        success: false, 
        message: 'ID inválido.' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Erro ao deletar contato.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Estatísticas de contatos
exports.estatisticas = async (req, res) => {
  try {
    const total = await Contato.countDocuments();
    const pendentes = await Contato.countDocuments({ status: 'pendente' });
    const lidos = await Contato.countDocuments({ status: 'lido' });
    const respondidos = await Contato.countDocuments({ status: 'respondido' });
    
    // Contatos dos últimos 7 dias
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    const recentesCount = await Contato.countDocuments({ 
      dataEnvio: { $gte: seteDiasAtras } 
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        porStatus: {
          pendentes,
          lidos,
          respondidos
        },
        ultimos7Dias: recentesCount
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar estatísticas.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};