const EventEmitter = require('events');
const eventEmitter = new EventEmitter();

// Escucha el evento 'stockInsuficiente'
eventEmitter.on('stockInsuficiente', (data) => {
    console.log('Evento recibido: stock insuficiente');
    console.log('Detalles del producto:', data);
});

module.exports = eventEmitter;
