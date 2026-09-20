import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkToggle",
  argTypes: {
    pressed: { control: "boolean" },
    disabled: { control: "boolean" },
    intent: { control: "select", options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"] },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    label: { control: "text" }
  },
  args: {
    pressed: false,
    disabled: false,
    intent: "primary",
    theme: "auto",
    size: "md",
    label: "Action"
  }
};

export default meta;

type StoryArgs = {
  pressed: boolean;
  disabled: boolean;
  intent: ArkIntent;
  theme: ArkTheme;
  size: ArkSize;
  label: string;
};

function createToggle(
  label: string,
  options: {
    pressed?: boolean;
    disabled?: boolean;
    value?: string;
    intent?: string;
    theme?: string;
    size?: string;
  } = {}
): HTMLElement {
  const el = document.createElement("ark-toggle");
  if (options.intent) el.setAttribute("intent", options.intent);
  if (options.theme) el.setAttribute("theme", options.theme);
  if (options.size) el.setAttribute("size", options.size);
  if (options.value) el.setAttribute("value", options.value);
  if (options.pressed) el.setAttribute("pressed", "");
  if (options.disabled) el.setAttribute("disabled", "");
  el.textContent = label;
  return el;
}

export const Playground = {
  render: ({ pressed, disabled, intent, theme, size, label }: StoryArgs) =>
    createToggle(label, { pressed, disabled, intent, theme, size })
};

export const Group = {
  render: () => {
    const group = document.createElement("ark-toggle-group");
    group.setAttribute("value", "left");
    group.appendChild(createToggle("Left", { value: "left" }));
    group.appendChild(createToggle("Center", { value: "center" }));
    group.appendChild(createToggle("Right", { value: "right" }));
    return group;
  }
};

export const GroupMultiple = {
  render: () => {
    const group = document.createElement("ark-toggle-group");
    group.setAttribute("multiple", "");
    group.setAttribute("value", "bold,italic");
    group.appendChild(createToggle("Bold", { value: "bold" }));
    group.appendChild(createToggle("Italic", { value: "italic" }));
    group.appendChild(createToggle("Underline", { value: "underline" }));
    return group;
  }
};

export const GroupDark = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.padding = "16px";
    wrap.style.borderRadius = "12px";
    wrap.style.background = "#0f172a";

    const group = document.createElement("ark-toggle-group");
    group.setAttribute("theme", "dark");
    group.setAttribute("value", "day");
    group.appendChild(createToggle("Day", { value: "day" }));
    group.appendChild(createToggle("Week", { value: "week" }));
    group.appendChild(createToggle("Month", { value: "month" }));
    wrap.appendChild(group);

    return wrap;
  }
};

export const StandaloneIntents = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexWrap = "wrap";
    wrap.style.gap = "12px";

    ["primary", "success", "warning", "danger", "info"].forEach((intent) => {
      wrap.appendChild(createToggle(intent, { intent, pressed: true }));
    });

    return wrap;
  }
};

export const TogglesOnClick = {
  render: () => createToggle("Favorito"),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole("button", { name: "Favorito" });

    await expect(control).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(control);
    await expect(control).toHaveAttribute("aria-pressed", "true");
  }
};

export const GroupDynamicItems = {
  render: Group.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const group = canvasElement.querySelector("ark-toggle-group")!;

    // O host é o próprio grupo: role e itens como filhos diretos.
    await expect(group).toHaveAttribute("role", "group");
    await expect(canvas.getByRole("button", { name: "Left" }).parentElement).toBe(group);

    // Item adicionado depois da montagem herda o size do grupo e entra na seleção.
    group.setAttribute("size", "sm");
    const extra = createToggle("Extra", { value: "extra" });
    group.appendChild(extra);
    await waitFor(() => expect(extra).toHaveAttribute("size", "sm"));

    await userEvent.click(extra);
    await expect(group).toHaveAttribute("value", "extra");
    await expect(canvas.getByRole("button", { name: "Left" })).toHaveAttribute("aria-pressed", "false");
  }
};

