export default function Signup() {
    return (
        <div>
            <h1> Signup</h1>
            <form action = "/api/signup" method="post">
                <input type="text" name="username" placeholder="Username" required />
                <input type="email" name="email" placeholder="Email" required />
                <input type="password" name="password" placeholder="Password" required />
                <button type="submit">Signup</button>
                <p>Already have an account? <a href="/login">Login</a></p>
                <p>Forgot your password? <a href="/forgot-password">Reset it here</a></p>
                <p>By signing up, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.</p>
            </form>
        </div>
    )
}