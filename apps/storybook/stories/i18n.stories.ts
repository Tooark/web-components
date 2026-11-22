import { type ArkLocaleSetting, getArkLocale, observeArkLocale, resolveLocale, setArkLocale } from "@tooark/core";
import * as components from "@tooark/web-components";
import { resolveWysiwygLabels } from "@tooark/wysiwyg";
import { expect, waitFor } from "storybook/test";

const meta = {
  title: "Core/I18n",
  parameters: {
    docs: {
      description: {
        component:
          "Idioma das strings dos componentes. `lang` aceita `en`, `pt`, `es` e `custom` (com `locale-json`), e também a tag com região que o app já tem (`pt-BR`, `es-419`, `en-US`, com hífen ou sublinhado, em qualquer caixa): a tabela é a do idioma base. Um idioma sem tabela cai no inglês. Vale para os elementos de `@tooark/web-components` e para os do `@tooark/wysiwyg`.\n\n`setArkLocale(lang, localeJson?)` (core, reexportado pelos wrappers) define o idioma de todo componente sem `lang` próprio, e os já montados se redesenham; o `lang` do componente continua valendo sobre ele, `setArkLocale(null)` volta ao inglês e o `lang` do `<html>` nunca é lido. Sem a chamada nada muda."
      }
    }
  }
};

export default meta;

export const RegionTags = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "grid";
    wrap.style.gap = "16px";

    for (const lang of ["pt-BR", "es-419", "en-US"]) {
      const pagination = document.createElement("ark-pagination");
      pagination.setAttribute("lang", lang);
      pagination.setAttribute("total", "120");
      pagination.setAttribute("page", "2");
      pagination.dataset.lang = lang;
      wrap.appendChild(pagination);
    }

    const editor = document.createElement("ark-wysiwyg-editor");
    editor.setAttribute("lang", "pt-BR");
    editor.setAttribute("toolbar", "marks");
    editor.setAttribute("aria-label", "Texto");
    wrap.appendChild(editor);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    // A tabela é a do idioma base, com hífen ou sublinhado, em qualquer caixa.
    await expect(resolveLocale("pt-BR").close).toBe("Fechar");
    await expect(resolveLocale("pt_br").close).toBe("Fechar");
    await expect(resolveLocale("PT").close).toBe("Fechar");
    await expect(resolveLocale("es-419").close).toBe("Cerrar");
    await expect(resolveLocale("en-US").close).toBe("Close");
    // Sem tabela para o idioma, ou sem idioma, fica o inglês; um nome de membro do Object também.
    await expect(resolveLocale("fr-FR").close).toBe("Close");
    await expect(resolveLocale(undefined).close).toBe("Close");
    await expect(resolveLocale("").close).toBe("Close");
    await expect(resolveLocale("constructor").close).toBe("Close");
    // custom continua mesclando o JSON sobre o inglês.
    await expect(resolveLocale("custom", { close: "Sair" }).close).toBe("Sair");
    await expect(resolveLocale("custom", { close: "Sair" }).copy).toBe("Copy");

    await expect(resolveWysiwygLabels("pt-BR").bold).toBe("Negrito");
    await expect(resolveWysiwygLabels("es_MX").bold).toBe("Negrita");
    await expect(resolveWysiwygLabels("de").bold).toBe("Bold");
    await expect(resolveWysiwygLabels("pt-BR", { bold: "N" }).bold).toBe("N");

    const previous = (lang: string) =>
      canvasElement.querySelector(`ark-pagination[data-lang="${lang}"] [data-ark="pagination-previous"]`);
    await expect(previous("pt-BR")).toHaveAttribute("aria-label", "Página anterior");
    await expect(previous("es-419")).toHaveAttribute("aria-label", resolveLocale("es").previousPage);
    await expect(previous("en-US")).toHaveAttribute("aria-label", "Previous page");

    await waitFor(() =>
      expect(canvasElement.querySelector('ark-wysiwyg-editor button[aria-label="Negrito"]')).not.toBeNull()
    );
  }
};

/** Atributos e filhos que fazem cada elemento mostrar strings do idioma (sem eles alguns não mostram nenhuma). */
const SETUP: Record<string, { attrs?: Record<string, string>; children?: () => Node[] }> = {
  "ark-alert": { attrs: { dismissible: "", heading: "Aviso" } },
  "ark-datepicker": { attrs: { input: "", value: "2026-09-15" } },
  "ark-dialog": { attrs: { label: "Título" } },
  "ark-drawer": { attrs: { label: "Título" } },
  "ark-input": { attrs: { type: "password", reveal: "", label: "Senha" } },
  "ark-nav": { attrs: { collapsible: "rail" } },
  "ark-pagination": { attrs: { total: "50", page: "2" } },
  "ark-scheduler": { attrs: { date: "2026-09-15" } },
  "ark-calendar": { attrs: { value: "2026-09-15" } },
  "ark-split-pane": { children: () => [document.createElement("div"), document.createElement("div")] },
  "ark-tab": { attrs: { closable: "", dirty: "", value: "a" } },
  "ark-time": { attrs: { datetime: new Date(Date.now() - 2 * 3600000).toISOString() } },
  "ark-tabs": {
    attrs: { variant: "editor" },
    children: () => {
      const tab = document.createElement("ark-tab");
      tab.setAttribute("value", "a");
      tab.setAttribute("closable", "");
      tab.textContent = "a.json";
      return [tab];
    }
  }
};

