import type { ArkIntent, ArkNavCollapsible, ArkNavSide, ArkNavVariant, ArkSize, ArkTheme } from "@tooark/core";
import { expect, userEvent, waitFor, within } from "storybook/test";

// Os itens têm `href` de verdade: um clique sem `preventDefault()` no `ark-navigate` navega o iframe do Storybook e
// derruba a execução. Toda `play` que clica num item cancela o evento (como um app SPA faz) ou usa um item sem `href`.
const meta = {
  title: "Core/ArkNav",
  parameters: {
    docs: {
      description: {
        component:
          'Navegação do app: o host `ark-nav` é o `role="navigation"`, cada `ark-nav-item` é a linha com um `<a href>` esticado por cima (Ctrl+clique e nova aba funcionam) ou um `role="button"` sem `href`, e `ark-nav-group` agrupa itens sob um cabeçalho, expansível ou não. Três apresentações: `sidebar` (coluna; recolhe para um trilho de ícones ou, com `collapsible="hidden"`, para só o logo), `navbar` (barra horizontal) e `tabbar` (abas de rodapé, ícone sobre o texto). `slot="header"` (logo) e `slot="footer"` (avatar) ficam onde estão e são ordenados por CSS. O clique emite `ark-navigate` cancelável; `value` marca o item atual.'
      }
    }
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["sidebar", "navbar", "tabbar"] },
    side: { control: "inline-radio", options: ["left", "right"], description: "Borda da sidebar" },
    collapsed: { control: "boolean" },
    collapsible: {
      control: "inline-radio",
      options: ["", "rail", "hidden"],
      description: "Botão de recolher; o que resta recolhida: só ícones (rail) ou só o logo (hidden)"
    },
    value: { control: "text", description: "value (ou href) do item atual" },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    intent: { control: "select", options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"] },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    lang: { control: "select", options: ["en", "pt", "es"] },
    label: { control: "text", description: "aria-label da navegação" }
  },
  args: {
    variant: "sidebar",
    side: "left",
    collapsed: false,
    collapsible: "rail",
    value: "/requests",
    size: "md",
    intent: "primary",
    theme: "auto",
    lang: "pt",
    label: "Principal"
  }
};

export default meta;

type StoryArgs = {
  variant: ArkNavVariant;
  side: ArkNavSide;
  collapsed: boolean;
  collapsible: ArkNavCollapsible | "";
  value: string;
  size: ArkSize;
  intent: ArkIntent;
  theme: ArkTheme;
  lang: string;
  label: string;
};

type ItemSpec = {
  href?: string;
  label?: string;
  value?: string;
  icon?: string;
  badge?: string;
  disabled?: boolean;
  divider?: boolean;
  testid?: string;
};

type GroupSpec = { group: string; expandable?: boolean; open?: boolean; items: ItemSpec[]; testid?: string };

// Traços dos ícones (24x24, stroke), como os de um pacote de ícones do app.
const ICONS = {
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  boxes:
    '<path d="M3 7.5 7.5 5l4.5 2.5L7.5 10Z"/><path d="M12 7.5 16.5 5 21 7.5 16.5 10Z"/><path d="M7.5 14.5 12 12l4.5 2.5L12 17Z"/><path d="M3 7.5v5l4.5 2.5"/><path d="M21 7.5v5l-4.5 2.5"/><path d="M7.5 17v4.5"/><path d="M16.5 17v4.5"/>',
  variable:
    '<path d="M8 21s-4-3-4-9 4-9 4-9"/><path d="M16 3s4 3 4 9-4 9-4 9"/><path d="m9 9 6 6"/><path d="m15 9-6 6"/>',
  share:
    '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4"/><path d="m15.4 6.5-6.8 4"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
  settings:
    '<path d="M12.2 2h-.4a2 2 0 0 0-2 2v.2a2 2 0 0 1-1 1.7l-.4.3a2 2 0 0 1-2 0l-.2-.1a2 2 0 0 0-2.7.7l-.2.4a2 2 0 0 0 .7 2.7l.2.1a2 2 0 0 1 1 1.7v.6a2 2 0 0 1-1 1.7l-.2.1a2 2 0 0 0-.7 2.7l.2.4a2 2 0 0 0 2.7.7l.2-.1a2 2 0 0 1 2 0l.4.3a2 2 0 0 1 1 1.7V20a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2v-.2a2 2 0 0 1 1-1.7l.4-.3a2 2 0 0 1 2 0l.2.1a2 2 0 0 0 2.7-.7l.2-.4a2 2 0 0 0-.7-2.7l-.2-.1a2 2 0 0 1-1-1.7v-.6a2 2 0 0 1 1-1.7l.2-.1a2 2 0 0 0 .7-2.7l-.2-.4a2 2 0 0 0-2.7-.7l-.2.1a2 2 0 0 1-2 0l-.4-.3a2 2 0 0 1-1-1.7V4a2 2 0 0 0-2-2Z"/><circle cx="12" cy="12" r="3"/>',
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
};

