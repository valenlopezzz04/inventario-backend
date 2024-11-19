const jwt = require('jsonwebtoken');
const JWT_SECRET = 'valentina';

// Middleware de autenticación general para verificar si el token es válido
const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'No se proporcionó un token de autenticación' });
    }

    const token = authHeader.replace('Bearer ', ''); // Elimina 'Bearer ' del token
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Agrega el usuario decodificado a la solicitud
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
};

// Middleware para verificar el rol específico
const verificarRol = (rolesPermitidos) => (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.role)) {
        return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    }
    next();
};

module.exports = { authMiddleware, verificarRol };

