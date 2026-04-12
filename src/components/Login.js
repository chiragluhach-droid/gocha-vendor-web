import React, { useState, useEffect } from 'react';
import { authAPI } from '../api';

const Login = ({ onLogin }) => {
  const [restaurantId, setRestaurantId] = useState('69dbb73cf01a247deae8c231');
  const [passkey, setPasskey] = useState('chirag123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  const inputStyle = {
    width: '100%',
    padding: '14px',
    border: '1.5px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #064e3b, #065f46, #047857)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>

      <div style={{
        width: '100%',
        maxWidth: '430px',
        padding: '2.5rem',
        borderRadius: '18px',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 25px 40px rgba(0,0,0,0.2)',
        animation: 'fadeIn 0.4s ease'
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.9rem',
            fontWeight: '700',
            marginBottom: '0.4rem',
            color: '#065f46'
          }}>
            Vendor Portal
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
            Sign in to manage your restaurant
          </p>
        </div>

        {/* Demo Credentials */}
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          padding: '0.9rem',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          color: '#065f46'
        }}>
          <strong>Demo Credentials</strong>
          <div>ID: 69dbb73cf01a247deae8c231</div>
          <div>Password: chirag123</div>
        </div>

        <form onSubmit={handleLogin}>

          {/* Restaurant ID */}
          <div style={{ marginBottom: '1.3rem' }}>
            <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>
              Restaurant ID
            </label>
            <input
              type="text"
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#047857'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.3rem', position: 'relative' }}>
            <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>
              Passkey
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = '#047857'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '38px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: '#047857',
                fontWeight: '600'
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.9rem',
              background: 'linear-gradient(135deg,#065f46,#047857)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: '0.2s',
              transform: loading ? 'scale(0.98)' : 'scale(1)'
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.8rem',
          color: '#9ca3af'
        }}>
          🔒 Secure Vendor Access
        </p>
      </div>
    </div>
  );
};

export default Login;