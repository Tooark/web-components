import type { ArkCarouselSnap, ArkCarouselStyleOptions } from "@tooark/core";
import { expect, userEvent, waitFor } from "storybook/test";

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
    createSlide(
      "Lago Azul",
      "Colecao de paisagens autorais",
      "linear-gradient(130deg, #bae6fd 0%, #7dd3fc 45%, #0ea5e9 100%)"
    ),
    createSlide(
      "Studio Portrait",
      "Retratos com contraste cinematografico",
      "linear-gradient(130deg, #fecdd3 0%, #fda4af 45%, #fb7185 100%)"
    ),
    createSlide(
      "Editorial Neon",
      "Moodboard para campanha urbana",
      "linear-gradient(130deg, #d8b4fe 0%, #c084fc 45%, #a855f7 100%)"
    ),
    createSlide(
      "Deserto Dourado",
      "Texturas e tons quentes para branding",
      "linear-gradient(130deg, #fde68a 0%, #fbbf24 45%, #d97706 100%)"
    ),
    createSlide(
      "Minimal Product",
      "Composicao clean para catalogo digital",
      "linear-gradient(130deg, #bbf7d0 0%, #4ade80 45%, #16a34a 100%)"
    )
  ];

  for (const slide of slides) el.appendChild(slide);
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

export const ArrowsNavigate = {
  render: renderCarousel,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const carousel = canvasElement.querySelector("ark-carousel") as HTMLElement & { index: number };
    const changes: number[] = [];
    carousel.addEventListener("ark-slide-change", (event) => changes.push((event as CustomEvent).detail.index));

    // Os slides continuam filhos diretos do host, na ordem declarada.
    const slides = Array.from(carousel.children).filter((el) => !el.hasAttribute("data-ark-chrome"));
    await expect(slides.length).toBe(5);
    await expect(slides[0].tagName).toBe("ARTICLE");
    await expect(slides[0]).toHaveAttribute("data-ark", "carousel-slide-0");

    // Setas e dots ficam sobre a área visível do host rolável.
    const hostRect = carousel.getBoundingClientRect();
    const next = canvasElement.querySelector<HTMLButtonElement>('[data-ark="carousel-arrow-next"]')!;
    const nextRect = next.getBoundingClientRect();
    await expect(nextRect.right).toBeLessThanOrEqual(hostRect.right);
    await expect(nextRect.left).toBeGreaterThan(hostRect.right - 80);

    await userEvent.click(next);
    await waitFor(() => expect(carousel.index).toBe(1));
    await waitFor(() => expect(carousel.scrollLeft).toBeGreaterThan(0));
    await expect(changes).toEqual([1]);

    // O overlay acompanha a rolagem: a seta continua no mesmo lugar da tela.
    await waitFor(() => expect(Math.abs(next.getBoundingClientRect().left - nextRect.left)).toBeLessThan(2));
    await expect(canvasElement.querySelector('[data-ark="carousel-dot-1"]')).toHaveAttribute("aria-current", "true");
  }
};

export const NextBeforeFirstFrame = {
  parameters: {
    docs: {
      description: {
        story:
          "Um `next()` no mesmo frame da montagem (um framework chamando a API logo apos o mount) vale: o posicionamento inicial, que espera um frame pelo layout, parte do indice atual e nao volta ao `start-index`, entao `ark-slide-change` dispara uma unica vez."
      }
    }
  },
  render: (): HTMLElement => document.createElement("div"),
  play: async ({ canvasElement, args }: { canvasElement: HTMLElement; args: StoryArgs }) => {
    const host = canvasElement.querySelector("div")!;
    const carousel = renderCarousel(args) as HTMLElement & { index: number; next(): void };
    const changes: number[] = [];
    carousel.addEventListener("ark-slide-change", (event) => changes.push((event as CustomEvent).detail.index));

    // Conecta e avanca sincronamente, antes do requestAnimationFrame da montagem.
    host.appendChild(carousel);
    carousel.next();
    await expect(carousel.index).toBe(1);
    await expect(changes).toEqual([1]);

    const target = canvasElement.querySelector<HTMLElement>('[data-ark="carousel-slide-1"]')!;
    await waitFor(() => expect(Math.abs(carousel.scrollLeft - target.offsetLeft)).toBeLessThan(2));
    // A sincronizacao por rolagem (80 ms apos parar) nao pode emitir de novo nem voltar o indice.
    await new Promise((resolve) => setTimeout(resolve, 200));
    await expect(carousel.index).toBe(1);
    await expect(changes).toEqual([1]);
    await expect(canvasElement.querySelector('[data-ark="carousel-dot-1"]')).toHaveAttribute("aria-current", "true");
  }
};

export const DynamicSlides = {
  render: renderCarousel,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const carousel = canvasElement.querySelector("ark-carousel")!;
    const dots = () => canvasElement.querySelectorAll('[data-ark^="carousel-dot-"]').length;
    await expect(dots()).toBe(5);

    // Slide adicionado depois da montagem (como um framework faria).
    carousel.appendChild(createSlide("Novo", "Slide adicionado dinamicamente", "#e2e8f0"));
    await waitFor(() => expect(dots()).toBe(6));
    await expect(carousel.lastElementChild).toHaveAttribute("data-ark", "carousel-slide-5");

    carousel.removeChild(carousel.lastElementChild!);
    await waitFor(() => expect(dots()).toBe(5));
  }
};
