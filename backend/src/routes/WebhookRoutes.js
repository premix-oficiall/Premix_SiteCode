const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/WebhookController");

router.post("/mercadopago", webhookController.webhookMercadoPago);

module.exports = router;