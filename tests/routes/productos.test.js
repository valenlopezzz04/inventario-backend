const mongoose = require('mongoose');
const Producto = require('../../models/Producto'); // Ajusta esta ruta según tu estructura de carpetas

beforeAll(async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/nombre_de_tu_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Conectado a MongoDB para tests');
    } catch (error) {
        console.error('Error al conectar con MongoDB:', error.message);
    }
});

afterAll(async () => {
    await mongoose.connection.close();
    console.log('Desconectado de MongoDB después de los tests');
});

describe('Test básico de Productos', () => {
    beforeEach(async () => {
        await Producto.deleteMany({}); // Limpia la colección antes de cada test
    });

    it('Debe agregar y listar un producto', async () => {
        // Crear un producto
        const producto = new Producto({
            nombre_producto: 'Producto Prueba',
            cantidad: 10,
            ubicacion_almacen: 'Estante A',
            estado: 'Nuevo',
            categoria: 'General',
        });
        const guardado = await producto.save();

        // Verificar que se haya guardado correctamente
        expect(guardado).toHaveProperty('_id');
        expect(guardado.nombre_producto).toBe('Producto Prueba');

        // Listar productos
        const productos = await Producto.find({});
        expect(productos.length).toBe(1);
        expect(productos[0].nombre_producto).toBe('Producto Prueba');
    });
});
