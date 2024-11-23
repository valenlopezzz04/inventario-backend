const express = require('express');
const router = express.Router();
const Notificacion = require('../models/Notificacion');
const { authMiddleware, verificarRol } = require('../middlewares/authMiddleware');

// Obtener todas las notificaciones no leídas
router.get('/', authMiddleware, verificarRol(['admin']), async (req, res) => {
    try {
        const notificaciones = await Notificacion.find({ leida: false });
        res.json(notificaciones);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ message: 'Error al obtener notificaciones', error: error.message });
    }
});

// Marcar notificaciones como leídas
// Eliminar una notificación
router.delete('/:id', authMiddleware, verificarRol(['admin']), async (req, res) => {
    try {
        const notificacion = await Notificacion.findByIdAndDelete(req.params.id);
        if (!notificacion) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }
        res.json({ message: 'Notificación eliminada con éxito', notificacion });
    } catch (error) {
        console.error('Error al eliminar notificación:', error);
        res.status(500).json({ message: 'Error al eliminar notificación', error: error.message });
    }
});


module.exports = router;

