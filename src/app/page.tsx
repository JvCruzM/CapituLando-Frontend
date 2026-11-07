import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Feather,
  Flag,
  Globe2,
  HeartHandshake,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { ThemeControl } from "@/components/theme/ThemeControl";
import { Brand } from "@/components/Brand";

const features = [
  {
    icon: Feather,
    number: "01",
    title: "Encontre o seu ritmo",
    description:
      "Um espaço para escrever, formatar e organizar capítulos e rascunhos. Entre no modo foco e dê atenção à próxima frase.",
  },
  {
    icon: HeartHandshake,
    number: "02",
    title: "Conheça quem vive na história",
    description:
      "Crie fichas de personagens, guarde referências e conecte relações que dão vida à sua narrativa.",
  },
  {
    icon: Globe2,
    number: "03",
    title: "Construa além da página",
    description:
      "Reúna lugares, regras do mundo e acontecimentos. Consulte seu universo sem perder o fio da história.",
  },
  {
    icon: Flag,
    number: "04",
    title: "Transforme vontade em progresso",
    description:
      "Defina metas, acompanhe seus projetos e mantenha um lugar para aquelas ideias que chegam sem avisar.",
  },
];
const faqs = [
  [
    "Preciso ter um livro começado?",
    "Você pode começar por uma ideia, uma ficha de personagem ou pelo primeiro parágrafo. Crie um livro e construa sua história no seu tempo.",
  ],
  [
    "Posso organizar mais de uma história?",
    "Sim. Cada livro reúne seus capítulos e rascunhos. Você também pode associar personagens, ideias e elementos do universo a cada projeto.",
  ],
  [
    "Como guardo uma cópia do meu trabalho?",
    "Nas configurações, você pode exportar um backup dos dados da sua conta e restaurá-lo depois. O espaço de escrita também permite exportar o texto.",
  ],
  [
    "Como começo a usar?",
    "Crie sua conta, confirme o endereço de e-mail e entre no seu escritório. Depois, abra o Espaço de Escrita para criar o primeiro livro.",
  ],
];
const primary =
  "inline-flex items-center justify-center gap-2 rounded-2xl bg-[#4b1d3f] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#38142f] dark:bg-pink-800 dark:hover:bg-pink-900";

