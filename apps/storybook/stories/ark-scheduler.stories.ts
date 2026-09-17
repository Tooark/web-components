import type { ArkIntent, ArkSchedulerEvent, ArkSchedulerView, ArkTheme } from "@tooark/core";
import { expect, userEvent } from "storybook/test";

const meta = {
  title: "Core/ArkScheduler",
  parameters: {
    docs: {
      description: {
        component:
          "Agenda com quatro views: `week` e `day` desenham a timeline por horario (eventos posicionados pelo horario, sobreposicoes resolvidas em colunas lado a lado e marcador da hora atual), `month` mostra o grid de celulas e `agenda` a lista cronologica. Os eventos vem do atributo `events` (JSON) ou da propriedade JS `events`. Emite `ark-event-click`, `ark-slot-click`, `ark-view-change` e `ark-range-change`."
      }
    }
  },
  argTypes: {
    view: {
      control: "inline-radio",
      options: ["day", "week", "month", "agenda"],
      description: "View ativa; sincronizada ao clicar no seletor do cabecalho"
    },
    date: { control: "text", description: "Data de referencia (YYYY-MM-DD); vazio usa hoje. Muda ao navegar" },
    views: {
      control: "text",
      description: 'Limita as views do seletor, separadas por virgula (ex.: "day,week"). Vazio mostra as quatro'
    },
    lang: {
      control: "select",
      options: ["en", "pt", "es", "custom"],
      description: "Locale embutido ou 'custom' para usar o locale-json"
    },
    localeJson: {
      control: "text",
      description: "JSON com sobrescritas parciais do locale (usado quando lang='custom')"
    },
    theme: { control: "select", options: ["auto", "light", "dark"] },
    intent: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"],
      description: "Cor padrao dos eventos sem color/intent proprios"
    },
    hourStart: { control: { type: "number", min: 0, max: 23 }, description: "Primeira hora da timeline (0 a 23)" },
    hourEnd: {
      control: { type: "number", min: 1, max: 24 },
      description: "Ultima hora da timeline (sempre maior que hourStart)"
    },
    slotMinutes: {
      control: "inline-radio",
      options: [15, 30, 60],
      description: "Granularidade dos slots clicaveis (15 a 60)"
    },
    hoursFormat: { control: "inline-radio", options: ["24", "12"], description: "12 exibe as horas com AM/PM" },
    testid: { control: "text", description: "Propaga data-testid para a agenda e suas partes" }
  },
  args: {
    view: "week",
    date: "",
    views: "",
    lang: "pt",
    localeJson: "",
    theme: "auto",
    intent: "primary",
    hourStart: 7,
    hourEnd: 20,
    slotMinutes: 30,
    hoursFormat: "24",
    testid: ""
  }
};

export default meta;

type StoryArgs = {
  view: ArkSchedulerView;
  date: string;
  views: string;
  lang: string;
  localeJson: string;
  theme: ArkTheme;
  intent: ArkIntent;
  hourStart: number;
  hourEnd: number;
  slotMinutes: number;
  hoursFormat: "24" | "12";
  testid: string;
};

// Semana da data de referência fixa, para as histórias serem estáveis.
const REFERENCE = new Date();

function at(dayOffset: number, hour: number, minute = 0): string {
  const base = new Date(REFERENCE.getFullYear(), REFERENCE.getMonth(), REFERENCE.getDate() + dayOffset, hour, minute);
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}T${pad(base.getHours())}:${pad(base.getMinutes())}`;
}

function day(dayOffset: number): string {
  const base = new Date(REFERENCE.getFullYear(), REFERENCE.getMonth(), REFERENCE.getDate() + dayOffset);
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}`;
}

