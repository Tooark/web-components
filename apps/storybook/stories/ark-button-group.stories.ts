import type { ArkButtonVariant, ArkIntent, ArkOrientation, ArkRounded, ArkSize } from "@tooark/core";
import type { ArkButton, ArkButtonGroup } from "@tooark/web-components";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkButtonGroup",
  parameters: {
    // A divisa, o foco e os papéis são o que o grupo acrescenta: aqui uma violação do axe reprova.
    a11y: { test: "error" },
    docs: {
      description: {
        component:
          'Grupo de botões: o host `ark-button-group` é o `role="group"` e os `ark-button` do app ficam onde estão. Colados por padrão (um contorno só, com os cantos de fora seguindo o `rounded` e uma divisa entre os botões); `spaced` os separa pelo gap do `size`. `orientation` (`horizontal`, padrão / `vertical`), `full-width` (o grupo ocupa a largura e a reparte), `label` (vira `aria-label`). `variant`, `intent`, `size`, `rounded`, `theme` e `disabled` do grupo valem para todos os botões; sem o atributo no grupo cada botão fica com o seu. O grupo não tem evento próprio: cada botão emite o clique dele. O botão dividido é a composição do grupo com um `ark-menu`.'
      }
    }
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    spaced: { control: "boolean" },
    fullWidth: { control: "boolean" },
    disabled: { control: "boolean" },
    variant: { control: "select", options: ["", "solid", "outline", "ghost", "soft"] },
    intent: {
      control: "select",
      options: ["", "primary", "secondary", "success", "warning", "danger", "info", "neutral"]
    },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    rounded: { control: "inline-radio", options: ["none", "xs", "sm", "md", "lg", "xl", "full"] }
  },
  args: {
    orientation: "horizontal",
    spaced: false,
    fullWidth: false,
    disabled: false,
    variant: "outline",
    intent: "",
    size: "md",
    rounded: "md"
  }
};

export default meta;

type StoryArgs = {
  orientation: ArkOrientation;
  spaced: boolean;
  fullWidth: boolean;
  disabled: boolean;
  variant: ArkButtonVariant | "";
  intent: ArkIntent | "";
  size: ArkSize;
  rounded: ArkRounded;
  label?: string;
  testid?: string;
};

function createGroup(args: Partial<StoryArgs>, labels: string[] = ["Dia", "Semana", "Mês"]): ArkButtonGroup {
  const group = document.createElement("ark-button-group") as ArkButtonGroup;
  group.setAttribute("label", args.label ?? "Período");
  if (args.orientation && args.orientation !== "horizontal") group.setAttribute("orientation", args.orientation);
  if (args.spaced) group.setAttribute("spaced", "");
  if (args.fullWidth) group.setAttribute("full-width", "");
  if (args.disabled) group.setAttribute("disabled", "");
  if (args.variant) group.setAttribute("variant", args.variant);
  if (args.intent) group.setAttribute("intent", args.intent);
  if (args.size && args.size !== "md") group.setAttribute("size", args.size);
  if (args.rounded && args.rounded !== "md") group.setAttribute("rounded", args.rounded);
  if (args.testid) group.setAttribute("testid", args.testid);
  for (const label of labels) {
    const button = document.createElement("ark-button");
    button.textContent = label;
    group.appendChild(button);
  }
  return group;
}

const buttonsOf = (group: Element): ArkButton[] => Array.from(group.querySelectorAll<ArkButton>("ark-button"));
const radius = (el: Element): string[] => {
  const style = getComputedStyle(el);
  return [
    style.borderTopLeftRadius,
    style.borderTopRightRadius,
    style.borderBottomRightRadius,
    style.borderBottomLeftRadius
  ];
};

export const Playground = {
  render: (args: StoryArgs) => createGroup(args)
};

