const Gestor = require("../models/Gestor");

// Registrar novo gestor
exports.registrarGestor = async (req, res) => {
  try {
    const { usuario, senha, cpf, email } = req.body;

    // Validação dos campos obrigatórios
    if (!usuario || !senha || !cpf || !email) {
      return res.status(400).json({ 
        message: "Preencha todos os campos obrigatórios: usuario, senha, cpf, email." 
      });
    }

    // Remove formatação do CPF
    const cpfLimpo = cpf.replace(/\D/g, '');

    // VERIFICA SE O EMAIL JÁ EXISTE
    const emailExistente = await Gestor.findOne({ 
      email: email.toLowerCase().trim() 
    });
    
    if (emailExistente) {
      return res.status(400).json({ 
        message: "Este email já está cadastrado." 
      });
    }

    // VERIFICA SE O USUÁRIO JÁ EXISTE
    const usuarioExistente = await Gestor.findOne({ 
      usuario: usuario.trim() 
    });
    
    if (usuarioExistente) {
      return res.status(400).json({ 
        message: "Este nome de usuário já está em uso." 
      });
    }

    // VERIFICA SE O CPF JÁ EXISTE
    const cpfExistente = await Gestor.findOne({ 
      cpf: cpfLimpo 
    });
    
    if (cpfExistente) {
      return res.status(400).json({ 
        message: "Este CPF já está cadastrado." 
      });
    }

    // Cria o gestor COM isActive: false
    const novoGestor = new Gestor({
      usuario: usuario.trim(),
      senha: senha,
      cpf: cpfLimpo,
      email: email.toLowerCase().trim(),
      isActive: false // 👈 AGORA SEMPRE FALSE - BLOQUEADO ATÉ PAGAR
    });

    await novoGestor.save();

    res.status(201).json({
      message: "Cadastro realizado com sucesso! Agora realize o pagamento para ativar sua conta.",
      gestor: novoGestor,
      needsPayment: true // 👈 FRONTEND SABE QUE PRECISA PAGAR
    });

  } catch (error) {
    console.error("Erro ao registrar gestor:", error);
    
    // Erro de duplicata do MongoDB (fallback)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let message = "";
      
      switch (field) {
        case "email":
          message = "Este email já está cadastrado.";
          break;
        case "usuario":
          message = "Este nome de usuário já está em uso.";
          break;
        case "cpf":
          message = "Este CPF já está cadastrado.";
          break;
        default:
          message = "Dados duplicados.";
      }
      
      return res.status(400).json({ message });
    }
    
    // Erro de validação do Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Dados inválidos",
        errors: errors
      });
    }
    
    res.status(500).json({ 
      message: "Erro interno do servidor.", 
      error: error.message 
    });
  }
};

// Listar todos os gestores
exports.listarGestores = async (req, res) => {
  try {
    const gestores = await Gestor.find();
    res.json(gestores);
  } catch (error) {
    console.error("Erro ao listar gestores:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Verificar se email existe
exports.verificarEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    const gestor = await Gestor.findOne({ 
      email: email.toLowerCase().trim() 
    });
    
    res.json({ 
      existe: !!gestor,
      gestor: gestor ? {
        _id: gestor._id,
        usuario: gestor.usuario,
        email: gestor.email,
        isActive: gestor.isActive
      } : null
    });
    
  } catch (error) {
    console.error("Erro ao verificar email:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Verificar se usuário existe
exports.verificarUsuario = async (req, res) => {
  try {
    const { usuario } = req.body;
    
    const gestor = await Gestor.findOne({ 
      usuario: usuario.trim() 
    });
    
    res.json({ 
      existe: !!gestor,
      gestor: gestor ? {
        _id: gestor._id,
        usuario: gestor.usuario,
        email: gestor.email,
        isActive: gestor.isActive
      } : null
    });
    
  } catch (error) {
    console.error("Erro ao verificar usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Buscar gestor por email
exports.buscarPorEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    const gestor = await Gestor.findOne({ 
      email: email.toLowerCase().trim() 
    });
    
    if (!gestor) {
      return res.status(404).json({ 
        message: "Email não encontrado" 
      });
    }
    
    res.json({
      gestor: {
        _id: gestor._id,
        usuario: gestor.usuario,
        email: gestor.email,
        isActive: gestor.isActive
      }
    });
    
  } catch (error) {
    console.error("Erro ao buscar gestor:", error);
    res.status(500).json({ 
      message: "Erro interno do servidor" 
    });
  }
};