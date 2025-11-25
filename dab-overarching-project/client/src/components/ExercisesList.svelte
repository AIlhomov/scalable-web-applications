<script>
    import { onMount } from "svelte";

    export let languageId;

    let exercises = [];
    let loading = true;
    let error = null;

    const serverUrl =
        typeof window !== "undefined"
            ? window.location.origin || "http://localhost:8000"
            : "http://localhost:8000";

    onMount(async () => {
        try {
            const response = await fetch(
                `${serverUrl}/api/languages/${languageId}/exercises`,
            );
            if (response.ok) {
                exercises = await response.json();
            } else {
                error = "Failed to load exercises";
            }
        } catch (err) {
            console.error("Error fetching exercises:", err);
            error = err.message;
        } finally {
            loading = false;
        }
    });
</script>

<h1>Available exercises</h1>

{#if loading}
    <p>Loading exercises...</p>
{:else if error}
    <p>Error: {error}</p>
{:else}
    <ul>
        {#each exercises as exercise}
            <li>
                <a href={`/exercises/${exercise.id}`}>{exercise.title}</a>
            </li>
        {/each}
    </ul>
{/if}

<style>
    h1 {
        color: #333;
    }
    ul {
        list-style-type: none;
        padding: 0;
    }
    li {
        margin: 10px 0;
    }
    a {
        color: #0066cc;
        text-decoration: none;
        font-size: 18px;
    }
    a:hover {
        text-decoration: underline;
    }
</style>
