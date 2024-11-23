const express = require('express');
const router = express.Router();
const Notificacion = require('../models/Notificacion');

// Obtener todas las notificaciones no leídas
router.get('/', async (req, res) => {
    try {
        const notificaciones = await Notificacion.find({ leida: false });
        res.json(notificaciones);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ message: 'Error al obtener notificaciones', error: error.message });
    }
});

// Marcar una notificación como leída
router.put('/:id', async (req, res) => {
    try {
        const notificacion = await Notificacion.findByIdAndUpdate(req.params.id, { leida: true }, { new: true });
        if (!notificacion) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }
        res.json({ message: 'Notificación marcada como leída', notificacion });
    } catch (error) {
        console.error('Error al actualizar notificación:', error);
        res.status(500).json({ message: 'Error al actualizar notificación', error: error.message });
    }
});

module.exports = router;
