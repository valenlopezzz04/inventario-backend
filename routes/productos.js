const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');
const Notificacion = require('../models/Notificacion'); // Importar el modelo de notificación
const { authMiddleware, verificarRol } = require('../middlewares/authMiddleware');
const eventEmitter = require('../eventEmitter'); // Importar el EventEmitter

// Crear un producto - Solo para administradores
router.post('/', authMiddleware, verificarRol(['admin']), async (req, res) => {
    try {
        console.log('Datos recibidos en POST:', req.body);

        // Convertir cantidad a número si es necesario
        if (req.body.cantidad !== undefined) {
            req.body.cantidad = parseInt(req.body.cantidad, 10);
        }

        const { nombre_producto, cantidad, ubicacion_almacen, estado, categoria } = req.body;

        if (!nombre_producto || cantidad === undefined || !ubicacion_almacen || !estado || !categoria) {
            return res.status(400).json({ message: 'Todos los campos obligatorios deben ser proporcionados' });
        }

        const producto = new Producto(req.body);
        await producto.save();

        if (producto.cantidad <= 5) {
            eventEmitter.emit('stockInsuficiente', {
                producto_id: producto._id,
                nombre_producto: producto.nombre_producto,
                cantidad: producto.cantidad,
                ubicacion_almacen: producto.ubicacion_almacen,
                nivel_minimo: producto.nivel_minimo,
                habilitarReposicion: producto.habilitarReposicion,
                cantidad_reposicion: producto.cantidad_reposicion,
            });
        }

        res.status(201).json({ message: 'Producto creado con éxito', producto });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ message: 'Error al crear producto', error: error.message });
    }
});


// Actualizar un producto - Solo para administradores
router.put('/:id', authMiddleware, verificarRol(['admin']), async (req, res) => {
    try {
        console.log('Datos recibidos en PUT:', req.body);
       

        // Convertir cantidad a número si es necesario
        if (req.body.cantidad !== undefined) {
            req.body.cantidad = parseInt(req.body.cantidad, 10);
        }

        const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado para actualizar' });
        }

        // Actualizar el producto en la base de datos
        const productoActualizado = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // Verificar si el stock actualizado está por debajo del nivel mínimo
        if (producto.cantidad <= producto.nivel_minimo) {
            eventEmitter.emit('stockInsuficiente', {
                producto_id: producto._id,
                nombre_producto: producto.nombre_producto,
                cantidad: producto.cantidad,
                ubicacion_almacen: producto.ubicacion_almacen,
                nivel_minimo: producto.nivel_minimo,
                habilitarReposicion: producto.habilitarReposicion,
                cantidad_reposicion: producto.cantidad_reposicion,
            });
        

            console.log(`Evento "stockInsuficiente" emitido para el producto ${productoActualizado.nombre_producto}`);
        } else {
            // Eliminar notificaciones relacionadas si el stock supera el nivel mínimo
            await Notificacion.deleteMany({ productoId: req.params.id });
            console.log('Notificaciones relacionadas eliminadas.');
        }

        res.json({ message: 'Producto actualizado con éxito', producto: productoActualizado });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
    }
});


// Obtener todos los productos - Acceso para todos los usuarios
router.get('/', authMiddleware, async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
});

// Eliminar un producto - Solo para administradores
router.delete('/:id', authMiddleware, verificarRol(['admin']), async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado para eliminar' });
        }

        // Eliminar el producto
        await Producto.findByIdAndDelete(req.params.id);

        // Eliminar las notificaciones relacionadas con este producto
        await Notificacion.deleteMany({ producto_id: req.params.id });
        console.log('Notificaciones relacionadas eliminadas.');

        res.json({ message: 'Producto eliminado con éxito' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
    }
});

module.exports = router;