const MAIN: Array<ItemSpec | GroupSpec> = [
  { href: "/requests", label: "Requisições", icon: ICONS.send, testid: "requests" },
  { href: "/environments", label: "Ambientes", icon: ICONS.boxes, badge: "3" },
  { href: "/variables", label: "Variáveis", icon: ICONS.variable },
  {
    group: "Workspace",
    expandable: true,
    open: true,
    testid: "workspace",
    items: [
      { href: "/shared", label: "Compartilhados", icon: ICONS.share },
      { href: "/teams", label: "Equipes", icon: ICONS.users, disabled: true }
    ]
  },
  { divider: true },
  { href: "/settings", label: "Configurações", icon: ICONS.settings }
];

const MOBILE: ItemSpec[] = [
  { href: "/", label: "Início", icon: ICONS.home },
  { href: "/search", label: "Buscar", icon: ICONS.search },
  { href: "/notifications", label: "Avisos", icon: ICONS.bell, badge: "2" },
  { href: "/profile", label: "Perfil", icon: ICONS.user }
];

function createIcon(paths: string): HTMLElement {
  const icon = document.createElement("span");
  icon.setAttribute("slot", "icon");
  icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
  return icon;
}

function createItem(spec: ItemSpec): HTMLElement {
  const item = document.createElement("ark-nav-item");
  if (spec.divider) {
    item.setAttribute("divider", "");
    return item;
  }
  if (spec.href) item.setAttribute("href", spec.href);
  if (spec.label) item.setAttribute("label", spec.label);
  if (spec.value) item.setAttribute("value", spec.value);
  if (spec.disabled) item.setAttribute("disabled", "");
  if (spec.testid) item.setAttribute("testid", spec.testid);
  if (spec.icon) item.appendChild(createIcon(spec.icon));
  if (spec.badge) {
    const badge = document.createElement("ark-badge");
    badge.setAttribute("slot", "trailing");
    badge.setAttribute("size", "xs");
    badge.textContent = spec.badge;
    item.appendChild(badge);
  }
  return item;
}

function createGroup(spec: GroupSpec): HTMLElement {
  const group = document.createElement("ark-nav-group");
  group.setAttribute("label", spec.group);
  if (spec.expandable) group.setAttribute("expandable", "");
  if (spec.open) group.setAttribute("open", "");
  if (spec.testid) group.setAttribute("testid", spec.testid);
  for (const item of spec.items) group.appendChild(createItem(item));
  return group;
}

// Logo do app no slot="header": a marca e o nome; o nome some quando a sidebar recolhe (regra do app, abaixo).
function createHeader(): HTMLElement {
  const header = document.createElement("div");
  header.setAttribute("slot", "header");
  header.className = "flex items-center gap-2 px-1";
  const mark = document.createElement("span");
  mark.className = "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold";
  mark.style.background = "var(--ark-color-primary)";
  mark.style.color = "var(--ark-color-primary-fg)";
  mark.textContent = "A";
  const name = document.createElement("span");
  name.setAttribute("data-wordmark", "");
  name.className = "truncate font-semibold";
  name.textContent = "Arkuest";
  header.append(mark, name);
  return header;
}

