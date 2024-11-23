const EventEmitter = require('events');
const { sendToQueue } = require('./rabbitmq'); // Asegúrate de que la ruta sea correcta

// Crear una instancia de EventEmitter
const eventEmitter = new EventEmitter();

// Escuchar el evento `stockInsuficiente`
eventEmitter.on('stockInsuficiente', async (data) => {
    try {
        console.log('Evento recibido: stock insuficiente');
        console.log('Detalles del producto:', data);

        // Envía un mensaje a RabbitMQ
        await sendToQueue('stockInsuficiente', JSON.stringify(data));
        console.log('Mensaje enviado a RabbitMQ con éxito.');
    } catch (error) {
        console.error('Error al enviar el mensaje a RabbitMQ:', error);
    }
});

module.exports = eventEmitter;
