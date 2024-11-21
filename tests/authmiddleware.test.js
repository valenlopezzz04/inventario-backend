const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { authMiddleware, verificarRol } = require('../middlewares/authMiddleware');

const app = express();
const JWT_SECRET = 'valentina'; // Asegúrate de usar el mismo secreto que en tu middleware

// Configuración de la aplicación para pruebas
app.use(express.json());
app.get('/protected', authMiddleware, (req, res) => {
    res.status(200).json({ message: 'Acceso permitido' });
});
app.get('/admin', authMiddleware, verificarRol(['admin']), (req, res) => {
    res.status(200).json({ message: 'Acceso permitido para admin' });
});

describe('authMiddleware', () => {
    it('Debe devolver un error 401 si no se proporciona el token', async () => {
        const response = await request(app).get('/protected');
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Token no proporcionado');
    });

    it('Debe devolver un error 401 si el token es inválido', async () => {
        const response = await request(app)
            .get('/protected')
            .set('Authorization', 'Bearer token_invalido');
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Token inválido');
    });

    it('Debe permitir el acceso si el token es válido', async () => {
        const token = jwt.sign({ id: 1, role: 'user' }, JWT_SECRET);
        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Acceso permitido');
    });
});

describe('verificarRol', () => {
    it('Debe devolver un error 403 si el rol del usuario no está permitido', async () => {
        const token = jwt.sign({ id: 1, role: 'user' }, JWT_SECRET);
        const response = await request(app)
            .get('/admin')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(403);
        expect(response.body.message).toBe(
            'No tienes permiso para realizar esta acción'
        );
    });

    it('Debe permitir el acceso si el rol del usuario está permitido', async () => {
        const token = jwt.sign({ id: 1, role: 'admin' }, JWT_SECRET);
        const response = await request(app)
            .get('/admin')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Acceso permitido para admin');
    });
});
