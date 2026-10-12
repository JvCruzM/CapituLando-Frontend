"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiRequest, type LoginResponse } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    if (!email.trim() || !senha) {
      setErro("Preencha seu e-mail e sua senha.");
      return;
    }

    setCarregando(true);
    try {
      const result = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password: senha }),
      });
      window.sessionStorage.setItem(
        "capitulando_access_token",
        result.accessToken,
      );
      window.sessionStorage.setItem(
        "capitulando_user",
        JSON.stringify(result.user),
      );
      router.replace("/home");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível entrar. Tente novamente.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      <section className="relative flex w-full items-center justify-center overflow-hidden bg-[#D8C4DC] p-8 md:w-1/2">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#C4A9CE] opacity-40" />
        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#B997C2] opacity-30" />
        <div className="relative flex flex-col items-center text-center">
          <div className="mb-6 text-8xl">📚</div>
          <div className="mb-5 text-7xl">🦉</div>
          <h1 className="text-5xl font-bold text-[#4B2858]">CapituLando</h1>
          <p className="mt-4 max-w-md text-lg text-[#5D4266]">
            Toda história começa com uma palavra.
          </p>
        </div>
      </section>
      <section className="flex w-full items-center justify-center bg-[#F5F0E8] p-8 md:w-1/2">
        <div className="w-full max-w-md rounded-[2rem] border border-[#D8C4DC] bg-[#FFFDF9] p-10 shadow-[0_15px_40px_rgba(75,40,88,0.12)]">
          <h2 className="text-3xl font-bold text-[#4B2858]">
            Bem-vindo de volta!
          </h2>
          <p className="mt-2 text-[#705979]">
            Continue escrevendo sua história.
          </p>
          {erro && (
            <p
              role="alert"
              className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {erro}
            </p>
          )}
          <form className="mt-8" onSubmit={handleLogin}>
            <div className="mb-5">
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
            </div>
            <div className="mb-3">
              <label
                htmlFor="senha"
                className="mb-2 block text-sm font-semibold text-[#4B2858]"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  required
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  className="w-full rounded-xl border-2 border-[#D8C4DC] bg-[#FFFDF9] px-4 py-3 pr-12 outline-none transition focus:border-[#704B7C]"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((current) => !current)}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#704B7C]"
                >
                  {mostrarSenha ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div className="mb-6 text-right">
              <Link
                href="/recuperar-senha"
                className="text-sm text-[#704B7C] hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>
            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-xl bg-[#704B7C] py-3 font-semibold text-white transition hover:bg-[#5B3A67] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-[#705979]">
            Ainda não possui uma conta?{" "}
            <Link
              href="/cadastro"
              className="font-semibold text-[#704B7C] hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
