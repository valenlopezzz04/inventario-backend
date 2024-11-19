const express = require('express');
const { body, validationResult, param } = require('express-validator');
const mongoose = require('mongoose');
const router = express.Router();
const Producto = require('../models/Producto');
const { authMiddleware, verificarRol } = require('../middlewares/authMiddleware');

// Middleware para validar los datos de entrada al crear o actualizar productos
const validateProducto = [
    body('nombre_producto').isString().notEmpty().withMessage('El nombre del producto es obligatorio y debe ser una cadena.'),
    body('cantidad').isNumeric().isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero positivo.'),
    body('ubicacion_almacen').optional().isString().withMessage('La ubicación del almacén debe ser una cadena.'),
    body('estado').optional().isString().withMessage('El estado debe ser una cadena.'),
    body('categoria').optional().isString().withMessage('La categoría debe ser una cadena.')
];

const validateObjectId = [
    param('id').custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage('ID inválido de MongoDB.')
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
        res.status(201).json(nuevoProducto);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Obtener todos los productos - Acceso para cualquier usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
    try {
        const productos = await Producto.find();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: error.message });
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
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(productoActualizado);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Eliminar un producto por ID - Solo para administradores
router.delete('/:id', authMiddleware, verificarRol(['admin']), validateObjectId, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        await Producto.findByIdAndDelete(req.params.id);
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Actualización en masa de productos - Solo para administradores
router.put('/bulk', authMiddleware, verificarRol(['admin']), [
    body('ids')
        .isArray({ min: 1 })
        .withMessage('Debe proporcionar al menos un ID de producto en un array.'),
    body('ids.*')
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('Uno o más IDs proporcionados no son válidos.'),
    body('updateFields')
        .isObject()
        .withMessage('Debe proporcionar un objeto de campos a actualizar.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { ids, updateFields } = req.body;
    try {
        const result = await Producto.updateMany(
            { _id: { $in: ids } },
            { $set: updateFields }
        );
        res.json({ message: 'Productos actualizados', result });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
