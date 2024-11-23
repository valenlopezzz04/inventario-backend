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
        res.status(500).json({ message: 'Error al obtener notificaciones' });
    }
});

// Marcar notificaciones como leídas
router.put('/leidas', authMiddleware, verificarRol(['admin']), async (req, res) => {
    try {
        const { notificaciones } = req.body; // Array de IDs de notificaciones

        if (!Array.isArray(notificaciones)) {
            return res.status(400).json({ message: 'Debe proporcionar un array de IDs de notificaciones' });
        }

        await Notificacion.updateMany(
            { _id: { $in: notificaciones } },
            { $set: { leida: true } }
        );

        res.json({ message: 'Notificaciones marcadas como leídas' });
    } catch (error) {
        console.error('Error al actualizar notificación:', error);
        res.status(500).json({ message: 'Error al actualizar notificación', error: error.message });
    }
});

module.exports = router;

