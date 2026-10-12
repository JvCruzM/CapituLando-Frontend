"use client";

import Link from "next/link";
import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { apiRequest, type ApiMessage } from "@/lib/api";

function ConfirmarEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleConfirmar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");
    if (!token) {
      setErro(
        "O link de confirmação está incompleto. Solicite um novo e-mail.",
      );
      return;
    }
    setCarregando(true);
    try {
      const result = await apiRequest<ApiMessage>("/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      setMensagem(
        result.message ||
          "E-mail confirmado. Você já pode entrar na sua conta.",
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível confirmar o e-mail.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F0E8] p-6">
      <div className="w-full max-w-md rounded-[2rem] border border-[#D8C4DC] bg-[#FFFDF9] p-10 shadow-[0_15px_40px_rgba(75,40,88,0.12)]">
        <h1 className="text-3xl font-bold text-[#4B2858]">Confirmar e-mail</h1>
        <p className="mt-3 text-[#705979]">
          Confirme seu endereço para liberar o acesso à sua conta CapituLando.
        </p>
        {erro && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {erro}
          </p>
        )}
        {mensagem && (
          <p
            role="status"
            className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700"
          >
            {mensagem}
          </p>
        )}
        {!mensagem && (
          <form onSubmit={handleConfirmar} className="mt-8">
            <button
              type="submit"
              disabled={carregando || !token}
              className="w-full rounded-xl bg-[#704B7C] py-3 font-semibold text-white transition hover:bg-[#5B3A67] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? "Confirmando..." : "Confirmar e-mail"}
            </button>
          </form>
        )}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="font-semibold text-[#704B7C] hover:underline"
          >
            Ir para o login
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ConfirmarEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F5F0E8] p-6">
          Carregando...
        </main>
      }
    >
      <ConfirmarEmailForm />
    </Suspense>
  );
}
