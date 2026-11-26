import type { ArkIntent, ArkOrientation, ArkSize } from "@tooark/core";
import type { ArkRadio, ArkRadioGroup } from "@tooark/web-components";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkRadioGroup",
  parameters: {
    // O papel, o nome e a descrição do grupo são o que ele acrescenta: aqui uma violação do axe reprova.
    a11y: { test: "error" },
    docs: {
      description: {
        component:
          'Grupo de rádios: o host `ark-radio-group` é o `role="radiogroup"` e os `ark-radio` do app ficam onde estão. Dentro dele os rádios formam um grupo pela presença no host, com ou sem `name`. `value` reflete o rádio marcado e, atribuído, marca o desse valor; o grupo emite um `change` só, com `detail: { value }`. `label` desenha a legenda, `helper` e `error-message` a mensagem abaixo, como nos campos. `orientation` (`vertical`, padrão / `horizontal`), `required`, e `name`, `size`, `intent`, `theme` e `disabled` valem para todos os rádios. Os rádios continuam funcionando sem o grupo, agrupados por `name`.'
      }
    }
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    intent: {
      control: "select",
      options: ["", "primary", "secondary", "success", "warning", "danger", "info", "neutral"]
    },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    label: { control: "text" },
    helper: { control: "text" },
    errorMessage: { control: "text" }
  },
  args: {
    orientation: "vertical",
    size: "md",
    intent: "",
    disabled: false,
    required: false,
    label: "Plano",
    helper: "Você pode trocar depois.",
    errorMessage: ""
  }
};

export default meta;

type StoryArgs = {
  orientation: ArkOrientation;
  size: ArkSize;
  intent: ArkIntent | "";
  disabled: boolean;
  required: boolean;
  label: string;
  helper: string;
  errorMessage: string;
  value?: string;
  name?: string;
  testid?: string;
};

const PLANS: [string, string][] = [
  ["free", "Gratuito"],
  ["pro", "Profissional"],
  ["team", "Equipe"]
];

function createRadio(value: string, label: string): ArkRadio {
  const radio = document.createElement("ark-radio") as ArkRadio;
  radio.setAttribute("value", value);
  radio.setAttribute("label", label);
  return radio;
}

function createGroup(args: Partial<StoryArgs>, options: [string, string][] = PLANS): ArkRadioGroup {
  const group = document.createElement("ark-radio-group") as ArkRadioGroup;
  if (args.label !== "") group.setAttribute("label", args.label ?? "Plano");
  if (args.helper) group.setAttribute("helper", args.helper);
  if (args.errorMessage) group.setAttribute("error-message", args.errorMessage);
  if (args.orientation && args.orientation !== "vertical") group.setAttribute("orientation", args.orientation);
  if (args.size && args.size !== "md") group.setAttribute("size", args.size);
  if (args.intent) group.setAttribute("intent", args.intent);
  if (args.disabled) group.setAttribute("disabled", "");
  if (args.required) group.setAttribute("required", "");
  if (args.value) group.setAttribute("value", args.value);
  if (args.name) group.setAttribute("name", args.name);
  if (args.testid) group.setAttribute("testid", args.testid);
  for (const [value, label] of options) group.appendChild(createRadio(value, label));
  return group;
}

const radiosOf = (group: Element): ArkRadio[] => Array.from(group.querySelectorAll<ArkRadio>("ark-radio"));
const byValue = (group: Element, value: string): ArkRadio =>
  group.querySelector(`ark-radio[value="${value}"]`) as ArkRadio;
const checkedValues = (group: Element): string[] =>
  radiosOf(group)
    .filter((radio) => radio.checked)
    .map((radio) => radio.value);

export const Playground = {
  render: (args: StoryArgs) => createGroup(args)
};

