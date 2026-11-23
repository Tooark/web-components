import type { ArkCardPadding, ArkRounded, ArkTheme } from "@tooark/core";
import { expect, waitFor } from "storybook/test";

const meta = {
  title: "Core/ArkCard",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Cartão: o host `ark-card` é a caixa (fundo surface, borda, cantos) e uma grid. Os filhos do usuário ficam onde estão: `slot="header"` e `slot="actions"` na linha de cima, `slot="footer"` na última linha com divisor, e os demais são o corpo. `heading` cria um h2 próprio; com ele o `slot="header"` vira a linha seguinte do cabeçalho. `padding` escala padding e gap juntos.'
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
  "<p>Variáveis, certificados e cabeçalhos padrão aplicados a toda requisição deste ambiente.</p><p>Última alteração há 2 dias por Ana Lima.</p>";

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
  render: () => createCard({ body: "<p>Um cartão é só uma caixa: qualquer filho sem slot é o corpo.</p>" })
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
      heading: "Integrações",
      header:
        '<span class="text-sm" style="color: var(--ark-color-fg-muted)">Com heading, o slot="header" vira a linha seguinte do cabeçalho: descrição, filtros, abas.</span>',
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
          body: "<p>O padding do host e o gap entre as linhas são o mesmo valor.</p>",
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
      ["Requisições", "1.284"],
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

// A grid coloca cada parte no lugar independentemente da ordem do DOM: h2 no início do host, ações na mesma
// linha, corpo na largura toda, rodapé por último com divisor; padding e gap seguem o atributo.
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

    // Título e ações na mesma linha (centros alinhados), ações encostadas a direita.
    await expect(
      Math.abs(headingBox.top + headingBox.height / 2 - (actionsBox.top + actionsBox.height / 2))
    ).toBeLessThan(2);
    await expect(Math.round(actionsBox.right)).toBe(Math.round(cardBox.right - 16 - 1));
    // Corpo abaixo do cabeçalho, na largura toda (padding 16 + borda 1 de cada lado).
    await expect(bodyBox.top).toBeGreaterThan(actionsBox.bottom);
    await expect(Math.round(bodyBox.width)).toBe(Math.round(cardBox.width - 34));
    // Rodapé por último, com divisor.
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

    // Sem heading o h2 sai; com um slot="header" ele ocupa a linha de cima ao lado das ações.
    card.removeAttribute("heading");
    await expect(card.querySelector('[data-ark="card-heading"]')).toBeNull();
    const header = document.createElement("div");
    header.setAttribute("slot", "header");
    header.textContent = "Cabeçalho livre";
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

/** Largura min-content do nó (a da maior palavra), medida num clone fora do fluxo. */
function minContentWidth(node: HTMLElement): number {
  const clone = node.cloneNode(true) as HTMLElement;
  clone.style.position = "absolute";
  clone.style.visibility = "hidden";
  clone.style.width = "min-content";
  node.parentElement?.appendChild(clone);
  const width = clone.getBoundingClientRect().width;
  clone.remove();
  return width;
}

function wideActions(withSelect: boolean): HTMLElement {
  const actions = document.createElement("div");
  actions.setAttribute("slot", "actions");
  actions.append(createButton("Exportar", "outline"), createButton("Duplicar", "outline"));
  actions.appendChild(createButton("Arquivar", "outline"));
  if (withSelect) {
    const select = document.createElement("ark-select");
    select.setAttribute("size", "sm");
    select.setAttribute("aria-label", "Período");
    select.setAttribute("options", JSON.stringify([{ value: "30", label: "Últimos 30 dias" }]));
    actions.appendChild(select);
  }
  return actions;
}

export const WrapActions = {
  parameters: {
    docs: {
      description: {
        story:
          'Ações largas num card estreito. Com `wrap-actions` o h2 do `heading` não fica mais estreito que a maior palavra e as ações quebram em linhas, encostadas à direita, em vez de esmagar o título ou transbordar o card. O `slot="header"` do usuário encolhe como sem o atributo (um título truncado continua truncando); `min-width: auto` no próprio elemento dá a ele o mesmo piso. Sem o atributo, o card fica como sempre foi. Limite: uma palavra mais larga que o card (URL, nome de arquivo) alarga a coluna do título; quebre-a no próprio conteúdo.'
      }
    }
  },
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "grid";
    wrap.style.gap = "16px";

    const squeezed = createCard({ heading: "Relatório V2", width: "400px" });
    squeezed.dataset.case = "squeezed";
    squeezed.appendChild(wideActions(true));

    const fits = createCard({ heading: "Hoje", width: "400px" });
    fits.dataset.case = "fits";
    fits.appendChild(wideActions(false));

    const truncated = createCard({
      width: "400px",
      header:
        '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Relatório financeiro consolidado do trimestre</span>',
      withActions: true
    });
    truncated.dataset.case = "truncated";

    const optIn = createCard({ width: "400px", header: "<strong>Relatório V2</strong>" });
    optIn.dataset.case = "opt-in";
    (optIn.querySelector('[slot="header"]') as HTMLElement).style.minWidth = "auto";
    optIn.appendChild(wideActions(true));

    for (const card of [squeezed, fits, truncated, optIn]) card.setAttribute("wrap-actions", "");

    const plain = createCard({ heading: "Relatório V2", width: "400px" });
    plain.dataset.case = "plain";
    plain.appendChild(wideActions(true));

    wrap.append(squeezed, fits, truncated, optIn, plain);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const card = (id: string) => canvasElement.querySelector(`ark-card[data-case="${id}"]`) as HTMLElement;
    const actionsOf = (el: HTMLElement) => el.querySelector('[slot="actions"]') as HTMLElement;
    const innerRight = (el: HTMLElement) => el.getBoundingClientRect().right - 16 - 1;

    for (const id of ["squeezed", "fits", "truncated", "opt-in"]) {
      // Nada sai do card: nem as ações nem o título.
      await expect(card(id).scrollWidth).toBeLessThanOrEqual(card(id).clientWidth);
      await expect(actionsOf(card(id)).getBoundingClientRect().right).toBeLessThanOrEqual(innerRight(card(id)) + 0.5);
    }

    // O h2 fica pelo menos na largura da maior palavra ("Relatório") e as ações quebram linha.
    const heading = card("squeezed").querySelector('[data-ark="card-heading"]') as HTMLElement;
    await expect(heading.getBoundingClientRect().width).toBeGreaterThanOrEqual(minContentWidth(heading) - 0.5);
    await expect(actionsOf(card("squeezed")).getBoundingClientRect().height).toBeGreaterThan(40);

    // Com espaço, nada muda: ações numa linha só, encostadas à direita, título com o resto.
    const fitsActions = actionsOf(card("fits"));
    await expect(Math.round(fitsActions.getBoundingClientRect().height)).toBe(28);
    await expect(Math.round(fitsActions.getBoundingClientRect().right)).toBe(Math.round(innerRight(card("fits"))));

    // O cabeçalho do usuário continua encolhendo: o título truncado segue truncado e as ações ficam numa linha.
    const ellipsis = card("truncated").querySelector('[slot="header"] span') as HTMLElement;
    await expect(ellipsis.scrollWidth).toBeGreaterThan(ellipsis.clientWidth);
    await expect(Math.round(actionsOf(card("truncated")).getBoundingClientRect().height)).toBe(28);

    // Com min-width: auto no próprio cabeçalho, ele ganha o piso da maior palavra.
    const header = card("opt-in").querySelector('[slot="header"]') as HTMLElement;
    await expect(header.getBoundingClientRect().width).toBeGreaterThanOrEqual(minContentWidth(header) - 0.5);

    // Sem o atributo, o layout é o de sempre: ações sem quebra de linha e coluna do título com mínimo 0.
    await expect(getComputedStyle(actionsOf(card("plain"))).flexWrap).toBe("nowrap");
    const plainHeading = card("plain").querySelector('[data-ark="card-heading"]') as HTMLElement;
    await expect(getComputedStyle(plainHeading).minWidth).toBe("0px");
  }
};

