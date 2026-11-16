FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY ui/package.json ui/package-lock.json ./ui/
RUN npm ci && npm ci --prefix ui
COPY tsconfig.json ./
COPY src ./src
COPY ui ./ui
RUN npm run build

FROM node:22-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
USER node
EXPOSE 8080
CMD ["node", "dist/server.js"]
