const EventEmitter = require('events');
const Notificacion = require('./models/Notificacion');
const { sendToQueue } = require('./rabbitmq');

const eventEmitter = new EventEmitter();

eventEmitter.on('stockInsuficiente', async (data) => {
    console.log('Evento recibido: stock insuficiente');
    console.log('Detalles del producto:', data);

    try {
        // Enviar mensaje a RabbitMQ
        await sendToQueue('stockInsuficiente', JSON.stringify(data));
        console.log('Mensaje enviado a RabbitMQ con éxito.');

        // Guardar notificación en la base de datos
        const notificacion = new Notificacion({
            productoId: data.productoId,
            nombre_producto: data.nombre_producto,
            cantidad: data.cantidad,
            ubicacion_almacen: data.ubicacion_almacen,
            stockMinimo: data.stockMinimo,
            fecha: new Date(),
            leida: false,
        });

        await notificacion.save();
        console.log('Notificación guardada con éxito:', notificacion);
    } catch (error) {
        console.error('Error al procesar el evento stockInsuficiente:', error);
    }
});

module.exports = eventEmitter;
