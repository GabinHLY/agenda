import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "./AuthContext";

export function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        await register({ name: name.trim(), email: email.trim(), password });
      } else {
        await login({ email: email.trim(), password });
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 flex items-center justify-center">
      <Card className="w-full max-w-md rounded-3xl shadow-sm border-0">
        <CardHeader>
          <CardTitle>{mode === "login" ? "Connexion" : "Inscription"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={onSubmit}>
            {mode === "register" && (
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton nom" required />
            )}
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              type="email"
              required
            />
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              type="password"
              minLength={6}
              required
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button className="w-full rounded-xl" type="submit" disabled={loading}>
              {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Creer un compte"}
            </Button>
          </form>

          <button
            className="text-sm text-slate-600 mt-4 hover:text-slate-900"
            onClick={() => setMode((prev) => (prev === "login" ? "register" : "login"))}
          >
            {mode === "login"
              ? "Pas encore de compte ? Inscris-toi"
              : "Tu as deja un compte ? Connecte-toi"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
