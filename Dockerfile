# Usa una imagen base de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia el package.json y el package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install --legacy-peer-deps

# Copia el resto de la aplicación
COPY . .

# Set NODE_ENV to production
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Expone el puerto en el que la aplicación correrá
EXPOSE 3000

# Comando para correr la aplicación
CMD ["npm", "start"]