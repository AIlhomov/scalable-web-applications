import { Hono } from "@hono/hono";
import { cors } from "@hono/hono/cors";
import { logger } from "@hono/hono/logger";
import postgres from "postgres";
import { Redis } from "ioredis";
import { auth } from "./auth.js";

const REPLICA_ID = crypto.randomUUID();
const app = new Hono();
const sql = postgres();
const redis = new Redis(6379, "redis");

const redisProducer = new Redis(6379, "redis");
const QUEUE_NAME = "users";

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

app.use("*", async (c, next) => {
    c.res.headers.set("X-Replica-Id", REPLICA_ID);
    await next();
});

app.use("/*", cors());
app.use("/*", logger());

app.get("/", (c) => c.json({ message: "Hello world!" }));

app.post("/users", async (c) => {
    const { name } = await c.req.json();
    await redisProducer.lpush(QUEUE_NAME, JSON.stringify({ name }));
    c.status(202);
    return c.body("Accepted");
});

app.get("/todos", async (c) => {
    const todos = await sql`SELECT * FROM todos`;
    return c.json(todos);
});

app.get("/redis-test", async (c) => {
    let count = await redis.get("test");
    if (!count) {
        count = 0;
    } else {
        count = Number(count);
    }

    count++;

    await redis.set("test", count);
    return c.json({ count });
});

app.get("/api", (c) => {
    return c.text("Hello new path!");
});

app.get("/api/lgtm-test", (c) => {
    console.log("Hello log collection :)");
    return c.json({ message: "Hello, world!" });
});


export default app;