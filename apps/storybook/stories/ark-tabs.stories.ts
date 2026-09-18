import type { ArkIntent, ArkRounded, ArkSize, ArkTabsFill, ArkTabsVariant, ArkTheme } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkTabs",
  parameters: {
    docs: {
      description: {
        component:
          'Faixa de abas: o host `ark-tabs` e o `role="tablist"` e cada `ark-tab` e o proprio `role="tab"` (icone, texto e badge como filhos livres). Tres variantes: `underline` (padrao), `chips` (filtros) e `editor` (abas fechaveis com `closable`, ponto de nao salvo com `dirty`, clique do meio e Delete fecham). Setas, Home e End movem e selecionam; um filho `slot="actions"` vai para o fim da faixa. Os paineis sao do app: o grupo emite `change` com `detail: { value }` e a aba emite `ark-close`. Sem motion na troca.'
      }
    }
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["underline", "chips", "editor"] },
    value: { control: "text", description: "Value da aba ativa; sem ele a primeira habilitada assume" },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    intent: { control: "select", options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"] },
    rounded: {
      control: "select",
      options: ["", "none", "xs", "sm", "md", "lg", "xl", "full"],
      description: "Cantos das abas (so o topo em editor). Padrao: full em chips, none nas outras"
    },
    fill: {
      control: "inline-radio",
      options: ["", "none", "soft", "solid"],
      description: "Pintura da aba ativa. Padrao: soft em chips, none nas outras"
    },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    lang: { control: "select", options: ["en", "pt", "es"] },
    label: { control: "text", description: "aria-label da faixa" }
  },
  args: {
    variant: "underline",
    value: "headers",
    size: "md",
    intent: "primary",
    rounded: "",
    fill: "",
    theme: "auto",
    lang: "pt",
    label: "Secoes da requisicao"
  }
};

export default meta;

type StoryArgs = {
  variant: ArkTabsVariant;
  value: string;
  size: ArkSize;
  intent: ArkIntent;
  rounded: ArkRounded | "";
  fill: ArkTabsFill | "";
  theme: ArkTheme;
  lang: string;
  label: string;
};

type TabSpec = {
  value: string;
  label: string;
  disabled?: boolean;
  closable?: boolean;
  dirty?: boolean;
  testid?: string;
};

const SECTIONS: TabSpec[] = [
  { value: "params", label: "Params" },
  { value: "headers", label: "Headers" },
  { value: "body", label: "Body" },
  { value: "auth", label: "Auth", disabled: true }
];

const REQUESTS: TabSpec[] = [
  { value: "req-1", label: "GET /users", closable: true },
  { value: "req-2", label: "POST /login", closable: true, dirty: true },
  { value: "req-3", label: "PUT /users/1", closable: true }
];

function createTab(spec: TabSpec): HTMLElement {
  const tab = document.createElement("ark-tab");
  tab.setAttribute("value", spec.value);
  if (spec.disabled) tab.setAttribute("disabled", "");
  if (spec.closable) tab.setAttribute("closable", "");
  if (spec.dirty) tab.setAttribute("dirty", "");
  if (spec.testid) tab.setAttribute("testid", spec.testid);
  tab.textContent = spec.label;
  return tab;
}

function createTabs(args: Partial<StoryArgs>, specs: TabSpec[] = SECTIONS, testid?: string): HTMLElement {
  const tabs = document.createElement("ark-tabs");
  if (args.variant) tabs.setAttribute("variant", args.variant);
  if (args.value) tabs.setAttribute("value", args.value);
  if (args.size) tabs.setAttribute("size", args.size);
  if (args.intent) tabs.setAttribute("intent", args.intent);
  if (args.rounded) tabs.setAttribute("rounded", args.rounded);
  if (args.fill) tabs.setAttribute("fill", args.fill);
  if (args.theme) tabs.setAttribute("theme", args.theme);
  if (args.lang) tabs.setAttribute("lang", args.lang);
  if (args.label) tabs.setAttribute("label", args.label);
  if (testid) tabs.setAttribute("testid", testid);
  for (const spec of specs) tabs.appendChild(createTab(spec));
  return tabs;
}

