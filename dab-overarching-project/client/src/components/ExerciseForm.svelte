<script>
    let code = "";
    let showStats = false;
    let characterCount = 0;
    let ifCount = 0;

    function handleSubmit() {
        // Count characters (including whitespace)
        characterCount = code.length;

        // Count occurrences of "if" in the text
        const regex = /if/g;
        const matches = code.match(regex);
        ifCount = matches ? matches.length : 0;

        showStats = true;
    }
</script>

<textarea bind:value={code} rows="10" cols="50"></textarea>
<br />
<button on:click={handleSubmit}>Submit</button>

{#if showStats}
    <p>Characters: {characterCount}</p>
    <p>ifs: {ifCount}</p>
{/if}
