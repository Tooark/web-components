const meta = {
  title: "Core/ArkButton",
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "outline", "ghost"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    type: { control: "radio", options: ["button", "submit", "reset"] },
    label: { control: "text" }
  },
  args: {
    variant: "primary",
    size: "md",
    disabled: false,
    type: "button",
    label: "Ação principal"
  }
};

export default meta;

type StoryArgs = { variant: string; size: string; disabled: boolean; type: "button" | "submit" | "reset"; label: string };

export const Playground = {
  render: ({ variant, size, disabled, type, label }: StoryArgs) => {
    const element = document.createElement("ark-button");
    element.setAttribute("variant", variant);
    element.setAttribute("size", size);
    element.setAttribute("type", type);

    if (disabled) {
      element.setAttribute("disabled", "");
    }

    element.textContent = label;
    return element;
  }
};

export const Variants = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.gap = "12px";

    ["primary", "secondary", "outline", "ghost"].forEach((v) => {
      const el = document.createElement("ark-button");
      el.setAttribute("variant", v);
      el.textContent = v;
      wrap.appendChild(el);
    });

    return wrap;
  }
};
