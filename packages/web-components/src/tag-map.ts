// Tipa document.createElement, querySelector e closest com a classe de cada ark-* (sem cast no consumidor).
import type {
  ArkAlert,
  ArkAvatar,
  ArkBadge,
  ArkButton,
  ArkCalendar,
  ArkCard,
  ArkCarousel,
  ArkCheckbox,
  ArkClock,
  ArkColorSwatches,
  ArkCommandItem,
  ArkCommandPalette,
  ArkCopyButton,
  ArkDatepicker,
  ArkDialog,
  ArkDrawer,
  ArkEmpty,
  ArkFileInput,
  ArkInput,
  ArkKbd,
  ArkKvEditor,
  ArkMark,
  ArkMenu,
  ArkMenuItem,
  ArkProgress,
  ArkRadio,
  ArkScheduler,
  ArkSelect,
  ArkShapePicker,
  ArkSkeleton,
  ArkSpinner,
  ArkSplitPane,
  ArkStatusDot,
  ArkSwitch,
  ArkTab,
  ArkTabs,
  ArkTextarea,
  ArkToaster,
  ArkToggle,
  ArkToggleGroup,
  ArkTooltip
} from "./components";

declare global {
  interface HTMLElementTagNameMap {
    "ark-alert": ArkAlert;
    "ark-avatar": ArkAvatar;
    "ark-badge": ArkBadge;
    "ark-button": ArkButton;
    "ark-calendar": ArkCalendar;
    "ark-card": ArkCard;
    "ark-carousel": ArkCarousel;
    "ark-checkbox": ArkCheckbox;
    "ark-clock": ArkClock;
    "ark-color-swatches": ArkColorSwatches;
    "ark-command-item": ArkCommandItem;
    "ark-command-palette": ArkCommandPalette;
    "ark-copy-button": ArkCopyButton;
    "ark-datepicker": ArkDatepicker;
    "ark-dialog": ArkDialog;
    "ark-drawer": ArkDrawer;
    "ark-empty": ArkEmpty;
    "ark-file-input": ArkFileInput;
    "ark-input": ArkInput;
    "ark-kbd": ArkKbd;
    "ark-kv-editor": ArkKvEditor;
    "ark-mark": ArkMark;
    "ark-menu": ArkMenu;
    "ark-menu-item": ArkMenuItem;
    "ark-progress": ArkProgress;
    "ark-radio": ArkRadio;
    "ark-scheduler": ArkScheduler;
    "ark-select": ArkSelect;
    "ark-shape-picker": ArkShapePicker;
    "ark-skeleton": ArkSkeleton;
    "ark-spinner": ArkSpinner;
    "ark-split-pane": ArkSplitPane;
    "ark-status-dot": ArkStatusDot;
    "ark-switch": ArkSwitch;
    "ark-tab": ArkTab;
    "ark-tabs": ArkTabs;
    "ark-textarea": ArkTextarea;
    "ark-toaster": ArkToaster;
    "ark-toggle": ArkToggle;
    "ark-toggle-group": ArkToggleGroup;
    "ark-tooltip": ArkTooltip;
  }
}
