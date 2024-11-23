const mongoose = require('mongoose');

const OrdenSchema = new mongoose.Schema({
    productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    nombre_producto: { type: String, required: true },
    cantidad_actual: { type: Number, required: true },
    cantidad_reposicion: { type: Number, required: true },
    estado: { type: String, enum: ['Pendiente', 'Completada'], default: 'Pendiente' },
    fecha: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Orden', OrdenSchema);
