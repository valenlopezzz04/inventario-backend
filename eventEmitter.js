const EventEmitter = require('events');
const Notificacion = require('./models/Notificacion'); // Importa el modelo de notificación
const Auditoria = require('./models/Auditoria'); // Importa el modelo de auditoría
const { sendToQueue } = require('./rabbitmq'); // RabbitMQ, si está configurado

// Instancia del EventEmitter
const eventEmitter = new EventEmitter();

// Evento para manejar "stockInsuficiente"
eventEmitter.on('stockInsuficiente', async (data) => {
    console.log('Evento recibido: stock insuficiente');
    console.log('Detalles del producto:', data);

    try {
        // Crear una nueva notificación en la base de datos
        const notificacion = new Notificacion({
            productoId: data.producto_id,
            nombre_producto: data.nombre_producto,
            cantidad: data.cantidad,
            ubicacion_almacen: data.ubicacion_almacen,
            stockMinimo: data.nivel_minimo,
            fecha: data.fecha || new Date(),
        });

        await notificacion.save();
        console.log('Notificación guardada correctamente:', notificacion);

        // Registrar el evento en el sistema de auditoría
        const auditoria = new Auditoria({
            tipoEvento: 'stockInsuficiente',
            detalles: data,
        });

        await auditoria.save();
        console.log('Evento registrado en el sistema de auditoría:', auditoria);

        // Opcional: Enviar la notificación a una cola de RabbitMQ
        if (sendToQueue) {
            await sendToQueue('stockInsuficiente', JSON.stringify(data));
            console.log('Mensaje enviado a la cola "stockInsuficiente" en RabbitMQ:', data);
        }
    } catch (error) {
        console.error('Error al procesar el evento stockInsuficiente:', error);
    }
});

module.exports = eventEmitter;
