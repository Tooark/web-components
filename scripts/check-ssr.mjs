// Smoke test de SSR: importa o dist de cada pacote num Node sem DOM (o que um servidor Next, Nuxt ou Angular SSR
// faz), chama os registerTooark*() e renderiza os wrappers React e Vue para string. Falha se um import lançar, se o
// registro não for no-op no servidor ou se o HTML não trouxer as tags ark-*.
// Uso: node scripts/check-ssr.mjs   (depois do pnpm -r build)

import { readdirSync, readFileSync } from "node:fs";
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
  // O data-view desenha as células em JSX por portal, que só existe no navegador: no servidor sai só a tag.
  const { ArkDataView } = await import(distUrl("react"));
  const table = renderToString(
    createElement(ArkDataView, {
      rows: [{ id: 1, name: "Ana" }],
      columns: [{ key: "name", label: "Nome", render: ({ row }) => createElement("strong", null, row.name) }],
      pageSize: 10
    })
  );
  if (!table.includes('<ark-data-view page-size="10"')) throw new Error(`HTML inesperado: ${table.slice(0, 160)}`);
});

// Subpaths dos pacotes laterais (@tooark/react/chart...): importam o próprio pacote lateral e renderizam a tag com os
// atributos; a propriedade JS (option, value) só é atribuída no navegador.
await check("react (subpaths dos pacotes laterais)", async () => {
  const { createElement } = await importFrom("react", "react");
  const { renderToString } = await importFrom("react", "react-dom/server");
  const { ArkChart } = await import(distUrl("react", "chart.js"));
  const { ArkCodeEditor } = await import(distUrl("react", "code.js"));
  const { ArkWysiwygEditor } = await import(distUrl("react", "wysiwyg.js"));
  const html = renderToString(
    createElement(
      "div",
      null,
      createElement(ArkChart, { option: { series: [] }, height: "200px", palette: "tokens" }),
      createElement(ArkCodeEditor, { value: "{}", language: "json", lineNumbers: false }),
      createElement(ArkWysiwygEditor, { content: { type: "doc" }, toolbar: "marks", editable: false })
    )
  );
  for (const expected of [
    'height="200px"',
    '<ark-code-editor language="json"',
    'line-numbers="false"',
    'editable="false"'
  ]) {
    if (!html.includes(expected)) throw new Error(`sem ${expected}: ${html.slice(0, 200)}`);
  }
  if (html.includes("option=") || html.includes("content=")) throw new Error(`propriedade JS no HTML: ${html}`);
});

// Vue: o setup roda no servidor e chama o registro, que precisa ser no-op.
await check("vue (renderToString)", async () => {
  const { createSSRApp, h } = await importFrom("vue", "vue");
  const { renderToString } = await importFrom("vue", "vue/server-renderer");
  const { ArkButton, ArkDataView } = await import(distUrl("vue"));
  const html = await renderToString(createSSRApp({ render: () => h(ArkButton, { type: "submit" }, () => "Salvar") }));
  if (!html.includes("<ark-button")) throw new Error(`HTML inesperado: ${html.slice(0, 160)}`);
  // O data-view teleporta os slots de célula, o que só acontece no navegador: no servidor sai só a tag.
  const table = await renderToString(
    createSSRApp({
      render: () =>
        h(
          ArkDataView,
          { rows: [{ id: 1, name: "Ana" }], columns: [{ key: "name", label: "Nome" }], pageSize: 10 },
          { "cell-name": ({ row }) => h("strong", row.name) }
        )
    })
  );
  if (!table.includes("<ark-data-view")) throw new Error(`HTML inesperado: ${table.slice(0, 160)}`);
});