// Usuário no slot="footer": avatar e nome.
function createFooter(): HTMLElement {
  const footer = document.createElement("div");
  footer.setAttribute("slot", "footer");
  footer.className = "flex items-center gap-2 px-1";
  const avatar = document.createElement("ark-avatar");
  avatar.setAttribute("name", "Paulo Freitas");
  avatar.setAttribute("size", "sm");
  const name = document.createElement("span");
  name.setAttribute("data-wordmark", "");
  name.className = "truncate text-sm";
  name.textContent = "Paulo Freitas";
  footer.append(avatar, name);
  return footer;
}

function createNav(args: Partial<StoryArgs>, specs: Array<ItemSpec | GroupSpec> = MAIN, testid?: string): HTMLElement {
  const nav = document.createElement("ark-nav");
  if (args.variant) nav.setAttribute("variant", args.variant);
  if (args.side) nav.setAttribute("side", args.side);
  if (args.collapsed) nav.setAttribute("collapsed", "");
  if (args.collapsible) nav.setAttribute("collapsible", args.collapsible);
  if (args.value) nav.setAttribute("value", args.value);
  if (args.size) nav.setAttribute("size", args.size);
  if (args.intent) nav.setAttribute("intent", args.intent);
  if (args.theme) nav.setAttribute("theme", args.theme);
  if (args.lang) nav.setAttribute("lang", args.lang);
  if (args.label) nav.setAttribute("label", args.label);
  if (testid) nav.setAttribute("testid", testid);
  for (const spec of specs) nav.appendChild("group" in spec ? createGroup(spec) : createItem(spec));
  return nav;
}

/** Onde a nav entra na página de demonstração: é o app quem posiciona o componente. */
type PagePosition = "left" | "right" | "top" | "bottom";

// Página de demonstração: a nav e um conteúdo que mostra a rota; o `ark-navigate` é cancelado e vira `value`, como
// um router de SPA faria. A regra de estilo é do app: esconde o nome ao lado do logo quando a sidebar recolhe.
function createPage(
  nav: HTMLElement,
  options: { position?: PagePosition; width?: string; height?: string } = {}
): HTMLElement {
  const position = options.position ?? "left";
  const column = position === "top" || position === "bottom";
  const page = document.createElement("div");
  page.className = `flex ${column ? "flex-col" : ""} ${options.height ?? "h-[28rem]"} ${options.width ?? "w-[40rem]"} overflow-hidden rounded-xl border border-neutral-200 bg-white text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100`;
  const style = document.createElement("style");
  style.textContent = "ark-nav[collapsed] [data-wordmark] { display: none; }";
  const main = document.createElement("main");
  main.className = "flex min-h-0 flex-1 items-center justify-center p-6 text-sm text-neutral-500";
  const route = (value: string): string => (value ? `Rota atual: ${value}` : "Clique num item");
  main.textContent = route(nav.getAttribute("value") || "");
  nav.addEventListener("ark-navigate", (event) => {
    event.preventDefault();
    const { value } = (event as CustomEvent<{ value: string }>).detail;
    nav.setAttribute("value", value);
    main.textContent = route(value);
  });
  page.append(style);
  if (position === "left" || position === "top") page.append(nav, main);
  else page.append(main, nav);
  return page;
}

// A sidebar vai para o lado escolhido, a navbar para o topo e o tabbar para o rodapé (numa coluna de celular).
function pagePosition(args: Partial<StoryArgs>): PagePosition {
  if (args.variant === "navbar") return "top";
  if (args.variant === "tabbar") return "bottom";
  return args.side === "right" ? "right" : "left";
}

export const Playground = {
  render: (args: StoryArgs) => {
    const nav = createNav(args);
    // Logo e avatar entram na sidebar e na navbar; a barra de abas é só itens.
    if (args.variant !== "tabbar") {
      nav.prepend(createHeader());
      nav.appendChild(createFooter());
    }
    return createPage(nav, { position: pagePosition(args), width: args.variant === "tabbar" ? "w-80" : undefined });
  }
};

export const Rail = {
  args: { collapsed: true, collapsible: "rail" },
  render: Playground.render
};

export const HiddenWhenCollapsed = {
  args: { collapsed: true, collapsible: "hidden" },
  render: Playground.render
};

export const RightSide = {
  args: { side: "right" },
  render: Playground.render
};

export const Navbar = {
  args: { variant: "navbar", value: "/environments" },
  render: Playground.render
};

