export default function Login() {
    return (
        <div>
            <h1>Login</h1>
            <form action="/api/login" method = "post">
                {/* <input type="text" name="username" placeholder="Username" required />
                <input type="password" name="password" placeholder="Password" required />
                <button type="submit">Login</button>
                <p>Don't have an account? <a href="/signup">Signup</a></p> */}
                <button type="submit">Coach</button>
                    
            </form>
        </div>
    )}