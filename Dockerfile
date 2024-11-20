# Usar una imagen base oficial de Node.js
FROM node:16

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos necesarios para instalar las dependencias
COPY package*.json ./

# Instalar las dependencias del proyecto
RUN npm install

# Copiar el resto de los archivos del proyecto al contenedor
COPY . .

# Exponer el puerto que utiliza tu backend
EXPOSE 3001

# Comando para iniciar el servidor
CMD ["node", "index.js"]
