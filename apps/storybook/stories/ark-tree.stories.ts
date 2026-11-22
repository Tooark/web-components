import type { ArkSize, ArkTreeSelection } from "@tooark/core";
import type { ArkTree, ArkTreeItem } from "@tooark/web-components";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Core/ArkTree",
  parameters: {
    layout: "padded",
    // A estrutura ARIA (group por aria-owns, sem mover os filhos) é o ponto frágil: aqui uma violação do axe reprova.
    a11y: { test: "error" },
    docs: {
      description: {
        component:
          'Árvore declarativa: o host `ark-tree` é o `role="tree"` e cada `ark-tree-item` é o próprio `treeitem`, com os subitens aninhados onde o app os declarou (um `role="group"` próprio os reúne por `aria-owns`). `label` dá o texto do nó, `slot="icon"` o ícone e `slot="trailing"` badges e ações. Sem `selection` a árvore só navega e expande; `selection="single"` seleciona e ativa no clique, `multiple` seleciona vários e `checkboxes` (com `multiple`) marca por caixas, com `propagate` para os descendentes. Teclado do padrão WAI-ARIA (setas, Home, End, `*`, busca por digitação, Enter e Espaço). Eventos `ark-toggle`, `ark-selection-change` e `ark-activate`.'
      }
    }
  },
  argTypes: {
    selection: { control: "inline-radio", options: ["none", "single", "multiple"] },
    checkboxes: { control: "boolean" },
    propagate: { control: "boolean" },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] }
  },
  args: { selection: "none", checkboxes: false, propagate: false, size: "md" }
};

export default meta;

type StoryArgs = {
  selection: ArkTreeSelection;
  checkboxes: boolean;
  propagate: boolean;
  size: ArkSize;
  testid?: string;
};

type Node = {
  value: string;
  label: string;
  expanded?: boolean;
  lazy?: boolean;
  disabled?: boolean;
  badge?: string;
  children?: Node[];
};

const FILES: Node[] = [
  {
    value: "src",
    label: "src",
    expanded: true,
    children: [
      { value: "src/index.ts", label: "index.ts" },
      {
        value: "src/components",
        label: "components",
        children: [
          { value: "src/components/button.ts", label: "button.ts" },
          { value: "src/components/tree.ts", label: "tree.ts" }
        ]
      },
      { value: "src/app", label: "app", lazy: true }
    ]
  },
  { value: "docs", label: "docs", children: [{ value: "docs/guide.md", label: "guide.md" }] },
  { value: "README.md", label: "README.md", badge: "M" },
  { value: "LICENSE", label: "LICENSE", disabled: true }
];

const FOLDER_SVG = `<svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M2 5a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5z"/></svg>`;
const FILE_SVG = `<svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M5 2h6l4 4v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/></svg>`;

function createNode(node: Node): ArkTreeItem {
  const item = document.createElement("ark-tree-item") as ArkTreeItem;
  item.setAttribute("value", node.value);
  item.setAttribute("label", node.label);
  if (node.expanded) item.setAttribute("expanded", "");
  if (node.lazy) item.setAttribute("lazy", "");
  if (node.disabled) item.setAttribute("disabled", "");
  const icon = document.createElement("span");
  icon.setAttribute("slot", "icon");
  icon.style.color = "var(--ark-color-fg-muted)";
  icon.innerHTML = node.children || node.lazy ? FOLDER_SVG : FILE_SVG;
  item.appendChild(icon);
  if (node.badge) {
    // Trailing não interativo (badge): fica na linha e não entra na árvore de acessibilidade como controle.
    const badge = document.createElement("ark-badge");
    badge.setAttribute("slot", "trailing");
    badge.setAttribute("size", "xs");
    badge.setAttribute("intent", "warning");
    badge.textContent = node.badge;
    item.appendChild(badge);
  }
  for (const child of node.children ?? []) item.appendChild(createNode(child));
  return item;
}

function createTree(args: Partial<StoryArgs>, nodes: Node[] = FILES): ArkTree {
  const tree = document.createElement("ark-tree") as ArkTree;
  tree.setAttribute("aria-label", "Arquivos");
  if (args.selection && args.selection !== "none") tree.setAttribute("selection", args.selection);
  if (args.checkboxes) tree.setAttribute("checkboxes", "");
  if (args.propagate) tree.setAttribute("propagate", "");
  if (args.size && args.size !== "md") tree.setAttribute("size", args.size);
  if (args.testid) tree.setAttribute("testid", args.testid);
  tree.style.maxWidth = "320px";
  for (const node of nodes) tree.appendChild(createNode(node));
  return tree;
}

