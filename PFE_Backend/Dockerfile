# Utiliser une image Node.js officielle comme base
FROM node:18-alpine
# Définir le répertoire de travail
WORKDIR /app

COPY . .

# Installer les dépendances
RUN npm install


# Copier le reste du code source


# Exposer le port sur lequel l'application s'exécute
EXPOSE 8000

# Commande pour démarrer l'application en production
CMD ["npm", "start"] 