export const Playground = {
  render: (args: StoryArgs) => createTabs(args)
};

export const Underline = {
  args: { variant: "underline" },
  render: Playground.render
};

export const Chips = {
  args: { variant: "chips", value: "params" },
  render: Playground.render
};

export const Editor = {
  render: (args: StoryArgs) => {
    const tabs = createTabs({ ...args, variant: "editor", value: "req-2" }, REQUESTS);
    // O "+" e um ark-button do usuario no slot de acoes; vai para o fim da faixa.
    const add = document.createElement("ark-button");
    add.setAttribute("slot", "actions");
    add.setAttribute("variant", "ghost");
    add.setAttribute("size", "xs");
    add.setAttribute("icon-only", "");
    add.setAttribute("aria-label", "Nova requisicao");
    add.textContent = "+";
    tabs.appendChild(add);
    return tabs;
  }
};

export const Sizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-4";
    for (const size of ["xs", "sm", "md", "lg", "xl"] as ArkSize[]) {
      wrap.appendChild(createTabs({ variant: "chips", size, value: "headers" }));
    }
    return wrap;
  }
};

export const Rounded = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-4";
    wrap.appendChild(createTabs({ variant: "chips", rounded: "md", value: "headers" }));
    wrap.appendChild(createTabs({ variant: "editor", rounded: "md", value: "req-1" }, REQUESTS));
    wrap.appendChild(createTabs({ variant: "chips", value: "headers" }));
    return wrap;
  },
  // `rounded` propaga as abas; chips sao pilula por padrao e o editor arredonda so o topo.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const [chips, editor, defaults] = Array.from(canvasElement.querySelectorAll("ark-tabs"));
    await expect(chips.querySelector("ark-tab")).toHaveClass("ark:rounded-md");
    await expect(editor.querySelector("ark-tab")).toHaveClass("ark:rounded-t-md");
    await expect(defaults.querySelector("ark-tab")).toHaveClass("ark:rounded-full");

    defaults.setAttribute("rounded", "none");
    await expect(defaults.querySelector("ark-tab")).toHaveClass("ark:rounded-none");
  }
};

export const Fill = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-4";
    wrap.appendChild(createTabs({ variant: "chips", fill: "solid", value: "headers" }));
    wrap.appendChild(createTabs({ variant: "chips", value: "headers" }));
    wrap.appendChild(createTabs({ variant: "underline", fill: "soft", value: "headers" }));
    wrap.appendChild(createTabs({ variant: "editor", fill: "solid", value: "req-1" }, REQUESTS));
    return wrap;
  },
  // `fill` pinta a aba ativa inteira: solid com a cor do intent, soft com a versao suave; chips vem soft por padrao.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const [solidChips, defaultChips, softUnderline, solidEditor] = Array.from(
      canvasElement.querySelectorAll("ark-tabs")
    );
    await expect(solidChips.querySelector("ark-tab[selected]")).toHaveClass("ark:bg-primary");
    await expect(defaultChips.querySelector("ark-tab[selected]")).toHaveClass("ark:bg-primary-soft");
    await expect(softUnderline.querySelector("ark-tab[selected]")).toHaveClass("ark:bg-primary-soft");
    await expect(softUnderline.querySelector("ark-tab[selected]")).toHaveClass("ark:border-primary");
    await expect(solidEditor.querySelector("ark-tab[selected]")).toHaveClass("ark:bg-primary");
    await expect(solidEditor.querySelector("ark-tab:not([selected])")).not.toHaveClass("ark:bg-primary");

    solidChips.setAttribute("fill", "none");
    await expect(solidChips.querySelector("ark-tab[selected]")).toHaveClass("ark:bg-surface-muted");
  }
};

