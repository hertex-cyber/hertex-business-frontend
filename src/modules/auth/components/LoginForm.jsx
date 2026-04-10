import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[400px] bg-white/[0.03] backdrop-blur-2xl p-8 rounded-2xl border border-white/10 shadow-[0_0_60px_rgba(255,255,255,0.03)] relative transition-all duration-500 hover:shadow-[0_0_80px_rgba(255,255,255,0.06)] hover:-translate-y-1 hover:bg-white/[0.04] hover:border-white/20">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
          <p className="text-white/40 text-sm">Please enter your details to sign in.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-500 text-xs font-medium">
              {error}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 bg-white/5 border-white/10 rounded cursor-pointer" />
              <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">Remember me</span>
            </label>
            <a href="#" className="text-xs font-medium text-white/40 hover:text-white transition-colors">Forgot password?</a>
          </div>

          <Button variant="primary" className="mt-2 py-3" type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>

          <Button variant="secondary" className="py-3" type="button" onClick={() => navigate('/register')}>
            Create an account
          </Button>
        </form>

        <p className="text-center text-xs text-white/20">
          By clicking continue, you agree to our <a href="#" className="text-white/40 hover:text-white underline underline-offset-4">Terms</a> and <a href="#" className="text-white/40 hover:text-white underline underline-offset-4">Privacy</a>.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
