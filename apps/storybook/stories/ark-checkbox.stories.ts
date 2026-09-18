import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkCheckbox",
  argTypes: {
    label: { control: "text" },
    checked: { control: "boolean" },
    indeterminate: { control: "boolean" },
    disabled: { control: "boolean" },
    intent: { control: "select", options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"] },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    name: { control: "text" },
    value: { control: "text" },
    testid: { control: "text" }
  },
  args: {
    label: "Aceito os termos",
    checked: false,
    indeterminate: false,
    disabled: false,
    intent: "primary",
    theme: "auto",
    size: "md",
    name: "",
    value: "",
    testid: ""
  }
};

export default meta;

type StoryArgs = {
  label: string;
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  intent: ArkIntent;
  theme: ArkTheme;
  size: ArkSize;
  name: string;
  value: string;
  testid: string;
};

type CheckboxEl = HTMLElement & { checked: boolean; indeterminate: boolean; toggle: () => void };

function createCheckbox(args: Partial<StoryArgs> & { ariaLabel?: string; html?: string }): CheckboxEl {
  const el = document.createElement("ark-checkbox") as CheckboxEl;
  if (args.label) el.setAttribute("label", args.label);
  if (args.ariaLabel) el.setAttribute("aria-label", args.ariaLabel);
  if (args.html) el.innerHTML = args.html;
  if (args.intent) el.setAttribute("intent", args.intent);
  if (args.theme) el.setAttribute("theme", args.theme);
  if (args.size) el.setAttribute("size", args.size);
  if (args.name) el.setAttribute("name", args.name);
  if (args.value) el.setAttribute("value", args.value);
  if (args.testid) el.setAttribute("testid", args.testid);
  if (args.checked) el.setAttribute("checked", "");
  if (args.indeterminate) el.setAttribute("indeterminate", "");
  if (args.disabled) el.setAttribute("disabled", "");
  return el;
}

function column(...items: HTMLElement[]): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "flex flex-col items-start gap-3";
  for (const item of items) wrap.appendChild(item);
  return wrap;
}

export const Playground = {
  render: (args: StoryArgs) => createCheckbox(args)
};

export const States = {
  render: () =>
    column(
      createCheckbox({ label: "Desmarcado" }),
      createCheckbox({ label: "Marcado", checked: true }),
      createCheckbox({ label: "Indeterminado", indeterminate: true }),
      createCheckbox({ label: "Desabilitado", disabled: true }),
      createCheckbox({ label: "Desabilitado e marcado", disabled: true, checked: true })
    )
};

export const Sizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap items-center gap-6";
    for (const size of ["xs", "sm", "md", "lg", "xl"] as ArkSize[]) {
      wrap.appendChild(createCheckbox({ size, checked: true, label: size }));
    }
    return wrap;
  }
};

export const Intents = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap items-center gap-6";
    for (const intent of ["primary", "secondary", "success", "warning", "danger", "info", "neutral"] as ArkIntent[]) {
      wrap.appendChild(createCheckbox({ intent, checked: true, label: intent }));
    }
    return wrap;
  }
};

export const WithoutVisibleLabel = {
  render: () => {
    const row = document.createElement("div");
    row.className = "flex items-center gap-3 text-sm";
    row.appendChild(createCheckbox({ ariaLabel: "Habilitado", checked: true }));
    const text = document.createElement("span");
    text.textContent = "Linha de tabela: a caixa sem rótulo visível leva aria-label no host.";
    text.style.color = "var(--ark-color-fg-muted)";
    row.appendChild(text);
    return row;
  }
};

export const RichLabel = {
  render: () =>
    createCheckbox({
      html: 'Aceito os <a href="#" class="underline" style="color: var(--ark-color-primary)">termos de uso</a> e a política de privacidade'
    })
};

export const InsideDisabledFieldset = {
  render: () => {
    const form = document.createElement("form");
    const fieldset = document.createElement("fieldset");
    fieldset.disabled = true;
    fieldset.className = "flex flex-col gap-3 rounded-lg border border-dashed p-4";
    fieldset.style.borderColor = "var(--ark-color-border)";
    const legend = document.createElement("legend");
    legend.className = "px-1 text-xs";
    legend.style.color = "var(--ark-color-fg-muted)";
    legend.textContent = "<fieldset disabled>";
    fieldset.appendChild(legend);
    fieldset.appendChild(createCheckbox({ label: "Herda o disabled do fieldset", checked: true }));
    fieldset.appendChild(createCheckbox({ label: "Sem atributo disabled próprio" }));
    form.appendChild(fieldset);
    return form;
  }
};

