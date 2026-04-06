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
    value: { control: "text", description: "Selected date in YYYY-MM-DD format" },
    min: { control: "text", description: "Minimum selectable date (YYYY-MM-DD)" },
    max: { control: "text", description: "Maximum selectable date (YYYY-MM-DD)" }
  },
  args: {
    lang: "en",
    localeJson: "",
    value: "",
    min: "",
    max: ""
  }
};

export default meta;

type StoryArgs = { lang: string; localeJson: string; value: string; min: string; max: string };

export const English = {
  args: { lang: "en" },
  render: ({ lang, localeJson, value, min, max }: StoryArgs) => {
    const el = document.createElement("ark-datepicker");
    el.setAttribute("lang", lang);
    if (value) el.setAttribute("value", value);
    if (min) el.setAttribute("min", min);
    if (max) el.setAttribute("max", max);
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
