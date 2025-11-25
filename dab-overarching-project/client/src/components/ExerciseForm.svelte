<script>
    import { onDestroy } from "svelte";

    export let exerciseId = null;

    let code = "";
    let submitting = false;
    let submissionId = null;
    let submissionStatus = null;
    let error = null;

    async function handleSubmit() {
        submitting = true;
        error = null;
        submissionStatus = null;
        submissionId = null;
        stopPolling();

        try {
            const response = await fetch(
                `/api/exercises/${exerciseId}/submissions`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ source_code: code }),
                },
            );

            if (response.ok) {
                const data = await response.json();
                submissionId = data.id;
                startPolling();
            } else {
                error = "Failed to submit code";
            }
        } catch (err) {
            error = `Error: ${err.message}`;
        } finally {
            submitting = false;
        }
    }

    let pollInterval = null;

    function startPolling() {
        pollSubmissionStatus();
        pollInterval = setInterval(pollSubmissionStatus, 500);
    }

    function stopPolling() {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    }

    onDestroy(stopPolling);

    async function pollSubmissionStatus() {
        if (!submissionId) return;

        try {
            const response = await fetch(
                `/api/submissions/${submissionId}/status`,
            );

            if (response.ok) {
                const data = await response.json();
                submissionStatus = data;

                if (data.grading_status === "graded") {
                    stopPolling();
                }
            }
        } catch (err) {
            console.error("Error fetching status:", err);
        }
    }
</script>

<div class="editor-container">
    <textarea
        bind:value={code}
        rows="15"
        cols="80"
        placeholder="Write your code here..."
    ></textarea>
    <br />
    <button on:click={handleSubmit} disabled={submitting}>
        {submitting ? "Submitting..." : "Submit"}
    </button>

    {#if error}
        <p class="error">{error}</p>
    {/if}

    {#if submissionStatus}
        <p>Grading status: {submissionStatus.grading_status}</p>
        <p>Grade: {submissionStatus.grade}</p>
    {/if}
</div>

<style>
    .editor-container {
        margin: 20px 0;
    }

    textarea {
        width: 100%;
        min-height: 200px;
        padding: 10px;
        font-family: "Courier New", monospace;
        font-size: 14px;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
    }

    button {
        background-color: #0066cc;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        margin-top: 10px;
    }

    button:hover {
        background-color: #0052a3;
    }

    button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }

    .error {
        color: #d32f2f;
        margin-top: 10px;
    }

    p {
        margin: 10px 0;
    }
</style>
