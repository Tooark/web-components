import type {
  ArkAlertLive,
  ArkAlertVariant,
  ArkAvatarShape,
  ArkBadgeSize,
  ArkBadgeVariant,
  ArkButtonStatus,
  ArkButtonType,
  ArkButtonVariant,
  ArkCardPadding,
  ArkCarouselSnap,
  ArkDatepickerLang,
  ArkDialogSize,
  ArkDrawerMode,
  ArkDrawerSide,
  ArkIntent,
  ArkLang,
  ArkMarkShape,
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

// Atributos de cada ark-* no JSX, inclusive os dos pacotes laterais (chart, wysiwyg, code), que não têm wrapper.
interface ArkIntrinsicElements {
  "ark-alert": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    testid?: string;
    intent?: ArkIntent;
    variant?: ArkAlertVariant;
    heading?: string;
    dismissible?: boolean;
    live?: ArkAlertLive;
    theme?: ArkTheme;
    lang?: ArkLang;
    "locale-json"?: string;
  };
  "ark-avatar": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    testid?: string;
    name?: string;
    src?: string;
    size?: ArkSize;
    shape?: ArkAvatarShape;
    color?: string;
    theme?: ArkTheme;
  };
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
  "ark-progress": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    testid?: string;
    value?: number | string;
    max?: number | string;
    indeterminate?: boolean;
    label?: string;
    "show-value"?: boolean;
    intent?: ArkIntent;
    size?: ArkSize;
    theme?: ArkTheme;
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
  "ark-spinner": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    testid?: string;
    size?: ArkSize;
    intent?: ArkIntent;
    label?: string;
    theme?: ArkTheme;
    lang?: ArkLang;
    "locale-json"?: string;
  };
  "ark-split-pane": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    testid?: string;
    direction?: "horizontal" | "vertical";
    sizes?: string;
    theme?: ArkTheme;
    lang?: ArkLang;
    "locale-json"?: string;
  };
  "ark-status-dot": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    testid?: string;
    intent?: ArkIntent;
    label?: string;
    size?: ArkSize;
    theme?: ArkTheme;
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
  "ark-color-swatches": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    testid?: string;
    value?: string;
    colors?: string;
    label?: string;
    disabled?: boolean;
    size?: ArkSize;
    theme?: ArkTheme;
  };
  "ark-command-palette": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    testid?: string;
    open?: boolean;
    placeholder?: string;
    hotkey?: string;
    filter?: boolean;
    "no-scroll-lock"?: boolean;
    "query-delay"?: number | string;
    label?: string;
    theme?: ArkTheme;
    lang?: ArkLang;
    "locale-json"?: string;
  };
  "ark-command-item": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    testid?: string;
    value?: string;
    group?: string;
    label?: string;
    disabled?: boolean;
  };
  "ark-copy-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    testid?: string;
    value?: string;
    for?: string;
    "feedback-ms"?: number | string;
    variant?: ArkButtonVariant;
    intent?: ArkIntent;
    theme?: ArkTheme;
    size?: ArkSize;
    rounded?: ArkRounded;
    loading?: boolean;
    disabled?: boolean;
    "icon-only"?: boolean;
    "full-width"?: boolean;
    color?: string;
    "text-color"?: string;
    lang?: ArkLang;
    "locale-json"?: string;
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
    "no-scroll-lock"?: boolean;
    theme?: ArkTheme;
    lang?: ArkLang;
    "locale-json"?: string;
  };
  "ark-kbd": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    testid?: string;
    size?: ArkSize;
    theme?: ArkTheme;
  };
  "ark-kv-editor": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    testid?: string;
    rows?: string;
    bulk?: boolean;
    "bulk-format"?: "lines" | "json";
    types?: string;
    description?: boolean;
    secret?: boolean;
    "key-placeholder"?: string;
    "value-placeholder"?: string;
    "description-placeholder"?: string;
    readonly?: boolean;
    size?: ArkSize;
    theme?: ArkTheme;
    lang?: ArkLang;
    "locale-json"?: string;
  };
  "ark-mark": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    testid?: string;
    shape?: ArkMarkShape;
    color?: string;
    size?: number | string;
    label?: string;
    theme?: ArkTheme;
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
  "ark-card": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    testid?: string;
    heading?: string;
    padding?: ArkCardPadding;
    rounded?: ArkRounded;
    theme?: ArkTheme;
  };
  "ark-drawer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    testid?: string;
    open?: boolean;
    side?: ArkDrawerSide;
    mode?: ArkDrawerMode;
    size?: string | number;
    label?: string;
    "no-close-button"?: boolean;
    persistent?: boolean;
    "no-scroll-lock"?: boolean;
    theme?: ArkTheme;
    lang?: ArkLang;
    "locale-json"?: string;
  };
  "ark-empty": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    testid?: string;
    heading?: string;
    description?: string;
    theme?: ArkTheme;
  };
  "ark-shape-picker": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    testid?: string;
    value?: ArkMarkShape;
    color?: string;
    label?: string;
    disabled?: boolean;
    size?: ArkSize;
    theme?: ArkTheme;
    lang?: ArkLang;
    "locale-json"?: string;
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
    "locale-json"?: string;
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
  "ark-file-input": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    testid?: string;
    accept?: string;
    multiple?: boolean;
    label?: string;
    helper?: string;
    "error-message"?: string;
    error?: boolean;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    intent?: ArkIntent;
    size?: ArkSize;
    rounded?: ArkRounded;
    theme?: ArkTheme;
    lang?: ArkLang;
    "locale-json"?: string;
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
    wrap?: "soft" | "hard" | "off";
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
    lang?: ArkLang;
  };
  "ark-chart": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    theme?: ArkTheme;
    renderer?: "canvas" | "svg";
    height?: string;
    "auto-resize"?: boolean | "false";
  };
  "ark-wysiwyg-editor": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    theme?: ArkTheme;
    placeholder?: string;
    editable?: boolean | "false";
    toolbar?: string;
    lang?: ArkLang;
    "locale-json"?: string;
    colors?: string;
    highlights?: string;
    "max-file-size"?: number;
  };
  "ark-wysiwyg-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    theme?: ArkTheme;
  };
  "ark-code-editor": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
    testid?: string;
    theme?: ArkTheme;
    language?: "json" | "javascript" | "yaml" | "text";
    readonly?: boolean;
    placeholder?: string;
    "min-height"?: string;
    "line-numbers"?: boolean | "false";
    fold?: boolean | "false";
    wrap?: boolean;
    "indent-style"?: "space" | "tab";
    "indent-size"?: number;
    "line-ending"?: "auto" | "lf" | "crlf";
    "tab-indent"?: boolean | "false";
    autocomplete?: boolean | "false";
  };
}

// @types/react 19 só tem o JSX dentro do módulo (React.JSX), que o runtime "react-jsx" lê.
declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ArkIntrinsicElements {}
  }
}

// @types/react 18 com o runtime clássico ("jsx": "react") ainda lê o JSX global.
declare global {
  namespace JSX {
    interface IntrinsicElements extends ArkIntrinsicElements {}
  }
}
