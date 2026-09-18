import type { ArkAvatarShape, ArkSize, ArkTheme } from "@tooark/core";
import { expect, waitFor } from "storybook/test";

const meta = {
  title: "Core/ArkAvatar",
  argTypes: {
    name: { control: "text" },
    src: { control: "text" },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    shape: { control: "inline-radio", options: ["circle", "square"] },
    color: { control: "color" },
    theme: { control: "select", options: ["auto", "light", "dark"] }
  },
  args: {
    name: "Ana Lima",
    src: "",
    size: "md",
    shape: "circle",
    color: "",
    theme: "auto"
  }
};

export default meta;

type StoryArgs = {
  name: string;
  src: string;
  size: ArkSize;
  shape: ArkAvatarShape;
  color: string;
  theme: ArkTheme;
  testid?: string;
};

type AvatarEl = HTMLElement & { initials: string };

/** Imagem quebrada sem rede: bytes que nao decodificam disparam `error` na hora (uma URL invalida depende de DNS). */
const BROKEN = "data:image/png;base64,AAAA";

/** Imagem de exemplo inline (SVG em data URI), sem rede. */
const PHOTO = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#f59e0b"/><circle cx="32" cy="24" r="12" fill="#fff7ed"/><path d="M8 64c0-14 10-22 24-22s24 8 24 22z" fill="#fff7ed"/></svg>'
)}`;

function createAvatar(args: Partial<StoryArgs>): AvatarEl {
  const el = document.createElement("ark-avatar") as AvatarEl;
  if (args.name) el.setAttribute("name", args.name);
  if (args.src) el.setAttribute("src", args.src);
  if (args.size) el.setAttribute("size", args.size);
  if (args.shape) el.setAttribute("shape", args.shape);
  if (args.color) el.setAttribute("color", args.color);
  if (args.theme) el.setAttribute("theme", args.theme);
  if (args.testid) el.setAttribute("testid", args.testid);
  return el;
}

function row(...items: HTMLElement[]): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "flex flex-wrap items-center gap-4";
  for (const item of items) wrap.appendChild(item);
  return wrap;
}

export const Playground = {
  render: (args: StoryArgs) => createAvatar(args)
};

export const Sizes = {
  render: () =>
    row(...(["xs", "sm", "md", "lg", "xl"] as ArkSize[]).map((size) => createAvatar({ name: "Ana Lima", size })))
};

export const Shapes = {
  render: () =>
    row(
      createAvatar({ name: "Ana Lima", shape: "circle", size: "lg" }),
      createAvatar({ name: "Ana Lima", shape: "square", size: "lg" }),
      createAvatar({ name: "Ana Lima", src: PHOTO, shape: "circle", size: "lg" }),
      createAvatar({ name: "Ana Lima", src: PHOTO, shape: "square", size: "lg" })
    )
};

export const Colors = {
  render: () =>
    row(
      createAvatar({ name: "Ana Lima" }),
      createAvatar({ name: "Bruno Costa", color: "#0ea5e9" }),
      createAvatar({ name: "Carla Dias", color: "#16a34a" }),
      createAvatar({ name: "Diego Faria", color: "#dc2626" }),
      createAvatar({ name: "Elisa", color: "oklch(55% 0.2 300)" })
    )
};

export const WithImage = {
  render: () =>
    row(
      createAvatar({ name: "Ana Lima", src: PHOTO, size: "xl" }),
      createAvatar({ name: "Ana Lima", src: BROKEN, size: "xl" })
    )
};

export const NoName = {
  render: () => row(createAvatar({}), createAvatar({ size: "lg", shape: "square" }))
};

export const Stack = {
  render: () => {
    const wrap = document.createElement("div");
    wrap.className = "flex items-center";
    const people = ["Ana Lima", "Bruno Costa", "Carla Dias", "Diego Faria"];
    people.forEach((name, index) => {
      const avatar = createAvatar({ name, size: "sm", color: ["#0ea5e9", "#16a34a", "#dc2626", "#7c3aed"][index] });
      avatar.style.marginLeft = index ? "-0.5rem" : "0";
      avatar.style.boxShadow = "0 0 0 2px var(--ark-color-surface)";
      wrap.appendChild(avatar);
    });
    return wrap;
  }
};

// Iniciais por name (primeira letra, ou primeira + ultima com sobrenome), role="img" nomeado; sem nome fica
// decorativo com o glifo; a imagem cai para as iniciais em erro de carga e volta quando o src muda.
export const Semantics = {
  render: () => createAvatar({ name: "Ana Lima" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const avatar = canvasElement.querySelector("ark-avatar") as AvatarEl;
    const initials = avatar.querySelector('[data-ark="avatar-initials"]') as HTMLElement;

    await expect(avatar).toHaveAttribute("role", "img");
    await expect(avatar).toHaveAccessibleName("Ana Lima");
    await expect(initials.textContent).toBe("AL");
    avatar.setAttribute("name", "  ana   maria   lima ");
    await expect(avatar.initials).toBe("AL");
    avatar.setAttribute("name", "Ana");
    await expect(initials.textContent).toBe("A");
    await expect(Math.round(avatar.getBoundingClientRect().width)).toBe(40);
    avatar.setAttribute("size", "xs");
    await expect(Math.round(avatar.getBoundingClientRect().width)).toBe(24);

    avatar.removeAttribute("name");
    await expect(avatar).toHaveAttribute("aria-hidden", "true");
    await expect(initials.querySelector("svg")).not.toBeNull();
    avatar.setAttribute("aria-label", "Sem foto");
    await expect(avatar).not.toHaveAttribute("aria-hidden");
    avatar.removeAttribute("aria-label");
    avatar.setAttribute("name", "Ana Lima");
    await expect(initials.textContent).toBe("AL");

    // Imagem valida: as iniciais somem; imagem quebrada: voltam.
    avatar.setAttribute("src", PHOTO);
    const image = avatar.querySelector('[data-ark="avatar-image"]') as HTMLImageElement;
    await expect(image.alt).toBe("Ana Lima");
    await waitFor(() => expect(initials).not.toBeVisible());
    await expect(image).toBeVisible();
    avatar.setAttribute("src", BROKEN);
    await waitFor(() => expect(image).not.toBeVisible());
    await expect(initials).toBeVisible();
    avatar.removeAttribute("src");
    await expect(avatar.querySelector("img")).toBeNull();

    // Cor propria: variaveis inline e classes por variavel.
    avatar.setAttribute("color", "rgb(220, 38, 38)");
    await expect(avatar.style.getPropertyValue("--ark-avatar-fg")).toBe("rgb(220, 38, 38)");
    await expect(getComputedStyle(avatar).color).toBe("rgb(220, 38, 38)");
  }
};

export const TestHooks = {
  render: () => createAvatar({ name: "Hooks", src: PHOTO, testid: "meu-avatar" }),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await expect(canvasElement.querySelector('[data-ark="avatar"]')).toHaveAttribute("data-testid", "meu-avatar");
    await expect(canvasElement.querySelector('[data-ark="avatar-image"]')).toHaveAttribute(
      "data-testid",
      "meu-avatar-image"
    );
    await expect(canvasElement.querySelector('[data-ark="avatar-initials"]')).toHaveAttribute(
      "data-testid",
      "meu-avatar-initials"
    );
  }
};