// Uma página com `overflow-wrap: anywhere` (comum em apps que mostram URLs e identificadores) reduz a largura mínima
// de um texto a um caractere: o piso do título de `wrap-actions` sumia e ele virava uma letra por linha. O h2
// próprio fixa o `overflow-wrap`, então o piso é o mesmo de uma página sem a regra.
export const WrapActionsUnderOverflowWrapAnywhere = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "grid";
    wrap.style.gap = "16px";
    for (const inherited of ["anywhere", "normal"]) {
      const scope = document.createElement("div");
      scope.dataset.case = inherited;
      scope.style.overflowWrap = inherited;
      const card = createCard({ heading: "Relatório de consumo mensal", width: "360px" });
      card.setAttribute("wrap-actions", "");
      card.appendChild(wideActions(true));
      scope.appendChild(card);
      wrap.appendChild(scope);
    }
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const headingOf = (id: string) =>
      canvasElement.querySelector(`[data-case="${id}"] [data-ark="card-heading"]`) as HTMLElement;
    const anywhere = headingOf("anywhere").getBoundingClientRect();
    const normal = headingOf("normal").getBoundingClientRect();

    await expect(getComputedStyle(headingOf("anywhere")).overflowWrap).toBe("break-word");
    // Mesma caixa nos dois: a largura da maior palavra, e não uma letra por linha.
    await expect(Math.round(anywhere.width)).toBe(Math.round(normal.width));
    await expect(Math.round(anywhere.height)).toBe(Math.round(normal.height));
    await expect(anywhere.width).toBeGreaterThan(40);
  }
};

