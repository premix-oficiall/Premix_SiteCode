const mongoose = require("mongoose");

const AssinaturaSchema = new mongoose.Schema({
  plano: {
    type: String,
    required: true,
    enum: ["unitario", "light", "premium"] // USE OS VALORES DO HTML
  },
  gestorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Gestor",
    required: true
  },
  dataInicio: {
    type: Date,
    default: Date.now
  },
  dataFim: {
    type: Date
  },
  status: {
    type: String,
    default: "ativa",
    enum: ["ativa", "cancelada", "expirada"]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Assinatura", AssinaturaSchema, "assinaturas");