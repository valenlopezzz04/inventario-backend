const mongoose = require('mongoose');

const uri = "mongodb+srv://valejalopez444:valentina@gestioninventario.o72zu.mongodb.net/inventario?retryWrites=true&w=majority&appName=GestionInventario";

mongoose.connect(uri)
  .then(() => console.log("Conectado a MongoDB Atlas"))
  .catch(error => console.error("Error conectando a MongoDB:", error));