export const Joined = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "grid gap-4 justify-items-start";
    for (const variant of ["outline", "solid", "soft", "ghost"] as ArkButtonVariant[]) {
      wrap.appendChild(createGroup({ variant, label: `Período ${variant}` }));
    }
    return wrap;
  },
  // Colados: o grupo grava a posição em cada botão, os cantos de fora seguem o `rounded` e os de dentro ficam retos,
  // e cada botão depois do primeiro sobrepõe 1 px o anterior. Com borda (outline) as duas viram uma linha; sem borda
  // (solid, soft, ghost) a divisa é uma linha na cor do texto.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const [outline, solid] = Array.from(canvasElement.querySelectorAll<ArkButtonGroup>("ark-button-group"));
    await expect(outline).toHaveAttribute("role", "group");
    await expect(outline).toHaveAccessibleName("Período outline");
    const [first, middle, last] = buttonsOf(outline);
    await expect(first).toHaveAttribute("data-ark-group-pos", "first");
    await expect(middle).toHaveAttribute("data-ark-group-pos", "middle");
    await expect(last).toHaveAttribute("data-ark-group-pos", "last");
    await expect(first.hasAttribute("data-ark-group-dir")).toBe(false);

    const outer = "6px";
    await expect(radius(first)).toEqual([outer, "0px", "0px", outer]);
    await expect(radius(middle)).toEqual(["0px", "0px", "0px", "0px"]);
    await expect(radius(last)).toEqual(["0px", outer, outer, "0px"]);

    // Um contorno só: sem vão, com 1 px de sobreposição, e todos da mesma altura.
    const rects = buttonsOf(outline).map((button) => button.getBoundingClientRect());
    await expect(Math.round((rects[0].right - rects[1].left) * 100) / 100).toBe(1);
    await expect(Math.round((rects[1].right - rects[2].left) * 100) / 100).toBe(1);
    await expect(rects[1].height).toBe(rects[0].height);
    await expect(Math.round(outline.getBoundingClientRect().width * 100) / 100).toBe(
      Math.round((rects[2].right - rects[0].left) * 100) / 100
    );

    // Outline: a divisa é a própria borda. Solid: a borda é transparente, então a divisa é desenhada.
    await expect(getComputedStyle(middle).borderLeftColor).toBe(getComputedStyle(middle).borderTopColor);
    const [solidFirst, solidMiddle] = buttonsOf(solid);
    await expect(getComputedStyle(solidFirst).borderLeftColor).toBe("rgba(0, 0, 0, 0)");
    await expect(getComputedStyle(solidMiddle).borderTopColor).toBe("rgba(0, 0, 0, 0)");
    await expect(getComputedStyle(solidMiddle).borderLeftColor).not.toBe("rgba(0, 0, 0, 0)");

    // O clique é do botão: o grupo não tem evento próprio.
    const clicks: string[] = [];
    outline.addEventListener("click", (event) => clicks.push((event.target as Element).textContent ?? ""));
    await userEvent.click(within(outline).getByRole("button", { name: "Semana" }));
    await expect(clicks).toEqual(["Semana"]);

    // Com o foco pelo teclado o botão sobe, para o vizinho não cobrir o anel.
    first.focus();
    await userEvent.tab();
    await expect(document.activeElement).toBe(middle);
    await expect(getComputedStyle(middle).zIndex).toBe("10");
    await expect(getComputedStyle(last).zIndex).toBe("auto");
    (document.activeElement as HTMLElement).blur();
  }
};

export const Vertical = {
  render: () => createGroup({ orientation: "vertical", variant: "outline" }, ["Copiar", "Mover", "Excluir"]),
  // Vertical: os botões esticam na largura do maior, e os cantos retos e a sobreposição trocam de eixo.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const group = canvasElement.querySelector("ark-button-group") as ArkButtonGroup;
    const [first, middle, last] = buttonsOf(group);
    await expect(group.orientation).toBe("vertical");
    await expect(first).toHaveAttribute("data-ark-group-dir", "vertical");
    await expect(radius(first)).toEqual(["6px", "6px", "0px", "0px"]);
    await expect(radius(middle)).toEqual(["0px", "0px", "0px", "0px"]);
    await expect(radius(last)).toEqual(["0px", "0px", "6px", "6px"]);
    const rects = buttonsOf(group).map((button) => button.getBoundingClientRect());
    await expect(rects[0].width).toBe(rects[2].width);
    await expect(rects[1].left).toBe(rects[0].left);
    await expect(Math.round((rects[0].bottom - rects[1].top) * 100) / 100).toBe(1);

    // Voltar a horizontal tira a direção dos botões.
    group.orientation = "horizontal";
    await expect(first.hasAttribute("data-ark-group-dir")).toBe(false);
    await expect(radius(first)).toEqual(["6px", "0px", "0px", "6px"]);
    group.orientation = "vertical";
  }
};

export const Spaced = {
  render: () => createGroup({ spaced: true }, ["Cancelar", "Salvar rascunho", "Publicar"]),
  // `spaced`: botões inteiros, separados pelo gap do size; nada de posição gravada neles.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const group = canvasElement.querySelector("ark-button-group") as ArkButtonGroup;
    const [first, middle] = buttonsOf(group);
    await expect(first.hasAttribute("data-ark-group-pos")).toBe(false);
    await expect(radius(middle)).toEqual(["6px", "6px", "6px", "6px"]);
    await expect(middle.getBoundingClientRect().left - first.getBoundingClientRect().right).toBe(8);
    group.setAttribute("size", "xl");
    await expect(middle.getBoundingClientRect().left - first.getBoundingClientRect().right).toBe(12);
    group.removeAttribute("size");

    // Tirar `spaced` cola os botões de novo.
    group.spaced = false;
    await expect(first).toHaveAttribute("data-ark-group-pos", "first");
    await expect(radius(middle)).toEqual(["0px", "0px", "0px", "0px"]);
    group.spaced = true;
  }
};

