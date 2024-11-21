const request = require('supertest');
const app = require('../index');

describe('Archivo principal (index.js)', () => {
    it('Debe responder a la ruta raíz con un mensaje', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Servidor funcionando correctamente');
    });

    it('Debe manejar solicitudes preflight correctamente', async () => {
        const res = await request(app).options('/');
        expect(res.status).toBe(204);
    });

    it('Debe bloquear solicitudes desde un origen no permitido', async () => {
        const res = await request(app).get('/').set('Origin', 'http://origen-no-permitido.com');
        expect(res.status).toBe(403);
        expect(res.body).toHaveProperty('message', 'No permitido por CORS');
    });
});
