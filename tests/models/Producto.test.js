const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../index');
const Producto = require('../../models/Producto');
const jwt = require('jsonwebtoken');

jest.setTimeout(30000);

let adminToken;
let standardToken;
let productoId;

beforeAll(async () => {
    const mongoURI = 'mongodb://127.0.0.1:27017/testdb';
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

    adminToken = 'Bearer ' + jwt.sign({ id: 'adminId', role: 'admin' }, 'valentina', { expiresIn: '1h' });
    standardToken = 'Bearer ' + jwt.sign({ id: 'userId', role: 'standard' }, 'valentina', { expiresIn: '1h' });

    const producto = await Producto.create({
        nombre_producto: 'Producto de Prueba',
        cantidad: 10,
        ubicacion_almacen: 'Almacén A',
        estado: 'Disponible',
        categoria: 'Categoría A',
    });

    productoId = producto._id;
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
});

describe('Rutas de Productos', () => {
    test('Debe bloquear creación de producto para usuarios estándar', async () => {
        const res = await request(app)
            .post('/productos')
            .set('Authorization', standardToken)
            .send({
                nombre_producto: 'Nuevo Producto',
                cantidad: 20,
                ubicacion_almacen: 'Almacén B',
            });

        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty('message', 'Acceso denegado. Se requiere rol de administrador.');
    });

    test('Debe actualizar un producto como administrador', async () => {
        const res = await request(app)
            .put(`/productos/${productoId}`)
            .set('Authorization', adminToken)
            .send({
                nombre_producto: 'Producto Actualizado',
                cantidad: 100,
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Producto actualizado con éxito.');
        expect(res.body.producto.nombre_producto).toBe('Producto Actualizado');
    });

    test('Debe bloquear actualización de producto para usuarios estándar', async () => {
        const res = await request(app)
            .put(`/productos/${productoId}`)
            .set('Authorization', standardToken)
            .send({
                cantidad: 50,
            });

        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty('message', 'Acceso denegado. Se requiere rol de administrador.');
    });

    test('Debe eliminar un producto como administrador', async () => {
        const res = await request(app)
            .delete(`/productos/${productoId}`)
            .set('Authorization', adminToken);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Producto eliminado con éxito.');
    });

    test('Debe devolver error 404 al intentar eliminar un producto inexistente', async () => {
        const res = await request(app)
            .delete('/productos/64b1234567890abcdef12345')
            .set('Authorization', adminToken);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'Producto no encontrado.');
    });
});
