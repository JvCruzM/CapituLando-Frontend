"use client";

import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";
import { useState, type FormEvent } from "react";
import { apiRequest, type ApiMessage } from "@/lib/api";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setSucesso("");
    if (!email.trim()) {
      setErro("Digite seu e-mail.");
      return;
    }

    setCarregando(true);
    try {
      const result = await apiRequest<ApiMessage>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setSucesso(
        result.message ||
          "Se existir uma conta confirmada para esse email, enviaremos as instruções.",
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível solicitar a recuperação. Tente novamente.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <PublicShell>
      <main className="flex min-h-[calc(100svh-5.5rem)] items-center justify-center bg-[#f3ccde] dark:bg-[#120e17] p-6">
        <div className="w-full max-w-md rounded-[2rem] border border-[#4b1d3f]/20 dark:border-[#382b47] bg-[#fcf8f2] dark:bg-[#1a1321] p-6 sm:p-10 shadow-[0_15px_40px_rgba(75,40,88,0.12)]">
          <h1 className="text-3xl font-bold text-[#4b1d3f] dark:text-pink-100">
            Recuperar senha
          </h1>
          <p className="mt-3 text-stone-600 dark:text-stone-300">
            Digite o e-mail da sua conta e enviaremos as instruções para criar
            uma nova senha.
          </p>
          {erro && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-200"
            >
              {erro}
            </p>
          )}
          {sucesso && (
            <p
              role="status"
              className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700 dark:bg-emerald-950/50 dark:text-emerald-200"
            >
              {sucesso}
            </p>
          )}
          <form onSubmit={handleSubmit} className="mt-8">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-[#4b1d3f] dark:text-pink-100"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seuemail@email.com"
              autoComplete="email"
              className="w-full rounded-xl border-2 border-[#4b1d3f]/20 dark:border-[#382b47] bg-white dark:bg-[#221a2b] px-4 py-3 outline-none transition focus:border-[#96708e]"
            />
            <button
              type="submit"
              disabled={carregando}
              className="mt-6 w-full rounded-xl bg-[#4b1d3f] dark:bg-pink-800 py-3 font-semibold text-white transition hover:bg-[#38142f] dark:hover:bg-pink-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? "Enviando..." : "Enviar instruções"}
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="font-semibold text-[#4b1d3f] dark:text-pink-200 hover:underline"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </main>
    </PublicShell>
  );
}
