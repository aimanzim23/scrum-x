"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    if (error) setError(error.message);
    else router.push("/");
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
    if (error) setError(error.message);
    else router.push("/");
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
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:border-sky-500"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:border-sky-500"
          />
          {isSignUp && (
            <Input
              type="tel"
              placeholder="WhatsApp number (e.g. 60123456789)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:border-sky-500"
            />
          )}
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        <div className="space-y-2">
          <Button
            onClick={isSignUp ? handleSignUp : handleLogin}
            disabled={loading || !email || !password}
            className="w-full h-10 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-full"
          >
            {loading ? "..." : isSignUp ? "Create account" : "Login"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
            className="w-full text-zinc-500 hover:text-white"
          >
            {isSignUp ? "Already have an account? Login" : "No account? Sign up"}
          </Button>
        </div>
      </div>
    </div>
  );
}
