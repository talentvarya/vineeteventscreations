import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SparkParticles } from "@/components/SparkParticles";

export default function AdminLogin() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate("/admin/dashboard");
  }, [user, loading, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0A0508] px-4">
      <SparkParticles density={40} />
      <div className="relative w-full max-w-md glass-card rounded-2xl p-8 gold-border-glow">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-[#0A0508]" />
          </div>
          <h1 className="font-display text-2xl font-black gold-gradient-text">Admin Panel</h1>
          <p className="text-slate-400 text-sm mt-1">Vineet Events Creations</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <input
            data-testid="admin-login-username"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-[#1e0f18] border border-yellow-500/20 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-yellow-500/60"
          />
          <input
            data-testid="admin-login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-[#1e0f18] border border-yellow-500/20 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-yellow-500/60"
          />
          {error && <p className="text-red-400 text-sm" data-testid="admin-login-error">{error}</p>}
          <button
            data-testid="admin-login-submit"
            type="submit"
            disabled={submitting}
            className="w-full btn-glow bg-gradient-to-r from-yellow-500 to-amber-600 text-[#0A0508] font-bold py-3 rounded-full flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />}
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 border-t border-white/5 pt-4">
          Demo: admin@vineetevents.com / Admin@123
        </div>
      </div>
    </div>
  );
}
