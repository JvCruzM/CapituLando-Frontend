"use client";

import Link from "next/link";
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
    <main className="flex min-h-screen items-center justify-center bg-[#F5F0E8] p-6">
      <div className="w-full max-w-md rounded-[2rem] border border-[#D8C4DC] bg-[#FFFDF9] p-10 shadow-[0_15px_40px_rgba(75,40,88,0.12)]">
        <h1 className="text-3xl font-bold text-[#4B2858]">Recuperar senha</h1>
        <p className="mt-3 text-[#705979]">
          Digite o e-mail da sua conta e enviaremos as instruções para criar uma
          nova senha.
        </p>
        {erro && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {erro}
          </p>
        )}
        {sucesso && (
          <p
            role="status"
            className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700"
          >
            {sucesso}
          </p>
        )}
        <form onSubmit={handleSubmit} className="mt-8">
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-[#4B2858]"
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
            className="w-full rounded-xl border-2 border-[#D8C4DC] bg-[#FFFDF9] px-4 py-3 outline-none transition focus:border-[#704B7C]"
          />
          <button
            type="submit"
            disabled={carregando}
            className="mt-6 w-full rounded-xl bg-[#704B7C] py-3 font-semibold text-white transition hover:bg-[#5B3A67] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {carregando ? "Enviando..." : "Enviar instruções"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="font-semibold text-[#704B7C] hover:underline"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    </main>
  );
}
