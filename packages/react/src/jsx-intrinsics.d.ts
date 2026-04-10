import React from "react";
import type { ArkSize, ArkButtonType, ArkButtonVariant, ArkDatepickerLang, ArkIntent, ArkTheme, ArkCarouselSnap, ArkToastPosition } from "@tooark/core";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "ark-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        type?: ArkButtonType;
        disabled?: boolean;
        variant?: ArkButtonVariant;
        intent?: ArkIntent;
        theme?: ArkTheme;
        size?: ArkSize;
        color?: string;
        "text-color"?: string;
      };
      "ark-datepicker": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        lang?: ArkDatepickerLang;
        theme?: ArkTheme;
        intent?: ArkIntent;
        "accent-color"?: string;
        "locale-json"?: string;
        value?: string;
        min?: string;
        max?: string;
      };
      "ark-carousel": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        theme?: ArkTheme;
        intent?: ArkIntent;
        "accent-color"?: string;
        "slides-per-view"?: number;
        gap?: number;
        "start-index"?: number;
        loop?: boolean;
        autoplay?: boolean;
        "autoplay-delay"?: number;
        "show-dots"?: boolean | "false";
        "show-arrows"?: boolean | "false";
        "drag-free"?: boolean;
        snap?: ArkCarouselSnap;
      };
      "ark-toaster": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        theme?: ArkTheme;
        position?: ArkToastPosition;
        "rich-colors"?: boolean;
        "close-button"?: boolean | "false";
        "max-visible"?: number;
        duration?: number;
      };
    }
  }
}

export { };