export const Basic = {
  render: () => createGroup({ helper: "Você pode trocar depois." }),
  // O host é o radiogroup, nomeado pela legenda e descrito pela mensagem. Um clique marca o rádio, o `value` do grupo
  // acompanha e sai um `change` só, do grupo: o do rádio não passa dele.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const group = canvasElement.querySelector("ark-radio-group") as ArkRadioGroup;
    await expect(group).toHaveAttribute("role", "radiogroup");
    await expect(group).toHaveAttribute("aria-orientation", "vertical");
    await expect(group).toHaveAccessibleName("Plano");
    await expect(group).toHaveAccessibleDescription("Você pode trocar depois.");
    await expect(group.hasAttribute("aria-invalid")).toBe(false);
    await expect(group.value).toBe("");
    await expect(within(group).getAllByRole("radio").length).toBe(3);

    const seen: { target: string; value: string }[] = [];
    canvasElement.addEventListener("change", (event) =>
      seen.push({
        target: (event.target as Element).localName,
        value: (event as CustomEvent<{ value: string }>).detail.value
      })
    );
    await userEvent.click(within(group).getByRole("radio", { name: "Profissional" }));
    await expect(group).toHaveAttribute("value", "pro");
    await expect(checkedValues(group)).toEqual(["pro"]);
    await userEvent.click(within(group).getByText("Equipe"));
    await expect(group.value).toBe("team");
    await expect(checkedValues(group)).toEqual(["team"]);
    await expect(seen).toEqual([
      { target: "ark-radio-group", value: "pro" },
      { target: "ark-radio-group", value: "team" }
    ]);
  }
};

export const ValueAttribute = {
  render: () => createGroup({ value: "pro" }),
  // `value` declarado marca o rádio desse valor; atribuir troca a marca sem emitir `change`; e um `checked` gravado
  // direto num rádio escreve o `value` do grupo.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const group = canvasElement.querySelector("ark-radio-group") as ArkRadioGroup;
    let changes = 0;
    group.addEventListener("change", () => {
      changes += 1;
    });
    await expect(checkedValues(group)).toEqual(["pro"]);
    group.value = "team";
    await expect(checkedValues(group)).toEqual(["team"]);

    byValue(group, "free").checked = true;
    await waitFor(() => expect(group).toHaveAttribute("value", "free"));
    await expect(checkedValues(group)).toEqual(["free"]);

    // Desmarcado direto, sem outro marcado: o grupo fica sem valor.
    byValue(group, "free").checked = false;
    await waitFor(() => expect(group.hasAttribute("value")).toBe(false));

    // Um valor sem rádio correspondente fica à espera: o rádio que chegar depois com ele nasce marcado.
    group.value = "enterprise";
    await expect(checkedValues(group)).toEqual([]);
    group.appendChild(createRadio("enterprise", "Corporativo"));
    await waitFor(() => expect(checkedValues(group)).toEqual(["enterprise"]));
    await expect(changes).toBe(0);
  }
};

// Tirar o `value` (removeAttribute, `value = ""` ou `null`) desmarca todos, sem `change`, e o formulário deixa de
// enviar o grupo; antes o grupo readotava o rádio marcado e o valor voltava. Sem `value` desde o início, o rádio
// marcado no HTML continua sendo adotado, e um rádio que chega depois não desmarca nada.
export const RemovingValueUnchecks = {
  render: () => {
    const form = document.createElement("form");
    form.appendChild(createGroup({ value: "pro", name: "plano" }));
    const declared = createGroup({ name: "declarado" });
    declared.dataset.case = "declared";
    byValue(declared, "team").setAttribute("checked", "");
    form.appendChild(declared);
    return form;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const form = canvasElement.querySelector("form") as HTMLFormElement;
    const group = form.querySelector("ark-radio-group") as ArkRadioGroup;
    let changes = 0;
    group.addEventListener("change", () => {
      changes += 1;
    });
    await expect(new FormData(form).get("plano")).toBe("pro");

    group.removeAttribute("value");
    await expect(checkedValues(group)).toEqual([]);
    await expect(new FormData(form).get("plano")).toBeNull();
    // O observer dos rádios não devolve o valor.
    await waitFor(() => expect(group.hasAttribute("value")).toBe(false));
    await expect(group.value).toBe("");

    group.value = "team";
    await expect(checkedValues(group)).toEqual(["team"]);
    group.value = "";
    await expect(checkedValues(group)).toEqual([]);
    group.value = "free";
    group.value = null;
    await expect(checkedValues(group)).toEqual([]);

    // Depois de uma escolha do usuário, que escreve o `value`, tirar desmarca do mesmo jeito.
    await userEvent.click(within(group).getByRole("radio", { name: "Equipe" }));
    await expect(group).toHaveAttribute("value", "team");
    await expect(changes).toBe(1);
    group.removeAttribute("value");
    await expect(checkedValues(group)).toEqual([]);
    await expect(changes).toBe(1);

    const declared = form.querySelector('ark-radio-group[data-case="declared"]') as ArkRadioGroup;
    await waitFor(() => expect(declared).toHaveAttribute("value", "team"));
    declared.appendChild(createRadio("enterprise", "Corporativo"));
    declared.setAttribute("label", "Plano declarado");
    await waitFor(() => expect(radiosOf(declared)).toHaveLength(4));
    await expect(checkedValues(declared)).toEqual(["team"]);
    await expect(declared).toHaveAttribute("value", "team");
  }
};

