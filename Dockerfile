FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/
COPY docs/openapi.yaml ./docs/openapi.yaml

EXPOSE 3000

CMD ["node", "src/server.js"]
