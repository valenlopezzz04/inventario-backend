const EventEmitter = require('events');
const { sendToQueue } = require('./rabbitmq'); // Asegúrate de que la ruta sea correcta

const Notificacion = require('./models/Notificacion'); // Importar el modelo

const eventEmitter = new EventEmitter();

eventEmitter.on('stockInsuficiente', async (data) => {
    console.log('Evento recibido: stock insuficiente');
    console.log('Detalles del producto:', data);

    // Crear un mensaje de notificación
    const mensaje = `El producto "${data.nombre_producto}" tiene un stock bajo de ${data.cantidad} unidades. Ubicación: ${data.ubicacion_almacen}.`;

    // Guardar la notificación en MongoDB
    try {
        const notificacion = new Notificacion({
            mensaje,
            producto: data.nombre_producto,
            cantidad: data.cantidad,
            fecha: new Date(), // Fecha y hora actual
            nivel_minimo: data.nivel_minimo || 5, // Nivel mínimo de stock
            ubicacion_almacen: data.ubicacion_almacen, // Ubicación del almacén
            producto_id: data.producto_id, // Identificador del producto
        });
        await notificacion.save();
        console.log('Notificación guardada:', notificacion);
    } catch (error) {
        console.error('Error al guardar la notificación:', error);
    }
});

module.exports = eventEmitter;
