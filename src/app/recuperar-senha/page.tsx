"use client";
import Link from "next/link";
import { useState } from "react";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");

    if (!email) {
      setErro("Digite seu e-mail.");
      return;
    }

    if (!email.includes("@")) {
      setErro("Digite um e-mail válido.");
      return;
    }

    console.log("Recuperação de senha:", {
      email,
    });

    setEnviado(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F0E8] p-6">

      <div className="w-full max-w-md rounded-[2rem] border border-[#D8C4DC] bg-[#FFFDF9] p-10 shadow-[0_15px_40px_rgba(75,40,88,0.12)]">

        {!enviado ? (
          <>
            {}
            <h1 className="text-3xl font-bold text-[#4B2858]">
              Recuperar senha
            </h1>

            <p className="mt-3 text-[#705979]">
              Digite o e-mail da sua conta e enviaremos as instruções para
              você criar uma nova senha.
            </p>

            {}
            {erro && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
              >
                {erro}
              </p>
            )}

            {}
            <form
              onSubmit={handleSubmit}
              className="mt-8"
            >
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#4B2858]"
              >
                E-mail
              </label>

              <input
                type="email"
                id="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seuemail@email.com"
                autoComplete="email"
                className="w-full rounded-xl border-2 border-[#D8C4DC] bg-[#FFFDF9] px-4 py-3 outline-none transition focus:border-[#704B7C]"
              />

              <button
                type="submit"
                className="mt-6 w-full rounded-xl bg-[#704B7C] py-3 font-semibold text-white transition hover:bg-[#5B3A67]"
              >
                Enviar instruções
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">

            <div className="mb-4 text-5xl">
              📖
            </div>

            <h1 className="text-2xl font-bold text-[#4B2858]">
              Verifique seu e-mail
            </h1>

            <p className="mt-3 text-[#705979]">
              Se existir uma conta associada a esse endereço, você receberá
              instruções para redefinir sua senha.
            </p>

          </div>
        )}

        {}
        <div className="mt-6 text-center">

          <Link
            href="/login"
            className="font-semibold text-[#704B7C] hover:underline"
          >
            ← Voltar para o login
          </Link>
        </div>
      </div>
    </main>
  );
}
