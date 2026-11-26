import type { ArkTheme } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkEmpty",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Estado vazio: o host `ark-empty` é a caixa de borda tracejada. Ícone (`slot="icon"`, apagado) e ação (`slot="action"`, um ark-button) são filhos do usuário e ficam onde estão; `heading` e `description` viram título (h3) e texto criados pelo componente. A ordem visual (ícone, título, descrição, outros filhos, ação) vem de CSS, não da ordem do DOM.'
      }
    }
  },
  argTypes: {
    heading: { control: "text" },
    description: { control: "text" },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    withIcon: { control: "boolean" },
    withAction: { control: "boolean" }
  },
  args: {
    heading: "Nenhuma requisição",
    description: "Crie a primeira requisição desta coleção ou importe de um arquivo.",
    theme: "auto",
    withIcon: true,
    withAction: true
  }
};

export default meta;

type StoryArgs = {
  heading: string;
  description: string;
  theme: ArkTheme;
  withIcon: boolean;
  withAction: boolean;
  testid?: string;
};

const INBOX_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 13l2.5-8h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"></path><path d="M3 13h5l1.5 2h5L16 13h5"></path></svg>';

function createEmpty(args: Partial<StoryArgs>): HTMLElement {
  const empty = document.createElement("ark-empty");
  if (args.heading) empty.setAttribute("heading", args.heading);
  if (args.description) empty.setAttribute("description", args.description);
  if (args.theme) empty.setAttribute("theme", args.theme);
  if (args.testid) empty.setAttribute("testid", args.testid);

  if (args.withIcon !== false) {
    const icon = document.createElement("span");
    icon.setAttribute("slot", "icon");
    icon.innerHTML = INBOX_SVG;
    empty.appendChild(icon);
  }
  if (args.withAction !== false) {
    const action = document.createElement("ark-button");
    action.setAttribute("slot", "action");
    action.setAttribute("size", "sm");
    action.textContent = "Nova requisição";
    empty.appendChild(action);
  }
  return empty;
}

export const Playground = {
  render: (args: StoryArgs) => createEmpty(args)
};

export const WithoutAction = {
  args: { withAction: false, heading: "Sem resultados", description: "Nenhum item corresponde ao filtro." },
  render: Playground.render
};

export const HeadingOnly = {
  args: { withIcon: false, withAction: false, description: "", heading: "Nada por aqui" },
  render: Playground.render
};

export const ExtraContent = {
  render: () => {
    const empty = createEmpty({ heading: "Sem variáveis", description: "Este ambiente ainda não tem variáveis." });
    // Filhos sem slot entram entre a descrição e a ação.
    const hint = document.createElement("p");
    hint.className = "text-xs text-slate-500";
    hint.textContent = "Dica: use {{nome}} nas requisições.";
    empty.appendChild(hint);
    return empty;
  }
};

export const DarkTheme = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "rounded-xl p-4";
    wrap.style.background = "oklch(20.8% 0.042 265.755)";
    const empty = createEmpty({ heading: "Nenhuma requisição", description: "Crie a primeira.", theme: "dark" });
    empty.querySelector("ark-button")?.setAttribute("theme", "dark");
    wrap.appendChild(empty);
    return wrap;
  }
};

export const StructureAndOrder = {
  render: () => {
    const empty = createEmpty({ heading: "Nenhuma requisição", description: "Crie a primeira." });
    const hint = document.createElement("p");
    hint.textContent = "Conteúdo livre";
    empty.appendChild(hint);
    return empty;
  },
  // Título e descrição são nós do componente; a ordem visual é ícone, título, descrição, livre, ação, seja qual
  // for a ordem do DOM; a ação do usuário continua clicável; sem heading/description os nós somem.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const empty = canvasElement.querySelector("ark-empty")!;
    const icon = empty.querySelector('[slot="icon"]')!;
    const heading = empty.querySelector('[data-ark="empty-heading"]')!;
    const description = empty.querySelector('[data-ark="empty-description"]')!;
    const free = canvas.getByText("Conteúdo livre");
    const action = empty.querySelector('[slot="action"]') as HTMLElement;

    expect(heading.tagName).toBe("H3");
    expect(heading.textContent).toBe("Nenhuma requisição");
    expect(description.textContent).toBe("Crie a primeira.");
    expect(getComputedStyle(empty).borderStyle).toBe("dashed");

    const top = (el: Element): number => el.getBoundingClientRect().top;
    expect(top(icon)).toBeLessThan(top(heading));
    expect(top(heading)).toBeLessThan(top(description));
    expect(top(description)).toBeLessThan(top(free));
    expect(top(free)).toBeLessThan(top(action));

    let clicks = 0;
    action.addEventListener("click", () => {
      clicks += 1;
    });
    await userEvent.click(action);
    expect(clicks).toBe(1);

    empty.setAttribute("heading", "Atualizado");
    expect(heading.textContent).toBe("Atualizado");
    empty.removeAttribute("description");
    expect(empty.querySelector('[data-ark="empty-description"]')).toBeNull();
    empty.removeAttribute("heading");
    expect(empty.querySelector('[data-ark="empty-heading"]')).toBeNull();
    expect(empty.contains(icon)).toBe(true);
    expect(empty.contains(action)).toBe(true);
  }
};

