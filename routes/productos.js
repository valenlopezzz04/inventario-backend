const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');
const { authMiddleware, verificarRol } = require('../middlewares/authMiddleware');
const eventEmitter = require('../eventEmitter'); // Importamos el EventEmitter

const stockMinimo = 5; // Nivel mínimo de stock

// Crear un producto - Solo para administradores
router.post('/', authMiddleware, verificarRol(['admin']), async (req, res) => {
    try {
        console.log('Datos recibidos en POST:', req.body);

        // Convertir cantidad a número si es necesario
        if (req.body.cantidad !== undefined) {
            req.body.cantidad = parseInt(req.body.cantidad, 10);
        }

        const { nombre_producto, cantidad, ubicacion_almacen, estado } = req.body;

        if (!nombre_producto || cantidad === undefined || !ubicacion_almacen || !estado) {
            return res.status(400).json({ message: 'Todos los campos obligatorios deben ser proporcionados' });
        }

        const producto = new Producto(req.body);
        await producto.save();

        // Emitir evento si el stock es insuficiente
        if (cantidad <= stockMinimo) {
            console.log('Emitiendo evento: stockInsuficiente', { nombre_producto, cantidad, ubicacion_almacen });
            eventEmitter.emit('stockInsuficiente', { nombre_producto, cantidad, ubicacion_almacen });
        }

        res.status(201).json({ message: 'Producto creado con éxito', producto });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ message: 'Error al crear producto', error: error.message });
    }
});

// Obtener todos los productos
router.get('/', authMiddleware, async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
});

// Obtener productos con stock insuficiente
router.get('/stock-insuficiente', authMiddleware, async (req, res) => {
    try {
        console.log('Consultando productos con cantidad <=', stockMinimo); // Agregar log para depuración
        const productos = await Producto.find({ cantidad: { $lte: stockMinimo } });
        console.log('Productos encontrados:', productos); // Agregar log para ver el resultado
        res.json(productos);
    } catch (error) {
        console.error('Error al obtener productos con stock insuficiente:', error);
        res.status(500).json({ message: 'Error al obtener productos con stock insuficiente', error: error.message });
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

        const producto = await Producto.findById(req.params.id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado para actualizar' });
        }

        const productoActualizado = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });

        // Emitir evento si el stock actualizado es insuficiente
        if (req.body.cantidad <= stockMinimo) {
            eventEmitter.emit('stockInsuficiente', {
                nombre_producto: productoActualizado.nombre_producto,
                cantidad: req.body.cantidad,
                ubicacion_almacen: productoActualizado.ubicacion_almacen,
            });
        }

        res.json({ message: 'Producto actualizado con éxito', producto: productoActualizado });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
    }
});

// Eliminar un producto - Solo para administradores
router.delete('/:id', authMiddleware, verificarRol(['admin']), async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado para eliminar' });
        }

        await Producto.findByIdAndDelete(req.params.id);
        res.json({ message: 'Producto eliminado con éxito' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
    }
});

module.exports = router;
