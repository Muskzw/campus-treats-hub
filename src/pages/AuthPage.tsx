import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import heroImage from "@/assets/hero-delivery.webp";

const AuthPage = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
      } else {
        if (!fullName.trim()) { setError("Full name is required"); setSubmitting(false); return; }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          setError(error.message);
        } else {
          setSignupSuccess(true);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl mb-4">📧</motion.div>
        <h2 className="font-display font-bold text-xl">Check your email!</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.</p>
        <button onClick={() => { setSignupSuccess(false); setIsLogin(true); }} className="mt-6 text-sm text-primary font-medium">
          Back to login
        </button>
      </div>
    );
  }

  if (resetSent) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-5xl mb-4">📧</motion.div>
        <h2 className="font-display font-bold text-xl">Reset link sent!</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">Check <strong>{email}</strong> for a password reset link.</p>
        <button onClick={() => { setResetSent(false); setForgotMode(false); setIsLogin(true); }} className="mt-6 text-sm text-primary font-medium">
          Back to login
        </button>
      </div>
    );
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Enter your email address"); return; }
    setSubmitting(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }
  };

  if (forgotMode) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="relative h-44 overflow-hidden">
          <img src={heroImage} alt="CampusGoodies" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <h1 className="font-display text-2xl font-bold">Reset Password 🔑</h1>
            <p className="text-xs text-muted-foreground mt-0.5">We'll send you a reset link</p>
          </div>
        </div>
        <div className="flex-1 p-5">
          <form onSubmit={handleForgot} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            {error && <p className="text-xs text-destructive font-medium">{error}</p>}
            <button type="submit" disabled={submitting} className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm disabled:opacity-50">
              {submitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
          <button onClick={() => { setForgotMode(false); setError(""); }} className="mt-4 text-sm text-primary font-medium w-full text-center">
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="relative h-44 overflow-hidden">
        <img src={heroImage} alt="CampusGoodies" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h1 className="font-display text-2xl font-bold">CampusGoodies 🎒</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Delivered to your hostel room</p>
        </div>
      </div>

      <div className="flex-1 p-5">
        <div className="flex bg-secondary rounded-xl p-1 mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(""); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${isLogin ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            Log In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(""); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${!isLogin ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
          >
            Sign Up
          </button>
        </div>

        <motion.form
          key={isLogin ? "login" : "signup"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-3"
        >
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>

          {error && <p className="text-xs text-destructive font-medium">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm disabled:opacity-50 transition-opacity"
          >
            {submitting ? "Please wait..." : isLogin ? "Log In" : "Create Account"}
          </button>
        </motion.form>
      </div>
    </div>
  );
};

export default AuthPage;
