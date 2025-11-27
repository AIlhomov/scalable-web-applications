<script>
    import { onMount } from "svelte";
    import ExerciseForm from "./ExerciseForm.svelte";
    import { useUserState } from "../states/userState.svelte.js";

    export let exerciseId;

    let exercise = null;
    let loading = true;
    let error = null;
    const userState = useUserState();

    const serverUrl =
        typeof window !== "undefined"
            ? window.location.origin || "http://localhost:8000"
            : "http://localhost:8000";

    onMount(async () => {
        try {
            const response = await fetch(
                `${serverUrl}/api/exercises/${exerciseId}`,
            );
            if (response.ok) {
                exercise = await response.json();
            } else {
                error = "Failed to load exercise";
            }
        } catch (err) {
            console.error("Error fetching exercise:", err);
            error = err.message;
        } finally {
            loading = false;
        }
    });
</script>

{#if loading}
    <p>Loading exercise...</p>
{:else if error}
    <p>Error: {error}</p>
{:else if exercise}
    <h1>{exercise.title}</h1>
    <p>{exercise.description}</p>
    {#if userState.loading}
        <p>Loading user information...</p>
    {:else if userState.email}
        <ExerciseForm {exerciseId} />
    {:else}
        <p>Login or register to complete exercises.</p>
    {/if}
{:else}
    <p>Exercise not found.</p>
{/if}

<style>
    h1 {
        color: #333;
    }
    p {
        line-height: 1.6;
    }
</style>