/** Textos que o usuário ou um leitor de tela recebem; ids gerados e o próprio `lang` ficam de fora. */
function signature(root: Element): string {
  const parts = [root.textContent?.replace(/\s+/g, " ").trim() ?? ""];
  for (const el of [root, ...Array.from(root.querySelectorAll("*"))]) {
    for (const name of ["aria-label", "placeholder", "title", "aria-roledescription", "aria-valuetext"]) {
      const value = el.getAttribute(name);
      if (value) parts.push(`${name}=${value}`);
    }
  }
  return parts.join(" | ");
}

/** Toda tag de `@tooark/web-components` que observa `lang`: a lista sai do pacote, não de uma cópia à mão. */
function langTags(): string[] {
  return Object.values(components)
    .filter(
      (value): value is typeof HTMLElement & { tagName: string; observedAttributes: string[] } =>
        typeof value === "function" &&
        typeof (value as { tagName?: unknown }).tagName === "string" &&
        Array.isArray((value as { observedAttributes?: unknown }).observedAttributes) &&
        (value as { observedAttributes: string[] }).observedAttributes.includes("lang")
    )
    .map((value) => value.tagName)
    .sort();
}

function createWithSetup(tag: string, lang: string | null): HTMLElement {
  const el = document.createElement(tag);
  for (const [name, value] of Object.entries(SETUP[tag]?.attrs ?? {})) el.setAttribute(name, value);
  if (lang) el.setAttribute("lang", lang);
  for (const child of SETUP[tag]?.children?.() ?? []) el.appendChild(child);
  return el;
}

function addToast(toaster: Element): void {
  (toaster as HTMLElement & { toast(options: { title: string; duration: number }): string }).toast({
    title: "Salvo",
    duration: 600000
  });
}

export const DefaultLocale = {
  parameters: {
    docs: {
      description: {
        story:
          '`setArkLocale("pt")` muda as strings de todo componente sem `lang`, já montado ou não, para as mesmas de `lang="pt"`; `setArkLocale(null)` devolve o inglês. A story percorre cada tag que observa `lang`.'
      }
    }
  },
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "grid";
    wrap.style.gap = "12px";
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const tags = langTags();
    // As 21 tags com strings; uma nova que observe `lang` entra aqui sozinha.
    await expect(tags.length).toBeGreaterThanOrEqual(21);
    const problems: string[] = [];
    // Erro lançado num callback do elemento (redesenho na troca ou na volta ao DOM) não chega ao try: vem por aqui.
    const onError = (event: ErrorEvent): void => {
      problems.push(`erro: ${event.message}`);
    };
    window.addEventListener("error", onError);
    try {
      for (const tag of tags) {
        const follower = createWithSetup(tag, null);
        const own = createWithSetup(tag, "pt");
        canvasElement.append(follower, own);
        if (tag === "ark-toaster") {
          follower.setAttribute("close-button", "");
          own.setAttribute("close-button", "");
          addToast(follower);
          addToast(own);
        }
        const english = signature(follower);
        setArkLocale("pt");
        const following = signature(follower);
        if (following !== signature(own)) problems.push(`${tag}: com setArkLocale("pt") difere de lang="pt"`);
        if (following === english) problems.push(`${tag}: nenhuma string mudou`);
        setArkLocale(null);
        if (signature(follower) !== english) problems.push(`${tag}: setArkLocale(null) não devolveu o inglês`);

        // Fora do DOM durante a troca (KeepAlive, nó movido): ao voltar redesenha com o idioma novo, antes de o
        // connectedCallback recriar os próprios observers, sem erro.
        follower.remove();
        setArkLocale("pt");
        try {
          canvasElement.insertBefore(follower, own);
          if (signature(follower) !== signature(own)) problems.push(`${tag}: voltou ao DOM sem o idioma novo`);
        } catch (error) {
          problems.push(`${tag}: erro ao voltar ao DOM (${String(error)})`);
        }
        setArkLocale(null);
        follower.remove();
        own.remove();
      }
    } finally {
      setArkLocale(null);
      window.removeEventListener("error", onError);
    }
    await expect(problems).toEqual([]);
  }
};

