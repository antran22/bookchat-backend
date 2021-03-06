# Build stage
FROM node:14-alpine AS builder
RUN apk add --no-cache alpine-sdk python3
WORKDIR /usr/app/
COPY *.json ./
RUN npm ci
COPY src src/
RUN npm run build

# Run stage
FROM node:14-alpine
ENV NODE_ENV=production

RUN apk add --no-cache tini alpine-sdk python3
WORKDIR /usr/app/
RUN chown node:node .

USER node
COPY package.json package-lock.json ./
RUN npm ci --production
COPY --from=builder /usr/app/dist/ dist/

RUN mkdir _uploads
RUN chown node:node _uploads

COPY public /usr/app/public

EXPOSE 3000
ENTRYPOINT [ "/sbin/tini","--", "node", "dist/app.js" ]
