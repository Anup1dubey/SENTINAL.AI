import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../api/client";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "viewer" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form);
      navigate("/dashboard", { replace: true });
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
          <UserPlus size={20} color="#000" strokeWidth={2.5} />
        </div>
        <h1 className="text-white font-extrabold text-2xl tracking-tight">Create an account</h1>
        <p className="text-gray text-sm mt-2">Register as a field inspector or a read-only viewer.</p>
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-card p-6 space-y-4">
        {error && (
          <div className="rounded-xl px-3.5 py-2.5 text-xs font-semibold text-red" style={{ background: "rgba(241,94,108,0.1)" }}>
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-grayDim mb-1.5">Name</label>
          <input
            type="text"
            required
            minLength={2}
            value={form.name}
            onChange={update("name")}
            className="w-full px-3.5 py-2.5 rounded-xl bg-elevated border border-line text-white text-sm outline-none focus:border-green"
            placeholder="Jane Doe"
          />
        </div>

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
            minLength={8}
            value={form.password}
            onChange={update("password")}
            className="w-full px-3.5 py-2.5 rounded-xl bg-elevated border border-line text-white text-sm outline-none focus:border-green"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-grayDim mb-1.5">I am a</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "viewer", label: "Viewer" },
              { value: "inspector", label: "Field Inspector" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: opt.value }))}
                className="py-2.5 rounded-xl text-xs font-bold transition-colors"
                style={{
                  background: form.role === opt.value ? "#1DB954" : "#1F1F1F",
                  color: form.role === opt.value ? "#000" : "#fff",
                  border: `1px solid ${form.role === opt.value ? "#1DB954" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-full font-bold text-sm bg-green text-black hover:bg-greenBright transition-colors disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>

        <p className="text-center text-xs text-grayDim">
          Already have an account?{" "}
          <Link to="/login" className="text-green font-semibold">
            Sign in
          </Link>
        </p>
      </form>
    </section>
  );
}
