const express = require('express');
const router = express.Router();
const contatoController = require('../controllers/ContatoController');

// POST - Criar novo contato
router.post('/', contatoController.criarContato);

// GET - Listar todos os contatos (com filtros opcionais)
// Query params opcionais: ?status=pendente&empresa=Premix&dataInicio=2025-01-01&dataFim=2025-12-31
router.get('/', contatoController.listarContatos);

// GET - Estatísticas de contatos
router.get('/estatisticas', contatoController.estatisticas);

// GET - Buscar contato por ID
router.get('/:id', contatoController.buscarContatoPorId);

// PATCH - Atualizar status do contato
//router.patch('/:id/status', contatoController.atualizarStatus);

// DELETE - Deletar contato
router.delete('/:id', contatoController.deletarContato);


module.exports = router;
