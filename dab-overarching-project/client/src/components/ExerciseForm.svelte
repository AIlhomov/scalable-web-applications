<script>
    export let exerciseId = null;

    let code = "";
    let showStats = false;
    let characterCount = 0;
    let ifCount = 0;
    let submitting = false;
    let submissionId = null;
    let submissionStatus = null;
    let error = null;

    const serverUrl =
        import.meta.env.PUBLIC_SERVER_URL || "http://localhost:8000";

    async function handleSubmit() {
        // Count characters (including whitespace)
        characterCount = code.length;

        // Count occurrences of "if" in the text
        const regex = /if/g;
        const matches = code.match(regex);
        ifCount = matches ? matches.length : 0;

        showStats = true;

        // If exerciseId is provided, submit to the API
        if (exerciseId) {
            submitting = true;
            error = null;

            try {
                const response = await fetch(
                    `${serverUrl}/api/exercises/${exerciseId}/submissions`,
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

                    // Start polling for status
                    pollSubmissionStatus();
                } else {
                    error = "Failed to submit code";
                }
            } catch (err) {
                error = `Error: ${err.message}`;
            } finally {
                submitting = false;
            }
        }
    }

    async function pollSubmissionStatus() {
        if (!submissionId) return;

        try {
            const response = await fetch(
                `${serverUrl}/api/submissions/${submissionId}/status`,
            );

            if (response.ok) {
                const data = await response.json();
                submissionStatus = data;

                // Continue polling if status is pending
                if (data.grading_status === "pending") {
                    setTimeout(pollSubmissionStatus, 1000); // Poll every second
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

    {#if showStats}
        <div class="stats">
            <p><strong>Code Statistics:</strong></p>
            <p>Characters: {characterCount}</p>
            <p>Number of "if" statements: {ifCount}</p>
        </div>
    {/if}

    {#if submissionId}
        <div
            class="status {submissionStatus?.grading_status === 'graded'
                ? 'graded'
                : 'pending'}"
        >
            <p><strong>Submission ID:</strong> {submissionId}</p>
            {#if submissionStatus}
                <p>
                    <strong>Status:</strong>
                    {submissionStatus.grading_status}
                </p>
                {#if submissionStatus.grading_status === "graded"}
                    <p><strong>Grade:</strong> {submissionStatus.grade}%</p>
                {:else}
                    <p>⏳ Grading in progress...</p>
                {/if}
            {/if}
        </div>
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

    .stats {
        margin-top: 20px;
        padding: 15px;
        background-color: #e8f4f8;
        border-radius: 4px;
    }

    .status {
        margin-top: 20px;
        padding: 15px;
        border-radius: 4px;
    }

    .status.pending {
        background-color: #fff3cd;
        border: 1px solid #ffc107;
    }

    .status.graded {
        background-color: #d4edda;
        border: 1px solid #28a745;
    }

    .error {
        color: #d32f2f;
        margin-top: 10px;
    }
</style>
