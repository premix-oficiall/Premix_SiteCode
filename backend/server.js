const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require("cors");

dotenv.config();

const app = express();

// Middlewares
// CORRIJA o CORS no server.js - URLS CORRETAS
app.use(cors({
  origin: [
    "https://premix-frontend.onrender.com",  // SEU FRONTEND
    "https://premix-sitecode1.onrender.com", // SEU BACKEND (para testes)
    "http://localhost:5500",                 // DEV FRONTEND
    "http://127.0.0.1:5500",                // DEV ALTERNATIVO
    "http://localhost:3000"                 // DEV BACKEND
  ],
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado com sucesso!'))
  .catch(err => console.error('Erro de conexão com MongoDB:', err));

// Rota de teste
app.get('/', (req, res) => {
  res.send('API PremiX está rodando!');
});

// Rotas
const gestorRoutes = require('./src/routes/GestorRoutes');
app.use('/api/Gestor', gestorRoutes);

const assinaturaRoutes = require("./src/routes/AssinaturaRoutes");
app.use("/api/assinaturas", assinaturaRoutes);

const mercadoPagoRoutes = require('./src/routes/MercadoPagoRoutes');
app.use('/api/payments', mercadoPagoRoutes);

const webhookRoutes = require('./src/routes/WebhookRoutes');
app.use('/api/webhooks', webhookRoutes);
// Inicializa servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
const contatoRoutes = require('./src/routes/ContatoRoutes');
app.use('/api/contatos', contatoRoutes);

