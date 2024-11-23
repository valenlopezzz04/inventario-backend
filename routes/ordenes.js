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

// Actualizar una orden
router.put('/:id', authMiddleware, verificarRol(['admin']), async (req, res) => {
    try {
        const ordenId = req.params.id;
        const { estado } = req.body;

        const ordenActualizada = await Orden.findByIdAndUpdate(
            ordenId,
            { estado },
            { new: true }
        );

        if (!ordenActualizada) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }

        res.json({ message: 'Orden actualizada con éxito', orden: ordenActualizada });
    } catch (error) {
        console.error('Error al actualizar orden:', error);
        res.status(500).json({ message: 'Error al actualizar la orden', error: error.message });
    }
});
module.exports = router;
