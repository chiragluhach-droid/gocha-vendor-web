import React, { useState, useEffect } from 'react';
import { authAPI } from '../api';

const Login = ({ onLogin }) => {
  const [restaurantId, setRestaurantId] = useState('');
  const [passkey, setPasskey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) onLogin();
  }, [onLogin]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authAPI.vendorLogin(restaurantId, passkey);
      localStorage.setItem('token', data.token);
      localStorage.setItem('vendor', JSON.stringify(data.vendor));
      onLogin();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Shared styles to keep the JSX clean
  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        margin: '20px',
        padding: '2.5rem',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0' }}>
            Welcome Back
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Please enter your vendor details</p>
        </div>

        {/* Demo credentials for testers */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px dashed #c7d2fe',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1.25rem',
          color: '#374151',
          fontSize: '0.8rem'
        }}>
          <strong style={{ display: 'block', marginBottom: '0.35rem', color: '#111827' }}>Demo credentials</strong>
          <div style={{ wordBreak: 'break-all' }}>
            Restaurant ID:<span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace', color: '#0f172a' }}>'692338e7935520cbe6bfedea'</span>
          </div>
          <div>
            Password: <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace', color: '#0f172a' }}>'bunkyard123'</span>
          </div>
        </div>

        <form onSubmit={handleLogin}>
          {/* Restaurant ID Field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="restaurantId" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
              Restaurant ID
            </label>
            <input
              id="restaurantId"
              type="text"
              placeholder="e.g. REST-101"
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#05623b')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          {/* Passkey Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="passkey" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
              Passkey
            </label>
            <input
              id="passkey"
              type="password"
              placeholder="••••••••"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#05623b')}
              onBlur={(e) => (e.target.style.borderColor = '#e5e7eb')}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ 
              backgroundColor: '#fef2f2', 
              color: '#b91c1c', 
              padding: '0.75rem', 
              borderRadius: '6px', 
              fontSize: '0.875rem', 
              marginBottom: '1.25rem',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.8rem',
              backgroundColor: '#05623b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: loading ? 0.8 : 1,
              boxShadow: '0 4px 6px -1px rgba(5, 98, 59, 0.2)'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                Logging in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#9ca3af' }}>
          Secure Vendor Portal Access
        </p>
      </div>
    </div>
  );
};

export default Login;