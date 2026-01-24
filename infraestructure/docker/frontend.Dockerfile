# Build stage
FROM node:20-alpine AS build

WORKDIR /app
COPY frontend/prueba/mi-app/package*.json ./
RUN npm install
COPY frontend/prueba/mi-app/ ./
RUN npm run build

# Serve stage
FROM nginx:alpine

# Copiamos build de React al directorio de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copiamos configuración personalizada de Nginx
COPY infraestructure/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
