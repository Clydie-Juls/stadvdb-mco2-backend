FROM node

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm cache clean --force && npm ci

COPY --chown=node:node ./ ./

RUN chown -R node:node /app

USER node

RUN npm run build

CMD ["node", "dist/main.js"]