const byValue = (root: Element, value: string): ArkTreeItem =>
  root.querySelector(`ark-tree-item[value="${value}"]`) as ArkTreeItem;

export const Playground = {
  render: (args: StoryArgs) => createTree(args)
};

export const Structure = {
  render: () => createTree({}),
  // Estrutura ARIA plana: a linha de cada item é o treeitem, com nível, posição e tamanho do conjunto explícitos, e o
  // host fica role="none"; os subitens continuam onde o app os declarou. O nome vem do rótulo próprio, não do texto
  // dos descendentes.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tree = canvasElement.querySelector("ark-tree") as ArkTree;
    const row = (value: string): HTMLElement => byValue(tree, value).rowElement as HTMLElement;
    const src = byValue(tree, "src");
    await expect(tree).toHaveAttribute("role", "tree");
    await expect(src).toHaveAttribute("role", "none");
    await expect(row("src")).toHaveAttribute("role", "treeitem");
    await expect(row("src")).toHaveAttribute("aria-level", "1");
    await expect(row("src")).toHaveAttribute("aria-posinset", "1");
    await expect(row("src")).toHaveAttribute("aria-setsize", "4");
    await expect(row("src")).toHaveAttribute("aria-expanded", "true");
    await expect(row("src/components")).toHaveAttribute("aria-level", "2");
    await expect(row("src/components")).toHaveAttribute("aria-posinset", "2");
    await expect(row("src/components")).toHaveAttribute("aria-setsize", "3");
    await expect(row("src/components")).toHaveAttribute("aria-expanded", "false");
    await expect(row("src/components/tree.ts")).toHaveAttribute("aria-level", "3");
    await expect(row("src/app")).toHaveAttribute("aria-expanded", "false");
    await expect(row("README.md").hasAttribute("aria-expanded")).toBe(false);
    await expect(row("LICENSE")).toHaveAttribute("aria-disabled", "true");
    // O rótulo nomeia a linha e fica fora da leitura solta; o badge do trailing entra como descrição.
    await expect(src.querySelector(':scope > [data-ark-chrome="label"]')).toHaveAttribute("aria-hidden", "true");
    const badge = byValue(tree, "README.md").querySelector('[slot="trailing"]') as HTMLElement;
    await expect(row("README.md")).toHaveAttribute("aria-describedby", badge.id);
    await expect(row("README.md")).toHaveAccessibleDescription("M");
    await expect(row("src").hasAttribute("aria-describedby")).toBe(false);
    // O filho continua filho do pai no DOM: nada foi movido.
    await expect(byValue(tree, "src/index.ts").parentElement).toBe(src);
    await expect(within(tree).getByRole("treeitem", { name: "components" })).toBe(row("src/components"));
    // Um tab stop só, no primeiro item.
    await expect(row("src")).toHaveAttribute("tabindex", "0");
    await expect(row("src/index.ts")).toHaveAttribute("tabindex", "-1");
    // Recolhido, o ramo some; o chevron expande.
    await expect(byValue(tree, "src/components/tree.ts")).not.toBeVisible();
    await userEvent.click(byValue(tree, "src/components").toggleElement!);
    await waitFor(() => expect(byValue(tree, "src/components/tree.ts")).toBeVisible());
    await expect(row("src/components")).toHaveAttribute("aria-expanded", "true");
  }
};

type Detail = { value: string; values?: string[]; expanded?: boolean };

/** Registra os eventos da árvore numa lista legível. */
function record(tree: ArkTree): string[] {
  const log: string[] = [];
  for (const name of ["ark-toggle", "ark-selection-change", "ark-activate"]) {
    tree.addEventListener(name, (event) => {
      const detail = (event as CustomEvent<Detail>).detail;
      if (name === "ark-toggle") log.push(`toggle ${detail.value} ${detail.expanded}`);
      if (name === "ark-activate") log.push(`activate ${detail.value}`);
      if (name === "ark-selection-change") log.push(`selection ${JSON.stringify(detail.values)}`);
    });
  }
  return log;
}

const rowOf = (tree: Element, value: string): HTMLElement => byValue(tree, value).rowElement as HTMLElement;
const focused = (): string | null =>
  (document.activeElement as Element | null)?.closest("ark-tree-item")?.getAttribute("value") ?? null;

