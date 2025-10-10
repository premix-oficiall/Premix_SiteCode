const mongoose = require('mongoose');

const contatoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  telefone: {
    type: String,
    required: true,
    trim: true
  },
  empresa: {
    type: String,
    required: true,
    trim: true
  },
  mensagem: {
    type: String,
    required: true,
    trim: true
  },
  aceitouTermos: {
    type: Boolean,
    required: true,
    default: false
  },
  aceitouNovidades: {
    type: Boolean,
    default: false
  },
  dataEnvio: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pendente', 'lido', 'respondido'],
    default: 'pendente'
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('contatos', contatosSchema);
