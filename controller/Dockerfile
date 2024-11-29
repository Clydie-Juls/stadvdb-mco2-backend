# Use the Node.js Alpine image
FROM node

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first for caching dependencies
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm cache clean --force && npm ci

# Copy the rest of the application code
COPY --chown=node:node ./ ./

RUN chown -R node:node /app

# Specify the default user
USER node

# Build the application
RUN npm run build

CMD ["node", "dist/main.js"]
