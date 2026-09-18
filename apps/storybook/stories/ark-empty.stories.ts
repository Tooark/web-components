import type { ArkTheme } from "@tooark/core";
import { expect, userEvent, within } from "storybook/test";

const meta = {
  title: "Core/ArkEmpty",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Estado vazio: o host `ark-empty` e a caixa de borda tracejada. Icone (`slot="icon"`, apagado) e acao (`slot="action"`, um ark-button) sao filhos do usuario e ficam onde estao; `heading` e `description` viram titulo (h3) e texto criados pelo componente. A ordem visual (icone, titulo, descricao, outros filhos, acao) vem de CSS, nao da ordem do DOM.'
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
    heading: "Nenhuma requisicao",
    description: "Crie a primeira requisicao desta colecao ou importe de um arquivo.",
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
    action.textContent = "Nova requisicao";
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
    const empty = createEmpty({ heading: "Sem variaveis", description: "Este ambiente ainda nao tem variaveis." });
    // Filhos sem slot entram entre a descricao e a acao.
    const hint = document.createElement("p");
    hint.className = "text-xs text-slate-500";
    hint.textContent = "Dica: use {{nome}} nas requisicoes.";
    empty.appendChild(hint);
    return empty;
  }
};

export const DarkTheme = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "rounded-xl p-4";
    wrap.style.background = "oklch(20.8% 0.042 265.755)";
    const empty = createEmpty({ heading: "Nenhuma requisicao", description: "Crie a primeira.", theme: "dark" });
    empty.querySelector("ark-button")?.setAttribute("theme", "dark");
    wrap.appendChild(empty);
    return wrap;
  }
};

export const StructureAndOrder = {
  render: () => {
    const empty = createEmpty({ heading: "Nenhuma requisicao", description: "Crie a primeira." });
    const hint = document.createElement("p");
    hint.textContent = "Conteudo livre";
    empty.appendChild(hint);
    return empty;
  },
  // Titulo e descricao sao nos do componente; a ordem visual e icone, titulo, descricao, livre, acao, seja qual
  // for a ordem do DOM; a acao do usuario continua clicavel; sem heading/description os nos somem.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const empty = canvasElement.querySelector("ark-empty")!;
    const icon = empty.querySelector('[slot="icon"]')!;
    const heading = empty.querySelector('[data-ark="empty-heading"]')!;
    const description = empty.querySelector('[data-ark="empty-description"]')!;
    const free = canvas.getByText("Conteudo livre");
    const action = empty.querySelector('[slot="action"]') as HTMLElement;

    expect(heading.tagName).toBe("H3");
    expect(heading.textContent).toBe("Nenhuma requisicao");
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

export const TestHooks = {
  render: () =>
    createEmpty({ heading: "Nenhuma requisicao", description: "Crie a primeira.", testid: "requests-empty" }),
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
