FROM node:24-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production 2>/dev/null || npm install --only=production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
