import type { ArkCardPadding, ArkRounded, ArkTheme } from "@tooark/core";
import { expect, waitFor } from "storybook/test";

const meta = {
  title: "Core/ArkCard",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Cartao: o host `ark-card` e a caixa (fundo surface, borda, cantos) e uma grid. Os filhos do usuario ficam onde estao: `slot="header"` e `slot="actions"` na linha de cima, `slot="footer"` na ultima linha com divisor, e os demais sao o corpo. `heading` cria um h2 proprio; com ele o `slot="header"` vira a linha seguinte do cabecalho. `padding` escala padding e gap juntos.'
      }
    }
  },
  argTypes: {
    heading: { control: "text" },
    padding: { control: "inline-radio", options: ["none", "sm", "md", "lg"] },
    rounded: { control: "select", options: ["none", "xs", "sm", "md", "lg", "xl", "full"] },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    withActions: { control: "boolean" },
    withFooter: { control: "boolean" }
  },
  args: {
    heading: "Ambiente de producao",
    padding: "md",
    rounded: "lg",
    theme: "auto",
    withActions: true,
    withFooter: true
  }
};

export default meta;

type StoryArgs = {
  heading: string;
  padding: ArkCardPadding;
  rounded: ArkRounded;
  theme: ArkTheme;
  withActions: boolean;
  withFooter: boolean;
};

type CardOptions = Partial<StoryArgs> & {
  testid?: string;
  className?: string;
  /** HTML do filho slot="header" (cabeçalho livre). */
  header?: string;
  /** HTML do corpo (filhos sem slot). */
  body?: string;
  /** Largura do host. */
  width?: string;
};

const BODY_HTML =
  "<p>Variaveis, certificados e cabecalhos padrao aplicados a toda requisicao deste ambiente.</p><p>Ultima alteracao ha 2 dias por Ana Lima.</p>";

function html(markup: string): HTMLElement[] {
  const template = document.createElement("template");
  template.innerHTML = markup.trim();
  return Array.from(template.content.children) as HTMLElement[];
}

function createButton(text: string, variant: "solid" | "ghost" | "outline" = "ghost"): HTMLElement {
  const button = document.createElement("ark-button");
  button.setAttribute("variant", variant);
  button.setAttribute("size", "sm");
  if (variant === "ghost") button.setAttribute("intent", "neutral");
  button.textContent = text;
  return button;
}

function createCard(options: CardOptions): HTMLElement {
  const card = document.createElement("ark-card");
  if (options.heading) card.setAttribute("heading", options.heading);
  if (options.padding) card.setAttribute("padding", options.padding);
  if (options.rounded) card.setAttribute("rounded", options.rounded);
  if (options.theme) card.setAttribute("theme", options.theme);
  if (options.testid) card.setAttribute("testid", options.testid);
  if (options.className) card.className = options.className;
  card.style.width = options.width ?? "28rem";

  if (options.header) {
    const header = document.createElement("div");
    header.setAttribute("slot", "header");
    header.className = "flex items-center gap-2";
    header.innerHTML = options.header;
    card.appendChild(header);
  }
  if (options.withActions) {
    const actions = document.createElement("div");
    actions.setAttribute("slot", "actions");
    actions.appendChild(createButton("Editar"));
    actions.appendChild(createButton("Duplicar"));
    card.appendChild(actions);
  }
  for (const node of html(options.body ?? BODY_HTML)) {
    node.classList.add("text-sm");
    node.style.color = "var(--ark-color-fg-soft)";
    card.appendChild(node);
  }
  if (options.withFooter) {
    const footer = document.createElement("div");
    footer.setAttribute("slot", "footer");
    footer.className = "flex justify-end gap-2";
    footer.appendChild(createButton("Cancelar", "outline"));
    footer.appendChild(createButton("Salvar", "solid"));
    card.appendChild(footer);
  }
  return card;
}

export const Playground = {
  render: (args: StoryArgs) => createCard(args)
};

export const BodyOnly = {
  render: () => createCard({ body: "<p>Um cartao e so uma caixa: qualquer filho sem slot e o corpo.</p>" })
};

export const SlotHeader = {
  render: () =>
    createCard({
      header:
        '<span style="color: var(--ark-color-primary)">◆</span><span class="font-semibold">Workspace pessoal</span><ark-badge intent="warning" size="xs">beta</ark-badge>',
      withActions: true
    })
};

export const HeadingAndHeader = {
  render: () =>
    createCard({
      heading: "Integracoes",
      header:
        '<span class="text-sm" style="color: var(--ark-color-fg-muted)">Com heading, o slot="header" vira a linha seguinte do cabecalho: descricao, filtros, abas.</span>',
      withActions: true,
      withFooter: true
    })
};

export const Paddings = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap items-start gap-4";
    for (const padding of ["none", "sm", "md", "lg"] as ArkCardPadding[]) {
      wrap.appendChild(
        createCard({
          heading: `padding="${padding}"`,
          padding,
          withActions: true,
          withFooter: true,
          body: "<p>O padding do host e o gap entre as linhas sao o mesmo valor.</p>",
          width: "18rem"
        })
      );
    }
    return wrap;
  }
};

export const EdgeToEdge = {
  render: () => {
    const card = createCard({
      padding: "none",
      className: "overflow-hidden",
      body: `<div style="height: 8rem; background: linear-gradient(135deg, var(--ark-color-primary), var(--ark-color-info))"></div>
        <div class="p-4 flex flex-col gap-1"><strong>Sem padding</strong><span class="text-sm">A imagem encosta nas bordas; o texto traz o proprio padding. overflow-hidden na class do host recorta os cantos.</span></div>`,
      withFooter: false
    });
    return card;
  }
};