// Ordem de leitura: título e descrição são os primeiros nós do host, antes do ícone, do conteúdo e da ação do app
// (um leitor de tela lia a ação antes do título). A tela não muda: a ordem visual continua vindo do CSS.
export const ReadingOrder = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "grid gap-4";
    const full = createEmpty({ heading: "Nenhuma requisição", description: "Crie a primeira." });
    full.dataset.case = "full";
    const hint = document.createElement("p");
    hint.textContent = "Conteúdo livre";
    full.appendChild(hint);
    const late = createEmpty({ description: "Só a descrição, por enquanto." });
    late.dataset.case = "late";
    wrap.append(full, late);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const empty = (name: string): HTMLElement =>
      canvasElement.querySelector(`ark-empty[data-case="${name}"]`) as HTMLElement;
    const order = (host: HTMLElement): string[] =>
      Array.from(host.children).map(
        (child) => child.getAttribute("data-ark")?.replace("empty-", "") || child.getAttribute("slot") || "free"
      );
    const frames = (): Promise<void> =>
      new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

    // O ícone e a ação foram inseridos antes de o componente criar título e descrição.
    const full = empty("full");
    await expect(order(full)).toEqual(["heading", "description", "icon", "action", "free"]);
    const top = (selector: string): number => (full.querySelector(selector) as HTMLElement).getBoundingClientRect().top;
    await expect(top('[slot="icon"]')).toBeLessThan(top('[data-ark="empty-heading"]'));
    await expect(top('[data-ark="empty-description"]')).toBeLessThan(top('[slot="action"]'));

    // Um filho que um framework insere no início volta para depois do texto; um que chega no fim fica onde está.
    const first = document.createElement("p");
    first.textContent = "Inserido no início";
    full.prepend(first);
    await waitFor(() => expect(order(full)).toEqual(["heading", "description", "free", "icon", "action", "free"]));
    full.appendChild(document.createElement("span"));
    await frames();
    await expect(order(full).slice(0, 2)).toEqual(["heading", "description"]);

    // Depois de assentar, nenhuma mutação a mais: o observer não entra em laço.
    let mutations = 0;
    const watch = new MutationObserver((records) => {
      mutations += records.length;
    });
    watch.observe(full, { childList: true });
    await frames();
    watch.disconnect();
    await expect(mutations).toBe(0);

    // Título que chega depois da descrição entra antes dela; trocar o nível mantém o lugar.
    const late = empty("late");
    await expect(order(late)).toEqual(["description", "icon", "action"]);
    late.setAttribute("heading", "Sem dados");
    await expect(order(late)).toEqual(["heading", "description", "icon", "action"]);
    late.setAttribute("heading-level", "2");
    await expect(late.firstElementChild?.tagName).toBe("H2");
    await expect(order(late)).toEqual(["heading", "description", "icon", "action"]);
  }
};

export const TestHooks = {
  render: () =>
    createEmpty({ heading: "Nenhuma requisição", description: "Crie a primeira.", testid: "requests-empty" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const empty = canvasElement.querySelector("ark-empty")!;

    await expect(empty).toHaveAttribute("data-ark", "empty");
    await expect(empty).toHaveAttribute("data-testid", "requests-empty");
    await expect(empty.querySelector('[data-ark="empty-heading"]')).toHaveAttribute(
      "data-testid",
      "requests-empty-heading"
    );
    await expect(empty.querySelector('[data-ark="empty-description"]')).toHaveAttribute(
      "data-testid",
      "requests-empty-description"
    );
    await expect(empty.querySelector('[slot="icon"]')).toHaveAttribute("data-ark", "empty-icon");
    await expect(empty.querySelector('[slot="action"]')).toHaveAttribute("data-testid", "requests-empty-action");
  }
};
