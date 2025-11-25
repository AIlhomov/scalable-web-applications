<script>
    import { onMount } from "svelte";

    let languages = [];
    let loading = true;
    let error = null;

    const serverUrl =
        typeof window !== "undefined"
            ? window.location.origin || "http://localhost:8000"
            : "http://localhost:8000";

    onMount(async () => {
        try {
            const response = await fetch(`${serverUrl}/api/languages`);
            if (response.ok) {
                languages = await response.json();
            } else {
                error = "Failed to load languages";
            }
        } catch (err) {
            console.error("Error fetching languages:", err);
            error = err.message;
        } finally {
            loading = false;
        }
    });
</script>

<h1>Available languages</h1>

{#if loading}
    <p>Loading languages...</p>
{:else if error}
    <p>Error: {error}</p>
{:else}
    <ul>
        {#each languages as language}
            <li>
                <a href={`/languages/${language.id}`}>{language.name}</a>
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
