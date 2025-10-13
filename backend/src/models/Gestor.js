const mongoose = require("mongoose");

const GestorSchema = new mongoose.Schema({
  usuario: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  senha: {
    type: String,
    required: true
  },
  cpf: {
    type: String, // CORRETO - igual ao schema do MongoDB
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    required: true, // OBRIGATÓRIO - igual ao schema
    default: false
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  }
}, {
  timestamps: false, // Isso cria createdAt e updatedAt
  versionKey: false
});

// Método para limpar a resposta - FUNCIONA!
GestorSchema.methods.toJSON = function() {
  const gestor = this.toObject();
  delete gestor.__v;
  delete gestor.createdAt;
  delete gestor.updatedAt;
  return gestor;
};

module.exports = mongoose.model("Gestor", GestorSchema, "Gestor");
