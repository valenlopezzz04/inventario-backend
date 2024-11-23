const mongoose = require('mongoose');

const notificacionSchema = new mongoose.Schema({
    productoId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Producto',
    },
    nombre_producto: {
        type: String,
        required: true,
    },
    cantidad: {
        type: Number,
        required: true,
    },
    ubicacion_almacen: {
        type: String,
        required: true,
    },
    stockMinimo: {
        type: Number,
        required: true,
    },
    fecha: {
        type: Date,
        default: Date.now,
        required: true,
    },
    leida: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('Notificacion', notificacionSchema);
