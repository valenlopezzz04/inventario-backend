const EventEmitter = require('events');
const Notificacion = require('./models/Notificacion');
const Orden = require('./models/orden'); // Importamos el modelo de Orden
const Auditoria = require('./models/Auditoria');
const { sendToQueue } = require('./rabbitmq'); // RabbitMQ, si está configurado

const eventEmitter = new EventEmitter();

// Evento para manejar "stockInsuficiente"
eventEmitter.on('stockInsuficiente', async (data) => {
    console.log('Evento recibido: stock insuficiente');
    console.log('Detalles del producto:', data);

    try {
        // Crear una nueva notificación
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

        // Registrar en auditoría
        const auditoria = new Auditoria({
            tipoEvento: 'stockInsuficiente',
            detalles: data,
        });
        await auditoria.save();
        console.log('Evento registrado en auditoría:', auditoria);

        // Verificar si el producto tiene habilitada la reposición automática
        if (data.habilitar_reposicion) {
            // Crear una orden de reposición automática
            const orden = new Orden({
                productoId: data.producto_id,
                nombre_producto: data.nombre_producto,
                cantidad_reponer: data.nivel_minimo * 2, // Por ejemplo, reponer el doble del nivel mínimo
            });
            await orden.save();
            console.log('Orden de reposición generada automáticamente:', orden);
        }

        // Opcional: Enviar mensaje a RabbitMQ
        if (sendToQueue) {
            await sendToQueue('stockInsuficiente', JSON.stringify(data));
            console.log('Mensaje enviado a la cola "stockInsuficiente" en RabbitMQ:', data);
        }
    } catch (error) {
        console.error('Error al procesar el evento stockInsuficiente:', error);
    }
});

module.exports = eventEmitter;
