import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { api } from '../apiClient';
import '../auth-pages.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const login = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const msg = res.data?.message || '';

      if (msg === 'Invalid credentials' || res.status === 401) {
        setMessage('Try again! Invalid credentials.');
        setMessageType('error');
        return;
      }

      if (res.data?.userId != null) {
        localStorage.setItem('id', String(res.data.userId));
        localStorage.setItem('userEmail', res.data.email || email);
        localStorage.setItem('userName', res.data.name || '');
        setMessage('Login successful! Redirecting...');
        setMessageType('success');
        setTimeout(() => navigate(redirectTo, { replace: true }), 800);
        return;
      }

      setMessage('Unexpected response from server.');
      setMessageType('error');
    } catch (err) {
      const isNetworkError = err.code === 'ERR_NETWORK' || err.message === 'Network Error' || !err.response;
      const msg = isNetworkError
        ? 'Cannot connect to server. Start PostgreSQL (./start-database.sh) and the backend on port 8080.'
        : (err.response?.data?.message || 'Login failed. Please check your credentials.');
      setMessage(msg);
      setMessageType('error');
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <h1>ZeNalam</h1>
        <p className="auth-tagline">Take a deep breath and find your balance.</p>
      </div>
      <form className="auth-card" onSubmit={login}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
          autoComplete="current-password"
        />
        <button type="submit" className="auth-submit">Sign in</button>
        {message && (
          <p className={`auth-message ${messageType === 'error' ? 'auth-message--error' : 'auth-message--success'}`}>
            {message}
          </p>
        )}
      </form>
      <p className="auth-footer">
        Don&apos;t have an account? <Link to="/register">Create an account</Link>
      </p>
    </div>
  );
};

export default Login;
