import { expect } from "storybook/test";

// React 19 e Vue gravam uma prop como propriedade quando o elemento já registrado a expõe (`key in el`) e só caem no
// atributo quando ela não existe. Os wrappers passam a string que iriam pôr no atributo (JSON para listas, "" para
// booleanos), então toda propriedade com o nome de um atributo observado precisa aceitar essa string como o
// setAttribute aceitaria: sem setter a atribuição lança TypeError (React, módulo strict) ou é descartada (Vue).
const meta = {
  title: "Integration/Framework Props",
  parameters: { a11y: { disable: true } }
};

export default meta;

const TAGS = [
  "ark-alert",
  "ark-avatar",
  "ark-badge",
  "ark-button",
  "ark-calendar",
  "ark-card",
  "ark-carousel",
  "ark-checkbox",
  "ark-clock",
  "ark-color-swatches",
  "ark-command-item",
  "ark-command-palette",
  "ark-copy-button",
  "ark-datepicker",
  "ark-dialog",
  "ark-drawer",
  "ark-empty",
  "ark-file-input",
  "ark-input",
  "ark-kbd",
  "ark-kv-editor",
  "ark-mark",
  "ark-menu",
  "ark-menu-item",
  "ark-progress",
  "ark-radio",
  "ark-scheduler",
  "ark-select",
  "ark-shape-picker",
  "ark-skeleton",
  "ark-spinner",
  "ark-split-pane",
  "ark-status-dot",
  "ark-switch",
  "ark-tab",
  "ark-tabs",
  "ark-textarea",
  "ark-toaster",
  "ark-toggle",
  "ark-toggle-group",
  "ark-tooltip"
];

// Um valor válido por atributo, no formato em que o wrapper o entrega; o resto usa FALLBACK.
const SAMPLES: Record<string, string> = {
  type: "submit",
  status: "success",
  rows: "3",
  side: "left",
  mode: "date",
  date: "2026-09-15",
  events: '[{"id":"e1","title":"Reunião","start":"2026-09-15T10:00","end":"2026-09-15T11:00"}]',
  colors: '[{"name":"Azul","value":"#2563eb"}]',
  sizes: "30,70",
  options: '[{"value":"a","label":"A"}]',
  value: "10:30",
  group: "Arquivo",
  label: "Rótulo"
};
const FALLBACK = "1";

type Mismatch = { tag: string; attr: string; problem: string };

function probe(tag: string): Mismatch[] {
  const ctor = customElements.get(tag) as (CustomElementConstructor & { observedAttributes?: string[] }) | undefined;
  if (!ctor) return [{ tag, attr: "-", problem: "não registrado" }];
  const mismatches: Mismatch[] = [];

  for (const attr of ctor.observedAttributes ?? []) {
    // Atributos com hífen nunca colidem com uma propriedade; os nativos (lang, title, hidden...) refletem sozinhos.
    if (attr.includes("-") || attr in HTMLElement.prototype) continue;
    const el = document.createElement(tag) as HTMLElement & Record<string, unknown>;
    if (!(attr in el)) continue;

    // Booleanos: o wrapper entrega "" para presente, e o setter (coerceBooleanAttr) precisa ligar o atributo.
    const sample = typeof el[attr] === "boolean" ? "" : (SAMPLES[attr] ?? FALLBACK);
    try {
      el[attr] = sample;
    } catch (error) {
      mismatches.push({ tag, attr, problem: `lança ${(error as Error).name}` });
      continue;
    }
    if (el.getAttribute(attr) !== sample) {
      mismatches.push({ tag, attr, problem: `atributo ficou ${JSON.stringify(el.getAttribute(attr))}` });
    }
  }
  return mismatches;
}

export const PropertyAssignmentMatchesAttribute = {
  render: () => {
    const note = document.createElement("p");
    note.textContent = "Grava cada atributo observado pela propriedade homônima, como React 19 e Vue fazem.";
    return note;
  },
  play: async () => {
    const mismatches = TAGS.flatMap(probe);
    await expect(mismatches.map((m) => `${m.tag}.${m.attr}: ${m.problem}`)).toEqual([]);
  }
};
