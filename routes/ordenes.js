const express = require('express');
const router = express.Router();
const Orden = require('../models/Orden');
const { authMiddleware, verificarRol } = require('../middlewares/authMiddleware');

// Obtener todas las órdenes
router.get('/', authMiddleware, verificarRol(['admin']), async (req, res) => {
    try {
        const ordenes = await Orden.find();
        res.json(ordenes);
    } catch (error) {
        console.error('Error al obtener órdenes:', error);
        res.status(500).json({ message: 'Error al obtener órdenes', error: error.message });
    }
});

module.exports = router;
