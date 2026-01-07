# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.14.0
ARG PNPM_VERSION=10.27.0

FROM node:${NODE_VERSION}-alpine AS base
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}

FROM base AS builder
WORKDIR /api
COPY package*.json pnpm-lock.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build 

FROM base AS prod
WORKDIR /api
COPY package*.json ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile

COPY --from=builder /api/dist ./dist

RUN chown -R node:node /api
USER node

EXPOSE 3030
CMD ["node", "dist/server.js"]
