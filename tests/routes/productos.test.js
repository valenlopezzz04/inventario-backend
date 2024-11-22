const request = require('supertest');
const mongoose = require('mongoose');
const Producto = require('../../models/Producto');
const app = require('../../index');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'valentina';

describe('Rutas de Productos', () => {
    let adminToken, standardToken, productoId;

    beforeAll(async () => {
        adminToken = `Bearer ${jwt.sign({ id: 'adminId', role: 'admin' }, JWT_SECRET)}`;
        standardToken = `Bearer ${jwt.sign({ id: 'userId', role: 'standard' }, JWT_SECRET)}`;

        await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost/testdb', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        await Producto.deleteMany();

        const producto = await Producto.create({
            nombre_producto: 'Producto Prueba',
            cantidad: 5,
            ubicacion_almacen: 'Almacén Central',
            estado: 'Disponible',
        });

        productoId = producto._id;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        await Producto.deleteMany();
        await mongoose.connection.close();
    });

    // Test para crear un producto
    test('Debe crear un producto con éxito (admin)', async () => {
        const res = await request(app)
            .post('/gestion/productos')
            .set('Authorization', adminToken)
            .send({
                nombre_producto: 'Producto Nuevo',
                cantidad: 10,
                ubicacion_almacen: 'Almacén Norte',
                estado: 'Disponible',
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('message', 'Producto creado con éxito');
        expect(res.body.producto).toHaveProperty('nombre_producto', 'Producto Nuevo');
    });

    test('Debe devolver error 400 si faltan campos obligatorios al crear un producto', async () => {
        const res = await request(app)
            .post('/gestion/productos')
            .set('Authorization', adminToken)
            .send({
                cantidad: 10,
                ubicacion_almacen: 'Almacén Norte',
            });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message', 'Todos los campos obligatorios deben ser proporcionados');
    });

    test('Debe devolver error 403 si un usuario no admin intenta crear un producto', async () => {
        const res = await request(app)
            .post('/gestion/productos')
            .set('Authorization', standardToken)
            .send({
                nombre_producto: 'Producto Sin Permiso',
                cantidad: 10,
                ubicacion_almacen: 'Almacén Norte',
                estado: 'Disponible',
            });

        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty('message', 'No tienes permiso para realizar esta acción');
    });

    // Test para obtener productos
    test('Debe obtener todos los productos', async () => {
        const res = await request(app).get('/gestion/productos').set('Authorization', adminToken);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('Debe devolver error 500 si ocurre un problema interno al obtener productos', async () => {
        jest.spyOn(Producto, 'find').mockImplementationOnce(() => {
            throw new Error('Error interno');
        });

        const res = await request(app).get('/gestion/productos').set('Authorization', adminToken);

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('message', 'Error al obtener productos');
    });

    // Test para actualizar un producto
    test('Debe actualizar un producto con éxito', async () => {
        const res = await request(app)
            .put(`/gestion/productos/${productoId}`)
            .set('Authorization', adminToken)
            .send({
                nombre_producto: 'Producto Actualizado',
                cantidad: 15,
                ubicacion_almacen: 'Almacén Sur',
                estado: 'Reservado',
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Producto actualizado con éxito');
        expect(res.body.producto).toHaveProperty('nombre_producto', 'Producto Actualizado');
    });

    test('Debe devolver error 404 si el producto no existe al intentar actualizar', async () => {
        const res = await request(app)
            .put(`/gestion/productos/64dfc2e7fc13ae6e6b000001`)
            .set('Authorization', adminToken)
            .send({
                nombre_producto: 'Producto Inexistente',
                cantidad: 10,
                ubicacion_almacen: 'Almacén X',
                estado: 'Disponible',
            });

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'Producto no encontrado para actualizar');
    });

    // Test para eliminar un producto
    test('Debe eliminar un producto con éxito', async () => {
        const res = await request(app).delete(`/gestion/productos/${productoId}`).set('Authorization', adminToken);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Producto eliminado con éxito');
    });

    test('Debe devolver error 404 si el producto no existe al intentar eliminar', async () => {
        const res = await request(app)
            .delete(`/gestion/productos/64dfc2e7fc13ae6e6b000002`)
            .set('Authorization', adminToken);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'Producto no encontrado para eliminar');
    });

    test('Debe devolver error 403 si un usuario no admin intenta eliminar un producto', async () => {
        const res = await request(app).delete(`/gestion/productos/${productoId}`).set('Authorization', standardToken);

        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty('message', 'No tienes permiso para realizar esta acción');
    });
});
