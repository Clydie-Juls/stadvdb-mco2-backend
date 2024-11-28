FROM node:alpine
COPY --chown=node:node ./ ./
RUN npm ci
CMD [ "npm", "run", "build" ]