export const KeyboardNavigation = {
  render: () => createTree({}),
  // Padrão WAI-ARIA: setas pelos itens visíveis, → expande ou entra no primeiro filho, ← recolhe ou volta ao pai,
  // Home/End, busca por digitação, * expande os irmãos, Enter ativa (um desabilitado não).
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tree = canvasElement.querySelector("ark-tree") as ArkTree;
    const log = record(tree);
    rowOf(tree, "src").focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(focused()).toBe("src/index.ts");
    // Com Alt (Alt+← volta a página), Ctrl ou Meta a seta fica com o navegador.
    await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");
    await expect(focused()).toBe("src/index.ts");
    await expect(
      rowOf(tree, "src/index.ts").dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", altKey: true, bubbles: true, cancelable: true })
      )
    ).toBe(true);
    await userEvent.keyboard("{ArrowDown}");
    await expect(focused()).toBe("src/components");
    await userEvent.keyboard("{ArrowRight}");
    await expect(byValue(tree, "src/components")).toHaveAttribute("expanded");
    await expect(focused()).toBe("src/components");
    await userEvent.keyboard("{ArrowRight}");
    await expect(focused()).toBe("src/components/button.ts");
    await userEvent.keyboard("{ArrowLeft}");
    await expect(focused()).toBe("src/components");
    await userEvent.keyboard("{ArrowLeft}");
    await expect(byValue(tree, "src/components")).not.toHaveAttribute("expanded");
    await userEvent.keyboard("{End}");
    await expect(focused()).toBe("LICENSE");
    await userEvent.keyboard("{Home}");
    await expect(focused()).toBe("src");
    // O tab stop acompanha o foco: um item só com tabindex 0.
    await expect(tree.items.filter((item) => item.rowElement?.getAttribute("tabindex") === "0").length).toBe(1);

    // Busca por digitação: "r" vai ao README.md; "d" ao docs.
    await userEvent.keyboard("r");
    await expect(focused()).toBe("README.md");
    await new Promise((resolve) => setTimeout(resolve, 600));
    await userEvent.keyboard("d");
    await expect(focused()).toBe("docs");

    // * expande os irmãos do item focado.
    await userEvent.keyboard("*");
    await expect(byValue(tree, "docs")).toHaveAttribute("expanded");
    await expect(byValue(tree, "docs/guide.md")).toBeVisible();

    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("{End}");
    await expect(focused()).toBe("LICENSE");
    await userEvent.keyboard("{Enter}");
    await expect(log).toEqual([
      "toggle src/components true",
      "toggle src/components false",
      "toggle docs true",
      "activate docs"
    ]);
  }
};

export const TabStopFollowsCollapse = {
  render: () => createTree({}),
  // Recolher o ramo com o foco num descendente leva foco e tab stop ao item recolhido; senão o Tab não acharia mais
  // a árvore.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tree = canvasElement.querySelector("ark-tree") as ArkTree;
    rowOf(tree, "src/index.ts").focus();
    await expect(rowOf(tree, "src/index.ts")).toHaveAttribute("tabindex", "0");
    await userEvent.click(byValue(tree, "src").toggleElement!);
    await expect(byValue(tree, "src")).not.toHaveAttribute("expanded");
    await expect(focused()).toBe("src");
    await expect(rowOf(tree, "src")).toHaveAttribute("tabindex", "0");
    // O tab stop num item removido volta ao primeiro visível.
    byValue(tree, "src").expanded = true;
    rowOf(tree, "README.md").focus();
    byValue(tree, "README.md").remove();
    await waitFor(() => expect(rowOf(tree, "src")).toHaveAttribute("tabindex", "0"));
  }
};

