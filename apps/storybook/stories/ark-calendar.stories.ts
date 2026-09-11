import type { ArkCalendarStyleOptions, ArkDatepickerLang } from "@tooark/core";
import { expect, userEvent } from "storybook/test";

const meta = {
  title: "Core/ArkCalendar",
  parameters: {
    docs: {
      description: {
        component:
          "Grid de mes inline no estilo DateCalendar do MUI. O titulo alterna dias → meses → anos, a navegacao por teclado segue o padrao WAI-ARIA (setas, Home/End no mes, PageUp/PageDown troca de mes) e `value` e sempre interpretado no fuso local. Aceita eventos por dia (atributo `events` em JSON ou propriedade JS `events`) exibidos como `dots`, `count` ou `list`. Emite `ark-change` com `detail: { value, date, events }`."
      }
    }
  },
  argTypes: {
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
    intent: { control: "select", options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"] },
    accentColor: {
      control: "color",
      description: "Cor custom dos estados selecionado/hoje (tem precedencia sobre intent)"
    },
    value: { control: "text", description: "Selected date in YYYY-MM-DD format" },
    min: { control: "text", description: "Menor data selecionavel (YYYY-MM-DD)" },
    max: { control: "text", description: "Maior data selecionavel (YYYY-MM-DD)" },
    events: {
      control: "text",
      description: "JSON com os eventos: [{ date, label?, color?, intent? }]"
    },
    eventDisplay: {
      control: "inline-radio",
      options: ["dots", "count", "list"],
      description: "Como os eventos do dia sao exibidos"
    },
    testid: { control: "text", description: "Propaga data-testid para o calendario e suas partes" }
  },
  args: {
    lang: "en",
    localeJson: "",
    theme: "auto",
    intent: "primary",
    accentColor: "",
    value: "",
    min: "",
    max: "",
    events: "",
    eventDisplay: "dots",
    testid: ""
  }
};

export default meta;

type StoryArgs = {
  lang: ArkDatepickerLang;
  localeJson: string;
  theme: NonNullable<ArkCalendarStyleOptions["theme"]>;
  intent: NonNullable<ArkCalendarStyleOptions["intent"]>;
  accentColor: string;
  value: string;
  min: string;
  max: string;
  events: string;
  eventDisplay: "dots" | "count" | "list";
  testid: string;
};

function createCalendar(args: Partial<StoryArgs>): HTMLElement {
  const el = document.createElement("ark-calendar");
  el.setAttribute("lang", args.lang || "en");
  el.setAttribute("theme", args.theme || "auto");
  el.setAttribute("intent", args.intent || "primary");
  if (args.value) el.setAttribute("value", args.value);
  if (args.min) el.setAttribute("min", args.min);
  if (args.max) el.setAttribute("max", args.max);
  if (args.accentColor) el.setAttribute("accent-color", args.accentColor);
  if (args.lang === "custom" && args.localeJson) el.setAttribute("locale-json", args.localeJson);
  if (args.events) el.setAttribute("events", args.events);
  if (args.events && args.eventDisplay) el.setAttribute("event-display", args.eventDisplay);
  if (args.testid) el.setAttribute("testid", args.testid);
  return el;
}

export const Playground = {
  render: (args: StoryArgs) => createCalendar(args)
};

export const WithMinMax = {
  args: {
    lang: "pt",
    min: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString().slice(0, 10),
    max: new Date(new Date().getFullYear(), new Date().getMonth(), 25).toISOString().slice(0, 10)
  },
  render: Playground.render
};

export const DarkTheme = {
  args: { theme: "dark", intent: "info" },
  render: Playground.render
};

export const CustomLocale = {
  args: {
    lang: "custom",
    localeJson: JSON.stringify({
      months: [
        "Yanvar",
        "Fevral",
        "Mart",
        "Aprel",
        "May",
        "İyun",
        "İyul",
        "Avqust",
        "Sentyabr",
        "Oktyabr",
        "Noyabr",
        "Dekabr"
      ],
      weekdaysMin: ["B", "BE", "ÇA", "Ç", "CA", "C", "Ş"],
      today: "Bu gün",
      clear: "Təmizlə"
    })
  },
  render: Playground.render
};

export const SelectsClickedDay = {
  args: { lang: "en" },
  render: Playground.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const calendar = canvasElement.querySelector("ark-calendar")!;
    const day = canvasElement.querySelector<HTMLButtonElement>('[data-ark="calendar-day"][data-date$="-15"]')!;
    const iso = day.getAttribute("data-date")!;

    await userEvent.click(day);

    // Regressão do off-by-one de timezone: o valor deve ser EXATAMENTE o dia clicado.
    await expect(calendar).toHaveAttribute("value", iso);
    const selected = canvasElement.querySelector(`[data-date="${iso}"]`);
    await expect(selected).toHaveAttribute("aria-pressed", "true");
  }
};

