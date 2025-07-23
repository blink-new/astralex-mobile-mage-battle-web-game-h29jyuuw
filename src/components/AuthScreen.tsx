import React, { useState } from 'react';
import { blink } from '../blink/client';
import { Sparkles, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        // For now, just redirect to Blink auth
        blink.auth.login();
      } else {
        // For now, just redirect to Blink auth
        blink.auth.login();
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-orange-500 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Logo and Title */}
      <div className="text-center mb-8 relative z-10">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <Zap className="w-12 h-12 text-orange-500 animate-pulse" />
            <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
          AstralEX
        </h1>
        <p className="text-gray-400 text-sm">
          Master the arcane arts of magical warfare
        </p>
      </div>

      {/* Auth Form */}
      <div className="w-full max-w-sm bg-gray-800/50 backdrop-blur-sm border border-gray-600 rounded-xl p-6 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-1">
              {isLogin ? 'Welcome Back, Mage' : 'Begin Your Journey'}
            </h2>
            <p className="text-gray-400 text-sm">
              {isLogin ? 'Enter your credentials to continue' : 'Create your magical account'}
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black/20 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {isLogin ? 'Entering...' : 'Creating...'}
              </div>
            ) : (
              isLogin ? 'Enter the Realm' : 'Begin Adventure'
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-orange-400 text-sm hover:text-orange-300 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-xs relative z-10">
        <p>© 2024 AstralEX. Master your magical destiny.</p>
      </div>
    </div>
  );
}