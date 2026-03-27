import React from "react";

import { useNavigate } from "react-router-dom";

function LoginPage(){
    const navigate = useNavigate();

    function handleLogin(e) {
        e.preventDefault();
        localStorage.setItem("user", "editor");
        navigate("/dashboard");
    }

    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <input placeholder="Username" required/>
                <input placeholder="Password" type="password" required/>
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default LoginPage;