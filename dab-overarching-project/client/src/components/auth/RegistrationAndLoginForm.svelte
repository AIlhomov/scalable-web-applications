<script>
    import { authClient } from "../../utils/auth.js";
    let { isLoginForm = false } = $props();
    const authFun = isLoginForm
        ? authClient.signIn.email
        : authClient.signUp.email;

    let email = $state("");
    let password = $state("");

    const registerOrLogin = async (e) => {
        e.preventDefault();

        const { data, error } = await authFun(
            {
                email,
                password,
                name: email,
            },
            {
                onError: (ctx) => {
                    alert(ctx.error.message);
                },
                onSuccess: (ctx) => {
                    window.location.href = "/";
                },
            },
        );
    };
</script>

<form onsubmit={registerOrLogin}>
    <label for="email">Email</label>
    <input type="email" id="email" bind:value={email} />

    <label for="password">Password</label>
    <input type="password" id="password" bind:value={password} />

    <button type="submit">{isLoginForm ? "Login" : "Register"}</button>
</form>

<style>
    form {
        display: flex;
        flex-direction: column;
        gap: 15px;
        max-width: 400px;
        margin: 0 auto;
    }

    label {
        font-weight: bold;
    }

    input {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
    }

    button {
        padding: 12px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
    }

    button:hover {
        background-color: #0056b3;
    }
</style>
