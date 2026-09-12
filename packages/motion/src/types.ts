import type { ArkDuration, ArkEasing, ArkMotionPreset } from "@tooark/core";

export type { ArkMotionPreset };

/** Alvos aceitos pelos helpers: elemento, lista, NodeList ou seletor CSS. */
export type ArkMotionTargets = string | Element | Element[] | NodeListOf<Element>;

/** Opções comuns de animação da Camada 3. */
export type ArkMotionPlusOptions = {
  /** Preset de transição. Padrão: "slide-up". */
  preset?: ArkMotionPreset;
  /** Token de duração ou valor em ms. Padrão: "default". */
  duration?: ArkDuration | number;
  /** Token de easing ou curva custom (array cubic-bezier ou nome da lib Motion). */
  ease?: ArkEasing | number[] | string;
  /** Deslocamento dos presets de slide (ex.: "1rem", "24px"). Padrão: --ark-motion-distance. */
  distance?: string;
};

/** Opções de entrada escalonada de listas. */
export type ArkStaggerOptions = ArkMotionPlusOptions & {
  /** Intervalo entre itens em ms. Padrão: 60. */
  interval?: number;
  /** Origem do escalonamento. Padrão: "first". */
  from?: "first" | "last" | "center";
};

/** Opções de scroll reveal. */
export type ArkRevealOptions = ArkMotionPlusOptions & {
  /** Anima apenas na primeira entrada na viewport. Padrão: true. */
  once?: boolean;
  /** Fração do elemento visível para disparar (0–1 ou "all"). Padrão: 0.25. */
  amount?: number | "some" | "all";
  /** Margem do observer (sintaxe de rootMargin, ex.: "0px 0px -10% 0px"). */
  margin?: string;
};

/** Opções de animação FLIP (reordenação de listas). */
export type ArkFlipOptions = {
  /** Física de spring da acomodação. */
  stiffness?: number;
  damping?: number;
};

export type ArkSwipeDirection = "left" | "right" | "up" | "down";

export type ArkSwipeInfo = {
  /** Deslocamento total do gesto em px (eixo configurado). */
  delta: number;
  /** Velocidade no soltar, em px/s. */
  velocity: number;
};

/** Opções do gesto de swipe. */
export type ArkSwipeOptions = {
  /** Eixo do gesto. Padrão: "x". */
  axis?: "x" | "y";
  /** Distância mínima em px para disparar. Padrão: 48. */
  threshold?: number;
  /** Velocidade mínima em px/s que dispara mesmo abaixo do threshold. Padrão: 500. */
  velocityThreshold?: number;
  /** Elemento acompanha o dedo durante o gesto. Padrão: true. */
  feedback?: boolean;
  /** Resistência do arrasto (0–1; maior = mais pesado). Padrão: 0.4. */
  resistance?: number;
  /** Chamado quando um swipe é reconhecido. */
  onSwipe: (direction: ArkSwipeDirection, info: ArkSwipeInfo) => void;
};
