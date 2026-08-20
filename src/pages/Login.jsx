import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../api/client";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-md mx-auto px-5 py-16 md:py-24">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green mx-auto mb-4">
          <LogIn size={20} color="#000" strokeWidth={2.5} />
        </div>
        <h1 className="text-white font-extrabold text-2xl tracking-tight">Sign in</h1>
        <p className="text-gray text-sm mt-2">Access the Sentinel AI dashboard and inspection tools.</p>
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-card p-6 space-y-4">
        {error && (
          <div className="rounded-xl px-3.5 py-2.5 text-xs font-semibold text-red" style={{ background: "rgba(241,94,108,0.1)" }}>
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-grayDim mb-1.5">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={update("email")}
            className="w-full px-3.5 py-2.5 rounded-xl bg-elevated border border-line text-white text-sm outline-none focus:border-green"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-grayDim mb-1.5">Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={update("password")}
            className="w-full px-3.5 py-2.5 rounded-xl bg-elevated border border-line text-white text-sm outline-none focus:border-green"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-full font-bold text-sm bg-green text-black hover:bg-greenBright transition-colors disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-center text-xs text-grayDim">
          Don't have an account?{" "}
          <Link to="/register" className="text-green font-semibold">
            Register
          </Link>
        </p>
      </form>
    </section>
  );
}
