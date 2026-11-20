import { resolveLocale } from "@tooark/core";
import { resolveWysiwygLabels } from "@tooark/wysiwyg";
import { expect, waitFor } from "storybook/test";

const meta = {
  title: "Core/I18n",
  parameters: {
    docs: {
      description: {
        component:
          "Idioma das strings dos componentes. `lang` aceita `en`, `pt`, `es` e `custom` (com `locale-json`), e também a tag com região que o app já tem (`pt-BR`, `es-419`, `en-US`, com hífen ou sublinhado, em qualquer caixa): a tabela é a do idioma base. Um idioma sem tabela cai no inglês. Vale para os elementos de `@tooark/web-components` e para os do `@tooark/wysiwyg`."
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
