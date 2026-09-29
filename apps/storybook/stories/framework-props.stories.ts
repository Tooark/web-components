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
  "ark-tooltip",
  // Pacotes laterais: usados como tag crua nos frameworks, sem wrapper, então a regra vale igual.
  "ark-chart",
  "ark-code-editor",
  "ark-wysiwyg-editor",
  "ark-wysiwyg-viewer"
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
    if (el.getAttribute(attr) === sample) continue;
    // Um setter pode normalizar a string (o `fold="true"` do ark-code-editor para o "" recebido): vale se o getter
    // lê o mesmo que leria do atributo gravado direto.
    const viaAttribute = document.createElement(tag) as HTMLElement & Record<string, unknown>;
    viaAttribute.setAttribute(attr, sample);
    if (JSON.stringify(el[attr]) !== JSON.stringify(viaAttribute[attr])) {
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

// Overlay que já nasce aberto: o ark-open precisa chegar a quem se inscreve logo depois de inserir o nó (o
// layout effect dos wrappers React, a view dos wrappers Angular, inclusive na hidratação de SSR), e não sair antes
// de alguém escutar.
export const OpenOnConnectReachesLateListeners = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    for (const tag of ["ark-dialog", "ark-drawer", "ark-command-palette"]) {
      const el = document.createElement(tag) as HTMLElement & { close: () => void };
      el.setAttribute("label", "Painel");
      el.setAttribute("open", "");
      let opened = 0;
      canvasElement.appendChild(el);
      el.addEventListener("ark-open", () => opened++);
      await Promise.resolve();
      await expect({ tag, opened }).toEqual({ tag, opened: 1 });
      el.remove();
    }
  }
};

// Propriedade gravada antes de registerTooark*(): vira propriedade própria do nó e, sem tratamento, esconderia o
// setter da classe depois do upgrade. Um documento sem janela não faz upgrade, então o nó criado nele se comporta
// como uma tag ainda não registrada até ser adotado pela página.
export const PropertiesSetBeforeRegistration = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const detached = document.implementation.createHTMLDocument("");
    const cases: Array<{ tag: string; prop: string; value: unknown; read: (el: HTMLElement) => unknown }> = [
      {
        tag: "ark-chart",
        prop: "option",
        value: { xAxis: { type: "category", data: ["a"] }, yAxis: {}, series: [{ type: "bar", data: [1] }] },
        read: (el) => el.querySelector('[part="canvas"]') !== null
      },
      {
        tag: "ark-code-editor",
        prop: "value",
        value: '{"a":1}',
        read: (el) => (el as HTMLElement & { value: string }).value
      },
      {
        tag: "ark-wysiwyg-editor",
        prop: "colors",
        value: ["#ff0000"],
        read: (el) => el.getAttribute("colors")
      },
      {
        tag: "ark-wysiwyg-viewer",
        prop: "content",
        value: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Olá" }] }] },
        read: (el) => el.textContent?.includes("Olá")
      }
    ];
    const expected: Record<string, unknown> = {
      "ark-chart": true,
      "ark-code-editor": '{"a":1}',
      "ark-wysiwyg-editor": '["#ff0000"]',
      "ark-wysiwyg-viewer": true
    };

    for (const { tag, prop, value, read } of cases) {
      const el = detached.createElement(tag) as HTMLElement & Record<string, unknown>;
      await expect(el instanceof (customElements.get(tag) as CustomElementConstructor)).toBe(false);
      el[prop] = value;
      canvasElement.appendChild(document.adoptNode(el));
      await expect({ tag, value: read(el) }).toEqual({ tag, value: expected[tag] });
      // Depois do upgrade o setter é o da classe, não uma propriedade própria do nó.
      await expect({ tag, own: Object.getOwnPropertyDescriptor(el, prop) !== undefined }).toEqual({ tag, own: false });
      el.remove();
    }
  }
};

// Valor distinto do padrão para as propriedades de dados que um framework liga na tag crua; as demais recebem o próprio
// padrão, o que já basta para provar que passaram pelo setter (a propriedade própria some).
const PRE_REGISTRATION_SAMPLES: Record<string, unknown> = {
  "ark-kv-editor.rows": [{ id: "r1", key: "host", value: "{{baseUrl}}", enabled: true }],
  "ark-select.options": [
    { value: "a", label: "A" },
    { value: "b", label: "B" }
  ],
  "ark-select.value": "b",
  "ark-calendar.events": [{ id: "e1", title: "Reunião", start: "2026-09-15" }],
  "ark-scheduler.events": [{ id: "e1", title: "Reunião", start: "2026-09-15T10:00", end: "2026-09-15T11:00" }],
  "ark-color-swatches.colors": [{ name: "Azul", value: "#2563eb" }],
  "ark-color-swatches.value": "#2563eb",
  "ark-input.value": "abc",
  "ark-textarea.value": "abc",
  "ark-checkbox.checked": true,
  "ark-switch.checked": true,
  "ark-toggle.pressed": true,
  "ark-progress.value": 40,
  "ark-split-pane.sizes": [30, 70],
  "ark-shape-picker.shapes": ["moon", "cross"],
  "ark-shape-picker.value": "moon"
};

// Os setters da classe (e das que ela estende), até o HTMLElement.
function setterNames(ctor: CustomElementConstructor): string[] {
  const names: string[] = [];
  for (let proto = ctor.prototype; proto && proto !== HTMLElement.prototype; proto = Object.getPrototypeOf(proto)) {
    for (const [name, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(proto))) {
      if (descriptor.set && !names.includes(name)) names.push(name);
    }
  }
  return names;
}

// Toda propriedade com setter, gravada na tag ainda sem registro, tem de chegar ao elemento como chegaria gravada num
// elemento já registrado (o caminho do React 19 e do Vue): o upgrade tira a propriedade própria e passa pelo setter.
export const EveryPropertySetBeforeRegistration = {
  render: () => document.createElement("div"),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const detached = document.implementation.createHTMLDocument("");
    const problems: string[] = [];

    for (const tag of TAGS) {
      const ctor = customElements.get(tag) as CustomElementConstructor;
      const fresh = document.createElement(tag) as HTMLElement & Record<string, unknown>;
      const values = setterNames(ctor).map((prop) => [prop, PRE_REGISTRATION_SAMPLES[`${tag}.${prop}`] ?? fresh[prop]]);

      const early = detached.createElement(tag) as HTMLElement & Record<string, unknown>;
      const registered = document.createElement(tag) as HTMLElement & Record<string, unknown>;
      for (const [prop, value] of values) {
        early[prop as string] = value;
        registered[prop as string] = value;
      }
      canvasElement.append(document.adoptNode(early), registered);

      for (const [prop] of values) {
        const name = prop as string;
        if (Object.getOwnPropertyDescriptor(early, name)) problems.push(`${tag}.${name}: ficou propriedade própria`);
        else if (JSON.stringify(early[name]) !== JSON.stringify(registered[name])) {
          problems.push(`${tag}.${name}: ${JSON.stringify(early[name])} != ${JSON.stringify(registered[name])}`);
        }
      }
      early.remove();
      registered.remove();
    }
    await expect(problems).toEqual([]);
  }
};
