const express = require('express');
const { body, validationResult, param } = require('express-validator');
const mongoose = require('mongoose');
const router = express.Router();
const Producto = require('../models/Producto');
const { authMiddleware, verificarRol } = require('../middlewares/authMiddleware');

// Middleware para validar los datos de entrada al crear o actualizar productos
const validateProducto = [
    body('nombre_producto').isString().notEmpty().withMessage('El nombre del producto es obligatorio y debe ser una cadena.'),
    body('cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero positivo.'),
    body('ubicacion_almacen').optional().isString().withMessage('La ubicación del almacén debe ser una cadena.'),
    body('estado').optional().isString().withMessage('El estado debe ser una cadena.'),
    body('categoria').optional().isString().withMessage('La categoría debe ser una cadena.'),
];

const validateObjectId = [
    param('id').custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage('ID inválido de MongoDB.'),
];

// Crear un nuevo producto - Solo para administradores
router.post('/', authMiddleware, verificarRol(['admin']), validateProducto, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const producto = new Producto(req.body);
        const nuevoProducto = await producto.save();
        res.status(201).json({
            message: 'Producto agregado con éxito.',
            producto: nuevoProducto,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error interno al agregar el producto.' });
    }
});

// Obtener todos los productos - Acceso para cualquier usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: 'Error interno al listar productos.' });
    }
});

// Actualizar un producto por ID - Solo para administradores
router.put('/:id', authMiddleware, verificarRol(['admin']), [...validateObjectId, ...validateProducto], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const productoActualizado = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!productoActualizado) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.status(200).json({
            message: 'Producto actualizado con éxito.',
            producto: productoActualizado,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error interno al actualizar el producto.' });
    }
});

// Eliminar un producto por ID - Solo para administradores
router.delete('/:id', authMiddleware, verificarRol(['admin']), validateObjectId, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const productoEliminado = await Producto.findByIdAndDelete(req.params.id);
        if (!productoEliminado) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.status(200).json({ message: 'Producto eliminado con éxito.' });
    } catch (error) {
        res.status(500).json({ message: 'Error interno al eliminar el producto.' });
    }
});

module.exports = router;
