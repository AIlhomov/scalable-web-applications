FROM denoland/deno:alpine-2.0.2

WORKDIR /app

RUN apk add --no-cache nodejs npm

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

EXPOSE 4321

CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-env", "./dist/server/entry.mjs"]
