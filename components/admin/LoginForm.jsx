"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/repositories/auth";

export default function LoginForm({ nextPath }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setPending(true);
    const result = await login(password);
    setPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.push(nextPath || "/admin");
    router.refresh();
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <div className="admin-field">
        <label htmlFor="password">Пароль</label>
        <input
          id="password"
          type="password"
          className="admin-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
      </div>
      {error && <p className="admin-error">{error}</p>}
      <button
        type="submit"
        className="admin-btn admin-btn--primary"
        disabled={pending}
      >
        {pending ? "Входим…" : "Войти"}
      </button>
    </form>
  );
}
