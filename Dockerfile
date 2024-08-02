FROM node:22.5 AS base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

FROM base AS build
WORKDIR /usr/src/app
RUN npm run build

FROM node:22.5-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /usr/src/app/dist dist
CMD ["npm", "run", "start:prod"]
