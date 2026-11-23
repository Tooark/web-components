// Tipa document.createElement, querySelector e closest com a classe de cada ark-* (sem cast no consumidor).
import type {
  ArkAlert,
  ArkAvatar,
  ArkBadge,
  ArkButton,
  ArkButtonGroup,
  ArkCalendar,
  ArkCard,
  ArkCarousel,
  ArkCheckbox,
  ArkClock,
  ArkColorSwatches,
  ArkCommandItem,
  ArkCommandPalette,
  ArkCopyButton,
  ArkDataView,
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
  ArkMenuGroup,
  ArkMenuItem,
  ArkNav,
  ArkNavGroup,
  ArkNavItem,
  ArkPagination,
  ArkProgress,
  ArkRadio,
  ArkRadioGroup,
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
  ArkTime,
  ArkToaster,
  ArkToggle,
  ArkToggleGroup,
  ArkTooltip,
  ArkTree,
  ArkTreeItem
} from "./components";

declare global {
  interface HTMLElementTagNameMap {
    "ark-alert": ArkAlert;
    "ark-avatar": ArkAvatar;
    "ark-badge": ArkBadge;
    "ark-button": ArkButton;
    "ark-button-group": ArkButtonGroup;
    "ark-calendar": ArkCalendar;
    "ark-card": ArkCard;
    "ark-carousel": ArkCarousel;
    "ark-checkbox": ArkCheckbox;
    "ark-clock": ArkClock;
    "ark-color-swatches": ArkColorSwatches;
    "ark-command-item": ArkCommandItem;
    "ark-command-palette": ArkCommandPalette;
    "ark-copy-button": ArkCopyButton;
    "ark-data-view": ArkDataView;
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
    "ark-menu-group": ArkMenuGroup;
    "ark-menu-item": ArkMenuItem;
    "ark-nav": ArkNav;
    "ark-nav-group": ArkNavGroup;
    "ark-nav-item": ArkNavItem;
    "ark-pagination": ArkPagination;
    "ark-progress": ArkProgress;
    "ark-radio": ArkRadio;
    "ark-radio-group": ArkRadioGroup;
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
    "ark-time": ArkTime;
    "ark-toaster": ArkToaster;
    "ark-toggle": ArkToggle;
    "ark-toggle-group": ArkToggleGroup;
    "ark-tooltip": ArkTooltip;
    "ark-tree": ArkTree;
    "ark-tree-item": ArkTreeItem;
  }
}