export const NamelessGroupsStayApart = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex gap-10";
    wrap.append(createGroup({ label: "Plano" }, []), createGroup({ label: "Cobrança" }, []));
    return wrap;
  },
  // Dois grupos sem `name`: cada um é um grupo próprio. Rádios marcados que chegam um a um, com os grupos já
  // conectados, não desmarcam os do outro (por `name` os dois grupos seriam o mesmo grupo "").
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const [plans, billing] = Array.from(canvasElement.querySelectorAll<ArkRadioGroup>("ark-radio-group"));
    const add = (group: ArkRadioGroup, value: string, label: string, checked: boolean): void => {
      const radio = createRadio(value, label);
      if (checked) radio.setAttribute("checked", "");
      group.appendChild(radio);
    };
    add(plans, "free", "Gratuito", false);
    add(plans, "pro", "Profissional", true);
    add(billing, "month", "Mensal", true);
    add(billing, "year", "Anual", false);
    await waitFor(() => expect(billing).toHaveAttribute("value", "month"));
    await expect(plans).toHaveAttribute("value", "pro");
    await expect(checkedValues(plans)).toEqual(["pro"]);
    await expect(checkedValues(billing)).toEqual(["month"]);

    // Marcar num grupo não mexe no outro, e as setas ficam dentro do grupo.
    await userEvent.click(within(billing).getByRole("radio", { name: "Anual" }));
    await expect(checkedValues(plans)).toEqual(["pro"]);
    await userEvent.keyboard("{ArrowDown}");
    await expect(checkedValues(billing)).toEqual(["month"]);
    await expect(checkedValues(plans)).toEqual(["pro"]);

    // Um tab stop por grupo.
    const stops = (group: Element): number => group.querySelectorAll('[role="radio"][tabindex="0"]').length;
    await expect(stops(plans)).toBe(1);
    await expect(stops(billing)).toBe(1);
  }
};

