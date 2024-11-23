const Notificacion = require('./models/Notificacion'); // Importa el modelo de notificación

eventEmitter.on('stockInsuficiente', async (data) => {
    console.log('Evento recibido: stock insuficiente');
    console.log('Detalles del producto:', data);

    try {
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
    } catch (error) {
        console.error('Error al guardar la notificación:', error);
    }
});