export const DefaultLocaleRules = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "grid";
    wrap.style.gap = "12px";
    const plain = document.createElement("ark-spinner");
    plain.dataset.role = "plain";
    const spanish = document.createElement("ark-spinner");
    spanish.setAttribute("lang", "es");
    spanish.dataset.role = "spanish";
    const picker = document.createElement("ark-datepicker");
    picker.setAttribute("input", "");
    picker.setAttribute("mode", "date");
    const editor = document.createElement("ark-wysiwyg-editor");
    editor.setAttribute("toolbar", "marks");
    editor.setAttribute("aria-label", "Texto");
    const own = document.createElement("ark-wysiwyg-editor");
    own.setAttribute("toolbar", "marks");
    own.setAttribute("aria-label", "Notas");
    own.setAttribute("locale-json", '{"bold":"N"}');
    wrap.append(plain, spanish, picker, editor, own);
    return wrap;
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const spinner = (role: string): HTMLElement =>
      canvasElement.querySelector(`ark-spinner[data-role="${role}"]`) as HTMLElement;
    const label = (role: string): string | null => spinner(role)?.getAttribute("aria-label") ?? null;
    const [editor, own] = Array.from(canvasElement.querySelectorAll("ark-wysiwyg-editor"));
    const button = (host: Element, name: string): Element | null => host.querySelector(`button[aria-label="${name}"]`);
    const field = canvasElement.querySelector("ark-datepicker ark-input") as HTMLElement;
    const seen: ArkLocaleSetting[] = [];
    const stop = observeArkLocale((setting) => seen.push(setting));

    try {
      await expect(getArkLocale()).toEqual({ lang: "en" });
      await waitFor(() => expect(button(editor, "Bold")).not.toBeNull());
      await expect(label("plain")).toBe("Loading");
      await expect(field).toHaveAttribute("placeholder", "mm/dd/yyyy");

      // A tag fica como foi dada (`pt-BR`, para quem formata com Intl); as tabelas usam o idioma base.
      setArkLocale("pt-BR");
      await expect(getArkLocale()).toEqual({ lang: "pt-BR" });
      await expect(seen).toEqual([{ lang: "pt-BR" }]);
      await expect(resolveLocale(undefined).loading).toBe(resolveLocale("pt").loading);
      await expect(label("plain")).toBe(resolveLocale("pt").loading);
      // O `lang` próprio vence o padrão.
      await expect(label("spanish")).toBe(resolveLocale("es").loading);
      await expect(field).toHaveAttribute("placeholder", "dd/mm/yyyy");
      // O wysiwyg (que não depende do core) segue o mesmo padrão; o locale-json do elemento fica por cima.
      await waitFor(() => expect(button(editor, "Negrito")).not.toBeNull());
      await waitFor(() => expect(button(own, "N")).not.toBeNull());
      await expect(button(own, "Itálico")).not.toBeNull();

      // A mesma chamada de novo não avisa ninguém.
      setArkLocale("pt-BR");
      await expect(seen.length).toBe(1);

      // Fora do DOM durante a troca: redesenha ao voltar.
      const plain = canvasElement.querySelector('ark-spinner[data-role="plain"]') as HTMLElement;
      const parent = plain.parentElement as HTMLElement;
      plain.remove();
      setArkLocale("es");
      await expect(label("plain")).toBeNull();
      parent.prepend(plain);
      await expect(label("plain")).toBe(resolveLocale("es").loading);

      // custom com as strings do app; trocar só as strings também redesenha.
      setArkLocale("custom", { loading: "Aguarde" });
      await expect(label("plain")).toBe("Aguarde");
      setArkLocale("custom", '{"loading":"Espere"}');
      await expect(label("plain")).toBe("Espere");
      await expect(label("spanish")).toBe(resolveLocale("es").loading);
      // JSON inválido falha na chamada, sem mudar o padrão.
      await expect(() => setArkLocale("custom", "{nope")).toThrow();
      await expect(() => setArkLocale("custom", "[1]")).toThrow(TypeError);
      await expect(getArkLocale()).toEqual({ lang: "custom", localeJson: { loading: "Espere" } });

      setArkLocale(null);
      await expect(getArkLocale()).toEqual({ lang: "en" });
      await expect(label("plain")).toBe("Loading");
      await expect(field).toHaveAttribute("placeholder", "mm/dd/yyyy");
      await waitFor(() => expect(button(editor, "Bold")).not.toBeNull());

      // Depois de parar de observar, nada mais chega.
      const before = seen.length;
      stop();
      setArkLocale("pt");
      await expect(seen.length).toBe(before);
    } finally {
      stop();
      setArkLocale(null);
    }
  }
};
