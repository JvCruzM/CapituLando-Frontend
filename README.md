# CapituLando — Frontend

<img src="public/brand/capitulando-logo.png" alt="Logo do CapituLando" width="120" />

Interface do **CapituLando**, um escritório literário para transformar ideias em histórias. A aplicação reúne escrita, organização de livros, fichas de personagens e planejamento do universo em um mesmo espaço.

Os dados são armazenados pela API do repositório [CapituLando-Backend](https://github.com/JvCruzM/CapituLando-Backend).

## Funcionalidades

- Página de apresentação com acesso ao cadastro e ao login.
- Cadastro, confirmação de e-mail, recuperação e redefinição de senha.
- Painel com visão dos projetos e progresso da escrita.
- Livros, capítulos e rascunhos com editor de texto e modo foco.
- Fichas de personagens, imagens e relacionamentos.
- Enciclopédia do universo com raças, criaturas, itens, locais, organizações e regras.
- Vínculos entre personagens e raças, membros de organizações e participantes de eventos.
- Eventos ligados a capítulos e locais na timeline, além da cronologia livre.
- Organização de ideias e metas.
- Perfil do autor, preferências e temas claro, escuro e do sistema.
- Recuperação da escrita e exportação/restauração de backups.

## Tecnologias

Next.js 16, React 19, TypeScript, Tailwind CSS, Lucide e DOMPurify. As verificações utilizam ESLint, TypeScript e Playwright.

## Requisitos

- Node.js 24 e npm.
- Backend configurado e disponível para autenticação e acesso aos dados.

Para executar os testes de navegador, também são necessários Java 21, o repositório backend e PostgreSQL local.

## Configuração e execução

Na raiz deste repositório, execute no PowerShell:

```powershell
Copy-Item .env.example .env.local
npm ci
```

No `.env.local`, configure a URL da API:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

Use uma URL completa, incluindo `http://` ou `https://`. Inicie o backend em outro terminal e execute:

```powershell
npm run dev
```

Acesse **http://localhost:3000**. A rota inicial `/` apresenta o produto; o painel da conta fica em `/home`.

No Linux/macOS, utilize `cp .env.example .env.local` para copiar o exemplo. Os comandos npm são os mesmos.

## Primeiro acesso

1. Abra a página inicial e selecione **Criar conta**.
2. Preencha o cadastro e confirme o link recebido por e-mail.
3. Faça login.
4. Abra o **Espaço de Escrita** e crie seu primeiro livro.
5. Escreva um capítulo ou rascunho e utilize **Salvar** para gravá-lo no livro.

O envio dos e-mails depende da configuração SMTP do backend. A opção de tema está disponível nas páginas públicas e nas configurações da conta.

## Rotas

| Rota | Página |
| --- | --- |
| `/` | Apresentação do CapituLando |
| `/login` | Login |
| `/cadastro` | Criação de conta |
| `/recuperar-senha` | Solicitação de recuperação |
| `/confirmar-email` | Confirmação pelo link enviado por e-mail |
| `/redefinir-senha` | Criação da nova senha pelo link de recuperação |
| `/home` | Painel e ferramentas da conta autenticada |

## Dados e preferências

Os dados são vinculados à conta autenticada e sincronizados com o backend. O editor mantém uma cópia de recuperação por conta no navegador; salvar capítulos e rascunhos no livro é uma ação manual.

Se houver conflito entre sessões, a interface permite escolher entre a cópia local e os dados do servidor. A restauração de backup substitui o conteúdo da conta; exporte uma cópia antes de restaurar ou apagar os dados.

A escolha de tema das páginas públicas permanece no navegador. Ao entrar, uma preferência já salva na conta tem prioridade. Lembretes de escrita funcionam enquanto o aplicativo está aberto.

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm ci` | Instalar as dependências conforme o lockfile |
| `npm run dev` | Iniciar o servidor de desenvolvimento |
| `npm run lint` | Verificar o código com ESLint |
| `npm run typecheck` | Verificar os tipos TypeScript |
| `npm run build` | Gerar a versão de produção |
| `npm start` | Executar a versão de produção já compilada |
| `npm test` | Executar os testes de navegador |
| `npm audit` | Consultar vulnerabilidades nas dependências |

## Testes de navegador

Os testes iniciam uma instância do frontend, a API e um servidor SMTP de teste. Prepare um **banco PostgreSQL local descartável, exclusivo para os testes**, e mantenha os repositórios em pastas irmãs:

```text
Projetos/
  CapituLando-Backend/
  CapituLando-Frontend/
```

Com Java 21 disponível em `JAVA_HOME`, execute na pasta do frontend:

```powershell
npx playwright install chromium
$env:E2E_DATABASE_URL = "jdbc:postgresql://127.0.0.1:5432/capitulando_e2e"
$env:E2E_DATABASE_USERNAME = "capitulando_test"
$env:E2E_DATABASE_PASSWORD = "senha_do_banco_de_testes"
npm test
```

Se o backend estiver em outro local, defina `E2E_BACKEND_PATH` com o caminho dele. Deixe livres as portas `3001` (frontend), `8081` (API), `2525` (SMTP) e `1025` (consulta dos e-mails de teste).

O banco deve estar em `localhost` ou `127.0.0.1`. Os testes usam configuração própria de banco, autenticação e SMTP. Capturas e rastros são gerados em `test-results/`.

## Produção

```powershell
npm run build
npm start
```

Em uma hospedagem como a Vercel, configure `NEXT_PUBLIC_API_BASE_URL` antes da compilação: essa variável é incorporada à versão gerada. No backend, inclua a origem pública do frontend em `APP_FRONTEND_URL` para permitir as requisições e gerar os links de e-mail corretamente.

Os scripts de desenvolvimento e build utilizam Webpack explicitamente, conforme a configuração deste projeto.

## Estrutura

```text
src/app/                    Páginas, rotas, layout e estilos globais
src/app/favicon.ico         Ícone reconhecido pelo Next.js
src/components/auth/        Proteção das páginas autenticadas
src/components/dashboard/   Ferramentas do escritório literário
src/components/theme/       Preferência e controles de tema
src/lib/                    Comunicação com a API e utilitários
public/brand/               Logo do projeto
tests/                      Testes de navegador e serviços de apoio
.github/workflows/          Verificações automáticas no GitHub
docs/                       Documentação complementar
```

## Licença

Este repositório utiliza a licença [MIT](LICENSE).
