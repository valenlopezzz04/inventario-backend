const express = require('express');
const router = express.Router();
const Orden = require('../models/orden');
const { authMiddleware, verificarRol } = require('../middlewares/authMiddleware');

// Obtener todas las órdenes
router.get('/', authMiddleware, verificarRol(['admin']), async (req, res) => {
    try {
        const ordenes = await Orden.find().populate('productoId', 'nombre_producto ubicacion_almacen');
        res.json(ordenes);
    } catch (error) {
        console.error('Error al obtener órdenes:', error);
        res.status(500).json({ message: 'Error al obtener órdenes', error: error.message });
    }
});

// Actualizar el estado de una orden (ejemplo: procesar una orden)
router.put('/:id', authMiddleware, verificarRol(['admin']), async (req, res) => {
    try {
        const { estado } = req.body;
        const orden = await Orden.findByIdAndUpdate(req.params.id, { estado }, { new: true });
        if (!orden) {
            return res.status(404).json({ message: 'Orden no encontrada' });
        }
        res.json({ message: 'Estado de la orden actualizado con éxito', orden });
    } catch (error) {
        console.error('Error al actualizar la orden:', error);
        res.status(500).json({ message: 'Error al actualizar la orden', error: error.message });
    }
});

module.exports = router;