// Subpaths do Vue: o setup chama o registerTooark*() do pacote lateral, no-op no servidor; a propriedade JS (option,
// value, content) só é atribuída no navegador.
await check("vue (subpaths dos pacotes laterais)", async () => {
  const { createSSRApp, h } = await importFrom("vue", "vue");
  const { renderToString } = await importFrom("vue", "vue/server-renderer");
  const { ArkChart } = await import(distUrl("vue", "chart.js"));
  const { ArkCodeEditor } = await import(distUrl("vue", "code.js"));
  const { ArkWysiwygEditor } = await import(distUrl("vue", "wysiwyg.js"));
  const html = await renderToString(
    createSSRApp({
      render: () => [
        h(ArkChart, { option: { series: [] }, height: "200px" }),
        h(ArkCodeEditor, { value: "{}", language: "json", maxHeight: "20rem" }),
        h(ArkWysiwygEditor, { content: { type: "doc" }, toolbar: "marks" })
      ]
    })
  );
  for (const expected of ['<ark-chart height="200px"', '<ark-code-editor language="json"', "<ark-wysiwyg-editor"]) {
    if (!html.includes(expected)) throw new Error(`sem ${expected}: ${html.slice(0, 200)}`);
  }
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
  const { ElementRef, Injector, runInInjectionContext, ViewContainerRef } = await importFrom(
    "angular",
    "@angular/core"
  );
  // A entrada principal e as secundárias dos pacotes laterais (@tooark/angular/chart...).
  const entries = ["", "-chart", "-code", "-wysiwyg"];
  const modules = await Promise.all(
    entries.map((suffix) => import(distUrl("angular", `fesm2022/tooark-angular${suffix}.mjs`)))
  );
  const wrappers = modules.flatMap((module) => Object.entries(module).filter(([name]) => name.endsWith("Component")));
  if (wrappers.length === 0) throw new Error("nenhum wrapper exportado");
  for (const name of ["ArkChartComponent", "ArkCodeEditorComponent", "ArkWysiwygEditorComponent"]) {
    if (!wrappers.some(([exported]) => exported === name)) throw new Error(`${name} fora das entradas secundárias`);
  }
  for (const [name, Wrapper] of wrappers) {
    const tag = Wrapper.ɵcmp.selectors[0][0].replace(/-wrapper$/, "");
    const queried = [];
    const host = { querySelector: (selector) => queried.push(selector) && null };
    // O ViewContainerRef é do wrapper do data-view, que instancia nele os templates de célula.
    const injector = Injector.create({
      providers: [
        { provide: ElementRef, useValue: new ElementRef(host) },
        { provide: ViewContainerRef, useValue: {} }
      ]
    });
    const wrapper = runInInjectionContext(injector, () => new Wrapper());
    if (wrapper.element !== null || queried[0] !== `:scope > ${tag}`) {
      throw new Error(`${name}.element procurou ${JSON.stringify(queried[0])}, esperado ":scope > ${tag}"`);
    }
  }
});

// Isolamento: só os arquivos de uma subpath (o nome tem chart, code ou wysiwyg) podem citar o pacote lateral ou os
// peers dele; a entrada principal dos wrappers continua sem ECharts, CodeMirror e Tiptap para quem não os usa.
const SIDE_PACKAGES = {
  chart: ["@tooark/chart", "echarts"],
  code: ["@tooark/code", "@codemirror/", "@lezer/"],
  wysiwyg: ["@tooark/wysiwyg", "@tiptap/"]
};
await check("isolamento das subpaths dos wrappers", () => {
  const files = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]
    );
  const leaks = [];
  for (const pkg of ["react", "vue", "angular"]) {
    const dist = path.join(packagesDir, pkg, "dist");
    for (const file of files(dist).filter((name) => /\.(c|m)?js$|\.d\.(c|m)?ts$/.test(name))) {
      const relative = path.relative(dist, file).replaceAll("\\", "/");
      const text = readFileSync(file, "utf8");
      for (const [subpath, specifiers] of Object.entries(SIDE_PACKAGES)) {
        if (relative.includes(subpath)) continue;
        const found = specifiers.find((specifier) => text.includes(`"${specifier}`) || text.includes(`'${specifier}`));
        if (found) leaks.push(`${pkg}/dist/${relative} cita ${found}`);
      }
    }
  }
  if (leaks.length > 0) throw new Error(leaks.join("; "));
});

if (failed) process.exit(1);
console.log("check-ssr: ok");