const SAMPLE_EVENTS: ArkSchedulerEvent[] = [
  { id: "1", title: "Daily standup", start: at(0, 9), end: at(0, 9, 15), intent: "info" },
  { id: "2", title: "Revisão de design", start: at(0, 9), end: at(0, 10, 30), intent: "success", location: "Sala 2" },
  { id: "3", title: "1:1 com a líder", start: at(0, 10), end: at(0, 11), color: "#7c3aed" },
  { id: "4", title: "Almoço", start: at(0, 12), end: at(0, 13), intent: "neutral" },
  { id: "5", title: "Deploy da release", start: at(1, 15), end: at(1, 17), intent: "danger" },
  { id: "6", title: "Planning", start: at(2, 14), end: at(2, 16), intent: "warning" },
  { id: "7", title: "Feriado", start: day(3), allDay: true, intent: "info" },
  { id: "8", title: "Retro", start: at(-1, 16), end: at(-1, 17) }
];

function createScheduler(args: Partial<StoryArgs> & { events?: ArkSchedulerEvent[] }): HTMLElement {
  const el = document.createElement("ark-scheduler");
  el.setAttribute("view", args.view || "week");
  el.setAttribute("lang", args.lang || "pt");
  if (args.theme) el.setAttribute("theme", args.theme);
  if (args.intent) el.setAttribute("intent", args.intent);
  if (args.date) el.setAttribute("date", args.date);
  if (args.views) el.setAttribute("views", args.views);
  if (args.lang === "custom" && args.localeJson) el.setAttribute("locale-json", args.localeJson);
  if (args.hourStart !== undefined) el.setAttribute("hour-start", String(args.hourStart));
  if (args.hourEnd !== undefined) el.setAttribute("hour-end", String(args.hourEnd));
  if (args.slotMinutes) el.setAttribute("slot-minutes", String(args.slotMinutes));
  if (args.hoursFormat) el.setAttribute("hours-format", args.hoursFormat);
  if (args.testid) el.setAttribute("testid", args.testid);
  el.setAttribute("events", JSON.stringify(args.events ?? SAMPLE_EVENTS));

  el.addEventListener("ark-event-click", (e) => console.log("ark-event-click", (e as CustomEvent).detail));
  el.addEventListener("ark-slot-click", (e) => console.log("ark-slot-click", (e as CustomEvent).detail));
  el.addEventListener("ark-view-change", (e) => console.log("ark-view-change", (e as CustomEvent).detail));
  el.addEventListener("ark-range-change", (e) => console.log("ark-range-change", (e as CustomEvent).detail));

  return el;
}

export const Playground = {
  render: (args: StoryArgs) => createScheduler(args)
};

export const WeekView = {
  args: { view: "week", hourStart: 7, hourEnd: 20 },
  render: Playground.render
};

export const DayView = {
  args: { view: "day", hourStart: 7, hourEnd: 20 },
  render: Playground.render
};

export const MonthView = {
  args: { view: "month" },
  render: Playground.render
};

export const AgendaView = {
  args: { view: "agenda" },
  render: Playground.render
};

export const LimitedViews = {
  args: { view: "day", views: "day,week", hourStart: 8, hourEnd: 18 },
  render: Playground.render
};

export const TwelveHours = {
  args: { view: "day", lang: "en", hoursFormat: "12", hourStart: 8, hourEnd: 18 },
  render: Playground.render
};

export const DarkTheme = {
  args: { view: "week", theme: "dark", hourStart: 8, hourEnd: 18 },
  render: (args: StoryArgs) => {
    const wrap = document.createElement("div");
    wrap.style.padding = "16px";
    wrap.style.background = "#0f172a";
    wrap.appendChild(createScheduler({ ...args, theme: "dark" }));
    return wrap;
  }
};

export const EmptyAgenda = {
  args: { view: "agenda" },
  render: (args: StoryArgs) => createScheduler({ ...args, events: [] })
};

export const OverlappingEvents = {
  args: { view: "day", hourStart: 8, hourEnd: 14 },
  render: Playground.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    // Três eventos se cruzam entre 9h e 11h: devem dividir a largura em colunas
    // distintas, enquanto o almoço (sem conflito) segue ocupando a coluna inteira.
    const column = canvasElement.querySelector<HTMLElement>('[data-ark="scheduler-day"]')!;
    // O holder posicionado é o pai direto de cada botão de evento (hook estável,
    // independente das classes utilitárias).
    const holders = Array.from(column.querySelectorAll<HTMLElement>('[data-ark="scheduler-event"]')).map(
      (el) => el.parentElement as HTMLElement
    );

    const shared = holders.filter((el) => el.style.width !== "100%");
    await expect(shared.length).toBeGreaterThanOrEqual(2);

    // Cada evento do cluster fica numa coluna própria (offsets diferentes).
    const offsets = new Set(shared.map((el) => el.style.left));
    await expect(offsets.size).toBeGreaterThanOrEqual(2);
  }
};