export const Grid = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "grid grid-cols-3 gap-4";
    for (const [name, count] of [
      ["Requisicoes", "1.284"],
      ["Falhas", "12"],
      ["Latencia p95", "412 ms"]
    ]) {
      wrap.appendChild(
        createCard({
          heading: name,
          padding: "sm",
          body: `<div class="text-2xl font-semibold">${count}</div>`,
          width: "auto"
        })
      );
    }
    return wrap;
  }
};

// A grid coloca cada parte no lugar independentemente da ordem do DOM: h2 no inicio do host, acoes na mesma
// linha, corpo na largura toda, rodape por ultimo com divisor; padding e gap seguem o atributo.
export const Layout = {
  render: () => createCard({ heading: "Layout", withActions: true, withFooter: true }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const card = canvasElement.querySelector("ark-card") as HTMLElement;
    const heading = card.querySelector('[data-ark="card-heading"]') as HTMLElement;
    const actions = card.querySelector('[slot="actions"]') as HTMLElement;
    const footer = card.querySelector('[slot="footer"]') as HTMLElement;
    const body = Array.from(card.querySelectorAll(":scope > p")) as HTMLElement[];

    await expect(card.firstElementChild).toBe(heading);
    await expect(heading.tagName).toBe("H2");
    await expect(heading.textContent).toBe("Layout");

    const cardBox = card.getBoundingClientRect();
    const headingBox = heading.getBoundingClientRect();
    const actionsBox = actions.getBoundingClientRect();
    const footerBox = footer.getBoundingClientRect();
    const bodyBox = body[0].getBoundingClientRect();

    // Titulo e acoes na mesma linha (centros alinhados), acoes encostadas a direita.
    await expect(
      Math.abs(headingBox.top + headingBox.height / 2 - (actionsBox.top + actionsBox.height / 2))
    ).toBeLessThan(2);
    await expect(Math.round(actionsBox.right)).toBe(Math.round(cardBox.right - 16 - 1));
    // Corpo abaixo do cabecalho, na largura toda (padding 16 + borda 1 de cada lado).
    await expect(bodyBox.top).toBeGreaterThan(actionsBox.bottom);
    await expect(Math.round(bodyBox.width)).toBe(Math.round(cardBox.width - 34));
    // Rodape por ultimo, com divisor.
    await expect(footerBox.top).toBeGreaterThan(body[body.length - 1].getBoundingClientRect().bottom);
    await expect(getComputedStyle(footer).borderTopWidth).toBe("1px");
    await expect(getComputedStyle(card).padding).toBe("16px");
    await expect(getComputedStyle(card).rowGap).toBe("16px");

    card.setAttribute("padding", "lg");
    await expect(getComputedStyle(card).padding).toBe("24px");
    await expect(getComputedStyle(footer).paddingTop).toBe("24px");
    card.setAttribute("padding", "none");
    await expect(getComputedStyle(card).padding).toBe("0px");
    await expect(getComputedStyle(card).rowGap).toBe("0px");
    card.setAttribute("padding", "lixo");
    await expect(getComputedStyle(card).padding).toBe("16px");

    card.setAttribute("rounded", "xl");
    await expect(getComputedStyle(card).borderTopLeftRadius).toBe("12px");

    // Sem heading o h2 sai; com um slot="header" ele ocupa a linha de cima ao lado das acoes.
    card.removeAttribute("heading");
    await expect(card.querySelector('[data-ark="card-heading"]')).toBeNull();
    const header = document.createElement("div");
    header.setAttribute("slot", "header");
    header.textContent = "Cabecalho livre";
    card.appendChild(header);
    await waitFor(() => expect(header).toHaveAttribute("data-ark", "card-header"));
    const headerBox = header.getBoundingClientRect();
    await expect(
      Math.abs(
        headerBox.top +
          headerBox.height / 2 -
          (actions.getBoundingClientRect().top + actions.getBoundingClientRect().height / 2)
      )
    ).toBeLessThan(2);

    // Com heading de volta, o slot="header" desce para a linha seguinte, na largura toda.
    card.setAttribute("padding", "md");
    card.setAttribute("heading", "De volta");
    const h2 = card.querySelector('[data-ark="card-heading"]') as HTMLElement;
    await expect(card.firstElementChild).toBe(h2);
    await expect(header.getBoundingClientRect().top).toBeGreaterThan(h2.getBoundingClientRect().bottom);
    await expect(Math.round(header.getBoundingClientRect().width)).toBe(
      Math.round(card.getBoundingClientRect().width - 34)
    );
  }
};

export const TestHooks = {
  render: () =>
    createCard({
      heading: "Hooks",
      header: "<span>Sub</span>",
      withActions: true,
      withFooter: true,
      testid: "meu-card"
    }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const card = canvasElement.querySelector('[data-ark="card"]');
    await expect(card).toHaveAttribute("data-testid", "meu-card");
    await expect(canvasElement.querySelector('[data-ark="card-heading"]')).toHaveAttribute(
      "data-testid",
      "meu-card-heading"
    );
    await expect(canvasElement.querySelector('[data-ark="card-header"]')).toHaveAttribute(
      "data-testid",
      "meu-card-header"
    );
    await expect(canvasElement.querySelector('[data-ark="card-actions"]')).toHaveAttribute(
      "data-testid",
      "meu-card-actions"
    );
    await expect(canvasElement.querySelector('[data-ark="card-footer"]')).toHaveAttribute(
      "data-testid",
      "meu-card-footer"
    );
    // O corpo nao e marcado: e conteudo livre, que pode ser outro ark-* com os proprios hooks.
    await expect(canvasElement.querySelector('[data-ark="card-body"]')).toBeNull();
  }
};