export const SingleSelection = {
  render: () => createTree({ selection: "single" }),
  // Em single o clique na linha seleciona e ativa (abrir o arquivo); Espaço seleciona; um desabilitado não; o value
  // segue a seleção e, atribuído, seleciona sem evento.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tree = canvasElement.querySelector("ark-tree") as ArkTree;
    const log = record(tree);
    await userEvent.click(within(byValue(tree, "src/index.ts")).getByText("index.ts"));
    await expect(byValue(tree, "src/index.ts")).toHaveAttribute("selected");
    await expect(rowOf(tree, "src/index.ts")).toHaveAttribute("aria-selected", "true");
    await expect(rowOf(tree, "README.md")).toHaveAttribute("aria-selected", "false");
    await expect(tree).toHaveAttribute("value", "src/index.ts");
    await userEvent.click(within(byValue(tree, "README.md")).getByText("README.md"));
    await expect(byValue(tree, "src/index.ts")).not.toHaveAttribute("selected");
    await expect(tree.value).toBe("README.md");
    await userEvent.keyboard("{ArrowUp}");
    await userEvent.keyboard(" ");
    await expect(tree.value).toBe("docs");
    await userEvent.click(within(byValue(tree, "LICENSE")).getByText("LICENSE"));
    await expect(tree.value).toBe("docs");
    await expect(log).toEqual([
      'selection ["src/index.ts"]',
      "activate src/index.ts",
      'selection ["README.md"]',
      "activate README.md",
      'selection ["docs"]'
    ]);
    tree.value = "docs/guide.md";
    await expect(byValue(tree, "docs/guide.md")).toHaveAttribute("selected");
    await expect(byValue(tree, "docs")).not.toHaveAttribute("selected");
    await expect(tree.values).toEqual(["docs/guide.md"]);
    await expect(log.length).toBe(5);
  }
};

export const MultipleSelection = {
  render: () => createTree({ selection: "multiple" }),
  // Em multiple o clique e o Espaço alternam a seleção do item; o value é a lista JSON; Enter ativa.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tree = canvasElement.querySelector("ark-tree") as ArkTree;
    const log = record(tree);
    await expect(tree).toHaveAttribute("aria-multiselectable", "true");
    await userEvent.click(within(byValue(tree, "src/index.ts")).getByText("index.ts"));
    await userEvent.click(within(byValue(tree, "README.md")).getByText("README.md"));
    await expect(JSON.parse(tree.value)).toEqual(["src/index.ts", "README.md"]);
    await userEvent.keyboard(" ");
    await expect(tree.values).toEqual(["src/index.ts"]);
    await userEvent.keyboard("{Enter}");
    await expect(log).toEqual([
      'selection ["src/index.ts"]',
      'selection ["src/index.ts","README.md"]',
      'selection ["src/index.ts"]',
      "activate README.md"
    ]);
    tree.values = ["docs", "README.md"];
    await expect(byValue(tree, "src/index.ts")).not.toHaveAttribute("selected");
    await expect(tree.values).toEqual(["docs", "README.md"]);
  }
};

export const CheckboxesAndLazy = {
  render: () => {
    const tree = createTree({ selection: "multiple", checkboxes: true, propagate: true }, [
      {
        value: "src",
        label: "src",
        expanded: true,
        children: [
          { value: "src/index.ts", label: "index.ts" },
          { value: "src/legacy.ts", label: "legacy.ts", disabled: true },
          { value: "src/app", label: "app", lazy: true }
        ]
      },
      { value: "README.md", label: "README.md" }
    ]);
    // Carga sob demanda: ao expandir o `lazy`, loading, os filhos e o fim do loading.
    tree.addEventListener("ark-toggle", (event) => {
      const { item, expanded } = (event as CustomEvent<{ item: ArkTreeItem; expanded: boolean }>).detail;
      if (!expanded || !item.lazy || item.childItems.length) return;
      item.loading = true;
      window.setTimeout(() => {
        for (const name of ["main.ts", "routes.ts"]) {
          const child = document.createElement("ark-tree-item");
          child.setAttribute("value", `src/app/${name}`);
          child.setAttribute("label", name);
          item.appendChild(child);
        }
        item.loading = false;
      }, 150);
    });
    return tree;
  },
  // Caixas com propagate: marcar o pai marca os descendentes habilitados (o desabilitado fica como está e deixa o pai
  // mixed); o value lista os marcados por inteiro; filhos que chegam depois sob um pai marcado chegam marcados.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tree = canvasElement.querySelector("ark-tree") as ArkTree;
    const log = record(tree);
    const check = (value: string): HTMLElement => byValue(tree, value).checkElement as HTMLElement;
    await expect(check("src")).toBeVisible();
    await expect(rowOf(tree, "src")).toHaveAttribute("aria-checked", "false");
    await expect(rowOf(tree, "src").hasAttribute("aria-selected")).toBe(false);

    await userEvent.click(check("src"));
    await expect(rowOf(tree, "src/index.ts")).toHaveAttribute("aria-checked", "true");
    await expect(rowOf(tree, "src/app")).toHaveAttribute("aria-checked", "true");
    await expect(rowOf(tree, "src/legacy.ts")).toHaveAttribute("aria-checked", "false");
    await expect(rowOf(tree, "src")).toHaveAttribute("aria-checked", "mixed");
    await expect(tree.values).toEqual(["src/index.ts", "src/app"]);

    // O lazy carrega com loading e os filhos chegam marcados, porque o pai está marcado.
    await userEvent.click(byValue(tree, "src/app").toggleElement!);
    await expect(rowOf(tree, "src/app")).toHaveAttribute("aria-busy", "true");
    await waitFor(() => expect(byValue(tree, "src/app/main.ts")).toBeVisible());
    await expect(rowOf(tree, "src/app")).not.toHaveAttribute("aria-busy");
    await waitFor(() => expect(rowOf(tree, "src/app/main.ts")).toHaveAttribute("aria-checked", "true"));
    await expect(rowOf(tree, "src/app")).toHaveAttribute("aria-checked", "true");

    // Desmarcar um filho deixa o pai mixed; Espaço na linha marca; o clique no rótulo ativa sem marcar.
    await userEvent.click(check("src/app/routes.ts"));
    await expect(rowOf(tree, "src/app")).toHaveAttribute("aria-checked", "mixed");
    rowOf(tree, "README.md").focus();
    await userEvent.keyboard(" ");
    await expect(rowOf(tree, "README.md")).toHaveAttribute("aria-checked", "true");
    await userEvent.click(within(byValue(tree, "src/index.ts")).getByText("index.ts"));
    await expect(rowOf(tree, "src/index.ts")).toHaveAttribute("aria-checked", "true");
    await expect(tree.values).toEqual(["src/index.ts", "src/app/main.ts", "README.md"]);
    await expect(log.filter((line) => line.startsWith("activate"))).toEqual(["activate src/index.ts"]);
    // Um desabilitado não marca.
    await userEvent.click(check("src/legacy.ts"));
    await expect(rowOf(tree, "src/legacy.ts")).toHaveAttribute("aria-checked", "false");
  }
};

