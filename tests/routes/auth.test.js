const request = require('supertest');
const app = require('../../index');
const Usuario = require('../../models/usuario');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // Importa jsonwebtoken

jest.setTimeout(30000); // Aumenta el tiempo límite


jest.setTimeout(30000);

describe('Rutas de autenticación', () => {
    beforeAll(async () => {
        const mongoURI = 'mongodb://127.0.0.1:27017/testdb';
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        await Usuario.deleteMany();
    });

    afterAll(async () => {
        await Usuario.deleteMany();
        await mongoose.connection.close();
    });

    it('Debe registrar un usuario con éxito', async () => {
        const res = await request(app).post('/auth/register').send({
            nombre: 'Usuario Test',
            email: 'test@example.com',
            password: '123456',
            role: 'standard',
        });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('message', 'Usuario registrado con éxito.');
    });

    it('Debe devolver error al registrar con un email existente', async () => {
        await Usuario.create({
            nombre: 'Usuario Test',
            email: 'duplicado@example.com',
            password: '123456',
            role: 'standard',
        });

        const res = await request(app).post('/auth/register').send({
            nombre: 'Usuario Test 2',
            email: 'duplicado@example.com',
            password: '654321',
        });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message', 'El usuario ya existe.');
    });

    it('Debe iniciar sesión correctamente con credenciales válidas', async () => {
        await Usuario.create({
            nombre: 'Usuario Test',
            email: 'login@example.com',
            password: '123456',
            role: 'standard',
        });

        const res = await request(app).post('/auth/login').send({
            email: 'login@example.com',
            password: '123456',
        });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('Debe devolver error con credenciales inválidas', async () => {
        const res = await request(app).post('/auth/login').send({
            email: 'invalido@example.com',
            password: 'wrongpassword',
        });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message', 'Credenciales incorrectas.');
    });

    it('Debe conceder acceso a administradores', async () => {
        const usuario = await Usuario.create({
            nombre: 'Admin User',
            email: 'admin@example.com',
            password: '123456',
            role: 'admin',
        });

        const token = jwt.sign({ id: usuario._id, role: usuario.role }, 'valentina', { expiresIn: '1h' });

        const res = await request(app).get('/auth/admin').set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Acceso concedido a administrador.');
    });

    it('Debe bloquear acceso a usuarios no administradores', async () => {
        const usuario = await Usuario.create({
            nombre: 'Usuario Test',
            email: 'user@example.com',
            password: '123456',
            role: 'standard',
        });

        const token = jwt.sign({ id: usuario._id, role: usuario.role }, 'valentina', { expiresIn: '1h' });

        const res = await request(app).get('/auth/admin').set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty('message', 'Acceso denegado. Se requiere rol de administrador.');
    });
});
