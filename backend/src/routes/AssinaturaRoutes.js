const express = require("express");
const router = express.Router();
const assinaturaController = require("../controllers/AssinaturaController");

// Registrar nova assinatura
router.post("/register", assinaturaController.registrarAssinatura);

module.exports = router;