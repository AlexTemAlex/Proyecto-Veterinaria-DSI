# Build stage
FROM node:20-alpine AS build

WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./

ENV VITE_API_URL=https://api.petsi-dsi.website

RUN npm run build

# Serve stage
FROM nginx:alpine

# Copiamos build de React al directorio de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos configuración personalizada de Nginx
COPY infraestructure/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