export const DarkTheme = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.padding = "16px";
    wrap.style.borderRadius = "12px";
    wrap.style.background = "#0f172a";
    wrap.className = "flex flex-col gap-4";
    wrap.appendChild(createTabs({ variant: "underline", theme: "dark", value: "headers" }));
    wrap.appendChild(createTabs({ variant: "editor", theme: "dark", value: "req-1" }, REQUESTS));
    return wrap;
  }
};

export const ClickSelectsAndEmitsOnce = {
  render: () => createTabs({ value: "params", lang: "pt" }),
  // O grupo publica um unico `change` com o value; o da aba nao vaza acima dele nem para quem escuta no grupo.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvasElement.querySelector("ark-tabs")!;
    const received: string[] = [];
    canvasElement.addEventListener("change", (event) => {
      received.push(`${(event.target as HTMLElement).tagName.toLowerCase()}:${(event as CustomEvent).detail.value}`);
    });
    const onHost: string[] = [];
    tabs.addEventListener("change", (event) => onHost.push((event.target as HTMLElement).tagName.toLowerCase()));

    const headers = canvas.getByRole("tab", { name: "Headers" });
    await expect(canvas.getByRole("tab", { name: "Params" })).toHaveAttribute("aria-selected", "true");
    await expect(tabs).toHaveAttribute("role", "tablist");

    await userEvent.click(headers);
    await expect(headers).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByRole("tab", { name: "Params" })).toHaveAttribute("aria-selected", "false");
    await expect(tabs).toHaveAttribute("value", "headers");
    await expect(received).toEqual(["ark-tabs:headers"]);
    await expect(onHost).toEqual(["ark-tabs"]);

    // Clicar na aba ativa nao emite de novo; aba desabilitada nao seleciona (pointer-events: none barra o
    // ponteiro real, entao o clique sintetico cobre a guarda do handler).
    await userEvent.click(headers);
    canvas.getByRole("tab", { name: "Auth" }).dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await expect(received).toHaveLength(1);
    await expect(tabs).toHaveAttribute("value", "headers");
  }
};

export const KeyboardRoving = {
  render: () => createTabs({ value: "params" }),
  // Setas e Home/End movem o foco, pulam abas desabilitadas e selecionam; so a ativa e parada de Tab.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const params = canvas.getByRole("tab", { name: "Params" });
    const headers = canvas.getByRole("tab", { name: "Headers" });
    const body = canvas.getByRole("tab", { name: "Body" });
    const auth = canvas.getByRole("tab", { name: "Auth" });

    await expect(params).toHaveAttribute("tabindex", "0");
    await expect(headers).toHaveAttribute("tabindex", "-1");
    await expect(auth).toHaveAttribute("aria-disabled", "true");

    params.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(document.activeElement).toBe(headers);
    await expect(headers).toHaveAttribute("aria-selected", "true");
    await expect(headers).toHaveAttribute("tabindex", "0");
    await expect(params).toHaveAttribute("tabindex", "-1");

    // Da ultima habilitada, a seta pula a desabilitada e volta ao inicio.
    await userEvent.keyboard("{End}");
    await expect(document.activeElement).toBe(body);
    await userEvent.keyboard("{ArrowRight}");
    await expect(document.activeElement).toBe(params);
    await userEvent.keyboard("{ArrowLeft}");
    await expect(document.activeElement).toBe(body);
    await userEvent.keyboard("{Home}");
    await expect(document.activeElement).toBe(params);
    await expect(params).toHaveAttribute("aria-selected", "true");
  }
};

