const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');
const { authMiddleware, verificarRol } = require('../middlewares/authMiddleware');

// Crear un producto - Solo para administradores
router.post('/', authMiddleware, verificarRol(['admin']), async (req, res) => {
    try {
        const { nombre_producto, cantidad, ubicacion_almacen, estado } = req.body;
        if (!nombre_producto || !cantidad || !ubicacion_almacen || !estado) {
            return res.status(400).json({ message: 'Todos los campos obligatorios deben ser proporcionados' });
        }

        const producto = new Producto(req.body);
        await producto.save();
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

// Actualizar un producto - Solo para administradores
router.put('/:id', authMiddleware, verificarRol(['admin']), async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado para actualizar' });
        }

        const productoActualizado = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
