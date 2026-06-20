import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, error, clearError } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
    return () => clearError();
  }, [user, navigate, from, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim() || !password.trim()) {
      setFormError('Please fill out all fields');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      showToast('Logged in successfully! Welcome back.', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto px-4 py-16 animate-fade-in">
      <div className="bg-brand-cream  border border-brand-sage/40  rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-1.5">
          <span className="font-display font-extrabold text-2xl tracking-tight bg-gradient-to-r from-brand-indigo to-brand-violet bg-clip-text text-transparent">
            ApexBuy
          </span>
          <h2 className="font-display font-bold text-xl text-brand-navy  my-0">Welcome Back</h2>
          <p className="text-xs text-brand-navy/60">Sign in to access your profile, cart, and orders</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-navy/60">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-navy/60" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-brand-cream/50  border border-brand-sage/40  rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-indigo text-brand-navy "
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-brand-navy/60">Password</label>
              <a href="#" className="text-xs text-brand-brown hover:underline font-medium">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-navy/60" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-brand-cream/50  border border-brand-sage/40  rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-indigo text-brand-navy "
              />
            </div>
          </div>

          {(formError || error) && (
            <p className="text-xs text-brand-brown font-semibold text-center bg-brand-brown/10  py-2.5 rounded-lg">
              {formError || error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-indigo to-brand-violet hover:from-brand-indigo hover:to-brand-violet text-brand-cream font-bold py-3 px-6 rounded-xl shadow-md hover:shadow flex items-center justify-center gap-1.5 text-sm mt-6"
          >
            {loading ? 'Signing In...' : 'Sign In'} <LogIn className="w-4 h-4" />
          </button>
        </form>

        <div className="bg-brand-brown/5 border border-brand-brown/10 p-4 rounded-2xl text-xs space-y-1.5 text-brand-brown">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-4 h-4" /> Demo Credentials
          </div>
          <div className="space-y-1 text-brand-navy/60 ">
            <p><span className="font-semibold text-brand-brown">Admin:</span> admin@apexbuy.com / admin12345</p>
            <p><span className="font-semibold text-brand-brown">Customer:</span> user@apexbuy.com / user12345</p>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-brand-navy/60">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-brown hover:underline font-bold">
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