export const GroupExclusiveSelection = {
  render: Group.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const left = canvas.getByRole("button", { name: "Left" });
    const center = canvas.getByRole("button", { name: "Center" });

    await expect(left).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(center);
    await expect(center).toHaveAttribute("aria-pressed", "true");
    await expect(left).toHaveAttribute("aria-pressed", "false");

    const group = canvasElement.querySelector("ark-toggle-group");
    await expect(group).toHaveAttribute("value", "center");
  }
};

export const GroupEmitsOnce = {
  render: Group.render,
  // Quem escuta `change` no proprio grupo recebe so o consolidado, nunca o do item.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const group = canvasElement.querySelector("ark-toggle-group")!;
    const received: string[] = [];
    group.addEventListener("change", (event) => received.push((event.target as HTMLElement).tagName.toLowerCase()));

    const toggles = Array.from(group.querySelectorAll("ark-toggle"));
    const next = toggles.find((toggle) => toggle.getAttribute("aria-pressed") !== "true") ?? toggles[0];
    await userEvent.click(next);
    await expect(received).toEqual(["ark-toggle-group"]);
  }
};

type ToggleElement = HTMLElement & {
  pressed: boolean | string | null | undefined;
  disabled: boolean | string | null | undefined;
  value: string;
  toggle(): void;
};

export const KeyboardAndDisabled = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex gap-2";
    const toggle = createToggle("Favorito", { value: "fav" });
    const inner = document.createElement("span");
    inner.textContent = " (com filho)";
    toggle.appendChild(inner);
    wrap.append(toggle, createToggle("Bloqueado", { disabled: true, value: "locked" }));
    return wrap;
  },
  // Enter e Espaco alternam (Espaco no keyup, como um botao nativo); teclas vindas de um filho sao ignoradas;
  // desabilitado nao reage a clique nem teclado e sai do tabindex; os setters aceitam a regra dos wrappers.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", { name: /Favorito/ }) as ToggleElement;
    const locked = canvas.getByRole("button", { name: "Bloqueado" }) as ToggleElement;
    const changes: Array<{ pressed: boolean; value: string }> = [];
    canvasElement.addEventListener("change", (event) => {
      changes.push((event as CustomEvent<{ pressed: boolean; value: string }>).detail);
    });

    toggle.focus();
    await userEvent.keyboard("{Enter}");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await userEvent.keyboard(" ");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(changes).toEqual([
      { pressed: true, value: "fav" },
      { pressed: false, value: "fav" }
    ]);

    // Tecla disparada por um filho nao alterna.
    const inner = toggle.querySelector("span")!;
    inner.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    inner.dispatchEvent(new KeyboardEvent("keyup", { key: " ", bubbles: true }));
    await expect(toggle).toHaveAttribute("aria-pressed", "false");

    // Desabilitado: tabindex -1, aria-disabled, clique cancelado (o CSS ja corta pointer-events; o evento vai
    // direto) e teclado ignorado.
    await expect(locked).toHaveAttribute("tabindex", "-1");
    await expect(locked).toHaveAttribute("aria-disabled", "true");
    expect(locked.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))).toBe(false);
    locked.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    locked.dispatchEvent(new KeyboardEvent("keyup", { key: " ", bubbles: true }));
    locked.toggle();
    await expect(locked).toHaveAttribute("aria-pressed", "false");
    expect(changes).toHaveLength(2);

    // Setters com a regra dos wrappers: "" liga, "false" desliga.
    locked.disabled = "false";
    expect(locked.hasAttribute("disabled")).toBe(false);
    await expect(locked).toHaveAttribute("tabindex", "0");
    expect(locked.hasAttribute("aria-disabled")).toBe(false);
    locked.toggle();
    await expect(locked).toHaveAttribute("aria-pressed", "true");
    expect(changes.at(-1)).toEqual({ pressed: true, value: "locked" });
    locked.disabled = "";
    await expect(locked).toHaveAttribute("aria-disabled", "true");
    toggle.pressed = "";
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    toggle.pressed = "false";
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(changes).toHaveLength(3);
  }
};

