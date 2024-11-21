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
    'http://localhost:3000',
    'https://inventariogestion-valenlopezzz04s-projects.vercel.app',
];

// Middleware de CORS
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
}));

// Conexión a MongoDB
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://<usuario>:<contraseña>@<cluster>', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => console.log("Conectado a MongoDB"))
        .catch((error) => console.error("Error conectando a MongoDB:", error));
}

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/auth', authRouter);
app.use('/gestion/productos', authMiddleware, productosRouter);

// Ruta pública
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
    if (err.message === 'No permitido por CORS') {
        return res.status(403).json({ message: 'No permitido por CORS' });
    }
    console.error('Error detectado:', err.message);
    res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' });
});

// Iniciar servidor
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

module.exports = app;

