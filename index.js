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

// Configuración de CORS
const allowedOrigins = [
    'http://localhost:3000', // Para desarrollo local
    'https://inventariogestion-valenlopezzz04s-projects.vercel.app', // Producción
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true, // Permite cookies y encabezados personalizados
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Cabeceras permitidas
}));

// Responder a solicitudes preflight
app.options('*', cors());

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
app.use('/auth', authRouter);
app.use('/gestion/productos', authMiddleware, productosRouter);

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