import type { ArkButtonVariant, ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkCopyButton",
  parameters: { layout: "padded" },
  argTypes: {
    value: { control: "text" },
    label: { control: "text", description: "Filhos do usuario; vazio usa o rotulo proprio (copy/copied)" },
    feedbackMs: { control: "number" },
    variant: { control: "select", options: ["primary", "solid", "outline", "ghost", "secondary", "neutral"] },
    intent: { control: "select", options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"] },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    iconOnly: { control: "boolean" },
    disabled: { control: "boolean" },
    lang: { control: "inline-radio", options: ["en", "pt", "es"] },
    theme: { control: "select", options: ["auto", "light", "dark"] }
  },
  args: {
    value: "https://api.arkuest.dev/v1/requests/42",
    label: "",
    feedbackMs: 1500,
    variant: "outline",
    intent: "primary",
    size: "sm",
    iconOnly: false,
    disabled: false,
    lang: "pt",
    theme: "auto"
  }
};

export default meta;

type StoryArgs = {
  value: string;
  label: string;
  feedbackMs: number;
  variant: ArkButtonVariant;
  intent: ArkIntent;
  size: ArkSize;
  iconOnly: boolean;
  disabled: boolean;
  lang: "en" | "pt" | "es";
  theme: ArkTheme;
  testid?: string;
  htmlFor?: string;
};

type CopyButtonEl = HTMLElement & { copy: () => Promise<boolean>; value: string; feedbackMs: number };

function createCopyButton(args: Partial<StoryArgs>): CopyButtonEl {
  const el = document.createElement("ark-copy-button") as CopyButtonEl;
  if (args.value !== undefined) el.setAttribute("value", args.value);
  if (args.htmlFor) el.setAttribute("for", args.htmlFor);
  if (args.feedbackMs !== undefined) el.setAttribute("feedback-ms", String(args.feedbackMs));
  if (args.variant) el.setAttribute("variant", args.variant);
  if (args.intent) el.setAttribute("intent", args.intent);
  if (args.size) el.setAttribute("size", args.size);
  if (args.iconOnly) el.setAttribute("icon-only", "");
  if (args.disabled) el.setAttribute("disabled", "");
  if (args.lang) el.setAttribute("lang", args.lang);
  if (args.theme) el.setAttribute("theme", args.theme);
  if (args.testid) el.setAttribute("testid", args.testid);
  if (args.label) el.textContent = args.label;
  return el;
}

function row(...items: HTMLElement[]): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "flex flex-wrap items-center gap-3";
  for (const item of items) wrap.appendChild(item);
  return wrap;
}

export const Playground = {
  render: (args: StoryArgs) => createCopyButton(args)
};

export const Variants = {
  render: () =>
    row(
      createCopyButton({ value: "x", variant: "primary", lang: "pt" }),
      createCopyButton({ value: "x", variant: "outline", lang: "pt" }),
      createCopyButton({ value: "x", variant: "ghost", intent: "neutral", lang: "pt" }),
      createCopyButton({ value: "x", variant: "outline", iconOnly: true, lang: "pt" }),
      createCopyButton({ value: "x", variant: "outline", label: "Copiar URL", lang: "pt" })
    )
};

export const Sizes = {
  render: () =>
    row(
      ...(["xs", "sm", "md", "lg", "xl"] as ArkSize[]).map((size) =>
        createCopyButton({ value: "x", size, variant: "outline", lang: "pt" })
      )
    )
};

// Painel de resposta: o botao copia o texto do elemento apontado por `for`.
export const CopyFromElement = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-2";
    wrap.style.maxWidth = "32rem";
    const bar = document.createElement("div");
    bar.className = "flex items-center justify-between text-xs";
    bar.style.color = "var(--ark-color-fg-muted)";
    bar.append("Resposta · 200 OK");
    bar.appendChild(
      createCopyButton({
        htmlFor: "resposta-json",
        variant: "ghost",
        intent: "neutral",
        size: "xs",
        iconOnly: true,
        lang: "pt"
      })
    );
    const pre = document.createElement("pre");
    pre.id = "resposta-json";
    pre.className = "rounded-lg p-3 text-xs";
    pre.style.background = "var(--ark-color-surface-muted)";
    pre.textContent = '{\n  "id": 42,\n  "status": "ok"\n}';
    wrap.append(bar, pre);
    return wrap;
  }
};

