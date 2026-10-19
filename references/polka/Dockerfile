# Build UI + prune devDependencies for runtime
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/
COPY packages/ui/package.json packages/ui/
COPY packages/config/package.json packages/config/
COPY packages/generator/package.json packages/generator/
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app /app
RUN mkdir -p /var/cache/polka-stock
EXPOSE 4700
CMD ["node", "apps/server/index.js"]
