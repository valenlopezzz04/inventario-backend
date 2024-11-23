const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
    nombre_producto: { type: String, required: true },
    cantidad: { type: Number, required: true, min: 0 },
    ubicacion_almacen: { type: String, required: true },
    estado: { type: String, required: true },
    fecha_ingreso: { type: Date, default: Date.now },
    categoria: { type: String },
    nivel_minimo: { type: Number, default: 5 }, // Nivel mínimo de stock
    habilitar_reposicion: { type: Boolean, default: false }, // Indica si se puede generar reposición automática
});

module.exports = mongoose.model('Producto', ProductoSchema);
