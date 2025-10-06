const express = require("express");
const router = express.Router();
const mercadoPagoController = require("../controllers/MercadoPagoController");

// Criar pagamento para novo cadastro
router.post("/create-preference", mercadoPagoController.criarPreferenciaPagamento);

// Criar pagamento para conta existente
router.post("/create-existing", mercadoPagoController.criarPagamentoExistente);

// Verificar status do pagamento
router.post("/check-payment", mercadoPagoController.verificarPagamento);

module.exports = router;