export const NavbarCollapsed = {
  args: { variant: "navbar", value: "/environments", collapsed: true },
  render: Playground.render
};

export const Tabbar = {
  render: () => {
    const nav = createNav({ variant: "tabbar", value: "/", label: "Principal" }, MOBILE);
    // Barra de abas no rodapé do "celular": o app a posiciona (aqui, o fim da coluna; numa página, position fixed).
    return createPage(nav, { position: "bottom", width: "w-80" });
  }
};

export const PinnedEnds = {
  render: () => {
    const specs: ItemSpec[] = Array.from({ length: 18 }, (_, index) => ({
      href: `/item-${index + 1}`,
      label: `Item ${index + 1}`,
      icon: ICONS.send
    }));
    const nav = createNav({ collapsible: "rail", value: "/item-1", lang: "pt" }, specs);
    nav.prepend(createHeader());
    nav.appendChild(createFooter());
    return createPage(nav, { height: "h-72" });
  },
  // Cabeçalho, rodapé e botão de recolher ficam presos nas pontas; só os itens rolam entre eles.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const nav = canvasElement.querySelector("ark-nav")!;
    const header = nav.querySelector('[slot="header"]')!;
    const footer = nav.querySelector('[slot="footer"]')!;
    const toggle = nav.querySelector('[data-ark="nav-toggle"]')!;
    const first = nav.querySelector("ark-nav-item")!;
    const box = nav.getBoundingClientRect();
    await expect(nav.scrollHeight).toBeGreaterThan(nav.clientHeight);

    const pinned = async (): Promise<void> => {
      await expect(header.getBoundingClientRect().top - box.top).toBeLessThanOrEqual(9);
      await expect(box.bottom - toggle.getBoundingClientRect().bottom).toBeLessThanOrEqual(9);
      await expect(footer.getBoundingClientRect().bottom).toBeLessThanOrEqual(toggle.getBoundingClientRect().top + 1);
    };
    await pinned();

    // No meio da rolagem o primeiro item já passou por baixo do cabeçalho e as pontas não se moveram.
    nav.scrollTop = 120;
    await waitFor(() => expect(nav.scrollTop).toBeGreaterThan(0));
    await expect(first.getBoundingClientRect().bottom).toBeLessThan(header.getBoundingClientRect().bottom);
    await pinned();

    nav.scrollTop = nav.scrollHeight;
    await waitFor(() => expect(nav.scrollTop + nav.clientHeight).toBeGreaterThanOrEqual(nav.scrollHeight - 1));
    await pinned();
  }
};

export const Sizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex items-start gap-4";
    for (const size of ["xs", "sm", "md", "lg", "xl"] as ArkSize[]) {
      const nav = createNav({ size, value: "/requests", collapsible: "rail" }, MAIN.slice(0, 3));
      nav.style.setProperty("--ark-nav-width", "12rem");
      wrap.appendChild(nav);
    }
    return wrap;
  }
};

export const DarkTheme = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.padding = "16px";
    wrap.style.borderRadius = "12px";
    wrap.style.background = "#0f172a";
    wrap.className = "flex gap-4";
    const nav = createNav({ theme: "dark", value: "/requests", collapsible: "rail" });
    nav.prepend(createHeader());
    nav.appendChild(createFooter());
    nav.style.height = "24rem";
    wrap.appendChild(nav);
    return wrap;
  }
};