// Clique na caixa, no <label for> e Espaço alternam; Enter não. `change` traz { checked }.
export const TogglesOnClick = {
  render: () => createCheckbox({ label: "Notificações", name: "notify" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const host = canvasElement.querySelector("ark-checkbox") as CheckboxEl;
    const box = canvas.getByRole("checkbox", { name: "Notificações" });
    const changes: boolean[] = [];
    host.addEventListener("change", (event) =>
      changes.push((event as CustomEvent<{ checked: boolean }>).detail.checked)
    );

    await expect(box).toHaveAttribute("aria-checked", "false");
    await userEvent.click(box);
    await expect(box).toHaveAttribute("aria-checked", "true");
    await expect(host).toHaveAttribute("checked");
    await expect(host.checked).toBe(true);

    await userEvent.click(canvas.getByText("Notificações"));
    await expect(box).toHaveAttribute("aria-checked", "false");

    box.focus();
    await userEvent.keyboard(" ");
    await expect(box).toHaveAttribute("aria-checked", "true");
    await userEvent.keyboard("{Enter}");
    await expect(box).toHaveAttribute("aria-checked", "true");

    await expect(changes).toEqual([true, false, true]);
  }
};

// O rótulo livre (filhos) nomeia a caixa por aria-labelledby e a alterna ao clique; o link dentro dele não.
export const ChildrenAsLabel = {
  render: () => createCheckbox({ html: 'Aceito os <a href="#" data-link>termos</a>' }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const host = canvasElement.querySelector("ark-checkbox") as CheckboxEl;
    const box = canvas.getByRole("checkbox", { name: "Aceito os termos" });

    await expect(box).toHaveAttribute("aria-labelledby", host.id);
    await userEvent.click(canvas.getByText("Aceito os", { exact: false }));
    await expect(box).toHaveAttribute("aria-checked", "true");
    await expect(box).toHaveFocus();

    const link = canvasElement.querySelector("[data-link]") as HTMLAnchorElement;
    link.addEventListener("click", (event) => event.preventDefault());
    await userEvent.click(link);
    await expect(box).toHaveAttribute("aria-checked", "true");

    // Rótulo que chega depois (frameworks) também nomeia.
    const late = createCheckbox({});
    canvasElement.appendChild(late);
    const lateBox = late.querySelector('[data-ark="checkbox"]') as HTMLElement;
    await expect(lateBox).not.toHaveAttribute("aria-labelledby");
    late.append("Tardio");
    await waitFor(() => expect(lateBox).toHaveAttribute("aria-labelledby", late.id));
  }
};

// Indeterminado: aria-checked="mixed" e o traço; o clique limpa e marca. Pelo JS, a propriedade espelha.
export const Indeterminate = {
  render: () => createCheckbox({ label: "Selecionar tudo", indeterminate: true }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const host = canvasElement.querySelector("ark-checkbox") as CheckboxEl;
    const box = canvas.getByRole("checkbox", { name: "Selecionar tudo" });
    const input = host.querySelector("input") as HTMLInputElement;

    await expect(box).toHaveAttribute("aria-checked", "mixed");
    await expect(input.indeterminate).toBe(true);
    await userEvent.click(box);
    await expect(box).toHaveAttribute("aria-checked", "true");
    await expect(host.indeterminate).toBe(false);
    await expect(input.indeterminate).toBe(false);

    host.indeterminate = true;
    await expect(box).toHaveAttribute("aria-checked", "mixed");
    // Frameworks passam "" como propriedade: continua presente; "false" desliga.
    host.indeterminate = "false" as unknown as boolean;
    await expect(box).toHaveAttribute("aria-checked", "true");
    host.checked = "" as unknown as boolean;
    await expect(host.checked).toBe(true);
  }
};

// O input oculto leva name/value ao formulário só quando marcado; <fieldset disabled> tira os dois do envio
// e bloqueia o clique sem atributo disabled no host.
export const FormParticipation = {
  render: () => {
    const form = document.createElement("form");
    form.className = "flex flex-col items-start gap-3";
    form.appendChild(createCheckbox({ label: "Newsletter", name: "newsletter", value: "yes" }));
    form.appendChild(createCheckbox({ label: "Termos", name: "terms", checked: true }));
    const fieldset = document.createElement("fieldset");
    fieldset.disabled = true;
    fieldset.appendChild(createCheckbox({ label: "Bloqueado", name: "locked", checked: true }));
    form.appendChild(fieldset);
    return form;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const form = canvasElement.querySelector("form") as HTMLFormElement;

    let data = new FormData(form);
    await expect(data.get("newsletter")).toBeNull();
    await expect(data.get("terms")).toBe("on");
    await expect(data.get("locked")).toBeNull();

    await userEvent.click(canvas.getByRole("checkbox", { name: "Newsletter" }));
    data = new FormData(form);
    await expect(data.get("newsletter")).toBe("yes");

    const locked = canvas.getByRole("checkbox", { name: "Bloqueado" });
    const lockedHost = locked.closest("ark-checkbox") as CheckboxEl;
    await expect(locked).toBeDisabled();
    await expect(lockedHost).not.toHaveAttribute("disabled");
    await expect(getComputedStyle(lockedHost).opacity).toBe("0.5");
    lockedHost.toggle();
    await expect(locked).toHaveAttribute("aria-checked", "true");
  }
};

export const TestHooks = {
  render: () => createCheckbox({ label: "Hooks", testid: "meu-checkbox" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const box = canvasElement.querySelector('[data-ark="checkbox"]');
    const label = canvasElement.querySelector('[data-ark="checkbox-label"]');
    const input = canvasElement.querySelector('[data-ark="checkbox-input"]');

    await expect(box).not.toBeNull();
    await expect(box).toHaveAttribute("data-testid", "meu-checkbox");
    await expect(label).toHaveAttribute("data-testid", "meu-checkbox-label");
    await expect(input).toHaveAttribute("data-testid", "meu-checkbox-input");
  }
};
