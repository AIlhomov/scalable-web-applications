FROM denoland/deno:alpine

WORKDIR /app

COPY package.json .

RUN DENO_FUTURE=1 deno install --allow-scripts

COPY . .

CMD [ "task", "dev", "--host" ]
