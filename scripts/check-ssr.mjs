// Smoke test de SSR: importa o dist de cada pacote num Node sem DOM (o que um servidor Next, Nuxt ou Angular SSR
// faz), chama os registerTooark*() e renderiza os wrappers React e Vue para string. Falha se um import lançar, se o
// registro não for no-op no servidor ou se o HTML não trouxer as tags ark-*.
// Uso: node scripts/check-ssr.mjs   (depois do pnpm -r build)

import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagesDir = path.join(rootDir, "packages");
let failed = false;

if (typeof HTMLElement !== "undefined" || typeof customElements !== "undefined") {
  console.error("check-ssr: rode num Node puro, sem DOM");
  process.exit(1);
}

async function check(label, run) {
  try {
    await run();
    console.log(`ok     ${label}`);
  } catch (error) {
    failed = true;
    const message = error instanceof Error ? error.message.split("\n")[0] : String(error);
    console.error(`FALHOU ${label}: ${message}`);
  }
}

const distUrl = (pkg, file = "index.js") => pathToFileURL(path.join(packagesDir, pkg, "dist", file)).href;
// Dependências de terceiros resolvidas a partir do pacote que as declara (o pnpm isola node_modules por pacote),
// para ser a mesma instância que o dist importa.
const requireFrom = (pkg) => createRequire(path.join(packagesDir, pkg, "package.json"));
const importFrom = (pkg, specifier) => import(pathToFileURL(requireFrom(pkg).resolve(specifier)).href);

// ESM e CJS dos pacotes Rollup.
for (const pkg of ["tokens", "core", "web-components", "chart", "wysiwyg", "code", "motion"]) {
  await check(`${pkg} (ESM)`, () => import(distUrl(pkg)));
  await check(`${pkg} (CJS)`, () => requireFrom(pkg)(path.join(packagesDir, pkg, "dist", "index.cjs")));
}

// No servidor não há customElements: registrar é no-op, sem ReferenceError.
await check("registerTooark*() no servidor", async () => {
  (await import(distUrl("web-components"))).registerTooarkComponents();
  (await import(distUrl("chart"))).registerTooarkChart();
  (await import(distUrl("wysiwyg"))).registerTooarkWysiwyg();
  (await import(distUrl("code"))).registerTooarkCode();
});

// React: o registro fica num useEffect, que não roda no servidor; o HTML sai com as tags e os atributos.
await check("react (renderToString)", async () => {
  const { createElement } = await importFrom("react", "react");
  const { renderToString } = await importFrom("react", "react-dom/server");
  const { ArkButton, ArkDialog } = await import(distUrl("react"));
  const html = renderToString(
    createElement(
      ArkDialog,
      { label: "Confirmar", open: true },
      createElement(ArkButton, { type: "submit", intent: "danger" }, "Excluir")
    )
  );
  if (!html.includes("<ark-dialog") || !html.includes('<ark-button type="submit"')) {
    throw new Error(`HTML inesperado: ${html.slice(0, 160)}`);
  }
});

// Vue: o setup roda no servidor e chama o registro, que precisa ser no-op.
await check("vue (renderToString)", async () => {
  const { createSSRApp, h } = await importFrom("vue", "vue");
  const { renderToString } = await importFrom("vue", "vue/server-renderer");
  const { ArkButton } = await import(distUrl("vue"));
  const html = await renderToString(createSSRApp({ render: () => h(ArkButton, { type: "submit" }, () => "Salvar") }));
  if (!html.includes("<ark-button")) throw new Error(`HTML inesperado: ${html.slice(0, 160)}`);
});

// Angular: o bundle parcial (FESM) avaliado com o compilador JIT, como num servidor sem o linker do CLI.
await check("angular (import + registro)", async () => {
  await importFrom("angular", "@angular/compiler");
  const { ElementRef, Injector, runInInjectionContext } = await importFrom("angular", "@angular/core");
  const angular = await import(distUrl("angular", "fesm2022/tooark-angular.mjs"));
  // O construtor de cada wrapper chama o registro, que no servidor precisa ser no-op. O wrapper nasce num contexto de
  // injeção, como o Angular o cria: o host dele (o `element`) vem de inject(ElementRef).
  const injector = Injector.create({ providers: [{ provide: ElementRef, useValue: new ElementRef(null) }] });
  const button = runInInjectionContext(injector, () => new angular.ArkButtonComponent());
  if (!("element" in button)) throw new Error("ArkButtonComponent sem o getter element");
});

// Todo wrapper Angular expõe o elemento que renderiza: o getter `element` procura, no host do wrapper, o filho direto
// com a tag do próprio seletor (`ark-x-wrapper` -> `ark-x`).
await check("angular (element de cada wrapper)", async () => {
  const { ElementRef, Injector, runInInjectionContext } = await importFrom("angular", "@angular/core");
  const angular = await import(distUrl("angular", "fesm2022/tooark-angular.mjs"));
  const wrappers = Object.entries(angular).filter(([name]) => name.endsWith("Component"));
  if (wrappers.length === 0) throw new Error("nenhum wrapper exportado");
  for (const [name, Wrapper] of wrappers) {
    const tag = Wrapper.ɵcmp.selectors[0][0].replace(/-wrapper$/, "");
    const queried = [];
    const host = { querySelector: (selector) => queried.push(selector) && null };
    const injector = Injector.create({ providers: [{ provide: ElementRef, useValue: new ElementRef(host) }] });
    const wrapper = runInInjectionContext(injector, () => new Wrapper());
    if (wrapper.element !== null || queried[0] !== `:scope > ${tag}`) {
      throw new Error(`${name}.element procurou ${JSON.stringify(queried[0])}, esperado ":scope > ${tag}"`);
    }
  }
});

if (failed) process.exit(1);
console.log("check-ssr: ok");
