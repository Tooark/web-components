// Camada 3 do motion Tooark — helpers de alto nível sobre a lib Motion
// (motion.dev), integrados aos tokens --ark-*. Pacote opt-in: só quem
// precisa de stagger/reveal/FLIP/swipe paga pela dependência.

export type {
  ArkMotionPreset,
  ArkMotionTargets,
  ArkMotionPlusOptions,
  ArkStaggerOptions,
  ArkRevealOptions,
  ArkFlipOptions,
  ArkSwipeDirection,
  ArkSwipeInfo,
  ArkSwipeOptions
} from "./types";

export { arkStaggerEnter } from "./stagger";
export { arkReveal } from "./reveal";
export { arkFlip } from "./flip";
export { arkSwipe } from "./swipe";

// Primitivas da lib Motion para uso avançado, sem precisar instalá-la à parte
export { animate, stagger, inView, scroll, spring, hover, press } from "motion";
