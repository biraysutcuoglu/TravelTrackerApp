import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const API_BASE_URL = 'http://localhost:8000';

function Login({ onLoginSuccess, onSwitchToSignup }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/login`, {
                username,
                password
            });

            // Store token in localStorage
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('username', username);

            // Call success callback
            onLoginSuccess();
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" disabled={loading} className="btn-login">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="signup-link">
                    Don't have an account? <button type="button" onClick={onSwitchToSignup} className="link-button">Sign up here</button>
                </p>
            </div>
        </div>
    );
}

export default Login;
