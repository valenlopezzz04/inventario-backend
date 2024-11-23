const mongoose = require('mongoose');

const auditoriaSchema = new mongoose.Schema({
    tipoEvento: { type: String, required: true },
    detalles: { type: Object, required: true },
    fecha: { type: Date, default: Date.now },
});

const Auditoria = mongoose.model('Auditoria', auditoriaSchema);

module.exports = Auditoria;
