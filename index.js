const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRouter = require('./routes/auth');
const productosRouter = require('./routes/productos');
const { authMiddleware } = require('./middlewares/authMiddleware');
const { connectToRabbitMQ } = require('./rabbitmq'); 
const notificacionesRouter = require('./routes/notificaciones');




dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de orígenes permitidos
const allowedOrigins = [
    'http://localhost:3000', // Para desarrollo local
    'https://inventariogestion-valenlopezzz04s-projects.vercel.app', // Dominio explícito
];

// Middleware de CORS para manejar orígenes dinámicos
app.use(cors({
    origin: (origin, callback) => {
        if (
            !origin || // Permitir solicitudes sin origen (como Postman)
            allowedOrigins.includes(origin) || // Orígenes explícitamente permitidos
            origin.endsWith('.vercel.app') // Cualquier subdominio de Vercel
        ) {
            console.log(`Solicitud permitida: Origen: ${origin || 'sin origen (Postman o similares)'}`);
            callback(null, true);
        } else {
            console.log(`Solicitud bloqueada: Origen: ${origin}`);
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true, // Permitir cookies y encabezados personalizados
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos HTTP permitidos
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
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect('mongodb+srv://valejalopez444:valentina@gestioninventario.o72zu.mongodb.net/GestionInventario?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Conectado a MongoDB Atlas'))
    .catch((error) => {
        console.error('Error conectando a MongoDB Atlas:', error);
        process.exit(1);
    });
}

// Middleware para parsear JSON
app.use(express.json());
app.use('/gestion/notificaciones',notificacionesRouter); // Usa el router
app.use('/gestion/auditorias', auditoriasRouter);






// Conectar a RabbitMQ
connectToRabbitMQ()
    .then(() => {
        console.log('Conexión a RabbitMQ exitosa');
    })
    .catch((error) => {
        console.error('Error al conectar con RabbitMQ:', error);
        process.exit(1);
    });

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
