const mongoose = require('mongoose');

const notificacionSchema = new mongoose.Schema({
    productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    nombre_producto: { type: String, required: true },
    cantidad: { type: Number, required: true },
    ubicacion_almacen: { type: String, required: true },
    stockMinimo: { type: Number, required: true },
    fecha: { type: Date, default: Date.now },
    leida: { type: Boolean, default: false }, // Indicador de si la notificación fue leída
});

module.exports = mongoose.model('Notificacion', notificacionSchema);
