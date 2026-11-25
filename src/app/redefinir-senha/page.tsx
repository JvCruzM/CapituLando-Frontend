"use client";

import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";
import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { completeEmailAction, mobileEmailLink } from "@/lib/email-actions";

function RedefinirSenhaForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const source = searchParams.get("source");
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
      const result = await completeEmailAction(source, "reset-password", {
        token,
        newPassword: senha,
      });
      window.sessionStorage.removeItem("capitulando_access_token");
      window.sessionStorage.removeItem("capitulando_user");
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
    <main className="flex min-h-[calc(100svh-5.5rem)] items-center justify-center bg-[#f3ccde] dark:bg-[#120e17] p-6">
      <div className="w-full max-w-md rounded-[2rem] border border-[#4b1d3f]/20 dark:border-[#382b47] bg-[#fcf8f2] dark:bg-[#1a1321] p-6 sm:p-10 shadow-[0_15px_40px_rgba(75,40,88,0.12)]">
        <h1 className="text-3xl font-bold text-[#4b1d3f] dark:text-pink-100">
          Criar nova senha
        </h1>
        <p className="mt-3 text-stone-600 dark:text-stone-300">
          Escolha uma nova senha para sua conta.
        </p>
        {erro && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-200"
          >
            {erro}
          </p>
        )}
        {mensagem && (
          <p
            role="status"
            className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700 dark:bg-emerald-950/50 dark:text-emerald-200"
          >
            {mensagem}
          </p>
        )}
        {!mensagem && (
          <form onSubmit={handleSubmit} className="mt-8">
            <div className="mb-5">
              <label
                htmlFor="senha"
                className="mb-2 block text-sm font-semibold text-[#4b1d3f] dark:text-pink-100"
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
                className="w-full rounded-xl border-2 border-[#4b1d3f]/20 dark:border-[#382b47] bg-white dark:bg-[#221a2b] px-4 py-3 outline-none transition focus:border-[#96708e]"
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="confirmarSenha"
                className="mb-2 block text-sm font-semibold text-[#4b1d3f] dark:text-pink-100"
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
                className="w-full rounded-xl border-2 border-[#4b1d3f]/20 dark:border-[#382b47] bg-white dark:bg-[#221a2b] px-4 py-3 outline-none transition focus:border-[#96708e]"
              />
            </div>
            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-xl bg-[#4b1d3f] dark:bg-pink-800 py-3 font-semibold text-white transition hover:bg-[#38142f] dark:hover:bg-pink-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? "Salvando..." : "Redefinir senha"}
            </button>
          </form>
        )}
        <div className="mt-6 text-center">
          {source === "mobile" ? (
            <>
              {!mensagem && (
                <p className="mb-3 text-sm text-stone-600 dark:text-stone-300">
                  Você pode concluir aqui no navegador ou abrir este link no
                  aplicativo instalado.
                </p>
              )}
              <a
                href={
                  mobileEmailLink(
                    source,
                    "reset-password",
                    mensagem ? undefined : token,
                  ) ?? undefined
                }
                className="font-semibold text-[#4b1d3f] dark:text-pink-200 hover:underline"
              >
                {mensagem ? "Voltar ao aplicativo" : "Abrir no aplicativo"}
              </a>
            </>
          ) : (
            <Link
              href="/login"
              className="font-semibold text-[#4b1d3f] dark:text-pink-200 hover:underline"
            >
              Voltar para o login
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <PublicShell>
      <Suspense
        fallback={
          <main className="flex min-h-[calc(100svh-5.5rem)] items-center justify-center bg-[#f3ccde] dark:bg-[#120e17] p-6">
            Carregando...
          </main>
        }
      >
        <RedefinirSenhaForm />
      </Suspense>
    </PublicShell>
  );
}
