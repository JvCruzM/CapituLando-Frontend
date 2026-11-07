const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const database = process.env.E2E_DATABASE_URL;
if (
  !database ||
  !/^jdbc:postgresql:\/\/(127\.0\.0\.1|localhost):\d+\/[a-z0-9_]+$/.test(
    database,
  )
) {
  throw new Error(
    "Set E2E_DATABASE_URL to an isolated local PostgreSQL database.",
  );
}
const config = {
  "spring.config.import": "",
  "spring.datasource.url": database,
  "spring.datasource.username":
    process.env.E2E_DATABASE_USERNAME || "capitulando_test",
  "spring.datasource.password": process.env.E2E_DATABASE_PASSWORD || "",
  "spring.flyway.url": database,
  "spring.flyway.user": process.env.E2E_DATABASE_USERNAME || "capitulando_test",
  "spring.flyway.password": process.env.E2E_DATABASE_PASSWORD || "",
  "app.jwt.secret-base64": "MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=",
  "app.jwt.issuer": "capitulando-local-e2e",
  "app.frontend-url": "http://127.0.0.1:3001",
  "server.port": 8081,
  "app.mail.from": "test@localhost",
  "spring.mail.host": "127.0.0.1",
  "spring.mail.port": 2525,
  "spring.mail.username": "",
  "spring.mail.password": "",
  "spring.mail.properties[mail.smtp.auth]": false,
  "spring.mail.properties[mail.smtp.starttls.enable]": false,
  "spring.mail.properties[mail.smtp.starttls.required]": false,
};
const env = { ...process.env, SPRING_APPLICATION_JSON: JSON.stringify(config) };
const localJava = "C:\\Program Files\\Java\\jdk-21.0.10";
if (!env.JAVA_HOME && fs.existsSync(localJava)) env.JAVA_HOME = localJava;
const child = spawn(
  process.platform === "win32" ? "cmd.exe" : "./mvnw",
  process.platform === "win32"
    ? ["/d", "/s", "/c", "mvnw.cmd -B spring-boot:run"]
    : ["-B", "spring-boot:run"],
  {
    cwd:
      process.env.E2E_BACKEND_PATH ||
      path.resolve(__dirname, "../../../CapituLando-Backend"),
    env,
    stdio: "inherit",
    windowsHide: true,
  },
);
child.on("exit", (code) => process.exit(code ?? 1));
process.on("SIGTERM", () => child.kill());
process.on("SIGINT", () => child.kill());