export const TrailingControls = {
  // Limite conhecido da árvore plana: o botão do trailing fica ao lado do treeitem, como filho do tree, e o axe acusa
  // aria-required-children. Aqui o a11y volta a só avisar; um trailing não interativo (badge) passa limpo.
  parameters: { a11y: { test: "todo" } },
  render: () => {
    const tree = createTree({ selection: "single" }, [
      { value: "a", label: "relatorio.pdf" },
      { value: "b", label: "notas.txt" }
    ]);
    for (const item of Array.from(tree.querySelectorAll("ark-tree-item"))) {
      const button = document.createElement("button");
      button.type = "button";
      button.slot = "trailing";
      button.textContent = "Excluir";
      button.setAttribute("aria-label", `Excluir ${item.getAttribute("label")}`);
      item.appendChild(button);
    }
    return tree;
  },
  // Um botão no slot trailing fica com o próprio clique e teclado: não seleciona, não ativa, não busca.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tree = canvasElement.querySelector("ark-tree") as ArkTree;
    const log = record(tree);
    const button = within(tree).getByRole("button", { name: "Excluir relatorio.pdf" });
    await userEvent.click(button);
    await expect(log).toEqual([]);
    button.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("n");
    await expect(log).toEqual([]);
    await expect(document.activeElement).toBe(button);
    await expect(tree.value).toBe("");
  }
};

export const Sizes = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-wrap gap-6";
    for (const size of ["xs", "sm", "md", "lg", "xl"] as ArkSize[])
      wrap.appendChild(createTree({ size, selection: "single" }));
    return wrap;
  }
};

export const TestHooks = {
  render: () => createTree({ testid: "files", selection: "multiple", checkboxes: true }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tree = canvasElement.querySelector("ark-tree") as ArkTree;
    await expect(tree).toHaveAttribute("data-ark", "tree");
    await expect(tree).toHaveAttribute("data-testid", "files");
    const item = byValue(tree, "src");
    item.setAttribute("testid", "folder-src");
    await expect(item).toHaveAttribute("data-ark", "tree-item");
    await expect(item).toHaveAttribute("data-testid", "folder-src");
    for (const part of ["row", "toggle", "check", "label"]) {
      const node = item.querySelector(`:scope > [data-ark="tree-item-${part}"]`);
      await expect(node).toHaveAttribute("data-testid", `folder-src-${part}`);
    }
  }
};
