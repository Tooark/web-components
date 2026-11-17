import type { ArkIntent, ArkPageChangeDetail, ArkSize, ArkTheme } from "@tooark/core";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Core/ArkPagination",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Paginação: resumo do intervalo, seletor opcional de itens por página (`page-sizes`) e a faixa de páginas com anterior e próxima. O host é a `role="navigation"`. `page`, `page-size` e `total` são a fonte da verdade: um clique reescreve `page`, emite `ark-page-change` com `{ page, pageSize, pageCount }` e anuncia a página. Quem pagina os dados é o app; o componente só conta páginas. Trocar os itens por página mantém à vista o primeiro item que estava na tela.'
      }
    }
  },
  argTypes: {
    page: { control: "number" },
    pageSize: { control: "number" },
    total: { control: "number" },
    pageSizes: { control: "text", description: "Opções de itens por página, separadas por vírgula; vazio esconde" },
    siblings: { control: "number", description: "Páginas vizinhas da atual, de cada lado" },
    disabled: { control: "boolean" },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    intent: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"]
    },
    lang: { control: "inline-radio", options: ["en", "pt", "es"] },
    theme: { control: "select", options: ["auto", "light", "dark"] }
  },
  args: {
    page: 1,
    pageSize: 10,
    total: 134,
    pageSizes: "10,25,50",
    siblings: 1,
    disabled: false,
    size: "md",
    intent: "primary",
    lang: "pt",
    theme: "auto"
  }
};

export default meta;

type StoryArgs = {
  page: number;
  pageSize: number;
  total: number;
  pageSizes: string;
  siblings: number;
  disabled: boolean;
  size: ArkSize;
  intent: ArkIntent;
  lang: "en" | "pt" | "es";
  theme: ArkTheme;
  testid?: string;
};

type PaginationEl = HTMLElement & {
  page: number;
  pageSize: number;
  total: number;
  pageSizes: number[];
  pageCount: number;
  siblings: number;
  disabled: boolean;
};

function createPagination(args: Partial<StoryArgs>): PaginationEl {
  const el = document.createElement("ark-pagination") as PaginationEl;
  if (args.page) el.setAttribute("page", String(args.page));
  if (args.pageSize) el.setAttribute("page-size", String(args.pageSize));
  if (args.total !== undefined) el.setAttribute("total", String(args.total));
  if (args.pageSizes) el.setAttribute("page-sizes", args.pageSizes);
  if (args.siblings !== undefined) el.setAttribute("siblings", String(args.siblings));
  if (args.disabled) el.setAttribute("disabled", "");
  if (args.size) el.setAttribute("size", args.size);
  if (args.intent) el.setAttribute("intent", args.intent);
  if (args.lang) el.setAttribute("lang", args.lang);
  if (args.theme) el.setAttribute("theme", args.theme);
  if (args.testid) el.setAttribute("testid", args.testid);
  return el;
}

/** Texto dos itens da faixa, na ordem: números, reticências e as setas como "<" e ">". */
function strip(el: HTMLElement): string[] {
  return Array.from(el.querySelectorAll('[data-ark="pagination-pages"] > li')).map((item) => {
    const button = item.querySelector("button");
    if (button?.dataset.arkPage === "previous") return "<";
    if (button?.dataset.arkPage === "next") return ">";
    return (item.textContent || "").trim();
  });
}

export const Playground = {
  render: (args: StoryArgs) => createPagination(args)
};

export const WithPageSizes = {
  render: () => createPagination({ page: 3, pageSize: 25, total: 480, pageSizes: "10,25,50,100", lang: "pt" })
};

export const FewPages = {
  render: () => createPagination({ page: 2, pageSize: 10, total: 42, lang: "pt" })
};

export const Sizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-6";
    for (const size of ["xs", "sm", "md", "lg", "xl"] as ArkSize[])
      wrap.appendChild(createPagination({ page: 4, pageSize: 10, total: 134, pageSizes: "10,25", size, lang: "pt" }));
    return wrap;
  }
};

export const Disabled = {
  render: () => createPagination({ page: 2, pageSize: 10, total: 134, pageSizes: "10,25", disabled: true, lang: "pt" })
};

