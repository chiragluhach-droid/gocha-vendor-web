import React, { useState, useEffect } from 'react';
import { authAPI } from '../api';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, ChevronRight } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [restaurantId, setRestaurantId] = useState('69dbb73cf01a247deae8c231');
  const [passkey, setPasskey] = useState('chirag123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen relative flex justify-center items-center font-sans bg-gray-900 py-6">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=2000&q=80")' }}
      ></div>
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>

      <div className="w-full max-w-[400px] relative z-10 px-4">
        
        {/* Back to Home Link */}
        <div className="mb-4 flex justify-center">
          <div 
            onClick={() => navigate('/')}
            className="cursor-pointer bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full inline-flex items-center gap-2 text-xs font-medium transition-colors"
          >
            ← Back to Home
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl p-6 sm:p-8 border border-white/20">
          
          {/* Logo & Header */}
          <div className="text-center mb-5">
            <div className="w-12 h-12 mx-auto bg-brand-50 rounded-xl border border-brand-100 flex items-center justify-center mb-3 overflow-hidden shadow-sm">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Vendor Portal</h2>
            <p className="text-[12px] text-brand-600 font-semibold tracking-[0.1em] uppercase mt-1 opacity-80">
              Empowering Campus Flavors
            </p>
          </div>



          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Restaurant ID */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Restaurant ID</label>
              <input
                type="text"
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all text-gray-800 text-sm font-medium"
                placeholder="Enter your ID"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Passkey</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all text-gray-800 text-sm font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-brand-600 transition-colors rounded-md"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 text-red-600 p-2.5 rounded-lg text-xs font-medium border border-red-100 flex items-center gap-2">
                <span className="w-1 h-3 bg-red-500 rounded-full"></span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-bold shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 mt-1 group ${loading ? 'opacity-70 cursor-not-allowed scale-[0.98]' : 'hover:-translate-y-0.5'}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

          </form>

          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs text-gray-400 font-medium">
            <Lock size={12} className="text-brand-500" />
            Secure Vendor Access
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;