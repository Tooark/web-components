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
      "ark-calendar": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
        lang?: ArkDatepickerLang;
        theme?: ArkTheme;
        intent?: ArkIntent;
        "accent-color"?: string;
        "locale-json"?: string;
        value?: string;
        min?: string;
        max?: string;
        events?: string;
        "event-display"?: "dots" | "count" | "list";
      };
      "ark-clock": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
        lang?: ArkDatepickerLang;
        theme?: ArkTheme;
        intent?: ArkIntent;
        value?: string;
        seconds?: boolean;
        "step-minutes"?: number;
        "hours-format"?: "24" | "12";
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
        mode?: "datetime" | "date" | "time";
        input?: boolean;
        placeholder?: string;
        name?: string;
        format?: string;
        seconds?: boolean;
        disabled?: boolean;
        events?: string;
        "event-display"?: "dots" | "count" | "list";
        "step-minutes"?: number;
        "hours-format"?: "24" | "12";
      };
      "ark-scheduler": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
        view?: "week" | "day" | "month" | "agenda";
        date?: string;
        events?: string;
        lang?: ArkDatepickerLang;
        theme?: ArkTheme;
        intent?: ArkIntent;
        views?: string;
        "hour-start"?: number;
        "hour-end"?: number;
        "slot-minutes"?: number;
        "hours-format"?: "24" | "12";
      };
      "ark-input": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
        type?: string;
        label?: string;
        placeholder?: string;
        value?: string;
        name?: string;
        size?: ArkSize;
        intent?: ArkIntent;
        theme?: ArkTheme;
        rounded?: ArkRounded;
        helper?: string;
        error?: boolean;
        "error-message"?: string;
        disabled?: boolean;
        required?: boolean;
        readonly?: boolean;
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
