const Assinatura = require("../models/Assinatura");

// Registrar nova assinatura
exports.registrarAssinatura = async (req, res) => {
  try {
    const { plano, gestorId } = req.body;

    if (!plano || !gestorId) {
      return res.status(400).json({ 
        message: "Plano e gestorId são obrigatórios." 
      });
    }

    const novaAssinatura = new Assinatura({
      plano,
      gestorId,
      dataFim: calcularDataFim(plano)
    });

    await novaAssinatura.save();

    res.status(201).json({
      message: "Assinatura registrada com sucesso!",
      assinatura: novaAssinatura
    });

  } catch (error) {
    console.error("Erro ao registrar assinatura:", error);
    res.status(500).json({ 
      message: "Erro interno do servidor.", 
      error: error.message 
    });
  }
};

// Calcular data fim baseada no plano
function calcularDataFim(plano) {
  const data = new Date();
  
  switch (plano) {
    case "basico":
      data.setMonth(data.getMonth() + 1); // 1 mês
      break;
    case "premium":
      data.setMonth(data.getMonth() + 6); // 6 meses
      break;
    case "empresarial":
      data.setFullYear(data.getFullYear() + 1); // 1 ano
      break;
    default:
      data.setMonth(data.getMonth() + 1); // padrão 1 mês
  }
  
  return data;
}