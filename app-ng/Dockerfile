# syntax=docker/dockerfile:1

# ---- Build stage: produce the Angular browser bundle (Node 22, matches CI) ----
FROM node:22 AS build
WORKDIR /app

# Install deps from the lockfile first (better layer caching).
COPY package.json package-lock.json ./
RUN npm ci

# Build the production bundle -> dist/app-ng/browser.
COPY . .
RUN npm run build

# ---- Run stage: nginx serving the SPA + proxying /api to the backend ----
FROM nginx:alpine AS run

# SPA fallback + /api reverse proxy (see nginx.conf).
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/app-ng/browser /usr/share/nginx/html

EXPOSE 80
