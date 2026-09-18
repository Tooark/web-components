import type {
  ArkBadgeSize,
  ArkBadgeVariant,
  ArkButtonStatus,
  ArkButtonType,
  ArkButtonVariant,
  ArkCarouselSnap,
  ArkDatepickerLang,
  ArkDialogSize,
  ArkIntent,
  ArkLang,
  ArkMenuAlign,
  ArkMenuDirection,
  ArkRounded,
  ArkSize,
  ArkTabsFill,
  ArkTabsVariant,
  ArkTextareaResize,
  ArkTheme,
  ArkToastPosition,
  ArkTooltipSide
} from "@tooark/core";
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "ark-badge": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
        intent?: ArkIntent;
        variant?: ArkBadgeVariant;
        size?: ArkBadgeSize;
        rounded?: ArkRounded;
        color?: string;
        theme?: ArkTheme;
      };
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
        status?: ArkButtonStatus;
        "status-label"?: string;
        "icon-only"?: boolean;
        "full-width"?: boolean;
        href?: string;
        target?: string;
        color?: string;
        "text-color"?: string;
      };
      "ark-checkbox": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
        checked?: boolean;
        indeterminate?: boolean;
        disabled?: boolean;
        intent?: ArkIntent;
        theme?: ArkTheme;
        size?: ArkSize;
        name?: string;
        value?: string;
        label?: string;
      };
      "ark-radio": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
        checked?: boolean;
        disabled?: boolean;
        intent?: ArkIntent;
        theme?: ArkTheme;
        size?: ArkSize;
        name?: string;
        value?: string;
        label?: string;
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
      "ark-dialog": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
        open?: boolean;
        size?: ArkDialogSize;
        width?: string | number;
        height?: string | number;
        label?: string;
        "no-close-button"?: boolean;
        persistent?: boolean;
        theme?: ArkTheme;
        lang?: ArkLang;
        "locale-json"?: string;
      };
      "ark-menu": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
        for?: string;
        open?: boolean;
        align?: ArkMenuAlign;
        direction?: ArkMenuDirection;
        size?: ArkSize;
        theme?: ArkTheme;
      };
      "ark-menu-item": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
        value?: string;
        disabled?: boolean;
        intent?: ArkIntent;
        checked?: boolean | "false";
        divider?: boolean;
        static?: boolean;
      };
      "ark-tooltip": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
        content?: string;
        side?: ArkTooltipSide;
        delay?: number | string;
        open?: boolean;
        theme?: ArkTheme;
      };
      "ark-empty": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
        heading?: string;
        description?: string;
        theme?: ArkTheme;
      };
      "ark-skeleton": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
        rows?: number | string;
        animated?: boolean;
        rounded?: ArkRounded;
        color?: string;
        ratio?: string;
        theme?: ArkTheme;
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
      "ark-select": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
        label?: string;
        placeholder?: string;
        options?: string;
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
        reveal?: boolean;
        lang?: ArkLang;
        "locale-json"?: string;
        autocomplete?: string;
        autofocus?: boolean;
        inputmode?: string;
        maxlength?: number | string;
        minlength?: number | string;
        pattern?: string;
        min?: number | string;
        max?: number | string;
        step?: number | string;
        spellcheck?: boolean | "true" | "false";
      };
      "ark-tabs": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
        value?: string;
        variant?: ArkTabsVariant;
        size?: ArkSize;
        intent?: ArkIntent;
        rounded?: ArkRounded;
        fill?: ArkTabsFill;
        theme?: ArkTheme;
        label?: string;
        lang?: ArkLang;
        "locale-json"?: string;
      };
      "ark-tab": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
        value?: string;
        disabled?: boolean;
        controls?: string;
        closable?: boolean;
        dirty?: boolean;
      };
      "ark-textarea": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        testid?: string;
        label?: string;
        placeholder?: string;
        value?: string;
        name?: string;
        rows?: number | string;
        autosize?: boolean;
        monospace?: boolean;
        resize?: ArkTextareaResize;
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
        autocomplete?: string;
        autofocus?: boolean;
        maxlength?: number | string;
        minlength?: number | string;
        spellcheck?: boolean | "true" | "false";
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