export const NavigateIsCancelable = {
  render: () => createNav({ value: "/requests", lang: "pt", label: "Principal" }),
  // O item publica `ark-navigate` cancelável antes de o navegador seguir o link; o evento sobe pelo nav sem ser
  // consolidado; Ctrl+clique fica com o navegador (nova aba); um item sem href é um botão com Enter e Espaço.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const nav = canvasElement.querySelector("ark-nav")!;
    const received: string[] = [];
    const prevented: boolean[] = [];
    nav.addEventListener("ark-navigate", (event) => {
      const detail = (event as CustomEvent<{ href: string | null; value: string }>).detail;
      received.push(`${(event.target as HTMLElement).tagName.toLowerCase()}:${detail.href}:${detail.value}`);
      if (detail.value !== "/variables") event.preventDefault();
    });
    // Rede de segurança: nenhum clique desta story pode navegar o iframe; registra se o item já tinha cancelado.
    canvasElement.addEventListener("click", (event) => {
      prevented.push(event.defaultPrevented);
      event.preventDefault();
    });

    await expect(nav).toHaveAttribute("role", "navigation");
    await expect(nav).toHaveAttribute("aria-label", "Principal");
    const environments = canvas.getByRole("link", { name: /Ambientes/ });
    await expect(environments.tagName).toBe("A");
    await expect(environments).toHaveAttribute("href", "/environments");

    await userEvent.click(environments);
    await expect(received).toEqual(["ark-nav-item:/environments:/environments"]);
    await expect(prevented).toEqual([true]);
    // O nav não escreve `value` sozinho: quem roteia é o app.
    await expect(nav).toHaveAttribute("value", "/requests");

    // Sem preventDefault o navegador seguiria o link (a rede de segurança acima é quem cancela).
    await userEvent.click(canvas.getByRole("link", { name: "Variáveis" }));
    await expect(received).toHaveLength(2);
    await expect(prevented).toEqual([true, false]);

    // Ctrl+clique: do navegador, sem ark-navigate.
    environments.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true }));
    await expect(received).toHaveLength(2);

    // Item desabilitado: o <a> perde o href e o clique não emite (pointer-events: none barra o ponteiro real).
    const teams = canvasElement.querySelector('ark-nav-item[href="/teams"]')!;
    await expect(teams.querySelector("a")).not.toHaveAttribute("href");
    await expect(teams.querySelector("a")).toHaveAttribute("aria-disabled", "true");
    teams.querySelector("a")!.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    await expect(received).toHaveLength(2);

    // Item sem href: o host é o botão.
    const action = document.createElement("ark-nav-item");
    action.setAttribute("label", "Sair");
    action.setAttribute("value", "logout");
    nav.appendChild(action);
    await expect(action).toHaveAttribute("role", "button");
    await expect(action).toHaveAttribute("tabindex", "0");
    action.focus();
    await userEvent.keyboard("{Enter}");
    await expect(received[2]).toBe("ark-nav-item:null:logout");
    await userEvent.click(action);
    await expect(received).toHaveLength(4);
  }
};

export const ValueMarksCurrent = {
  render: () => createNav({ value: "/environments" }),
  // `value` do nav marca `current` no item cujo value (ou href) coincide; o link ganha aria-current="page".
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const nav = canvasElement.querySelector("ark-nav")!;
    const requests = canvasElement.querySelector('ark-nav-item[href="/requests"]')!;
    const environments = canvasElement.querySelector('ark-nav-item[href="/environments"]')!;

    await expect(environments).toHaveAttribute("current");
    await expect(environments.querySelector("a")).toHaveAttribute("aria-current", "page");
    await expect(environments).toHaveClass("ark:bg-primary-soft");
    await expect(requests).not.toHaveAttribute("current");

    nav.setAttribute("value", "/requests");
    await expect(requests).toHaveAttribute("current");
    await expect(requests.querySelector("a")).toHaveAttribute("aria-current", "page");
    await expect(environments).not.toHaveAttribute("current");

    // Item que chega depois herda tamanho e intent e entra na comparação.
    nav.setAttribute("intent", "success");
    nav.setAttribute("size", "sm");
    const extra = createItem({ href: "/history", label: "Histórico", value: "history" });
    nav.appendChild(extra);
    await waitFor(() => expect(extra).toHaveAttribute("size", "sm"));
    await expect(extra).toHaveAttribute("intent", "success");
    nav.setAttribute("value", "history");
    await expect(extra).toHaveAttribute("current");
    await expect(extra).toHaveClass("ark:bg-success-soft");

    // Sem `value` cada item mantém o próprio current.
    nav.removeAttribute("value");
    await expect(extra).toHaveAttribute("current");
  }
};

