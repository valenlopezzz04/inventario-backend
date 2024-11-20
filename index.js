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

// Middleware de CORS con ajustes para solicitudes sin origen
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            console.log(`Solicitud permitida: Origen: ${origin || 'sin origen (Postman o similares)'}`);
            callback(null, true);
        } else {
            console.log(`Solicitud bloqueada: Origen: ${origin}`);
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true, // Permitir cookies y encabezados personalizados
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Cabeceras permitidas
}));

// Middleware para solicitudes preflight
app.options('*', (req, res) => {
    console.log('Solicitud preflight detectada.');
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://<usuario>:<contraseña>@<cluster>', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Conectado a MongoDB"))
    .catch((error) => console.error("Error conectando a MongoDB:", error));

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/auth', authRouter); // Rutas de autenticación
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
