const mongoose = require('mongoose');

// Esquema de usuario
const UsuarioSchema = mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'standard'], default: 'standard' },
});

// Modelo de usuario
const Usuario = mongoose.model('Usuario', UsuarioSchema);

module.exports = Usuario;
