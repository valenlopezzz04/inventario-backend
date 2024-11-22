const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');

jest.mock('mongoose', () => ({
    connect: jest.fn(),
    Schema: jest.fn(),
    model: jest.fn(),
    set: jest.fn(),
    connection: {
        close: jest.fn(),
    },
}));

describe('Archivo principal (index.js)', () => {
    beforeAll(() => {
        process.env.NODE_ENV = 'test';
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('Debe responder a la ruta raíz con un mensaje', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Servidor funcionando correctamente');
    });

    it('Debe manejar solicitudes preflight correctamente', async () => {
        const res = await request(app).options('/auth');
        expect(res.status).toBe(204);
    });

    it('Debe bloquear solicitudes desde un origen no permitido', async () => {
        const res = await request(app).get('/').set('Origin', 'http://origen-no-permitido.com');
        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty('message', 'No permitido por CORS');
    });

    it('Debe permitir solicitudes sin origen', async () => {
        const res = await request(app).get('/').unset('Origin');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Servidor funcionando correctamente');
    });

    it('Debe devolver 404 para rutas no encontradas', async () => {
        const res = await request(app).get('/ruta-inexistente');
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'Ruta no encontrada');
    });

    it('Debe manejar JSON mal formado y devolver 400', async () => {
        const res = await request(app)
            .post('/auth')
            .set('Content-Type', 'application/json')
            .send('{ "campo": valor }'); // JSON malformado
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message', 'Error en el formato del JSON');
    });

    it('Debe manejar un error global en el middleware', async () => {
        const res = await request(app).get('/ruta-error');
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('message', 'Error global de prueba');
    });

    it('Debe manejar errores genéricos', async () => {
        app.get('/ruta-error-gen', (req, res, next) => {
            const error = new Error('Error genérico de prueba');
            error.status = 500;
            next(error);
        });

        const res = await request(app).get('/ruta-error-gen');
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('message', 'Error genérico de prueba');
    });

    it('Debe manejar errores al conectar con MongoDB', async () => {
        const logSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        mongoose.connect.mockImplementationOnce(() =>
            Promise.reject(new Error('Error conectando a MongoDB'))
        );

        try {
            await mongoose.connect();
        } catch (e) {
            expect(logSpy).toHaveBeenCalledWith(
                'Error conectando a MongoDB:',
                expect.any(Error)
            );
        }

        logSpy.mockRestore();
    });

    it('Debe manejar la inicialización del servidor fuera del entorno de pruebas', () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const connectSpy = jest.spyOn(mongoose, 'connect').mockImplementation(() =>
            Promise.resolve()
        );

        process.env.NODE_ENV = 'production';
        jest.isolateModules(() => {
            require('../index');
        });

        expect(connectSpy).toHaveBeenCalled();
        expect(logSpy).toHaveBeenCalledWith(
            expect.stringContaining('Servidor corriendo en http://localhost:')
        );

        connectSpy.mockRestore();
        logSpy.mockRestore();
    });
});