export const CollapseToRail = {
  render: () => {
    const nav = createNav({ collapsible: "rail", value: "/requests", lang: "pt" });
    nav.prepend(createHeader());
    nav.appendChild(createFooter());
    return createPage(nav);
  },
  // O botão recolhe a sidebar para um trilho: só os ícones ficam, o rótulo vira sr-only (o nome do link continua),
  // o item ganha title, os grupos viram faixas separadas e `ark-collapse` avisa o app, que persiste o estado.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const nav = canvasElement.querySelector("ark-nav")!;
    const toggle = nav.querySelector<HTMLButtonElement>('[data-ark="nav-toggle"]')!;
    const requests = nav.querySelector('ark-nav-item[href="/requests"]')!;
    const group = nav.querySelector("ark-nav-group")!;
    const collapsed: boolean[] = [];
    nav.addEventListener("ark-collapse", (event) => collapsed.push((event as CustomEvent).detail.collapsed));

    await expect(toggle).toHaveAttribute("aria-label", "Recolher");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(nav).toHaveClass("ark:w-(--ark-nav-width)");
    await expect(requests.querySelector('[data-ark="nav-item-label"]')).not.toHaveClass("ark:sr-only");
    await expect(group.querySelector('[data-ark="nav-group-heading"]')).toBeVisible();
    const header = nav.querySelector<HTMLElement>('[slot="header"]')!;
    await expect(getComputedStyle(header).justifyContent).not.toBe("center");

    await userEvent.click(toggle);
    // Recolhida, o logo (e o rodapé) centram na coluna estreita.
    await expect(getComputedStyle(header).justifyContent).toBe("center");
    await expect(collapsed).toEqual([true]);
    await expect(nav).toHaveAttribute("collapsed");
    await expect(nav).toHaveClass("ark:w-(--ark-nav-rail-width)");
    await expect(toggle).toHaveAttribute("aria-label", "Expandir");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(requests).toHaveAttribute("data-ark-rail");
    await expect(requests.querySelector('[data-ark="nav-item-label"]')).toHaveClass("ark:sr-only");
    // O title fica no host (um title no <a> entraria duas vezes no nome do link, que vem do conteúdo do host).
    await expect(requests).toHaveAttribute("title", "Requisições");
    await expect(requests.querySelector("a")).not.toHaveAttribute("title");
    await expect(requests.querySelector("a")).toHaveAccessibleName("Requisições");
    await expect(nav.querySelector('ark-nav-item[href="/environments"] [slot="trailing"]')).not.toBeVisible();
    await expect(group.querySelector('[data-ark="nav-group-heading"]')).not.toBeVisible();
    await expect(group).toHaveClass("ark:border-t");
    // No trilho os itens do grupo ficam à mostra mesmo com o grupo fechado.
    group.removeAttribute("open");
    await expect(group.querySelector("ark-nav-item")).toBeVisible();

    await userEvent.click(toggle);
    await expect(collapsed).toEqual([true, false]);
    await expect(nav).not.toHaveAttribute("collapsed");
    await expect(requests).not.toHaveAttribute("title");
    await expect(group.querySelector("ark-nav-item")).not.toBeVisible();

    // Pela propriedade (o app restaurou o estado guardado): sem evento.
    (nav as HTMLElement & { collapsed: boolean }).collapsed = true;
    await expect(nav).toHaveAttribute("collapsed");
    await expect(collapsed).toHaveLength(2);
  }
};

