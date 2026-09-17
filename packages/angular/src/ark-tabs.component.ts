import {
  type AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  type ElementRef,
  EventEmitter,
  Input,
  type OnDestroy,
  Output,
  ViewChild
} from "@angular/core";
import type { ArkIntent, ArkLang, ArkRounded, ArkSize, ArkTabsFill, ArkTabsVariant, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-tabs-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-tabs
    #tabs
    [attr.testid]="testid"
    [attr.value]="value"
    [attr.variant]="variant"
    [attr.size]="size"
    [attr.intent]="intent"
    [attr.rounded]="rounded"
    [attr.fill]="fill"
    [attr.theme]="theme"
    [attr.label]="label"
    [attr.lang]="lang"
    [attr.locale-json]="localeJson"
    (change)="onChange($event)">
    <ng-content></ng-content>
  </ark-tabs>`
})
export class ArkTabsComponent implements AfterViewInit, OnDestroy {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  /** Value da aba ativa; sem ele a primeira habilitada assume. */
  @Input() value: string | undefined;
  @Input() variant: ArkTabsVariant = "underline";
  @Input() size: ArkSize = "md";
  @Input() intent: ArkIntent = "primary";
  /** Cantos das abas; em editor só o topo. Padrão: "full" em chips, "none" nas outras. */
  @Input() rounded: ArkRounded | undefined;
  /** Pintura da aba ativa. Padrão: "soft" em chips, "none" nas outras. */
  @Input() fill: ArkTabsFill | undefined;
  @Input() theme: ArkTheme = "auto";
  /** Vira aria-label da faixa. */
  @Input() label: string | undefined;
  @Input() lang: ArkLang | undefined;
  @Input() localeJson: string | undefined;
  @Output() changed = new EventEmitter<CustomEvent<{ value: string }>>();
  /** Uma aba fechável pediu para fechar; remover a aba é do app. */
  @Output() arkClose = new EventEmitter<CustomEvent<{ value: string }>>();

  @ViewChild("tabs", { static: false }) tabsRef!: ElementRef<HTMLElement>;

  private closeHandler = (event: Event) => this.arkClose.emit(event as CustomEvent<{ value: string }>);

  ngAfterViewInit(): void {
    this.tabsRef?.nativeElement?.addEventListener("ark-close", this.closeHandler);
  }

  ngOnDestroy(): void {
    this.tabsRef?.nativeElement?.removeEventListener("ark-close", this.closeHandler);
  }

  onChange(event: Event): void {
    this.changed.emit(event as CustomEvent<{ value: string }>);
  }
}

@Component({
  selector: "ark-tab-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-tab
    [attr.testid]="testid"
    [attr.value]="value"
    [attr.disabled]="disabled ? '' : null"
    [attr.controls]="controls"
    [attr.closable]="closable ? '' : null"
    [attr.dirty]="dirty ? '' : null">
    <ng-content></ng-content>
  </ark-tab>`
})
export class ArkTabComponent {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  @Input() value = "";
  @Input() disabled = false;
  /** id do painel que a aba controla (aria-controls). */
  @Input() controls: string | undefined;
  /** Botão de fechar, clique do meio e Delete (só na variante editor). */
  @Input() closable = false;
  /** Ponto de alterações não salvas. */
  @Input() dirty = false;
}
