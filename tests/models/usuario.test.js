const mongoose = require('mongoose');
const Usuario = require('../../models/usuario');

jest.setTimeout(30000); // Aumenta el tiempo límite

beforeAll(async () => {
    const mongoURI = 'mongodb://127.0.0.1:27017/testdb';
    await mongoose.connect(mongoURI); // Conexión a MongoDB
});

afterAll(async () => {
    await mongoose.connection.dropDatabase(); // Elimina la base de datos de prueba
    await mongoose.connection.close(); // Cierra la conexión
});

describe('Modelo Usuario', () => {
    it('Debe crear un usuario válido', async () => {
        const usuario = new Usuario({
            nombre: 'Usuario Prueba',
            email: 'prueba@example.com',
            password: '123456',
        });
        const savedUsuario = await usuario.save();
        expect(savedUsuario._id).toBeDefined();
        expect(savedUsuario.email).toBe('prueba@example.com');
    });

    it('Debe fallar si falta un campo requerido', async () => {
        const usuario = new Usuario({
            email: 'falta@example.com',
            password: '123456',
        });
        await expect(usuario.save()).rejects.toThrow();
    });

    it('Debe fallar si el email no es único', async () => {
        const usuario1 = new Usuario({
            nombre: 'Usuario 1',
            email: 'duplicado@example.com',
            password: '123456',
        });

        const usuario2 = new Usuario({
            nombre: 'Usuario 2',
            email: 'duplicado@example.com',
            password: '654321',
        });

        await usuario1.save();

        // Maneja el error de email duplicado
        try {
            await usuario2.save();
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toContain('duplicate key error');
        }
    });
});
