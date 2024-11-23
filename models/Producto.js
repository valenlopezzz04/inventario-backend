const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
    nombre_producto: { type: String, required: true },
    cantidad: { type: Number, required: true, min: 0 },
    ubicacion_almacen: { type: String, required: true },
    estado: { type: String, required: true },
    fecha_ingreso: { type: Date, default: Date.now },
    categoria: { type: String },
    habilitarReposicion: { type: Boolean, default: false },
    cantidad_reposicion: { type: Number, default: 10 }, // Cantidad por defecto para reabastecimiento
    nivel_minimo: { type: Number, default: 5 }, // Nivel mínimo predeterminado
});

module.exports = mongoose.model('Producto', ProductoSchema);
