# Étape de build
FROM node:18-alpine as build

# Définir le répertoire de travail
WORKDIR /app

COPY . .


# Installer les dépendances
RUN npm install
RUN npm run build

FROM nginx:latest
# Copier les fichiers de build dans le répertoire de nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copier la configuration nginx personnalisée si nécessaire
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 5173

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
