"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    setLoading(true);
    setError("");
    const result = await supabase.auth.signInWithPassword({ email, password });
    const error = result.error;
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
    setLoading(false);
  }

  async function handleSignUp() {
    setLoading(true);
    setError("");
    const result = await supabase.auth.signUp({
      email,
      password,
      options: { data: { phone } },
    });
    const error = result.error;
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">ScrumX</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {isSignUp ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-sky-500 transition-colors"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-sky-500 transition-colors"
          />
          {isSignUp && (
            <input
              type="tel"
              placeholder="WhatsApp number (e.g. 60123456789)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-sky-500 transition-colors"
            />
          )}
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        <div className="space-y-2">
          {isSignUp ? (
            <button
              onClick={handleSignUp}
              disabled={loading || !email || !password}
              className="w-full bg-sky-500 text-white text-sm font-bold py-2.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "..." : "Create account"}
            </button>
          ) : (
            <button
              onClick={handleLogin}
              disabled={loading || !email || !password}
              className="w-full bg-sky-500 text-white text-sm font-bold py-2.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "..." : "Login"}
            </button>
          )}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="w-full text-zinc-500 text-sm py-2 hover:text-white transition-colors"
          >
            {isSignUp
              ? "Already have an account? Login"
              : "No account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
