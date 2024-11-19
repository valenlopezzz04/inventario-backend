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
    'http://localhost:3000', // Desarrollo local
    'https://inventariogestion-valenlopezzz04s-projects.vercel.app', // Producción
];

// Configuración de CORS
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin); // Permitir origen
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Métodos permitidos
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Cabeceras permitidas
        res.header('Access-Control-Allow-Credentials', 'true'); // Permitir cookies o credenciales
    }

    if (req.method === 'OPTIONS') {
        // Responder directamente a solicitudes preflight
        return res.sendStatus(200);
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

// Rutas públicas y protegidas
app.use('/auth', authRouter); // Rutas de autenticación (públicas)
app.use('/gestion/productos', authMiddleware, productosRouter); // Rutas protegidas

// Ruta pública de prueba
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
