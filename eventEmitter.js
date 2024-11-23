const EventEmitter = require('events');
const Notificacion = require('./models/Notificacion');
const Orden = require('./models/Orden'); // Modelo de orden
const { sendToQueue } = require('./rabbitmq');

// Instancia del EventEmitter
const eventEmitter = new EventEmitter();

// Evento para manejar "stockInsuficiente"
eventEmitter.on('stockInsuficiente', async (data) => {
    console.log('Evento recibido: stock insuficiente');
    console.log('Detalles del producto:', data);

    try {
        // Crear una notificación
        const notificacion = new Notificacion({
            productoId: data.producto_id,
            nombre_producto: data.nombre_producto,
            cantidad: data.cantidad,
            ubicacion_almacen: data.ubicacion_almacen,
            stockMinimo: data.nivel_minimo,
            fecha: new Date(),
        });

        await notificacion.save();
        console.log('Notificación guardada correctamente:', notificacion);

        // Crear una orden de reposición si está habilitada
        if (data.habilitarReposicion) {
            const nuevaOrden = new Orden({
                productoId: data.producto_id,
                nombre_producto: data.nombre_producto,
                cantidad_actual: data.cantidad,
                cantidad_reposicion: data.cantidad_reposicion,
                estado: 'Pendiente',
                fecha: new Date(),
            });

            await nuevaOrden.save();
            console.log('Orden de reposición creada:', nuevaOrden);
        }

        // Opcional: Enviar datos a RabbitMQ
        if (sendToQueue) {
            await sendToQueue('stockInsuficiente', JSON.stringify(data));
            console.log('Mensaje enviado a RabbitMQ:', data);
        }
    } catch (error) {
        console.error('Error al procesar el evento stockInsuficiente:', error);
    }
});

module.exports = eventEmitter;