export const CollapseToHidden = {
  render: () => {
    const nav = createNav({ collapsible: "hidden", collapsed: true, value: "/requests", lang: "en" });
    nav.prepend(createHeader());
    nav.appendChild(createFooter());
    // Uma segunda nav sem rodapé: o botão de expandir tem de ficar logo abaixo do logo do mesmo jeito.
    const bare = createNav({ collapsible: "hidden", collapsed: true, value: "/requests", lang: "en" });
    bare.prepend(createHeader());
    bare.style.height = "20rem";
    const wrap = document.createElement("div");
    wrap.className = "flex items-start gap-6";
    wrap.append(createPage(nav), bare);
    return wrap;
  },
  // Com collapsible="hidden" só o cabeçalho (logo) e o botão de expandir ficam; itens, grupos e rodapé somem também
  // da ordem de Tab. Expandir devolve tudo.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const [nav, bare] = Array.from(canvasElement.querySelectorAll("ark-nav"));
    const bareToggle = bare.querySelector('[data-ark="nav-toggle"]')!.getBoundingClientRect();
    const bareHeader = bare.querySelector('[slot="header"]')!.getBoundingClientRect();
    await expect(bareToggle.top - bareHeader.bottom).toBeLessThan(12);
    await expect(bareToggle.top).toBeGreaterThanOrEqual(bareHeader.bottom);

    const toggle = nav.querySelector<HTMLButtonElement>('[data-ark="nav-toggle"]')!;
    const header = nav.querySelector('[slot="header"]')!;
    const footer = nav.querySelector('[slot="footer"]')!;
    const requests = nav.querySelector('ark-nav-item[href="/requests"]')!;

    await expect(nav).toHaveAttribute("data-ark-hidden");
    await expect(header).toBeVisible();
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-label", "Expand");
    await expect(requests).not.toBeVisible();
    await expect(footer).not.toBeVisible();
    await expect(nav.querySelector("ark-nav-group")).not.toBeVisible();
    // Fora da ordem de Tab: o foco vai do botão para fora da nav.
    toggle.focus();
    await userEvent.tab();
    await expect(nav.contains(document.activeElement)).toBe(false);

    await userEvent.click(toggle);
    await expect(nav).not.toHaveAttribute("data-ark-hidden");
    await expect(requests).toBeVisible();
    await expect(footer).toBeVisible();
    await expect(requests).not.toHaveAttribute("data-ark-rail");
  }
};

export const SideRight = {
  render: () => createNav({ side: "right", collapsible: "rail" }),
  // À direita a borda desenhada e o chevron trocam de lado.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const nav = canvasElement.querySelector("ark-nav")!;
    const chevron = nav.querySelector('[data-ark="nav-toggle"] svg')!;
    await expect(nav).toHaveClass("ark:border-l");
    await expect(nav).toHaveAttribute("data-ark-side", "right");
    await expect(chevron).toHaveClass("ark:rotate-180");
    nav.setAttribute("collapsed", "");
    await expect(chevron).not.toHaveClass("ark:rotate-180");
    nav.setAttribute("side", "left");
    await expect(nav).toHaveClass("ark:border-r");
    await expect(chevron).toHaveClass("ark:rotate-180");
  }
};

export const GroupToggle = {
  render: () => createNav({ value: "/shared" }),
  // O cabeçalho expansível é um botão (aria-expanded) que esconde e mostra os itens e emite `ark-toggle`; um grupo
  // sem `expandable` tem um título simples; sem `label` não tem cabeçalho.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const group = canvasElement.querySelector("ark-nav-group")!;
    const shared = group.querySelector('ark-nav-item[href="/shared"]')!;
    const toggled: boolean[] = [];
    group.addEventListener("ark-toggle", (event) => toggled.push((event as CustomEvent).detail.open));

    const heading = canvas.getByRole("button", { name: "Workspace" });
    await expect(group).toHaveAttribute("role", "group");
    await expect(group).toHaveAccessibleName("Workspace");
    await expect(heading).toHaveAttribute("aria-expanded", "true");
    await expect(shared).toBeVisible();

    await userEvent.click(heading);
    await expect(toggled).toEqual([false]);
    await expect(group).not.toHaveAttribute("open");
    await expect(heading).toHaveAttribute("aria-expanded", "false");
    await expect(shared).not.toBeVisible();

    heading.focus();
    await userEvent.keyboard("{Enter}");
    await expect(toggled).toEqual([false, true]);
    await expect(shared).toBeVisible();

    // Sem expandable: título, não botão; sem label: sem cabeçalho.
    group.removeAttribute("expandable");
    await expect(group.querySelector('[data-ark="nav-group-heading"]')?.tagName).toBe("DIV");
    await expect(canvas.queryByRole("button", { name: "Workspace" })).toBeNull();
    group.removeAttribute("label");
    await expect(group.querySelector('[data-ark="nav-group-heading"]')).toBeNull();
    await expect(group).not.toHaveAttribute("aria-labelledby");
  }
};

