const mongoose = require('mongoose');

const OrdenSchema = new mongoose.Schema({
    productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
    nombre_producto: { type: String, required: true },
    cantidad_reponer: { type: Number, required: true },
    fecha_generacion: { type: Date, default: Date.now },
    estado: { type: String, default: 'pendiente' }, // Estado de la orden: pendiente, procesada, cancelada
});

module.exports = mongoose.model('Orden', OrdenSchema);
