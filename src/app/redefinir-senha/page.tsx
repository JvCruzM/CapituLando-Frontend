"use client";

import Link from "next/link";
import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { apiRequest, type ApiMessage } from "@/lib/api";

function RedefinirSenhaForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");
    if (!token) {
      setErro(
        "O link de redefinição está incompleto. Solicite uma nova recuperação de senha.",
      );
      return;
    }
    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não são iguais.");
      return;
    }

    setCarregando(true);
    try {
      const result = await apiRequest<ApiMessage>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: senha }),
      });
      setMensagem(result.message || "Senha redefinida com sucesso.");
      setSenha("");
      setConfirmarSenha("");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível redefinir a senha.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F0E8] p-6">
      <div className="w-full max-w-md rounded-[2rem] border border-[#D8C4DC] bg-[#FFFDF9] p-10 shadow-[0_15px_40px_rgba(75,40,88,0.12)]">
        <h1 className="text-3xl font-bold text-[#4B2858]">Criar nova senha</h1>
        <p className="mt-3 text-[#705979]">
          Escolha uma nova senha para sua conta.
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
          <form onSubmit={handleSubmit} className="mt-8">
            <div className="mb-5">
              <label
                htmlFor="senha"
                className="mb-2 block text-sm font-semibold text-[#4B2858]"
              >
                Nova senha
              </label>
              <input
                id="senha"
                type="password"
                required
                minLength={6}
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                autoComplete="new-password"
                className="w-full rounded-xl border-2 border-[#D8C4DC] bg-[#FFFDF9] px-4 py-3 outline-none transition focus:border-[#704B7C]"
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="confirmarSenha"
                className="mb-2 block text-sm font-semibold text-[#4B2858]"
              >
                Confirmar nova senha
              </label>
              <input
                id="confirmarSenha"
                type="password"
                required
                value={confirmarSenha}
                onChange={(event) => setConfirmarSenha(event.target.value)}
                autoComplete="new-password"
                className="w-full rounded-xl border-2 border-[#D8C4DC] bg-[#FFFDF9] px-4 py-3 outline-none transition focus:border-[#704B7C]"
              />
            </div>
            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-xl bg-[#704B7C] py-3 font-semibold text-white transition hover:bg-[#5B3A67] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? "Salvando..." : "Redefinir senha"}
            </button>
          </form>
        )}
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

export default function RedefinirSenhaPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F5F0E8] p-6">
          Carregando...
        </main>
      }
    >
      <RedefinirSenhaForm />
    </Suspense>
  );
}
