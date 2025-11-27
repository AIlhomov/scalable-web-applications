import { Hono } from "@hono/hono";
import { cors } from "@hono/hono/cors";
import { logger } from "@hono/hono/logger";
import postgres from "postgres";
import { Redis } from "ioredis";
import { auth } from "./auth.js";


const app = new Hono();

// Initialize database connection using environment variables
const sql = postgres({
    host: Deno.env.get("PGHOST"),
    port: Deno.env.get("PGPORT"),
    database: Deno.env.get("PGDATABASE"),
    username: Deno.env.get("PGUSER"),
    password: Deno.env.get("PGPASSWORD"),
});

// Initialize Redis connection
let redis;
if (Deno.env.get("REDIS_HOST")) {
    redis = new Redis(
        Number.parseInt(Deno.env.get("REDIS_PORT")),
        Deno.env.get("REDIS_HOST"),
    );
} else {
    redis = new Redis(6379, "redis");
}

const ensureAuthenticated = async (c, next) => {
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
        asResponse: false,
    }).catch(() => null);

    if (!session?.session) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("session", session);
    await next();
};

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));
app.use("/api/exercises/:id/submissions", ensureAuthenticated);
app.use("/api/submissions/:id/status", ensureAuthenticated);

// Simple in-memory cache
const cache = new Map();

app.use("/*", cors());
app.use("/*", logger());

app.get("/", (c) => c.json({ message: "Hello world!" }));

app.get("/api/languages", async (c) => {
    const cacheKey = "languages";

    // Check cache
    if (cache.has(cacheKey)) {
        return c.json(cache.get(cacheKey));
    }

    // Fetch from database
    const languages = await sql`SELECT id, name FROM languages ORDER BY id`;

    // Store in cache
    cache.set(cacheKey, languages);

    return c.json(languages);
});

app.get("/api/languages/:id/exercises", async (c) => {
    const { id } = c.req.param();
    const cacheKey = `exercises_${id}`;

    // Check cache
    if (cache.has(cacheKey)) {
        return c.json(cache.get(cacheKey));
    }

    // Fetch from database, excluding language_id from response
    const exercises = await sql`
    SELECT id, title, description 
    FROM exercises 
    WHERE language_id = ${id}
    ORDER BY id
  `;

    // Store in cache
    cache.set(cacheKey, exercises);

    return c.json(exercises);
});

app.get("/api/exercises/:id", async (c) => {
    const { id } = c.req.param();

    // Fetch single exercise from database
    const result = await sql`
        SELECT id, title, description 
        FROM exercises 
        WHERE id = ${id}
    `;

    if (result.length === 0) {
        return c.body("", 404);
    }

    return c.json(result[0]);
});

app.get("/api/submissions/:id/status", async (c) => {
    const { id } = c.req.param();

    // Fetch submission status from database (no caching)
    const result = await sql`
        SELECT grading_status, grade 
        FROM exercise_submissions 
        WHERE id = ${id}
    `;

    if (result.length === 0) {
        return c.body("", 404);
    }

    return c.json(result[0]);
});

app.post("/api/exercises/:id/submissions", async (c) => {
    const { id } = c.req.param();
    const { source_code } = await c.req.json();

    // Insert submission into database
    const result = await sql`
        INSERT INTO exercise_submissions (exercise_id, source_code)
        VALUES (${id}, ${source_code})
        RETURNING id
    `;

    const submissionId = result[0].id;

    // Add submission ID to Redis queue
    await redis.lpush("submissions", submissionId.toString());

    return c.json({ id: submissionId });
});

export default app;
