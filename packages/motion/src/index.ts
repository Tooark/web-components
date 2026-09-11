// Camada 3 do motion Tooark — helpers de alto nível sobre a lib Motion
// (motion.dev), integrados aos tokens --ark-*. Pacote opt-in: só quem
// precisa de stagger/reveal/FLIP/swipe paga pela dependência.

// Primitivas da lib Motion para uso avançado, sem precisar instalá-la à parte
export { animate, hover, inView, press, scroll, spring, stagger } from "motion";
export { arkFlip } from "./flip";
export { arkReveal } from "./reveal";
export { arkStaggerEnter } from "./stagger";
export { arkSwipe } from "./swipe";
export type {
  ArkFlipOptions,
  ArkMotionPlusOptions,
  ArkMotionPreset,
  ArkMotionTargets,
  ArkRevealOptions,
  ArkStaggerOptions,
  ArkSwipeDirection,
  ArkSwipeInfo,
  ArkSwipeOptions
} from "./types";
