const express = require('express');
const router = express.Router();
const contatoController = require('../controllers/ContatoController');

// ✅ TODAS AS ROTAS AGORA FUNCIONAM:

// POST - Criar novo contato
router.post('/', contatoController.criarContato);

// GET - Listar todos os contatos
router.get('/', contatoController.listarContatos);

// GET - Estatísticas de contatos
router.get('/estatisticas', contatoController.estatisticas);

// GET - Buscar contato por ID
router.get('/:id', contatoController.buscarContatoPorId);

// PATCH - Atualizar status do contato (AGORA EXISTE!)
router.patch('/:id/status', contatoController.atualizarStatus);

// DELETE - Deletar contato (AGORA EXISTE!)
router.delete('/:id', contatoController.deletarContato);

module.exports = router;
