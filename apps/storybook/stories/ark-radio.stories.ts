import type { ArkIntent, ArkSize, ArkTheme } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkRadio",
  argTypes: {
    checked: { control: "text", description: "value da opção marcada" },
    disabled: { control: "boolean" },
    intent: { control: "select", options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"] },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    testid: { control: "text" }
  },
  args: {
    checked: "get",
    disabled: false,
    intent: "primary",
    theme: "auto",
    size: "md",
    testid: ""
  }
};

export default meta;

type StoryArgs = {
  checked: string;
  disabled: boolean;
  intent: ArkIntent;
  theme: ArkTheme;
  size: ArkSize;
  testid: string;
};

type RadioEl = HTMLElement & { checked: boolean; value: string; select: () => void };

type RadioOptions = Partial<StoryArgs> & {
  name: string;
  value: string;
  label?: string;
  ariaLabel?: string;
  html?: string;
  isChecked?: boolean;
};

function createRadio(args: RadioOptions): RadioEl {
  const el = document.createElement("ark-radio") as RadioEl;
  el.setAttribute("name", args.name);
  el.setAttribute("value", args.value);
  if (args.label) el.setAttribute("label", args.label);
  if (args.ariaLabel) el.setAttribute("aria-label", args.ariaLabel);
  if (args.html) el.innerHTML = args.html;
  if (args.intent) el.setAttribute("intent", args.intent);
  if (args.theme) el.setAttribute("theme", args.theme);
  if (args.size) el.setAttribute("size", args.size);
  if (args.testid) el.setAttribute("testid", args.testid);
  if (args.isChecked) el.setAttribute("checked", "");
  if (args.disabled) el.setAttribute("disabled", "");
  return el;
}

const METHODS = ["GET", "POST", "PUT", "DELETE"];

// Um grupo de métodos HTTP num <fieldset role="radiogroup">, como o app monta.
function createGroup(args: Partial<StoryArgs>, options: { name?: string; disabledValue?: string } = {}): HTMLElement {
  const name = options.name ?? "method";
  const group = document.createElement("fieldset");
  group.setAttribute("role", "radiogroup");
  group.setAttribute("aria-label", "Método");
  group.className = "flex flex-col items-start gap-3";
  for (const method of METHODS) {
    const value = method.toLowerCase();
    group.appendChild(
      createRadio({
        ...args,
        name,
        value,
        label: method,
        isChecked: args.checked === value,
        disabled: args.disabled || options.disabledValue === value
      })
    );
  }
  return group;
}

export const Playground = {
  render: (args: StoryArgs) => createGroup(args)
};

export const Sizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap items-center gap-6";
    for (const size of ["xs", "sm", "md", "lg", "xl"] as ArkSize[]) {
      wrap.appendChild(createRadio({ name: `size-${size}`, value: size, size, label: size, isChecked: true }));
    }
    return wrap;
  }
};

export const Intents = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap items-center gap-6";
    for (const intent of ["primary", "secondary", "success", "warning", "danger", "info", "neutral"] as ArkIntent[]) {
      wrap.appendChild(
        createRadio({ name: `intent-${intent}`, value: intent, intent, label: intent, isChecked: true })
      );
    }
    return wrap;
  }
};

export const WithDisabledOption = {
  render: () => createGroup({ checked: "get" }, { disabledValue: "delete" })
};

export const RichLabel = {
  render: () => {
    const group = document.createElement("div");
    group.setAttribute("role", "radiogroup");
    group.setAttribute("aria-label", "Plano");
    group.className = "flex flex-col items-start gap-3";
    group.appendChild(
      createRadio({
        name: "plan",
        value: "free",
        isChecked: true,
        html: '<span><strong>Gratuito</strong> <span style="color: var(--ark-color-fg-muted)">até 3 workspaces</span></span>'
      })
    );
    group.appendChild(
      createRadio({
        name: "plan",
        value: "pro",
        html: '<span><strong>Pro</strong> <span style="color: var(--ark-color-fg-muted)">workspaces ilimitados</span></span>'
      })
    );
    return group;
  }
};