export const EditorCloseAndDirty = {
  render: () =>
    createTabs({ variant: "editor", value: "req-1", lang: "pt" }, [
      { ...REQUESTS[0], testid: "req-get" },
      ...REQUESTS.slice(1)
    ]),
  // Botao proprio (fora da ordem de Tab), clique do meio e Delete emitem ark-close; o ponto de dirty tem nome.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvasElement.querySelector("ark-tabs")!;
    const closed: string[] = [];
    tabs.addEventListener("ark-close", (event) => closed.push((event as CustomEvent).detail.value));

    const first = canvas.getByRole("tab", { name: /GET \/users/ });
    const close = first.querySelector<HTMLButtonElement>('[data-ark="tab-close"]')!;
    await expect(close).toHaveAttribute("aria-label", "Fechar aba");
    await expect(close).toHaveAttribute("tabindex", "-1");
    // O testid e por aba (a faixa nao o propaga): a parte interna recebe o sufixo.
    await expect(close).toHaveAttribute("data-testid", "req-get-close");

    await userEvent.click(close);
    await expect(closed).toEqual(["req-1"]);
    // Fechar nao seleciona nem remove: remover a aba e do app.
    await expect(tabs).toHaveAttribute("value", "req-1");
    await expect(first.isConnected).toBe(true);

    const second = canvas.getByRole("tab", { name: /POST \/login/ });
    const dirty = second.querySelector('[data-ark="tab-dirty"]')!;
    await expect(dirty).toHaveAttribute("role", "img");
    await expect(dirty).toHaveAttribute("aria-label", "Alterações não salvas");

    second.dispatchEvent(new MouseEvent("auxclick", { button: 1, bubbles: true }));
    await expect(closed).toEqual(["req-1", "req-2"]);

    second.focus();
    await userEvent.keyboard("{Delete}");
    await expect(closed).toEqual(["req-1", "req-2", "req-2"]);

    // Fora da variante editor, closable e ignorado.
    tabs.setAttribute("variant", "underline");
    await waitFor(() => expect(first.querySelector('[data-ark="tab-close"]')).toBeNull());
  }
};

export const RemovingSelectedTabPicksNeighbour = {
  render: () => createTabs({ variant: "editor", value: "req-2" }, REQUESTS),
  // O app removeu a aba ativa: a vizinha assume e o grupo avisa com `change`.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvasElement.querySelector("ark-tabs")!;
    const received: string[] = [];
    tabs.addEventListener("change", (event) => received.push((event as CustomEvent).detail.value));

    canvas.getByRole("tab", { name: /POST \/login/ }).remove();

    await waitFor(() => expect(tabs).toHaveAttribute("value", "req-3"));
    await expect(received).toEqual(["req-3"]);
    await expect(canvas.getByRole("tab", { name: /PUT \/users\/1/ })).toHaveAttribute("aria-selected", "true");

    // Aba adicionada depois herda a variante e o tamanho do grupo.
    tabs.setAttribute("size", "sm");
    const extra = createTab({ value: "req-4", label: "DELETE /users/1", closable: true });
    tabs.appendChild(extra);
    await waitFor(() => expect(extra).toHaveAttribute("variant", "editor"));
    await expect(extra).toHaveAttribute("size", "sm");
    await expect(extra.querySelector('[data-ark="tab-close"]')).not.toBeNull();
  }
};

export const TestHooks = {
  render: () => {
    const tabs = createTabs({ variant: "editor", value: "req-2", label: "Requisicoes" }, REQUESTS, "requests");
    const add = document.createElement("ark-button");
    add.setAttribute("slot", "actions");
    add.textContent = "+";
    tabs.appendChild(add);
    return tabs;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tabs = canvasElement.querySelector("ark-tabs")!;
    await expect(tabs).toHaveAttribute("data-ark", "tabs");
    await expect(tabs).toHaveAttribute("data-testid", "requests");
    await expect(tabs).toHaveAttribute("aria-label", "Requisicoes");
    await expect(tabs.querySelector('[slot="actions"]')).toHaveAttribute("data-ark", "tabs-actions");

    const tab = tabs.querySelector('[value="req-2"]')!;
    await expect(tab).toHaveAttribute("data-ark", "tab");
    await expect(tab.querySelector('[data-ark="tab-close"]')).not.toBeNull();
    await expect(tab.querySelector('[data-ark="tab-dirty"]')).not.toBeNull();
  }
};