export const GroupAttributes = {
  render: () => {
    const form = document.createElement("form");
    const group = createGroup({ name: "plano", size: "lg", intent: "success", value: "pro" });
    byValue(group, "free").setAttribute("size", "xs");
    byValue(group, "team").setAttribute("disabled", "");
    form.appendChild(group);
    return form;
  },
  // `name`, `size`, `intent`, `theme` e `disabled` do grupo valem para todos os rádios; o que o rádio tinha volta
  // quando o grupo perde o atributo ou o rádio sai. Com `name` o grupo entra no formulário.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const form = canvasElement.querySelector("form") as HTMLFormElement;
    const group = canvasElement.querySelector("ark-radio-group") as ArkRadioGroup;
    const [free, pro, team] = radiosOf(group);
    for (const radio of [free, pro, team]) {
      await expect(radio).toHaveAttribute("name", "plano");
      await expect(radio).toHaveAttribute("size", "lg");
      await expect(radio).toHaveAttribute("intent", "success");
    }
    await expect(new FormData(form).get("plano")).toBe("pro");
    await userEvent.click(within(group).getByRole("radio", { name: "Gratuito" }));
    await expect(new FormData(form).get("plano")).toBe("free");

    // Regravado direto no rádio, volta ao do grupo: ele vale enquanto existe.
    pro.setAttribute("intent", "danger");
    await waitFor(() => expect(pro).toHaveAttribute("intent", "success"));
    await expect(checkedValues(group)).toEqual(["free"]);

    group.removeAttribute("size");
    await expect(free).toHaveAttribute("size", "xs");
    await expect(pro.hasAttribute("size")).toBe(false);

    group.disabled = true;
    await expect(within(group).getByRole("radio", { name: "Profissional" })).toBeDisabled();
    group.disabled = false;
    await expect(within(group).getByRole("radio", { name: "Profissional" })).toBeEnabled();
    await expect(team).toHaveAttribute("disabled", "");

    // Fora do grupo o rádio perde o que o grupo gravou e volta a agrupar por `name`.
    pro.remove();
    form.appendChild(pro);
    await waitFor(() => expect(pro.hasAttribute("name")).toBe(false));
    // O `intent` que o app regravou no rádio passou a ser o valor dele: é esse que volta, não o do grupo.
    await expect(pro).toHaveAttribute("intent", "danger");
    pro.removeAttribute("intent");
    group.insertBefore(pro, team);
    await waitFor(() => expect(pro).toHaveAttribute("name", "plano"));
  }
};

export const LateRadioAndMessage = {
  render: () => createGroup({ helper: "Você pode trocar depois.", size: "sm" }, PLANS.slice(0, 2)),
  // A legenda e a mensagem são nós próprios no início do host, e a mensagem vai para o fim pelo `order`: um rádio que
  // um framework inserir depois fica acima dela, e recebe os atributos do grupo.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const group = canvasElement.querySelector("ark-radio-group") as ArkRadioGroup;
    const label = group.querySelector('[data-ark="radio-group-label"]') as HTMLElement;
    const message = group.querySelector('[data-ark="radio-group-helper"]') as HTMLElement;
    const late = createRadio("team", "Equipe");
    group.appendChild(late);
    await waitFor(() => expect(late).toHaveAttribute("size", "sm"));
    const radios = radiosOf(group).map((radio) => radio.getBoundingClientRect());
    await expect(label.getBoundingClientRect().bottom).toBeLessThanOrEqual(radios[0].top);
    await expect(radios[1].bottom).toBeLessThanOrEqual(radios[2].top);
    await expect(radios[2].bottom).toBeLessThanOrEqual(message.getBoundingClientRect().top);
    // Nenhum nó do usuário foi movido.
    await expect(late.parentElement).toBe(group);
    await expect(group.lastElementChild).toBe(late);
  }
};

export const Horizontal = {
  render: () => createGroup({ orientation: "horizontal", helper: "Cobrança no cartão." }),
  // Horizontal: os rádios numa fila, com a legenda acima e a mensagem abaixo, na largura toda.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const group = canvasElement.querySelector("ark-radio-group") as ArkRadioGroup;
    await expect(group).toHaveAttribute("aria-orientation", "horizontal");
    const radios = radiosOf(group).map((radio) => radio.getBoundingClientRect());
    await expect(radios[1].top).toBe(radios[0].top);
    await expect(radios[1].left).toBeGreaterThan(radios[0].right);
    const label = (group.querySelector('[data-ark="radio-group-label"]') as HTMLElement).getBoundingClientRect();
    const message = (group.querySelector('[data-ark="radio-group-helper"]') as HTMLElement).getBoundingClientRect();
    await expect(label.bottom).toBeLessThanOrEqual(radios[0].top);
    await expect(message.top).toBeGreaterThanOrEqual(radios[0].bottom);
  }
};

