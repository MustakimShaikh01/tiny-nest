'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Mail, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: password }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex flex-col bg-charcoal p-8 xl:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-charcoal-light/20 via-transparent to-transparent opacity-50"></div>
        <Link href="/" className="flex items-center gap-2.5 relative z-10 group mb-12 text-white">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-tiny flex items-center justify-center transition-transform group-hover:scale-105">
            <Home className="text-white w-5 h-5" />
          </div>
          <span className="font-serif text-3xl font-bold tracking-tight">Tiny Living Market</span>
        </Link>
        <div className="relative z-10 mt-auto max-w-sm">
          <h2 className="font-serif text-5xl font-bold text-white mb-6 leading-tight">Reset <span className="text-gray-400">Security.</span></h2>
          <p className="text-white/70 text-lg font-medium">Update your account credentials safely to restore access to your tiny home journey.</p>
        </div>
        {/* Abstract Shapes */}
        <div className="absolute -bottom-24 -right-24 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-white flex items-center justify-center p-6 sm:p-8 lg:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <div className="lg:hidden mb-12 flex justify-center">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-charcoal rounded-tiny flex items-center justify-center">
                <Home className="text-white w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold text-charcoal tracking-tight">Tiny Living Market</span>
            </Link>
          </div>

          {!success ? (
            <>
              <h1 className="text-3xl font-bold text-charcoal mb-4">Reset Password</h1>
              <p className="text-gray-500 font-medium mb-10">Remembered your password? <Link href="/login" className="text-green font-bold hover:underline">Back to Login</Link></p>

              <form onSubmit={handleReset} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Account Email</label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 w-5 h-5 text-gray-400 focus-within:text-green-light" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-tiny font-medium focus:bg-white focus:border-green transition-all outline-none"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">New Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 w-5 h-5 text-gray-400" />
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-tiny font-medium focus:bg-white focus:border-green transition-all outline-none"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Confirm New Password</label>
                  <div className="relative flex items-center">
                    <CheckCircle2 className={`absolute left-4 w-5 h-5 ${confirmPassword && password === confirmPassword ? 'text-green' : 'text-gray-400'}`} />
                    <input 
                      type="password" 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-tiny font-medium focus:bg-white focus:border-green transition-all outline-none ${confirmPassword && password !== confirmPassword ? 'border-red-400 focus:border-red-500' : ''}`}
                      placeholder="Verify new password"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-tiny text-sm font-bold animate-shake">
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full btn bg-charcoal text-white hover:bg-charcoal/90 py-4 text-base justify-center shadow-xl hover:-translate-y-1 transition-all rounded-tiny"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Update Password <ArrowRight className="w-5 h-5 ml-2" /></>}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-12 animate-fade-in">
               <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <CheckCircle2 className="w-10 h-10 text-green" />
               </div>
               <h1 className="text-3xl font-bold text-charcoal mb-4">Password Updated</h1>
               <p className="text-gray-500 font-medium mb-8">Your account security has been restored successfully. Redirecting you to login automatically...</p>
               <Link href="/login" className="btn btn-primary py-3 px-8 text-sm">Return to Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
