import type { ArkCarouselSnap, ArkCarouselStyleOptions } from "@tooark/core";

const meta = {
  title: "Core/ArkCarousel",
  parameters: {
    docs: {
      description: {
        component:
          "Carousel baseado no comportamento do Embla: suporte a drag/swipe, snap configuravel, loop, autoplay, navegacao por setas e dots. O conteudo dos slides e livre e pode ser qualquer HTML."
      }
    }
  },
  argTypes: {
    theme: { control: "select", options: ["auto", "light", "dark"] },
    intent: { control: "select", options: ["primary", "secondary", "success", "warning", "danger", "info", "neutral"] },
    accentColor: { control: "color" },
    slidesPerView: { control: { type: "number", min: 1, max: 4, step: 1 } },
    gap: { control: { type: "number", min: 0, max: 40, step: 2 } },
    startIndex: { control: { type: "number", min: 0, max: 10, step: 1 } },
    loop: { control: "boolean" },
    autoplay: { control: "boolean" },
    autoplayDelay: { control: { type: "number", min: 1200, max: 12000, step: 200 } },
    showDots: { control: "boolean" },
    showArrows: { control: "boolean" },
    dragFree: { control: "boolean" },
    snap: { control: "radio", options: ["mandatory", "proximity"] }
  },
  args: {
    theme: "light",
    intent: "primary",
    accentColor: "",
    slidesPerView: 1,
    gap: 12,
    startIndex: 0,
    loop: false,
    autoplay: false,
    autoplayDelay: 4200,
    showDots: true,
    showArrows: true,
    dragFree: false,
    snap: "mandatory"
  }
};

export default meta;

type StoryArgs = {
  theme: NonNullable<ArkCarouselStyleOptions["theme"]>;
  intent: NonNullable<ArkCarouselStyleOptions["intent"]>;
  accentColor: string;
  slidesPerView: number;
  gap: number;
  startIndex: number;
  loop: boolean;
  autoplay: boolean;
  autoplayDelay: number;
  showDots: boolean;
  showArrows: boolean;
  dragFree: boolean;
  snap: ArkCarouselSnap;
};

function createSlide(title: string, text: string, bg: string): HTMLElement {
  const slide = document.createElement("article");
  slide.style.minHeight = "180px";
  slide.style.background = bg;
  slide.style.display = "grid";
  slide.style.alignContent = "end";
  slide.style.gap = "6px";

  const h3 = document.createElement("h3");
  h3.textContent = title;
  h3.style.fontSize = "18px";
  h3.style.fontWeight = "700";

  const p = document.createElement("p");
  p.textContent = text;
  p.style.fontSize = "13px";
  p.style.opacity = "0.85";

  slide.appendChild(h3);
  slide.appendChild(p);

  return slide;
}

function renderCarousel(args: StoryArgs): HTMLElement {
  const el = document.createElement("ark-carousel");
  el.setAttribute("theme", args.theme);
  el.setAttribute("intent", args.intent);
  el.setAttribute("slides-per-view", String(args.slidesPerView));
  el.setAttribute("gap", String(args.gap));
  el.setAttribute("start-index", String(args.startIndex));
  el.setAttribute("autoplay-delay", String(args.autoplayDelay));
  el.setAttribute("snap", args.snap);

  if (args.accentColor) el.setAttribute("accent-color", args.accentColor);
  if (args.loop) el.setAttribute("loop", "");
  if (args.autoplay) el.setAttribute("autoplay", "");
  if (!args.showDots) el.setAttribute("show-dots", "false");
  if (!args.showArrows) el.setAttribute("show-arrows", "false");
  if (args.dragFree) el.setAttribute("drag-free", "");

  const slides = [
    createSlide("Lago Azul", "Colecao de paisagens autorais", "linear-gradient(130deg, #bae6fd 0%, #7dd3fc 45%, #0ea5e9 100%)"),
    createSlide("Studio Portrait", "Retratos com contraste cinematografico", "linear-gradient(130deg, #fecdd3 0%, #fda4af 45%, #fb7185 100%)"),
    createSlide("Editorial Neon", "Moodboard para campanha urbana", "linear-gradient(130deg, #d8b4fe 0%, #c084fc 45%, #a855f7 100%)"),
    createSlide("Deserto Dourado", "Texturas e tons quentes para branding", "linear-gradient(130deg, #fde68a 0%, #fbbf24 45%, #d97706 100%)"),
    createSlide("Minimal Product", "Composicao clean para catalogo digital", "linear-gradient(130deg, #bbf7d0 0%, #4ade80 45%, #16a34a 100%)")
  ];

  slides.forEach((slide) => el.appendChild(slide));
  el.style.maxWidth = "860px";

  el.addEventListener("ark-slide-change", (event) => {
    console.log("ark-slide-change", (event as CustomEvent).detail);
  });

  return el;
}

export const Playground = {
  render: renderCarousel
};

export const AutoPlayLoop = {
  args: {
    autoplay: true,
    loop: true,
    theme: "dark",
    intent: "info",
    autoplayDelay: 2800
  },
  render: renderCarousel
};

export const MultiSlideViewport = {
  args: {
    slidesPerView: 2,
    gap: 16,
    showDots: true,
    theme: "light",
    intent: "success"
  },
  render: renderCarousel
};

export const MinimalNavigation = {
  args: {
    showDots: false,
    showArrows: true,
    snap: "proximity",
    dragFree: true,
    accentColor: "#f97316"
  },
  render: renderCarousel
};
