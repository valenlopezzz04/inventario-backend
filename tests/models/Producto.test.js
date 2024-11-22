const request = require('supertest');
const mongoose = require('mongoose');
const Producto = require('../../models/Producto');
const app = require('../../index'); // Ajustar la ruta según tu archivo principal
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'valentina'; // Asegúrate de usar el mismo secreto que en el middleware

describe('Rutas de Productos', () => {
    let adminToken, standardToken;

    beforeAll(async () => {
        // Generar tokens de ejemplo
        adminToken = `Bearer ${jwt.sign({ id: 'adminId', role: 'admin' }, JWT_SECRET)}`;
        standardToken = `Bearer ${jwt.sign({ id: 'userId', role: 'standard' }, JWT_SECRET)}`;

        // Conexión a la base de datos de prueba
        await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost/testdb', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        await Producto.deleteMany({}); // Limpia la colección de productos antes de iniciar las pruebas

        // Inserta productos para pruebas
        await Producto.create([
            { nombre_producto: 'Producto 1', cantidad: 10, ubicacion_almacen: 'Almacén A', estado: 'Disponible' },
            { nombre_producto: 'Producto 2', cantidad: 5, ubicacion_almacen: 'Almacén B', estado: 'Reservado' },
        ]);
    });

    afterAll(async () => {
        await mongoose.connection.close(); // Cierra la conexión a la base de datos después de las pruebas
    });

    test('Debe bloquear creación de producto para usuarios estándar', async () => {
        const res = await request(app)
            .post('/gestion/productos') // Ruta para crear un producto
            .set('Authorization', standardToken)
            .send({
                nombre_producto: 'Producto Bloqueado',
                cantidad: 5,
                ubicacion_almacen: 'Almacén Norte',
                estado: 'Disponible',
            });

        expect(res.status).toBe(403); // Usuario estándar no tiene permisos
        expect(res.body).toHaveProperty('message', 'No tienes permiso para realizar esta acción');
    });

    test('Debe crear un producto como administrador', async () => {
        const res = await request(app)
            .post('/gestion/productos') // Ruta para crear un producto
            .set('Authorization', adminToken)
            .send({
                nombre_producto: 'Producto de prueba',
                cantidad: 10,
                ubicacion_almacen: 'Almacén Central',
                estado: 'Disponible',
            });

        expect(res.status).toBe(201); // Producto creado con éxito
        expect(res.body).toHaveProperty('message', 'Producto creado con éxito');
        expect(res.body.producto).toHaveProperty('nombre_producto', 'Producto de prueba');
    });

    test('Debe listar todos los productos como usuario autenticado', async () => {
        const res = await request(app)
            .get('/gestion/productos') // Ruta para listar productos
            .set('Authorization', standardToken);

        expect(res.status).toBe(200); // Usuario estándar puede listar productos
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0); // Verifica que hay al menos un producto
    });
});

