import { Hono } from "@hono/hono";
import { cors } from "@hono/hono/cors";
import { logger } from "@hono/hono/logger";
import postgres from "postgres";
import { Redis } from "ioredis";
import { levenshteinDistance } from "./grader-utils.js";

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

const QUEUE_NAME = "submissions";
let consumeEnabled = false;
let isGrading = false;

// Function to sleep for a given number of milliseconds
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Random number generator
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Grading consumer function
const startConsuming = async () => {
    if (isGrading) {
        return; // Already grading
    }

    isGrading = true;

    while (consumeEnabled) {
        // Check queue length
        const queueSize = await redis.llen(QUEUE_NAME);

        if (queueSize === 0) {
            // No items in queue, sleep for 250ms
            await sleep(250);
            continue;
        }

        // Get an item from the queue
        const submissionId = await redis.rpop(QUEUE_NAME);

        if (!submissionId) {
            // No item retrieved, continue
            await sleep(250);
            continue;
        }

        // Start grading
        try {
            // Update status to "processing"
            await sql`
                UPDATE exercise_submissions 
                SET grading_status = 'processing' 
                WHERE id = ${submissionId}
            `;

            // Sleep for random time between 1 and 3 seconds
            const gradeTime = randomInt(1000, 3000);
            await sleep(gradeTime);

            // Fetch the submission and the solution code
            const submissionResult = await sql`
                SELECT es.source_code, e.solution_code
                FROM exercise_submissions es
                JOIN exercises e ON es.exercise_id = e.id
                WHERE es.id = ${submissionId}
            `;

            if (submissionResult.length === 0) {
                console.error(`Submission ${submissionId} not found`);
                continue;
            }

            const submission = submissionResult[0].source_code;
            const solution = submissionResult[0].solution_code;

            // Calculate grade based on Levenshtein distance
            const distance = levenshteinDistance(submission, solution);
            const maxLength = Math.max(submission.length, solution.length);
            const grade = Math.ceil(100 * (1 - (distance / maxLength)));

            // Update status to "graded" and set grade
            await sql`
                UPDATE exercise_submissions 
                SET grading_status = 'graded', grade = ${grade} 
                WHERE id = ${submissionId}
            `;

            console.log(`Graded submission ${submissionId} with grade ${grade}`);
        } catch (error) {
            console.error(`Error grading submission ${submissionId}:`, error);
        }
    }

    isGrading = false;
};

app.use("/*", cors());
app.use("/*", logger());

// GET /api/status - Returns queue size and consume status
app.get("/api/status", async (c) => {
    const queueSize = await redis.llen(QUEUE_NAME);
    return c.json({
        queue_size: queueSize,
        consume_enabled: consumeEnabled,
    });
});

// POST /api/consume/enable - Enable consuming and start grading
app.post("/api/consume/enable", async (c) => {
    consumeEnabled = true;

    // Start consuming in the background
    startConsuming();

    return c.json({ consume_enabled: true });
});

// POST /api/consume/disable - Disable consuming
app.post("/api/consume/disable", (c) => {
    consumeEnabled = false;
    return c.json({ consume_enabled: false });
});

export default app;
