"use client";

import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { apiRequest, type ApiMessage } from "@/lib/api";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  async function handleCadastro(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setSucesso("");

    if (!/^[A-Za-z0-9._-]{3,50}$/.test(nome.trim())) {
      setErro(
        "Use de 3 a 50 caracteres no nome de usuário, sem espaços ou acentos.",
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
      const result = await apiRequest<ApiMessage>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: nome.trim(),
          email: email.trim(),
          password: senha,
        }),
      });
      setSucesso(
        result.message ||
          "Cadastro iniciado. Confira seu e-mail para confirmar a conta.",
      );
      setNome("");
      setEmail("");
      setSenha("");
      setConfirmarSenha("");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a conta. Tente novamente.",
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
            Comece sua história
          </h1>
          <p className="mt-2 text-stone-600 dark:text-stone-300">
            Crie sua conta e comece a escrever.
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
          <form className="mt-8" onSubmit={handleCadastro}>
            <div className="mb-5">
              <label
                htmlFor="nome"
                className="mb-2 block text-sm font-semibold text-[#4b1d3f] dark:text-pink-100"
              >
                Nome de usuário
              </label>
              <input
                id="nome"
                required
                minLength={3}
                maxLength={50}
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Escolha um nome sem espaços"
                autoComplete="username"
                className="w-full rounded-xl border-2 border-[#4b1d3f]/20 dark:border-[#382b47] bg-white dark:bg-[#221a2b] px-4 py-3 outline-none transition focus:border-[#96708e]"
              />
            </div>
            <div className="mb-5">
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
                maxLength={320}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seuemail@email.com"
                autoComplete="email"
                className="w-full rounded-xl border-2 border-[#4b1d3f]/20 dark:border-[#382b47] bg-white dark:bg-[#221a2b] px-4 py-3 outline-none transition focus:border-[#96708e]"
              />
            </div>
            <div className="mb-5">
              <label
                htmlFor="senha"
                className="mb-2 block text-sm font-semibold text-[#4b1d3f] dark:text-pink-100"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  required
                  minLength={6}
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  placeholder="Crie uma senha"
                  autoComplete="new-password"
                  className="w-full rounded-xl border-2 border-[#4b1d3f]/20 dark:border-[#382b47] bg-white dark:bg-[#221a2b] px-4 py-3 pr-12 outline-none transition focus:border-[#96708e]"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b1d3f] dark:text-pink-200"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="mt-2 text-xs text-stone-600 dark:text-stone-300">
                A senha deve ter pelo menos 6 caracteres.
              </p>
            </div>
            <div className="mb-6">
              <label
                htmlFor="confirmarSenha"
                className="mb-2 block text-sm font-semibold text-[#4b1d3f] dark:text-pink-100"
              >
                Confirmar senha
              </label>
              <div className="relative">
                <input
                  id="confirmarSenha"
                  type={mostrarConfirmarSenha ? "text" : "password"}
                  required
                  value={confirmarSenha}
                  onChange={(event) => setConfirmarSenha(event.target.value)}
                  placeholder="Digite sua senha novamente"
                  autoComplete="new-password"
                  className="w-full rounded-xl border-2 border-[#4b1d3f]/20 dark:border-[#382b47] bg-white dark:bg-[#221a2b] px-4 py-3 pr-12 outline-none transition focus:border-[#96708e]"
                />
                <button
                  type="button"
                  onClick={() =>
                    setMostrarConfirmarSenha((current) => !current)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b1d3f] dark:text-pink-200"
                  aria-label={
                    mostrarConfirmarSenha
                      ? "Ocultar confirmação de senha"
                      : "Mostrar confirmação de senha"
                  }
                >
                  {mostrarConfirmarSenha ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-xl bg-[#4b1d3f] dark:bg-pink-800 py-3 font-semibold text-white transition hover:bg-[#38142f] dark:hover:bg-pink-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? "Criando conta..." : "Criar conta"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-stone-600 dark:text-stone-300">
            Já possui uma conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#4b1d3f] dark:text-pink-200 hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </main>
    </PublicShell>
  );
}
