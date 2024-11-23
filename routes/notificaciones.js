const express = require('express');
const router = express.Router();
const Notificacion = require('../models/Notificacion');
const { authMiddleware, verificarRol } = require('../middlewares/authMiddleware');

// Middleware para proteger las rutas
router.use(authMiddleware, verificarRol(['admin']));

// Obtener todas las notificaciones (opcional, para listar en el dashboard)
router.get('/', async (req, res) => {
    try {
        const notificaciones = await Notificacion.find().sort({ fecha: -1 }); // Ordenar por fecha descendente
        res.json(notificaciones);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ message: 'Error al obtener notificaciones', error: error.message });
    }
});

// Endpoint para marcar una notificación como leída
router.put('/leida/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verifica si el ID es válido
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'ID inválido' });
        }

        const notificacion = await Notificacion.findByIdAndUpdate(
            id,
            { leida: true },
            { new: true }
        );

        if (!notificacion) {
            return res.status(404).json({ message: 'Notificación no encontrada' });
        }

        res.json({ message: 'Notificación marcada como leída', notificacion });
    } catch (error) {
        console.error('Error al actualizar notificación:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});

module.exports = router;