// Faixa de tamanho constante com reticências; clique, anterior e próxima reescrevem `page`, emitem
// `ark-page-change` e mantém o foco; os extremos desabilitam as setas.
export const Navigation = {
  render: () => createPagination({ page: 1, pageSize: 10, total: 134, lang: "pt" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const el = canvasElement.querySelector("ark-pagination") as PaginationEl;
    const events: ArkPageChangeDetail[] = [];
    el.addEventListener("ark-page-change", (event) => events.push((event as CustomEvent<ArkPageChangeDetail>).detail));

    await expect(el).toHaveAttribute("role", "navigation");
    await expect(el).toHaveAccessibleName("Paginação");
    await expect(el.pageCount).toBe(14);
    await expect(strip(el)).toEqual(["<", "1", "2", "3", "4", "5", "…", "14", ">"]);
    await expect(canvas.getByRole("button", { name: "Página 1" })).toHaveAttribute("aria-current", "page");
    await expect(canvas.getByRole("button", { name: "Página anterior" })).toBeDisabled();
    await expect(canvasElement.querySelector('[data-ark="pagination-summary"]')).toHaveTextContent("1–10 de 134");

    await userEvent.click(canvas.getByRole("button", { name: "Página 5" }));
    await expect(el).toHaveAttribute("page", "5");
    await expect(events.at(-1)).toEqual({ page: 5, pageSize: 10, pageCount: 14 });
    await expect(strip(el)).toEqual(["<", "1", "…", "4", "5", "6", "…", "14", ">"]);
    // O foco fica na página atual, que é um botão novo depois de refazer a faixa.
    await expect(canvas.getByRole("button", { name: "Página 5" })).toHaveFocus();
    await expect(canvasElement.querySelector('[data-ark="pagination-summary"]')).toHaveTextContent("41–50 de 134");

    await userEvent.click(canvas.getByRole("button", { name: "Próxima página" }));
    await expect(el.page).toBe(6);
    await expect(canvas.getByRole("button", { name: "Próxima página" })).toHaveFocus();

    await userEvent.click(canvas.getByRole("button", { name: "Página 14" }));
    await expect(strip(el)).toEqual(["<", "1", "…", "10", "11", "12", "13", "14", ">"]);
    await expect(canvas.getByRole("button", { name: "Próxima página" })).toBeDisabled();
    await expect(canvasElement.querySelector('[data-ark="pagination-summary"]')).toHaveTextContent("131–134 de 134");

    // Teclado: os botões são nativos, Enter ativa.
    canvas.getByRole("button", { name: "Página anterior" }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(el.page).toBe(13);
    await expect(events).toHaveLength(4);

    // Clicar na página atual não emite nada.
    await userEvent.click(canvas.getByRole("button", { name: "Página 13" }));
    await expect(events).toHaveLength(4);

    // Gravar `page` por fora atualiza a faixa sem emitir; uma página além do total é limitada na leitura.
    el.page = 2;
    await expect(canvas.getByRole("button", { name: "Página 2" })).toHaveAttribute("aria-current", "page");
    el.setAttribute("page", "99");
    await expect(el.page).toBe(14);
    await expect(events).toHaveLength(4);

    // `siblings` alarga a janela em volta da atual.
    el.page = 7;
    el.siblings = 2;
    await expect(strip(el)).toEqual(["<", "1", "…", "5", "6", "7", "8", "9", "…", "14", ">"]);
  }
};

// O seletor troca `page-size`, mantém à vista o primeiro item da tela e emite um único `ark-page-change`; o
// `change` e o `input` do ark-select composto não saem do host.
export const PageSize = {
  render: () => createPagination({ page: 4, pageSize: 10, total: 134, pageSizes: "10,25,50", lang: "pt" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const el = canvasElement.querySelector("ark-pagination") as PaginationEl;
    const events: ArkPageChangeDetail[] = [];
    const leaked: string[] = [];
    el.addEventListener("ark-page-change", (event) => events.push((event as CustomEvent<ArkPageChangeDetail>).detail));
    for (const type of ["change", "input"]) el.addEventListener(type, () => leaked.push(type));

    const select = canvas.getByRole("combobox", { name: "Por página" }) as HTMLSelectElement;
    await expect(select.value).toBe("10");
    await expect(Array.from(select.options).map((option) => option.value)).toEqual(["10", "25", "50"]);

    // Página 4 de 10 em 10 mostra o item 31, que em páginas de 25 está na página 2.
    await userEvent.selectOptions(select, "25");
    await expect(el).toHaveAttribute("page-size", "25");
    await expect(el).toHaveAttribute("page", "2");
    await expect(events).toEqual([{ page: 2, pageSize: 25, pageCount: 6 }]);
    await expect(leaked).toEqual([]);
    await expect(canvasElement.querySelector('[data-ark="pagination-summary"]')).toHaveTextContent("26–50 de 134");

    // Um tamanho fora de `page-sizes` entra na lista, para o seletor mostrar o valor real.
    el.pageSize = 15;
    await expect(Array.from(select.options).map((option) => option.value)).toEqual(["10", "15", "25", "50"]);
    await expect(select.value).toBe("15");

    // Sem `page-sizes` o seletor some; sem itens, o resumo também.
    el.pageSizes = [];
    await expect(canvasElement.querySelector('[data-ark="pagination-page-size"]')).not.toBeVisible();
    el.total = 0;
    await expect(canvasElement.querySelector('[data-ark="pagination-summary"]')).not.toBeVisible();
    await expect(el.pageCount).toBe(1);
  }
};

// `disabled` bloqueia tudo; o aria-label do app no host não é sobrescrito pelo do idioma.
export const DisabledAndLabel = {
  render: () => {
    const el = createPagination({ page: 2, pageSize: 10, total: 50, pageSizes: "10,25", disabled: true, lang: "pt" });
    el.setAttribute("aria-label", "Páginas de usuários");
    return el;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const el = canvasElement.querySelector("ark-pagination") as PaginationEl;
    await expect(el).toHaveAccessibleName("Páginas de usuários");
    for (const button of canvas.getAllByRole("button")) await expect(button).toBeDisabled();
    await expect(canvas.getByRole("combobox")).toBeDisabled();

    el.setAttribute("lang", "en");
    await expect(el).toHaveAccessibleName("Páginas de usuários");
    el.disabled = false;
    await expect(canvas.getByRole("button", { name: "Page 3" })).toBeEnabled();
  }
};

export const TestHooks = {
  render: () => createPagination({ page: 1, pageSize: 10, total: 134, pageSizes: "10,25", lang: "pt", testid: "pag" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const hook = (part: string) => canvasElement.querySelector(`[data-ark="pagination${part}"]`);
    await expect(hook("")).toHaveAttribute("data-testid", "pag");
    await expect(hook("-summary")).toHaveAttribute("data-testid", "pag-summary");
    await expect(hook("-page-size")).toHaveAttribute("data-testid", "pag-page-size");
    await expect(hook("-pages")).toHaveAttribute("data-testid", "pag-pages");
    await expect(hook("-previous")).toHaveAttribute("data-testid", "pag-previous");
    await expect(hook("-page")).toHaveAttribute("data-testid", "pag-page");
    await expect(hook("-gap")).toHaveAttribute("data-testid", "pag-gap");
    await expect(hook("-next")).toHaveAttribute("data-testid", "pag-next");
  }
};
