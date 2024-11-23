const mongoose = require('mongoose');

const notificacionSchema = new mongoose.Schema({
    mensaje: { type: String, required: true },
    producto: { type: String, required: true },
    cantidad: { type: Number, required: true },
    fecha: { type: Date, default: Date.now },
    leida: { type: Boolean, default: false },
    nivel_minimo: { type: Number, required: true }, // Nivel mínimo de stock
    ubicacion_almacen: { type: String, required: true }, // Ubicación del almacén
    producto_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' }, // ID del producto relacionado
});

module.exports = mongoose.model('Notificacion', notificacionSchema);
