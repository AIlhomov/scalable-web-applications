import { Hono } from "@hono/hono";
import { cors } from "@hono/hono/cors";
import { logger } from "@hono/hono/logger";
import postgres from "postgres";

const app = new Hono();

// Initialize database connection using environment variables
const sql = postgres({
    host: Deno.env.get("PGHOST"),
    port: Deno.env.get("PGPORT"),
    database: Deno.env.get("PGDATABASE"),
    username: Deno.env.get("PGUSER"),
    password: Deno.env.get("PGPASSWORD"),
});

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

export default app;