export const CopyFromInput = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex items-end gap-2";
    const input = document.createElement("ark-input");
    input.setAttribute("label", "Token");
    input.setAttribute("value", "sk-live-9f2a…");
    input.setAttribute("size", "sm");
    input.id = "token";
    wrap.appendChild(input);
    // `for` aponta para o ark-input: o value vem da propriedade `value` do host.
    wrap.appendChild(createCopyButton({ htmlFor: "token", variant: "outline", size: "sm", lang: "pt" }));
    return wrap;
  }
};

// Copia, troca icone/rotulo/title por "copiado" durante feedback-ms, anuncia e emite ark-copy com o texto;
// com filhos so o icone e o title mudam; icon-only leva o rotulo ao aria-label; `for` le value ou texto.
export const CopiesAndGivesFeedback = {
  render: () => {
    const wrap = row(
      createCopyButton({ value: "texto copiado", feedbackMs: 300, lang: "pt", variant: "outline" }),
      createCopyButton({ value: "com rotulo", feedbackMs: 300, lang: "pt", label: "Copiar URL", variant: "outline" }),
      createCopyButton({ value: "so icone", feedbackMs: 300, lang: "pt", iconOnly: true, variant: "outline" })
    );
    const source = document.createElement("span");
    source.id = "fonte-texto";
    source.textContent = "texto da fonte";
    wrap.appendChild(source);
    wrap.appendChild(
      createCopyButton({ htmlFor: "fonte-texto", feedbackMs: 300, lang: "pt", variant: "ghost", intent: "neutral" })
    );
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const [plain, labelled, iconOnly, fromEl] = Array.from(
      canvasElement.querySelectorAll("ark-copy-button")
    ) as CopyButtonEl[];
    const copies: string[] = [];
    canvasElement.addEventListener("ark-copy", (event) =>
      copies.push((event as CustomEvent<{ value: string }>).detail.value)
    );
    // Sem permissao de clipboard no runner: registra o que seria escrito.
    const written: string[] = [];
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: (text: string) => {
          written.push(text);
          return Promise.resolve();
        }
      }
    });

    await expect(plain).toHaveAttribute("data-ark", "copy-button");
    await expect(plain).toHaveAttribute("role", "button");
    await expect(plain.textContent?.trim()).toBe("Copiar");
    await expect(plain.title).toBe("Copiar");

    await userEvent.click(plain);
    await waitFor(() => expect(plain).toHaveAttribute("data-ark-copied"));
    await expect(plain.textContent?.trim()).toBe("Copiado");
    await expect(plain.title).toBe("Copiado");
    await expect(written).toEqual(["texto copiado"]);
    await expect(copies).toEqual(["texto copiado"]);
    await waitFor(() => expect(document.querySelector('[data-ark="announcer"]')?.textContent).toContain("Copiado"));
    await waitFor(() => expect(plain).not.toHaveAttribute("data-ark-copied"));
    await expect(plain.textContent?.trim()).toBe("Copiar");

    // Filhos do usuario: rotulo intacto, so icone e title mudam.
    await expect(labelled.querySelector('[data-ark="copy-button-text"]')).toBeNull();
    await userEvent.click(labelled);
    await waitFor(() => expect(labelled).toHaveAttribute("data-ark-copied"));
    await expect(labelled.textContent?.trim()).toBe("Copiar URL");
    await expect(labelled.title).toBe("Copiado");

    // icon-only: nome pelo aria-label.
    await expect(iconOnly).toHaveAccessibleName("Copiar");
    await expect(canvas.getAllByRole("button", { name: "Copiar" })).toContain(iconOnly);
    await userEvent.click(iconOnly);
    await waitFor(() => expect(iconOnly).toHaveAttribute("aria-label", "Copiado"));

    // `for`: texto do elemento; a propriedade value tambem devolve.
    await expect(fromEl.value).toBe("texto da fonte");
    await expect(await fromEl.copy()).toBe(true);
    await expect(written.at(-1)).toBe("texto da fonte");

    // Desabilitado nao copia.
    plain.setAttribute("disabled", "");
    await expect(await plain.copy()).toBe(false);
  }
};

export const TestHooks = {
  render: () => createCopyButton({ value: "x", lang: "pt", testid: "copiar" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await expect(canvasElement.querySelector('[data-ark="copy-button"]')).toHaveAttribute("data-testid", "copiar");
    await expect(canvasElement.querySelector('[data-ark="copy-button-icon"]')).toHaveAttribute(
      "data-testid",
      "copiar-icon"
    );
    await expect(canvasElement.querySelector('[data-ark="copy-button-text"]')).toHaveAttribute(
      "data-testid",
      "copiar-text"
    );
    await expect(canvasElement.querySelector('[data-ark="button"]')).toBeNull();
  }
};
