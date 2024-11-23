const express = require('express');
const router = express.Router();
const Auditoria = require('../models/auditoria');
const { authMiddleware, verificarRol } = require('../middlewares/authMiddleware');

// Obtener todos los registros de auditoría
router.get('/', authMiddleware, verificarRol(['admin']), async (req, res) => {
    try {
        const registros = await Auditoria.find().sort({ fecha: -1 }); // Ordenar por fecha descendente
        res.json(registros);
    } catch (error) {
        console.error('Error al obtener registros de auditoría:', error);
        res.status(500).json({ message: 'Error al obtener registros de la auditoría', error: error.message });
    }
});

module.exports = router;
