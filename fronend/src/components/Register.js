import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../apiClient';
import '../auth-pages.css';

const Register = () => {
  const [user, setUser] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  const register = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    try {
      const res = await api.post('/api/auth/register', user);
      if (res.data?.userId != null) {
        localStorage.setItem('id', String(res.data.userId));
        localStorage.setItem('userName', user.name || '');
        localStorage.setItem('userEmail', user.email || '');
      }
      setMessage('Account created successfully! Redirecting to login...');
      setMessageType('success');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      const isNetworkError = err.code === 'ERR_NETWORK' || err.message === 'Network Error' || !err.response;
      if (err.response?.status === 409 || err.response?.data?.message === 'User already exists') {
        setMessage('An account with this email already exists.');
        setMessageType('error');
        return;
      }
      const msg = isNetworkError
        ? 'Cannot connect to server. Start PostgreSQL and the backend (see start-database.sh).'
        : (err.response?.data?.message || err.message || 'Registration failed.');
      setMessage(msg);
      setMessageType('error');
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <h1>ZeNalam</h1>
        <p className="auth-tagline">Your journey to wellness begins here.</p>
      </div>
      <form className="auth-card" onSubmit={register}>
        <h2>Create an account</h2>
        <input
          placeholder="Full name"
          onChange={(e) => setUser({ ...user, name: e.target.value })}
          value={user.name}
          required
          autoComplete="name"
        />
        <input
          placeholder="Email"
          type="email"
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          value={user.email}
          required
          autoComplete="email"
        />
        <input
          placeholder="Password"
          type="password"
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          value={user.password}
          required
          autoComplete="new-password"
        />
        <button type="submit" className="auth-submit">Register</button>
        {message && (
          <p className={`auth-message ${messageType === 'error' ? 'auth-message--error' : 'auth-message--success'}`}>
            {message}
          </p>
        )}
      </form>
      <p className="auth-footer">
        Already have an account? <Link to="/">Sign in</Link>
      </p>
    </div>
  );
};

export default Register;