export const ErrorAndRequired = {
  render: () => createGroup({ required: true, helper: "Você pode trocar depois.", errorMessage: "Escolha um plano." }),
  // O erro vence o helper, marca aria-invalid e troca o hook da mensagem; `required` vira aria-required.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const group = canvasElement.querySelector("ark-radio-group") as ArkRadioGroup;
    await expect(group).toHaveAttribute("aria-invalid", "true");
    await expect(group).toHaveAttribute("aria-required", "true");
    await expect(group).toHaveAccessibleDescription("Escolha um plano.");
    await expect(group.querySelector('[data-ark="radio-group-error"]')).toHaveTextContent("Escolha um plano.");
    group.removeAttribute("error-message");
    await expect(group.hasAttribute("aria-invalid")).toBe(false);
    await expect(group).toHaveAccessibleDescription("Você pode trocar depois.");
    // `error` sozinho marca inválido sem mensagem de erro.
    group.error = true;
    await expect(group).toHaveAttribute("aria-invalid", "true");
    group.error = false;
    await expect(group.hasAttribute("aria-invalid")).toBe(false);

    // Os aria-* que o app pôs no host não são do componente: sem mensagem e sem `required` eles ficam.
    group.removeAttribute("helper");
    group.removeAttribute("required");
    await expect(group.hasAttribute("aria-describedby")).toBe(false);
    await expect(group.hasAttribute("aria-required")).toBe(false);
    const note = document.createElement("p");
    note.id = "plan-note";
    note.textContent = "Cobrança mensal.";
    canvasElement.appendChild(note);
    group.setAttribute("aria-describedby", "plan-note");
    group.setAttribute("aria-required", "true");
    group.setAttribute("size", "lg");
    await expect(group).toHaveAttribute("aria-describedby", "plan-note");
    await expect(group).toHaveAttribute("aria-required", "true");
    // Com mensagem a descrição é a do componente; sem ela de novo, o componente só tira a que ele gravou.
    group.setAttribute("error-message", "Escolha um plano.");
    await expect(group).toHaveAccessibleDescription("Escolha um plano.");
    group.removeAttribute("aria-describedby");
    group.removeAttribute("aria-required");
    group.removeAttribute("size");
    note.remove();
    group.setAttribute("required", "");
    group.setAttribute("helper", "Você pode trocar depois.");
  }
};

export const AccessibleName = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "grid gap-6";
    const named = createGroup({ label: "" });
    named.setAttribute("aria-label", "Plano da conta");
    const heading = document.createElement("h3");
    heading.id = "plan-heading";
    heading.textContent = "Escolha o plano";
    const labelled = createGroup({ label: "Legenda própria" });
    labelled.setAttribute("aria-labelledby", "plan-heading");
    wrap.append(named, heading, labelled);
    return wrap;
  },
  // Sem `label` o grupo usa o aria-label do host; e um aria-labelledby do app vence a legenda própria.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const [named, labelled] = Array.from(canvasElement.querySelectorAll<ArkRadioGroup>("ark-radio-group"));
    await expect(named).toHaveAccessibleName("Plano da conta");
    await expect(named.hasAttribute("aria-labelledby")).toBe(false);
    await expect(named.querySelector('[data-ark="radio-group-label"]')).not.toBeVisible();
    await expect(labelled).toHaveAttribute("aria-labelledby", "plan-heading");
    await expect(labelled).toHaveAccessibleName("Escolha o plano");
  }
};

export const Sizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap gap-10";
    for (const size of ["xs", "sm", "md", "lg", "xl"] as ArkSize[]) {
      wrap.appendChild(createGroup({ size, value: "pro", label: `Plano ${size}` }));
    }
    return wrap;
  }
};

export const TestHooks = {
  render: () => createGroup({ testid: "plano", helper: "Você pode trocar depois." }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const group = canvasElement.querySelector("ark-radio-group") as ArkRadioGroup;
    await expect(group).toHaveAttribute("data-ark", "radio-group");
    await expect(group).toHaveAttribute("data-testid", "plano");
    await expect(group.querySelector('[data-ark="radio-group-label"]')).toHaveAttribute("data-testid", "plano-label");
    await expect(group.querySelector('[data-ark="radio-group-helper"]')).toHaveAttribute("data-testid", "plano-helper");
  }
};
