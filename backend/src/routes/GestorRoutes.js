const express = require("express");
const router = express.Router();
const gestorController = require("../controllers/GestorController");

// Registrar novo gestor
router.post("/register", gestorController.registrarGestor);

// Listar todos os gestores
router.get("/", gestorController.listarGestores);

// Verificações em tempo real
router.post("/verificar-email", gestorController.verificarEmail);
router.post("/verificar-usuario", gestorController.verificarUsuario);

// Buscar gestor por email
router.post("/buscar-email", gestorController.buscarPorEmail);

module.exports = router;