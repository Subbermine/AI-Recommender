import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

const Register = () => {
  const navigate = useNavigate();
  const { register, user, error, clearError } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
    return () => clearError();
  }, [user, navigate, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setFormError('Please fill out all fields');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password);
      showToast('Account registered successfully! Welcome to ApexBuy.', 'success');
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
          <h2 className="font-display font-bold text-xl text-brand-navy  my-0">Create Account</h2>
          <p className="text-xs text-brand-navy/60">Register in seconds to start ordering premium items</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-navy/60">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-navy/60" />
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-brand-cream/50  border border-brand-sage/40  rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-indigo text-brand-navy "
              />
            </div>
          </div>

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
            <label className="text-xs font-semibold text-brand-navy/60">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-navy/60" />
              <input
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-brand-cream/50  border border-brand-sage/40  rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-indigo text-brand-navy "
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-navy/60">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-brand-navy/60" />
              <input
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creating Account...' : 'Register'} <UserPlus className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-brand-navy/60">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-brown hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

