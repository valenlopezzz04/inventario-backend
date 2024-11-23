const mongoose = require('mongoose');

const auditoriaSchema = new mongoose.Schema({
    tipoEvento: { type: String, required: true }, // Tipo del evento
    detalles: { type: Object, required: true },   // Detalles del evento
    fecha: { type: Date, default: Date.now },    // Fecha del evento
});

module.exports = mongoose.model('auditoria', auditoriaSchema);