export const GroupAttributes = {
  render: () => {
    const group = createGroup({ size: "sm", variant: "outline" });
    const [first, , last] = buttonsOf(group);
    // Um botão com os próprios atributos: o do grupo vale enquanto existe, e o do botão volta depois.
    first.setAttribute("size", "lg");
    first.setAttribute("variant", "ghost");
    last.setAttribute("disabled", "");
    return group;
  },
  // O atributo do grupo, quando existe, vale para todos os botões (os wrappers Vue e Angular sempre gravam o padrão no
  // botão, então "o do botão vence" nunca propagaria por eles). O que o botão tinha volta quando o grupo perde o
  // atributo ou o botão sai do grupo.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const group = canvasElement.querySelector("ark-button-group") as ArkButtonGroup;
    const [first, middle, last] = buttonsOf(group);
    for (const button of [first, middle, last]) {
      await expect(button).toHaveAttribute("size", "sm");
      await expect(button).toHaveAttribute("variant", "outline");
    }

    // Regravado direto no botão (um framework trocando a prop do filho), volta ao do grupo: ele vale enquanto existe.
    middle.setAttribute("size", "xl");
    await waitFor(() => expect(middle).toHaveAttribute("size", "sm"));

    // O grupo troca o valor: todos acompanham.
    group.setAttribute("variant", "soft");
    await expect(first).toHaveAttribute("variant", "soft");
    await expect(middle).toHaveAttribute("variant", "soft");

    // O grupo perde o atributo: cada botão volta ao que tinha (o do meio não tinha nenhum).
    group.removeAttribute("variant");
    group.removeAttribute("size");
    await expect(first).toHaveAttribute("variant", "ghost");
    await expect(first).toHaveAttribute("size", "lg");
    await expect(middle.hasAttribute("variant")).toBe(false);
    // O que o app regravou no meio do caminho passou a ser o valor do botão.
    await expect(middle).toHaveAttribute("size", "xl");
    middle.removeAttribute("size");

    // disabled do grupo desabilita todos; ao sair, quem já era desabilitado por conta própria continua.
    group.disabled = true;
    await expect(middle).toHaveAttribute("aria-disabled", "true");
    group.disabled = false;
    await expect(middle.hasAttribute("disabled")).toBe(false);
    await expect(last).toHaveAttribute("disabled", "");

    // Um botão que sai do grupo perde a posição e o que o grupo gravou; os que ficam se rearrumam.
    group.setAttribute("size", "sm");
    await expect(middle).toHaveAttribute("size", "sm");
    middle.remove();
    canvasElement.appendChild(middle);
    await waitFor(() => expect(middle.hasAttribute("data-ark-group-pos")).toBe(false));
    await expect(middle.hasAttribute("size")).toBe(false);
    await expect(first).toHaveAttribute("data-ark-group-pos", "first");
    await expect(last).toHaveAttribute("data-ark-group-pos", "last");

    // Um botão que entra depois recebe tudo; sozinho no grupo, fica inteiro.
    group.insertBefore(middle, last);
    await waitFor(() => expect(middle).toHaveAttribute("data-ark-group-pos", "middle"));
    await expect(middle).toHaveAttribute("size", "sm");
    first.remove();
    last.remove();
    await waitFor(() => expect(middle).toHaveAttribute("data-ark-group-pos", "only"));
    await expect(radius(middle)).toEqual(["6px", "6px", "6px", "6px"]);
    group.prepend(first);
    group.append(last);
    await waitFor(() => expect(middle).toHaveAttribute("data-ark-group-pos", "middle"));
    group.removeAttribute("size");
  }
};

export const FullWidth = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.width = "420px";
    wrap.appendChild(createGroup({ fullWidth: true, variant: "outline" }, ["Dia", "Semana", "Mês inteiro"]));
    return wrap;
  },
  // full-width: o grupo ocupa o contêiner e a largura é repartida por igual, seja qual for o texto.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const group = canvasElement.querySelector("ark-button-group") as ArkButtonGroup;
    await expect(group.getBoundingClientRect().width).toBe(420);
    const widths = buttonsOf(group).map((button) => Math.round(button.getBoundingClientRect().width));
    await expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
    await expect(widths[0]).toBeGreaterThan(135);
  }
};

