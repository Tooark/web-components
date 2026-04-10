import { registerTooarkComponents } from "./register";

export { ArkButton, ArkCarousel, ArkDatepicker, ArkToaster } from "./components";
export type { ArkDatepickerLocale } from "./i18n/types";
export type {
	ArkTheme,
	ArkThemeSelected,
	ArkIntent,
	ArkCarouselSnap,
	ArkToastType,
	ArkToastPosition,
	ArkStyleVariant,
	ArkButtonVariant,
	ArkSize,
	ArkButtonType,
	ArkDatepickerLang,
	ArkButtonStyleOptions,
	ArkDatepickerStyleOptions,
	ArkCarouselStyleOptions,
	ArkToasterStyleOptions,
	ArkToastOptions
} from "./types/style";
export { en, pt, es, resolveLocale } from "./i18n";
export { toast, showToast, dismissToast } from "./services";
export { registerTooarkComponents } from "./register";

registerTooarkComponents();