export default function Page() {
  return (
    <div className="bg-[#f3ccde] text-stone-800 dark:bg-[#120e17] dark:text-stone-100">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-xl focus:bg-white focus:p-4 focus:text-[#4b1d3f]"
      >
        Ir para o conteúdo
      </a>
      <header className="border-b border-[#4b1d3f]/10 dark:border-[#382b47]">
        <nav
          aria-label="Navegação principal"
          className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-5 sm:px-8"
        >
          <Brand />
          <div className="hidden gap-7 text-sm font-medium text-stone-600 dark:text-stone-300 lg:flex">
            <a href="#recursos" className="hover:underline">
              O seu espaço
            </a>
            <a href="#como-funciona" className="hover:underline">
              Como funciona
            </a>
            <a href="#duvidas" className="hover:underline">
              Dúvidas
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
            <ThemeControl />
            <Link
              href="/login"
              className="text-[#4b1d3f] hover:underline dark:text-pink-200"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="rounded-xl bg-[#4b1d3f] px-4 py-2.5 text-white transition hover:bg-[#38142f] dark:bg-pink-800"
            >
              Criar conta
            </Link>
          </div>
        </nav>
      </header>
      <main id="conteudo">
        <section className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-28">
          <div>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#4b1d3f]/15 bg-[#f3ccde]/40 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#4b1d3f] dark:border-[#382b47] dark:bg-[#221a2b] dark:text-pink-200">
              <Sparkles size={14} aria-hidden="true" /> Seu escritório literário
            </p>
            <h1 className="max-w-xl font-serif text-5xl font-medium leading-[1.08] tracking-tight text-[#4b1d3f] dark:text-pink-50 sm:text-6xl lg:text-7xl">
              Toda história merece{" "}
              <span className="italic text-[#4b1d3f] dark:text-pink-300">
                um lugar para nascer.
              </span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-relaxed text-stone-600 dark:text-stone-300 sm:text-lg">
              Da ideia solta ao próximo capítulo. Reúna sua escrita, seus
              personagens e os mundos que só você pode criar em um espaço feito
              para escritores.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link href="/cadastro" className={primary}>
                Começar minha história{" "}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <a
                href="#recursos"
                className="text-sm font-bold text-[#4b1d3f] underline decoration-[#b58da6] underline-offset-4 dark:text-pink-200"
              >
                Conhecer o espaço
              </a>
            </div>
            <p className="mt-5 flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
              <Check size={14} aria-hidden="true" /> Escreva no seu ritmo.
              Organize do seu jeito.
            </p>
          </div>
          <div
            aria-hidden="true"
            className="relative min-w-0 rounded-[2rem] border border-[#4b1d3f]/10 bg-[#fcf8f2] p-4 shadow-sm dark:border-[#382b47] dark:bg-[#1a1321] sm:p-7"
          >
            <div className="mb-4 flex items-center justify-between px-1 text-[#4b1d3f] dark:text-pink-200">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                Um mundo em construção
              </span>
              <span className="flex gap-1.5">
                <i className="h-2 w-2 rounded-full bg-[#b48ba7]" />
                <i className="h-2 w-2 rounded-full bg-[#b48ba7]/60" />
                <i className="h-2 w-2 rounded-full bg-[#b48ba7]/30" />
              </span>
            </div>
            <div className="rounded-2xl border border-[#4b1d3f]/10 bg-white p-5 shadow-sm dark:border-[#382b47] dark:bg-[#1a1321] sm:p-8">
              <div className="flex items-center gap-2 border-b border-[#4b1d3f]/10 pb-4 text-xs font-bold text-[#4b1d3f] dark:border-[#382b47] dark:text-pink-200">
                <BookOpen size={15} /> O atlas dos dias impossíveis
              </div>
              <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                Capítulo um
              </p>
              <p className="mt-2 font-serif text-3xl text-[#4b1d3f] dark:text-pink-100">
                Onde tudo começa
              </p>
              <div className="mt-6 space-y-4 font-serif text-sm leading-loose text-stone-600 dark:text-stone-300">
                <p>
                  Naquela manhã, Clara encontrou um mapa de um lugar que ainda
                  não existia.
                </p>
                <p>
                  Dobrou o papel com cuidado. Pela primeira vez em muito tempo,
                  não precisava saber o caminho inteiro. Bastava dar o primeiro
                  passo.
                </p>
                <span className="block h-5 w-0.5 bg-[#875474]" />
              </div>
              <div className="mt-7 flex flex-wrap items-center justify-between gap-2 border-t border-[#4b1d3f]/10 pt-4 text-[10px] text-stone-600 dark:border-[#382b47] dark:text-stone-400">
                <span>O próximo capítulo é seu.</span>
                <span className="rounded-full bg-[#ede9df] px-3 py-1 text-[#4b1d3f] dark:bg-[#382b47] dark:text-pink-100">
                  Em construção
                </span>
              </div>
            </div>
            <div className="ml-auto mt-4 flex max-w-xs items-center gap-3 rounded-2xl bg-[#4b1d3f] p-4 text-white">
              <Lightbulb size={22} className="shrink-0 text-pink-200" />
              <p className="text-xs leading-relaxed">
                Uma ideia hoje.
                <br />
                <span className="font-serif text-base">
                  Um universo inteiro amanhã.
                </span>
              </p>
            </div>
          </div>
        </section>
        <section
          id="recursos"
          className="scroll-mt-6 border-y border-[#4b1d3f]/10 bg-[#fcf8f2] dark:border-[#382b47] dark:bg-[#1a1321]"
        >
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4b1d3f] dark:text-pink-300">
                Menos dispersão, mais história
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-tight text-[#4b1d3f] dark:text-pink-50 sm:text-4xl">
                Sua criatividade tem muitas partes.
                <br />
                Elas podem morar no mesmo lugar.
              </h2>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ icon: Icon, number, title, description }) => (
                <article
                  key={number}
                  className="rounded-3xl border border-[#4b1d3f]/20 bg-white p-6 dark:border-[#382b47] dark:bg-[#221a2b]"
                >
                  <div className="flex items-center justify-between">
                    <Icon
                      size={23}
                      className="text-[#4b1d3f] dark:text-pink-300"
                      aria-hidden="true"
                    />
                    <span className="font-serif text-sm text-stone-500 dark:text-stone-400">
                      {number}
                    </span>
                  </div>
                  <h3 className="mt-8 font-serif text-xl font-bold text-[#4b1d3f] dark:text-pink-100">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section
          id="como-funciona"
          className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4b1d3f] dark:text-pink-300">
              Da primeira ideia à próxima página
            </p>
            <h2 className="mt-4 max-w-md font-serif text-4xl leading-tight text-[#4b1d3f] dark:text-pink-50">
              Você traz a história.
              <br />
              <span className="italic">O espaço já está pronto.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-stone-600 dark:text-stone-300">
              Não existe uma ordem certa para criar. Comece pela parte que pede
              para ser escrita.
            </p>
          </div>
          <ol className="space-y-6">
            {[
              [
                "Abra seu escritório",
                "Crie sua conta e confirme seu e-mail para acessar seu espaço pessoal.",
              ],
              [
                "Dê um nome à sua história",
                "Crie um livro no Espaço de Escrita. O título pode mudar; o importante é começar.",
              ],
              [
                "Encontre o seu próximo passo",
                "Escreva um rascunho, apresente um personagem ou anote uma ideia. Volte quando quiser continuar.",
              ],
            ].map(([title, description], i) => (
              <li
                key={title}
                className="flex gap-5 border-b border-[#4b1d3f]/10 pb-6 dark:border-[#382b47]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f3ccde]/60 font-serif text-lg text-[#4b1d3f] dark:bg-[#382b47] dark:text-pink-200">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-serif text-xl font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section
          id="duvidas"
          className="mx-auto max-w-3xl scroll-mt-6 px-5 pb-20 sm:px-8"
        >
          <h2 className="mb-8 text-center font-serif text-3xl text-[#4b1d3f] dark:text-pink-50">
            Antes de abrir o primeiro capítulo
          </h2>
          <div className="space-y-3">
            {faqs.map(([question, answer]) => (
              <details
                key={question}
                className="group rounded-2xl border border-[#4b1d3f]/15 bg-white px-5 py-4 dark:border-[#382b47] dark:bg-[#221a2b]"
              >
                <summary className="cursor-pointer text-sm font-bold text-[#4b1d3f] dark:text-pink-100">
                  {question}
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </section>
        <section className="mx-5 mb-8 rounded-[2rem] bg-[#4b1d3f] px-6 py-14 text-center text-white sm:mx-8 sm:py-20">
          <Feather
            size={28}
            className="mx-auto mb-5 text-pink-200"
            aria-hidden="true"
          />
          <h2 className="font-serif text-3xl sm:text-5xl">
            A próxima página está esperando.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-pink-100">
            Não precisa ter todas as respostas. Só um lugar para começar a
            encontrá-las.
          </p>
          <Link
            href="/cadastro"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#fcf8f2] px-6 py-3.5 text-sm font-bold text-[#4b1d3f] transition hover:bg-[#f3ccde]"
          >
            Criar meu escritório <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </section>
      </main>
      <footer className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-8 sm:px-8">
        <Brand />
        <p className="text-xs text-stone-600 dark:text-stone-400">
          Um espaço para as histórias que você ainda vai contar.
        </p>
        <Link
          href="/login"
          className="text-sm font-bold text-[#4b1d3f] hover:underline dark:text-pink-200"
        >
          Acessar minha conta
        </Link>
      </footer>
    </div>
  );
}
