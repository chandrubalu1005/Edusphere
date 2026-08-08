FROM node:18-alpine AS builder
WORKDIR /app
# canvas requires build tools: python3, make, g++, and system libs
RUN apk add --no-cache python3 make g++ cairo-dev pango-dev pixman-dev jpeg-dev giflib-dev librsvg-dev
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache cairo pango pixman jpeg giflib librsvg
COPY package*.json ./
RUN apk add --no-cache python3 make g++ cairo-dev pango-dev pixman-dev jpeg-dev giflib-dev librsvg-dev \
    && npm install --omit=dev \
    && apk del python3 make g++ cairo-dev pango-dev pixman-dev jpeg-dev giflib-dev librsvg-dev
COPY --from=builder /app/dist ./dist
RUN mkdir -p uploads/certificates
EXPOSE 3007
CMD ["node", "dist/server.js"]
