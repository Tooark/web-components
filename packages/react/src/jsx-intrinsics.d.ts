import React from "react";
import type { ArkSize, ArkButtonType, ArkButtonVariant, ArkDatepickerLang, ArkIntent, ArkRounded, ArkTheme, ArkCarouselSnap, ArkToastPosition } from "@tooark/core";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "ark-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
        type?: ArkButtonType;
        disabled?: boolean;
        variant?: ArkButtonVariant;
        intent?: ArkIntent;
        theme?: ArkTheme;
        size?: ArkSize;
        rounded?: ArkRounded;
        loading?: boolean;
        "icon-only"?: boolean;
        "full-width"?: boolean;
        href?: string;
        target?: string;
        color?: string;
        "text-color"?: string;
      };
      "ark-switch": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
        checked?: boolean;
        disabled?: boolean;
        intent?: ArkIntent;
        theme?: ArkTheme;
        size?: ArkSize;
        labels?: boolean;
        "label-on"?: string;
        "label-off"?: string;
        icons?: boolean;
        color?: string;
        name?: string;
        value?: string;
        label?: string;
      };
      "ark-toggle": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
        pressed?: boolean;
        disabled?: boolean;
        intent?: ArkIntent;
        theme?: ArkTheme;
        size?: ArkSize;
        value?: string;
      };
      "ark-toggle-group": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
        value?: string;
        multiple?: boolean;
        disabled?: boolean;
        intent?: ArkIntent;
        theme?: ArkTheme;
        size?: ArkSize;
      };
      "ark-datepicker": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
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
        testid?: string;
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
        testid?: string;
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
