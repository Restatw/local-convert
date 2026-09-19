# syntax=docker/dockerfile:1

# ---- deps: install once, shared by dev and build ----
FROM node:24-alpine AS deps
ENV NUXT_TELEMETRY_DISABLED=1
WORKDIR /app
RUN chown node:node /app
USER node
COPY --chown=node:node package.json package-lock.json .npmrc ./
COPY --chown=node:node scripts ./scripts
RUN npm ci

# ---- dev: hot-reload server (used by docker compose --profile dev) ----
FROM deps AS dev
COPY --chown=node:node . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]

# ---- build: static site (nuxt generate) ----
FROM deps AS build
COPY --chown=node:node . .
RUN npm run generate

# ---- prod: nginx serves the static output ----
FROM nginx:alpine AS prod
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/.output/public /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
