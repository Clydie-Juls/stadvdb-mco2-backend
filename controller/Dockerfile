FROM node:20-alpine
WORKDIR /app
COPY --chown=node:node src/ ./
COPY --chown=node:node .env ./
RUN npm ci
CMD [ "node", "index.js" ]