export const HorizontalVariants = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex w-[36rem] flex-col gap-6";
    const navbar = createNav({ variant: "navbar", value: "/requests", collapsible: "rail", collapsed: true });
    navbar.prepend(createHeader());
    navbar.appendChild(createFooter());
    const tabbar = createNav({ variant: "tabbar", value: "/search" }, MOBILE);
    wrap.append(navbar, tabbar);
    return wrap;
  },
  // A navbar recolhida fica só com ícones (sem botão: quem recolhe é o app) e sem barra de rolagem visível; o grupo
  // não tem caixa e o cabeçalho some; no tabbar o ícone fica sobre o rótulo, os itens dividem a largura e o trailing
  // some.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const [navbar, tabbar] = Array.from(canvasElement.querySelectorAll("ark-nav"));
    await expect(navbar.querySelector('[data-ark="nav-toggle"]')).toBeNull();
    await expect(getComputedStyle(navbar).scrollbarWidth).toBe("none");
    await expect(navbar).toHaveAttribute("data-ark-rail");
    const item = navbar.querySelector("ark-nav-item")!;
    await expect(item).toHaveAttribute("data-ark-rail");
    await expect(item).toHaveAttribute("variant", "navbar");
    await expect(item).toHaveAttribute("title", "Requisições");
    await expect(item).toHaveClass("ark:min-w-(--ark-size-md)");
    await expect(item.querySelector('[data-ark="nav-item-label"]')).toHaveClass("ark:sr-only");
    navbar.removeAttribute("collapsed");
    await expect(item).not.toHaveAttribute("data-ark-rail");
    await expect(item.querySelector('[data-ark="nav-item-label"]')).not.toHaveClass("ark:sr-only");
    navbar.setAttribute("collapsed", "");
    await expect(navbar.querySelector('[data-ark="nav-group-heading"]')).not.toBeVisible();
    await expect(getComputedStyle(navbar.querySelector("ark-nav-group")!).display).toBe("contents");
    await expect(navbar.querySelector("ark-nav-item[divider]")).toHaveAttribute("aria-orientation", "vertical");

    const items = Array.from(tabbar.querySelectorAll("ark-nav-item"));
    await expect(items[0]).toHaveClass("ark:flex-col");
    await expect(items[1]).toHaveClass("ark:text-primary");
    await expect(items[2].querySelector('[slot="trailing"]')).not.toBeVisible();
    const widths = items.map((item) => Math.round(item.getBoundingClientRect().width));
    await expect(new Set(widths).size).toBe(1);
  }
};

export const TestHooks = {
  render: () => {
    const nav = createNav({ collapsible: "rail", value: "/requests" }, MAIN, "main-nav");
    nav.prepend(createHeader());
    nav.appendChild(createFooter());
    return nav;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const nav = canvasElement.querySelector("ark-nav")!;
    await expect(nav).toHaveAttribute("data-ark", "nav");
    await expect(nav).toHaveAttribute("data-testid", "main-nav");
    await expect(nav.querySelector('[slot="header"]')).toHaveAttribute("data-ark", "nav-header");
    await expect(nav.querySelector('[slot="footer"]')).toHaveAttribute("data-testid", "main-nav-footer");
    await expect(nav.querySelector('[data-ark="nav-toggle"]')).toHaveAttribute("data-testid", "main-nav-toggle");

    // O testid é por item (o nav não o propaga): as partes internas recebem o sufixo.
    const item = nav.querySelector('ark-nav-item[href="/requests"]')!;
    await expect(item).toHaveAttribute("data-ark", "nav-item");
    await expect(item).toHaveAttribute("data-testid", "requests");
    await expect(item.querySelector("a")).toHaveAttribute("data-testid", "requests-link");
    await expect(item.querySelector('[data-ark="nav-item-label"]')).toHaveAttribute("data-testid", "requests-label");
    await expect(item.querySelector('[slot="icon"]')).toHaveAttribute("data-ark", "nav-item-icon");
    await expect(nav.querySelector('ark-nav-item[href="/environments"] [slot="trailing"]')).toHaveAttribute(
      "data-ark",
      "nav-item-trailing"
    );
    await expect(nav.querySelector("ark-nav-item[divider]")).toHaveAttribute("data-ark", "nav-divider");

    const group = nav.querySelector("ark-nav-group")!;
    await expect(group).toHaveAttribute("data-ark", "nav-group");
    await expect(group).toHaveAttribute("data-testid", "workspace");
    await expect(group.querySelector('[data-ark="nav-group-heading"]')).toHaveAttribute(
      "data-testid",
      "workspace-heading"
    );
  }
};