function sampleEvents(): string {
  const now = new Date();
  const iso = (day: number): string => {
    const d = new Date(now.getFullYear(), now.getMonth(), day);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  return JSON.stringify([
    { date: iso(5), label: "Reunião de equipe", intent: "info" },
    { date: iso(5), label: "Entrega do relatório", intent: "danger" },
    { date: iso(12), label: "Aniversário", color: "#7c3aed" },
    { date: iso(18), label: "Sprint review", intent: "success" },
    { date: iso(18), label: "Retro", intent: "warning" },
    { date: iso(18), label: "Planning", intent: "info" }
  ]);
}

export const EventsDots = {
  args: { lang: "pt", events: sampleEvents(), eventDisplay: "dots" },
  render: Playground.render
};

export const EventsCount = {
  args: { lang: "pt", events: sampleEvents(), eventDisplay: "count" },
  render: Playground.render
};

export const EventsList = {
  args: { lang: "pt", events: sampleEvents(), eventDisplay: "list" },
  render: (args: StoryArgs) => {
    const wrap = document.createElement("div");
    wrap.style.maxWidth = "640px";
    wrap.appendChild(createCalendar(args));
    return wrap;
  }
};

export const EventsRender = {
  args: EventsDots.args,
  render: Playground.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    // Dia 5 tem 2 eventos: marcadores visíveis e aria-label anunciando.
    const day = canvasElement.querySelector<HTMLButtonElement>('[data-ark="calendar-day"][data-date$="-05"]')!;
    const dots = day.querySelector('[data-ark="calendar-event"]');

    await expect(dots).not.toBeNull();
    await expect(day.getAttribute("aria-label")).toMatch(/2 eventos$/);
  }
};

export const ViewsNavigation = {
  args: { lang: "en" },
  render: Playground.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const title = canvasElement.querySelector<HTMLButtonElement>('[data-ark="calendar-title"]')!;

    // dias → meses
    await userEvent.click(title);
    const month = canvasElement.querySelector<HTMLButtonElement>('[data-ark="calendar-month"][data-month="0"]');
    await expect(month).not.toBeNull();

    // meses → anos
    await userEvent.click(canvasElement.querySelector<HTMLButtonElement>('[data-ark="calendar-title"]')!);
    const year = canvasElement.querySelector<HTMLButtonElement>('[data-ark="calendar-year"]');
    await expect(year).not.toBeNull();

    // ano → meses → mês → dias
    await userEvent.click(year!);
    await userEvent.click(
      canvasElement.querySelector<HTMLButtonElement>('[data-ark="calendar-month"][data-month="2"]')!
    );
    const day = canvasElement.querySelector('[data-ark="calendar-day"][data-date$="-03-01"]');
    await expect(day).not.toBeNull();
  }
};

export const KeyboardNavigation = {
  args: { lang: "en" },
  render: Playground.render,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const day15 = canvasElement.querySelector<HTMLButtonElement>('[data-date$="-15"]')!;
    day15.focus();

    await userEvent.keyboard("{ArrowRight}");
    await expect(document.activeElement?.getAttribute("data-date")).toMatch(/-16$/);

    await userEvent.keyboard("{ArrowDown}");
    await expect(document.activeElement?.getAttribute("data-date")).toMatch(/-23$/);

    await userEvent.keyboard("{Home}");
    await expect(document.activeElement?.getAttribute("data-date")).toMatch(/-01$/);
  }
};
