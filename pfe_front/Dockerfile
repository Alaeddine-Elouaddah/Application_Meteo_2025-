# Étape de build
FROM node:18-alpine as build

# Définir le répertoire de travail
WORKDIR /app

COPY . .


# Installer les dépendances
RUN npm install

# Exposer le port 80
EXPOSE 5173

# Démarrer nginx
CMD ["npm", "run", "dev"]