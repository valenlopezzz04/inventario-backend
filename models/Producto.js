const mongoose = require('mongoose');

const ProductoSchema = new mongoose.Schema({
    nombre_producto: { type: String, required: true },
    cantidad: { type: Number, required: true, min: 0 },
    ubicacion_almacen: { type: String, required: true },
    estado: { type: String, required: true },
    fecha_ingreso: { type: Date, default: Date.now },
    categoria: { type: String }
});

module.exports = mongoose.model('Producto', ProductoSchema);