export const ClassAndTestHooks = {
  render: () => {
    const toggle = createToggle("Hooks", { value: "hooks" });
    toggle.setAttribute("testid", "meu-toggle");
    toggle.className = "extra";
    return toggle;
  },
  // O host carrega as classes: um framework que reescreve `class` nao as apaga; os hooks ficam no proprio host.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const toggle = canvasElement.querySelector<HTMLElement>("ark-toggle")!;
    await expect(toggle).toHaveAttribute("data-ark", "toggle");
    await expect(toggle).toHaveAttribute("data-testid", "meu-toggle");
    expect(toggle.classList.contains("extra")).toBe(true);
    expect(toggle.classList.contains("ark:inline-flex")).toBe(true);

    toggle.className = "outra";
    expect(toggle.classList.contains("outra")).toBe(true);
    expect(toggle.classList.contains("extra")).toBe(false);
    expect(toggle.classList.contains("ark:inline-flex")).toBe(true);

    toggle.setAttribute("class", "");
    expect(toggle.classList.contains("ark:inline-flex")).toBe(true);
  }
};

export const GroupPropagation = {
  render: () => {
    const group = document.createElement("ark-toggle-group");
    group.setAttribute("value", "left");
    group.setAttribute("testid", "alinhamento");
    group.className = "extra";
    group.appendChild(createToggle("Left", { value: "left" }));
    group.appendChild(createToggle("Center", { value: "center" }));
    group.appendChild(createToggle("Right", { value: "right", disabled: true }));
    return group;
  },
  // `value` por propriedade seleciona o item (vazio limpa); size/intent/theme/disabled do grupo descem para os itens
  // e o disabled do grupo e retirado sem apagar o individual; `class` reescrita mantem as classes do host.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const group = canvasElement.querySelector<HTMLElement & { value: string }>("ark-toggle-group")!;
    const left = canvas.getByRole("button", { name: "Left" });
    const center = canvas.getByRole("button", { name: "Center" });
    const right = canvas.getByRole("button", { name: "Right" });

    await expect(group).toHaveAttribute("data-ark", "toggle-group");
    await expect(group).toHaveAttribute("data-testid", "alinhamento");

    group.value = "center";
    await expect(group).toHaveAttribute("value", "center");
    await expect(center).toHaveAttribute("aria-pressed", "true");
    await expect(left).toHaveAttribute("aria-pressed", "false");
    group.value = "";
    expect(group.hasAttribute("value")).toBe(false);
    await expect(center).toHaveAttribute("aria-pressed", "false");

    group.setAttribute("size", "lg");
    group.setAttribute("intent", "danger");
    group.setAttribute("theme", "dark");
    await expect(left).toHaveAttribute("size", "lg");
    await expect(left).toHaveAttribute("intent", "danger");
    await expect(left).toHaveAttribute("theme", "dark");

    group.setAttribute("disabled", "");
    await expect(left).toHaveAttribute("aria-disabled", "true");
    await expect(left).toHaveAttribute("data-group-disabled", "true");
    // O "Right" ja era desabilitado por conta propria: nao leva a marca do grupo.
    expect(right.hasAttribute("data-group-disabled")).toBe(false);
    group.removeAttribute("disabled");
    expect(left.hasAttribute("disabled")).toBe(false);
    expect(left.hasAttribute("data-group-disabled")).toBe(false);
    await expect(right).toHaveAttribute("aria-disabled", "true");

    group.className = "outra";
    expect(group.classList.contains("outra")).toBe(true);
    expect(group.classList.contains("ark:inline-flex")).toBe(true);
  }
};