export const Rounded = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "grid gap-4 justify-items-start";
    for (const rounded of ["none", "lg", "full"] as ArkRounded[]) {
      wrap.appendChild(createGroup({ rounded, variant: "soft", intent: "info" }));
    }
    return wrap;
  },
  // `rounded` do grupo dá os cantos de fora; os de dentro continuam retos.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const groups = Array.from(canvasElement.querySelectorAll("ark-button-group"));
    const pill = buttonsOf(groups[2]);
    await expect(pill[0]).toHaveAttribute("rounded", "full");
    await expect(radius(pill[0])[1]).toBe("0px");
    await expect(radius(pill[0])[0]).not.toBe("0px");
    await expect(radius(pill[1])).toEqual(["0px", "0px", "0px", "0px"]);
    await expect(radius(buttonsOf(groups[0])[0])).toEqual(["0px", "0px", "0px", "0px"]);
  }
};

export const SplitButton = {
  render: () => {
    const wrap = document.createElement("div");
    const group = createGroup({ label: "Salvar" }, []);
    const main = document.createElement("ark-button");
    main.textContent = "Salvar";
    const more = document.createElement("ark-button");
    more.id = "split-more";
    more.setAttribute("icon-only", "");
    more.setAttribute("aria-label", "Mais opções de salvar");
    more.innerHTML =
      '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>';
    group.append(main, more);
    const menu = document.createElement("ark-menu");
    menu.setAttribute("for", "split-more");
    menu.setAttribute("align", "end");
    for (const [value, label] of [
      ["draft", "Salvar rascunho"],
      ["copy", "Salvar uma cópia"]
    ]) {
      const item = document.createElement("ark-menu-item");
      item.setAttribute("value", value);
      item.textContent = label;
      menu.appendChild(item);
    }
    wrap.append(group, menu);
    return wrap;
  },
  // Botão dividido sem elemento novo: o grupo cola a ação principal ao botão que abre um ark-menu. Cada parte tem o
  // próprio clique, e a escolha sai pelo ark-select do menu.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const group = canvasElement.querySelector("ark-button-group") as ArkButtonGroup;
    const menu = canvasElement.querySelector("ark-menu") as HTMLElement;
    const [main, more] = buttonsOf(group);
    await expect(main).toHaveAttribute("data-ark-group-pos", "first");
    await expect(more).toHaveAttribute("data-ark-group-pos", "last");
    // A divisa entre as duas partes de um botão sólido.
    await expect(getComputedStyle(more).borderLeftColor).not.toBe("rgba(0, 0, 0, 0)");

    const log: string[] = [];
    main.addEventListener("click", () => log.push("salvar"));
    menu.addEventListener("ark-select", (event) => log.push(`menu ${(event as CustomEvent).detail.value}`));
    await userEvent.click(main);
    await expect(menu.matches(":popover-open")).toBe(false);
    await userEvent.click(more);
    await waitFor(() => expect(menu.matches(":popover-open")).toBe(true));
    await expect(more).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(within(menu).getByRole("menuitem", { name: "Salvar uma cópia" }));
    await waitFor(() => expect(menu.matches(":popover-open")).toBe(false));
    await expect(log).toEqual(["salvar", "menu copy"]);
  }
};

export const Sizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "grid gap-4 justify-items-start";
    for (const size of ["xs", "sm", "md", "lg", "xl"] as ArkSize[]) {
      wrap.appendChild(createGroup({ size, variant: "outline" }));
    }
    return wrap;
  }
};

export const Dark = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "grid gap-4 justify-items-start";
    wrap.style.padding = "16px";
    wrap.style.borderRadius = "12px";
    wrap.style.background = "#0f172a";
    for (const variant of ["outline", "solid", "soft", "ghost"] as ArkButtonVariant[]) {
      const group = createGroup({ variant, label: `Período ${variant}` });
      group.setAttribute("theme", "dark");
      wrap.appendChild(group);
    }
    return wrap;
  },
  // `theme` do grupo chega a cada botão.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    for (const button of buttonsOf(canvasElement)) await expect(button).toHaveAttribute("theme", "dark");
  }
};

export const TestHooks = {
  render: () => createGroup({ testid: "periodo" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const group = canvasElement.querySelector("ark-button-group") as ArkButtonGroup;
    await expect(group).toHaveAttribute("data-ark", "button-group");
    await expect(group).toHaveAttribute("data-testid", "periodo");
    // O `label` vira aria-label; um aria-label do app não é trocado nem apagado.
    await expect(group).toHaveAttribute("aria-label", "Período");
    group.setAttribute("aria-label", "Do app");
    group.label = "Outro";
    await expect(group).toHaveAttribute("aria-label", "Do app");
    group.removeAttribute("label");
    await expect(group).toHaveAttribute("aria-label", "Do app");
  }
};
