const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRouter = require('./routes/auth');
const productosRouter = require('./routes/productos');
const { authMiddleware } = require('./middlewares/authMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de orígenes permitidos
const allowedOrigins = [
    'http://localhost:3000', // Para desarrollo local
    'https://inventariogestion-valenlopezzz04s-projects.vercel.app', // Para producción
];

// Middleware de CORS con logs
app.use((req, res, next) => {
    console.log(`Solicitud entrante: ${req.method} - Ruta: ${req.path} - Origen: ${req.headers.origin}`);
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
        console.log('CORS configurado correctamente para este origen.');
    } else {
        console.log(`Origen no permitido: ${origin}`);
    }

    if (req.method === 'OPTIONS') {
        console.log('Solicitud preflight detectada.');
        return res.sendStatus(200); // Respuesta para solicitudes preflight
    }

    next();
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://<usuario>:<contraseña>@<cluster>', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
})
    .then(() => console.log("Conectado a MongoDB"))
    .catch((error) => console.error("Error conectando a MongoDB:", error));

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/auth', authRouter); // Rutas de autenticación (públicas)
app.use('/gestion/productos', authMiddleware, productosRouter); // Rutas protegidas

// Ruta pública de prueba
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error detectado:', err.stack);
    res.status(500).json({ message: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