export const ClickingEventEmits = {
  args: { view: "day", hourStart: 8, hourEnd: 14 },
  render: Playground.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scheduler = canvasElement.querySelector("ark-scheduler")!;
    const received: Array<{ id: string | null }> = [];
    scheduler.addEventListener("ark-event-click", (event) => {
      received.push((event as CustomEvent).detail);
    });

    const event = canvasElement.querySelector<HTMLButtonElement>('[data-event-id="2"]')!;
    await userEvent.click(event);

    await expect(received).toHaveLength(1);
    await expect(received[0].id).toBe("2");
  }
};

export const HeaderAlignsWithGrid = {
  args: { view: "week", hourStart: 0, hourEnd: 24 },
  render: Playground.render,
  // A barra de rolagem do corpo nao pode encolher so as colunas de baixo: cabecalho e grade dividem o scroller.
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scroller = canvasElement.querySelector<HTMLElement>('[data-ark="scheduler-scroller"]')!;
    await expect(scroller.scrollHeight).toBeGreaterThan(scroller.clientHeight);

    const headerColumns = Array.from(
      canvasElement.querySelectorAll<HTMLElement>('[data-ark="scheduler-days"] > :not(:first-child)')
    );
    const dayColumns = Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-ark="scheduler-day"]'));
    await expect(headerColumns).toHaveLength(7);
    await expect(dayColumns).toHaveLength(7);

    headerColumns.forEach((header, index) => {
      const top = header.getBoundingClientRect();
      const grid = dayColumns[index].getBoundingClientRect();
      expect(Math.abs(top.left - grid.left)).toBeLessThan(1);
      expect(Math.abs(top.width - grid.width)).toBeLessThan(1);
    });
  }
};

export const SwitchingViews = {
  args: { view: "week" },
  render: Playground.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scheduler = canvasElement.querySelector("ark-scheduler")!;
    // O ark-toggle é o próprio controle; o scheduler o marca como parte sua.
    const monthToggle = canvasElement.querySelector<HTMLElement>('[data-ark="scheduler-view-month"]')!;

    await userEvent.click(monthToggle);

    await expect(scheduler).toHaveAttribute("view", "month");
    // A view de mês renderiza o grid de células, não a timeline.
    await expect(canvasElement.querySelector('[data-ark="scheduler-grid"]')).not.toBeNull();
  }
};

export const NavigatingPeriod = {
  args: { view: "day" },
  render: Playground.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scheduler = canvasElement.querySelector("ark-scheduler") as HTMLElement & { date: string };
    const initial = scheduler.date;

    await userEvent.click(canvasElement.querySelector<HTMLButtonElement>('[data-ark="scheduler-next"]')!);
    await expect(scheduler.date).not.toBe(initial);

    // Ida e volta retorna exatamente ao mesmo período.
    await userEvent.click(canvasElement.querySelector<HTMLButtonElement>('[data-ark="scheduler-prev"]')!);
    await expect(scheduler.date).toBe(initial);
  }
};

export const ClickingSlotEmits = {
  args: { view: "day", hourStart: 9, hourEnd: 12, slotMinutes: 60 },
  render: Playground.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const scheduler = canvasElement.querySelector("ark-scheduler")!;
    const received: Array<{ start: string }> = [];
    scheduler.addEventListener("ark-slot-click", (event) => {
      received.push((event as CustomEvent).detail);
    });

    const slot = canvasElement.querySelector<HTMLElement>('[data-ark="scheduler-slot"]')!;
    await userEvent.click(slot);

    await expect(received).toHaveLength(1);
    await expect(received[0].start).toMatch(/T09:00$/);
  }
};
