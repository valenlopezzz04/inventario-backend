const amqp = require('amqplib');

let channel, connection;

const connectToRabbitMQ = async () => {
    try {
        // Reemplaza por tu URL de RabbitMQ
        const rabbitmqURL = 'amqps://qqhgtlcx:55hDR_RFYQU7jaYqlCt2t1fUpdLo6iZP@jackal.rmq.cloudamqp.com/qqhgtlcx';
        connection = await amqp.connect(rabbitmqURL);
        channel = await connection.createChannel();
        console.log('Conexión a RabbitMQ exitosa');
    } catch (error) {
        console.error('Error conectando a RabbitMQ:', error);
        throw error;
    }
};

const sendToQueue = async (queue, message) => {
    try {
        if (!channel) {
            console.error('El canal de RabbitMQ no está configurado');
            return;
        }
        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(message));
        console.log(`Mensaje enviado a la cola "${queue}": ${message}`);
    } catch (error) {
        console.error('Error enviando mensaje a RabbitMQ:', error);
    }
};

const closeConnection = async () => {
    try {
        if (connection) {
            await connection.close();
            console.log('Conexión a RabbitMQ cerrada');
        }
    } catch (error) {
        console.error('Error cerrando conexión a RabbitMQ:', error);
    }
};

module.exports = {
    connectToRabbitMQ,
    sendToQueue,
    closeConnection,
};
