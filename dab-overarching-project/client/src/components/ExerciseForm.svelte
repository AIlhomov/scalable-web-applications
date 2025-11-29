<script>
    import { onDestroy } from "svelte";

    export let exerciseId = null;

    let code = "";
    let submitting = false;
    let submissionId = null;
    let submissionStatus = null;
    let error = null;
    let prediction = null;
    let predictionTimer = null;

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

    onDestroy(() => {
        stopPolling();
        clearPredictionTimer();
    });

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

    function clearPredictionTimer() {
        if (predictionTimer) {
            clearTimeout(predictionTimer);
            predictionTimer = null;
        }
    }

    function handleCodeInput() {
        clearPredictionTimer();

        if (code.trim().length > 0) {
            predictionTimer = setTimeout(async () => {
                await getPrediction();
            }, 500);
        } else {
            prediction = null;
        }
    }

    async function getPrediction() {
        if (!code.trim() || !exerciseId) {
            prediction = null;
            return;
        }

        try {
            const response = await fetch("/inference-api/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    exercise: parseInt(exerciseId),
                    code: code,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                prediction = Math.round(data.prediction);
            }
        } catch (err) {
            console.error("Error fetching prediction:", err);
        }
    }
</script>

<div class="editor-container">
    <textarea
        bind:value={code}
        on:input={handleCodeInput}
        rows="15"
        cols="80"
        placeholder="Write your code here..."
    ></textarea>
    <br />

    {#if prediction !== null}
        <p class="prediction">Correctness estimate: {prediction}%</p>
    {/if}

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

    .prediction {
        color: #2e7d32;
        margin: 10px 0;
        font-weight: bold;
    }

    p {
        margin: 10px 0;
    }
</style>
