const jwt = require('jsonwebtoken');
const JWT_SECRET = 'valentina'; // Cambia esto a una variable de entorno en producción

// Middleware general para verificar el token
const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        console.log('No se proporcionó el encabezado Authorization');
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.replace('Bearer ', ''); // Elimina 'Bearer ' del token
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Token decodificado:', decoded);
        req.user = decoded; // Agrega el usuario decodificado a la solicitud
        next();
    } catch (error) {
        console.log('Error al verificar el token:', error.message);
        res.status(401).json({ message: 'Token inválido' });
    }
};

// Middleware para verificar roles específicos
const verificarRol = (rolesPermitidos) => (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.role)) {
        return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    }
    next();
};

module.exports = { authMiddleware, verificarRol };