// Clique marca e desmarca as outras; `change` dispara uma vez, só em quem ganhou a marca, com o value;
// clicar na marcada não emite; marcar pelo atributo também desmarca as outras, em silêncio.
export const ExclusiveSelection = {
  render: () => createGroup({ checked: "get" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const values: string[] = [];
    canvasElement.addEventListener("change", (event) =>
      values.push((event as CustomEvent<{ value: string }>).detail.value)
    );
    const get = canvas.getByRole("radio", { name: "GET" });
    const post = canvas.getByRole("radio", { name: "POST" });
    const put = canvas.getByRole("radio", { name: "PUT" });

    await expect(get).toHaveAttribute("aria-checked", "true");
    await userEvent.click(post);
    await expect(post).toHaveAttribute("aria-checked", "true");
    await expect(get).toHaveAttribute("aria-checked", "false");
    await expect(canvasElement.querySelectorAll("ark-radio[checked]")).toHaveLength(1);

    await userEvent.click(post);
    await userEvent.click(canvas.getByText("PUT"));
    await expect(put).toHaveAttribute("aria-checked", "true");
    await expect(values).toEqual(["post", "put"]);

    (get.closest("ark-radio") as RadioEl).checked = true;
    await expect(get).toHaveAttribute("aria-checked", "true");
    await expect(put).toHaveAttribute("aria-checked", "false");
    await expect(values).toEqual(["post", "put"]);
  }
};

// Setas movem o foco e marcam (dando a volta e pulando a desabilitada); Espaço marca a focada; Enter não.
export const ArrowKeys = {
  render: () => createGroup({ checked: "get" }, { disabledValue: "put" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const get = canvas.getByRole("radio", { name: "GET" });
    const post = canvas.getByRole("radio", { name: "POST" });
    const del = canvas.getByRole("radio", { name: "DELETE" });

    get.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(post).toHaveFocus();
    await expect(post).toHaveAttribute("aria-checked", "true");
    await userEvent.keyboard("{ArrowRight}");
    await expect(del).toHaveFocus();
    await expect(del).toHaveAttribute("aria-checked", "true");
    await userEvent.keyboard("{ArrowDown}");
    await expect(get).toHaveFocus();
    await expect(get).toHaveAttribute("aria-checked", "true");
    await userEvent.keyboard("{ArrowUp}");
    await expect(del).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(post).toHaveFocus();

    // Espaço em quem não está marcada marca; Enter não faz nada.
    (get.closest("ark-radio") as RadioEl).checked = true;
    await expect(post).toHaveAttribute("aria-checked", "false");
    await userEvent.keyboard("{Enter}");
    await expect(post).toHaveAttribute("aria-checked", "false");
    await userEvent.keyboard(" ");
    await expect(post).toHaveAttribute("aria-checked", "true");
  }
};

// Um só tab stop por grupo: a marcada, ou a primeira habilitada quando nenhuma está; grupos distintos não se
// misturam e quem sai do DOM devolve o tab stop.
export const RovingTabIndex = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-6";
    wrap.appendChild(createGroup({ checked: "post" }));
    wrap.appendChild(createGroup({}, { name: "other", disabledValue: "get" }));
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tabStops = (name: string) =>
      Array.from(canvasElement.querySelectorAll<HTMLElement>(`ark-radio[name="${name}"] [data-ark="radio"]`))
        .filter((box) => box.tabIndex === 0)
        .map((box) => (box.closest("ark-radio") as RadioEl).value);

    await expect(tabStops("method")).toEqual(["post"]);
    await expect(tabStops("other")).toEqual(["post"]);

    const otherPut = canvasElement.querySelector('ark-radio[name="other"][value="put"]') as RadioEl;
    otherPut.checked = true;
    await expect(tabStops("other")).toEqual(["put"]);
    await expect(tabStops("method")).toEqual(["post"]);

    otherPut.remove();
    await waitFor(() => expect(tabStops("other")).toEqual(["post"]));

    // Tab de fora entra pela marcada e sai do grupo no próximo Tab.
    const before = document.createElement("button");
    before.textContent = "antes";
    canvasElement.prepend(before);
    before.focus();
    await userEvent.tab();
    await expect(
      canvasElement.querySelector('ark-radio[name="method"][value="post"] [data-ark="radio"]')
    ).toHaveFocus();
    await userEvent.tab();
    await expect(canvasElement.querySelector('ark-radio[name="other"][value="post"] [data-ark="radio"]')).toHaveFocus();
  }
};

// O input oculto agrupa por name no formulário: envia o value da marcada; dois grupos no mesmo form são
// independentes; <fieldset disabled> tira o grupo do envio e bloqueia o clique.
export const FormParticipation = {
  render: () => {
    const form = document.createElement("form");
    form.className = "flex flex-col gap-6";
    form.appendChild(createGroup({ checked: "get" }));
    form.appendChild(createGroup({ checked: "delete" }, { name: "fallback" }));
    const fieldset = document.createElement("fieldset");
    fieldset.disabled = true;
    fieldset.appendChild(createRadio({ name: "locked", value: "a", label: "Bloqueado A", isChecked: true }));
    fieldset.appendChild(createRadio({ name: "locked", value: "b", label: "Bloqueado B" }));
    form.appendChild(fieldset);
    return form;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const form = canvasElement.querySelector("form") as HTMLFormElement;

    let data = new FormData(form);
    await expect(data.get("method")).toBe("get");
    await expect(data.get("fallback")).toBe("delete");
    await expect(data.get("locked")).toBeNull();

    await userEvent.click(canvas.getAllByRole("radio", { name: "POST" })[0]);
    data = new FormData(form);
    await expect(data.get("method")).toBe("post");
    await expect(data.get("fallback")).toBe("delete");

    const lockedB = canvas.getByRole("radio", { name: "Bloqueado B" });
    await expect(lockedB).toBeDisabled();
    (lockedB.closest("ark-radio") as RadioEl).select();
    await expect(lockedB).toHaveAttribute("aria-checked", "false");
  }
};

export const TestHooks = {
  render: () => createRadio({ name: "hooks", value: "one", label: "Hooks", testid: "meu-radio", isChecked: true }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const box = canvasElement.querySelector('[data-ark="radio"]');
    const dot = canvasElement.querySelector('[data-ark="radio-dot"]');
    const label = canvasElement.querySelector('[data-ark="radio-label"]');
    const input = canvasElement.querySelector('[data-ark="radio-input"]');

    await expect(box).toHaveAttribute("data-testid", "meu-radio");
    await expect(dot).toHaveAttribute("data-testid", "meu-radio-dot");
    await expect(label).toHaveAttribute("data-testid", "meu-radio-label");
    await expect(input).toHaveAttribute("data-testid", "meu-radio-input");
  }
};