// Esticado numa grade ao lado de um card mais alto, o host repartia a sobra entre as linhas: o título descia e a
// linha do rodapé inchava. Com cabeçalho, ações ou rodapé o título fica no topo. Um corpo de um filho só fica com
// a sobra (preenche o card) e o rodapé encosta no fundo; com vários filhos o conteúdo fica junto no topo e a sobra
// vai para baixo. O card só de corpo mantém o layout de antes.
export const Stretched = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "grid grid-cols-4 gap-4";
    const single = createCard({ heading: "Um corpo", body: "<p>Uma linha.</p>", withFooter: true, width: "auto" });
    single.dataset.case = "single";
    const tall = createCard({
      heading: "Alto",
      body: '<div style="height:18rem">Conteúdo que define a altura da linha.</div>',
      width: "auto"
    });
    tall.dataset.case = "tall";
    const many = createCard({
      heading: "Vários",
      body: "<p>Primeiro parágrafo.</p><p>Segundo parágrafo.</p>",
      withFooter: true,
      width: "auto"
    });
    many.dataset.case = "many";
    const bodyOnly = createCard({ body: "<div>Só corpo: ocupa a altura toda.</div>", width: "auto" });
    bodyOnly.dataset.case = "body-only";
    wrap.append(single, tall, many, bodyOnly);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const card = (id: string) => canvasElement.querySelector(`ark-card[data-case="${id}"]`) as HTMLElement;
    const box = (host: HTMLElement, selector: string) =>
      (host.querySelector(selector) as HTMLElement).getBoundingClientRect();
    const offset = (host: HTMLElement, selector: string) =>
      Math.round(box(host, selector).top - host.getBoundingClientRect().top);
    // Distância do fim do nó até o fim da área de conteúdo do card (padding de 1rem e borda de 1 px).
    const below = (host: HTMLElement, selector: string) =>
      Math.round(host.getBoundingClientRect().bottom - 17 - box(host, selector).bottom);
    const [single, tall, many, bodyOnly] = ["single", "tall", "many", "body-only"].map(card);
    const height = Math.round(tall.getBoundingClientRect().height);

    // A grade esticou todos na altura do mais alto, e o título de cada um fica onde fica o do card que a define.
    for (const host of [single, many, bodyOnly]) {
      await expect(Math.round(host.getBoundingClientRect().height)).toBe(height);
    }
    for (const host of [single, many]) {
      await expect(offset(host, '[data-ark="card-heading"]')).toBe(offset(tall, '[data-ark="card-heading"]'));
      await expect(offset(host, "p")).toBe(offset(tall, "div"));
    }

    // Um filho de corpo: ele fica com a sobra e o rodapé, na própria altura, encosta no fundo.
    await expect(box(single, "p").height).toBeGreaterThan(height - 160);
    await expect(box(single, '[slot="footer"]').height).toBeLessThan(60);
    await expect(below(single, '[slot="footer"]')).toBe(0);

    // Vários filhos de corpo: seguem um ao outro com o gap do card, o rodapé logo depois, e a sobra embaixo.
    const [first, second] = Array.from(many.querySelectorAll("p")).map((p) => p.getBoundingClientRect());
    await expect(Math.round(second.top - first.bottom)).toBe(16);
    await expect(Math.round(box(many, '[slot="footer"]').top - second.bottom)).toBe(16);
    await expect(below(many, '[slot="footer"]')).toBeGreaterThan(100);

    // Só corpo: sem cabeçalho nem rodapé nenhuma regra entra, e o filho segue esticado na altura do card.
    await expect(getComputedStyle(bodyOnly).alignContent).toBe("normal");
    await expect(getComputedStyle(bodyOnly).gridTemplateRows).not.toContain(" ");
    await expect(below(bodyOnly, "div")).toBe(0);

    // Sem sobra (card na própria altura) o 1fr mede o conteúdo: o card de um corpo mede o mesmo fora da grade.
    const loose = single.cloneNode(true) as HTMLElement;
    loose.style.width = `${single.getBoundingClientRect().width}px`;
    const holder = document.createElement("div");
    holder.style.display = "flex";
    holder.style.alignItems = "flex-start";
    holder.appendChild(loose);
    canvasElement.appendChild(holder);
    await expect(Math.round(box(loose, "p").height)).toBe(Math.round(second.height));
    holder.remove();
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
    // O corpo não é marcado: é conteúdo livre, que pode ser outro ark-* com os próprios hooks.
    await expect(canvasElement.querySelector('[data-ark="card-body"]')).toBeNull();
  }
};
