const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../index');
const Usuario = require('../../models/usuario');

jest.setTimeout(30000);

// Define JWT_SECRET directamente aquí
const JWT_SECRET = 'valentina';

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

    describe('Registro de usuario', () => {
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
                nombre: 'Usuario Existente',
                email: 'duplicado@example.com',
                password: '123456',
                role: 'standard',
            });

            const res = await request(app).post('/auth/register').send({
                nombre: 'Usuario Nuevo',
                email: 'duplicado@example.com',
                password: '654321',
            });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'El usuario ya existe.');
        });

        it('Debe devolver error si hay un problema interno al registrar', async () => {
            jest.spyOn(Usuario.prototype, 'save').mockImplementationOnce(() => {
                throw new Error('Error interno');
            });

            const res = await request(app).post('/auth/register').send({
                nombre: 'Usuario Error',
                email: 'error@example.com',
                password: '123456',
                role: 'standard',
            });

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message', 'Error interno');
        });

        it('Debe devolver error con datos inválidos', async () => {
            const res = await request(app).post('/auth/register').send({
                nombre: '',
                email: 'no-email',
                password: '12',
            });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ msg: 'El nombre es obligatorio.' }),
                    expect.objectContaining({ msg: 'Debe ser un email válido.' }),
                    expect.objectContaining({ msg: 'La contraseña debe tener al menos 6 caracteres.' }),
                ])
            );
        });
    });

    describe('Inicio de sesión', () => {
        beforeAll(async () => {
            await Usuario.create({
                nombre: 'Usuario Login',
                email: 'login@example.com',
                password: '123456',
                role: 'standard',
            });
        });

        it('Debe iniciar sesión correctamente con credenciales válidas', async () => {
            const res = await request(app).post('/auth/login').send({
                email: 'login@example.com',
                password: '123456',
            });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
        });

        it('Debe devolver error con credenciales inválidas', async () => {
            const res = await request(app).post('/auth/login').send({
                email: 'inexistente@example.com',
                password: 'wrongpassword',
            });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'Credenciales incorrectas.');
        });

        it('Debe devolver error con datos inválidos', async () => {
            const res = await request(app).post('/auth/login').send({
                email: 'no-email',
                password: '',
            });
        
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
        
            expect(res.body.errors).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        location: 'body',
                        msg: 'Debe ser un email válido.',
                        path: 'email',
                        value: 'no-email',
                    }),
                    expect.objectContaining({
                        location: 'body',
                        msg: 'La contraseña es obligatoria.',
                        path: 'password',
                        value: '',
                    }),
                ])
            );
        });
        
        

        it('Debe devolver error si hay un problema interno al iniciar sesión', async () => {
            jest.spyOn(Usuario, 'findOne').mockImplementationOnce(() => {
                throw new Error('Error interno');
            });

            const res = await request(app).post('/auth/login').send({
                email: 'error@example.com',
                password: '123456',
            });

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty('message', 'Error interno');
        });
    });

    describe('Rutas protegidas', () => {
        let adminToken;
        let userToken;

        beforeAll(async () => {
            const admin = await Usuario.create({
                nombre: 'Admin',
                email: 'admin@example.com',
                password: '123456',
                role: 'admin',
            });

            const user = await Usuario.create({
                nombre: 'Usuario',
                email: 'user@example.com',
                password: '123456',
                role: 'standard',
            });

            adminToken = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });
            userToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        });

        it('Debe conceder acceso a administradores', async () => {
            const res = await request(app).get('/auth/admin').set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message', 'Acceso concedido a administrador.');
        });

        it('Debe bloquear acceso a usuarios no administradores', async () => {
            const res = await request(app).get('/auth/admin').set('Authorization', `Bearer ${userToken}`);
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', 'Acceso denegado. Se requiere rol de administrador.');
        });

        it('Debe devolver error si no se proporciona token', async () => {
            const res = await request(app).get('/auth/admin');
            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Token no proporcionado.');
        });

        it('Debe devolver error si el token es inválido', async () => {
            const res = await request(app).get('/auth/admin').set('Authorization', 'Bearer token_invalido');
            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('message', 'Token no válido.');
        });
    });
});

