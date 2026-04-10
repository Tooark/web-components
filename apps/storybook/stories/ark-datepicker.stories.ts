import type { ArkDatepickerLang, ArkDatepickerStyleOptions } from "@tooark/core";

const meta = {
  title: "Core/ArkDatepicker",
  argTypes: {
    lang: {
      control: "select",
      options: ["en", "pt", "es", "custom"],
      description: "Built-in locale or 'custom' to use locale-json"
    },
    localeJson: {
      control: "text",
      description: "JSON string with partial locale overrides (used when lang='custom')"
    },
    theme: {
      control: "select",
      options: ["auto", "light", "dark"]
    },
    intent: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"]
    },
    accentColor: {
      control: "color",
      description: "Custom accent color for selected/today states"
    },
    value: { control: "text", description: "Selected date in YYYY-MM-DD format" },
    min: { control: "text", description: "Minimum selectable date (YYYY-MM-DD)" },
    max: { control: "text", description: "Maximum selectable date (YYYY-MM-DD)" }
  },
  args: {
    lang: "en",
    localeJson: "",
    theme: "auto",
    intent: "primary",
    accentColor: "",
    value: "",
    min: "",
    max: ""
  }
};

export default meta;

type StoryArgs = {
  lang: ArkDatepickerLang;
  localeJson: string;
  theme: NonNullable<ArkDatepickerStyleOptions["theme"]>;
  intent: NonNullable<ArkDatepickerStyleOptions["intent"]>;
  accentColor: string;
  value: string;
  min: string;
  max: string;
};

export const English = {
  args: { lang: "en" },
  render: ({ lang, localeJson, theme, intent, accentColor, value, min, max }: StoryArgs) => {
    const el = document.createElement("ark-datepicker");
    el.setAttribute("lang", lang);
    el.setAttribute("theme", theme);
    el.setAttribute("intent", intent);
    if (value) el.setAttribute("value", value);
    if (min) el.setAttribute("min", min);
    if (max) el.setAttribute("max", max);
    if (accentColor) el.setAttribute("accent-color", accentColor);
    if (lang === "custom" && localeJson) el.setAttribute("locale-json", localeJson);

    el.addEventListener("ark-change", (e) => {
      console.log("ark-change", (e as CustomEvent).detail);
    });

    return el;
  }
};

export const Portuguese = {
  args: { lang: "pt" },
  render: English.render
};

export const Spanish = {
  args: { lang: "es" },
  render: English.render
};

export const CustomLocale = {
  args: {
    lang: "custom",
    localeJson: JSON.stringify({
      months: [
        "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
        "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
      ],
      weekdaysMin: ["B", "BE", "ÇA", "Ç", "CA", "C", "Ş"],
      today: "Bu gün",
      clear: "Təmizlə"
    })
  },
  render: English.render
};

export const WithMinMax = {
  args: {
    lang: "pt",
    min: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString().slice(0, 10),
    max: new Date(new Date().getFullYear(), new Date().getMonth(), 25).toISOString().slice(0, 10)
  },
  render: English.render
};

export const PreselectedDate = {
  args: {
    lang: "en",
    value: new Date().toISOString().slice(0, 10)
  },
  render: English.render
};

export const SemanticIntents = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "grid";
    wrap.style.gridTemplateColumns = "repeat(auto-fit, minmax(240px, 1fr))";
    wrap.style.gap = "12px";

    ["primary", "secondary", "success", "warning", "danger", "info", "neutral"].forEach((intent) => {
      const box = document.createElement("div");
      box.style.display = "flex";
      box.style.flexDirection = "column";
      box.style.gap = "8px";

      const label = document.createElement("strong");
      label.textContent = intent;

      const picker = document.createElement("ark-datepicker");
      picker.setAttribute("lang", "en");
      picker.setAttribute("intent", intent);

      box.appendChild(label);
      box.appendChild(picker);
      wrap.appendChild(box);
    });

    return wrap;
  }
};

export const DarkTheme = {
  args: {
    theme: "dark",
    intent: "info"
  },
  render: English.render
};

export const CustomAccent = {
  args: {
    lang: "en",
    accentColor: "#7c3aed"
  },
  render: English.render
};
