FROM node:24 AS build

WORKDIR /src

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build


FROM node:24 AS production-deps

WORKDIR /src

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true && yarn cache clean


FROM node:24 AS runtime

ENV NODE_ENV=production
WORKDIR /src

COPY --from=production-deps --chown=node:node \
    /src/node_modules ./node_modules

COPY --from=build --chown=node:node /src/dist ./dist
COPY --from=build --chown=node:node /src/package.json ./

USER node

CMD ["node", "dist/worker.js"]