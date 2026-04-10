import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from "@angular/core";
import type { ArkDatepickerLang, ArkIntent, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

ensureTooarkComponentsRegistered();

@Component({
  selector: "ark-datepicker-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-datepicker 
    #picker
    [attr.lang]="lang"
    [attr.locale-json]="localeJsonStr"
    [attr.theme]="theme"
    [attr.intent]="intent"
    [attr.accent-color]="accentColor"
    [attr.value]="value"
    [attr.min]="min"
    [attr.max]="max">
  </ark-datepicker>`
})
export class ArkDatepickerComponent implements AfterViewInit, OnDestroy {
  @Input() lang: ArkDatepickerLang = "en";
  @Input() localeJson: Record<string, unknown> | undefined;
  @Input() theme: ArkTheme = "auto";
  @Input() intent: ArkIntent = "primary";
  @Input() accentColor: string | undefined;
  @Input() value: string | undefined;
  @Input() min: string | undefined;
  @Input() max: string | undefined;
  @Output() arkChange = new EventEmitter<{ value: string | null; date: Date | null }>();

  @ViewChild("picker", { static: false }) pickerRef!: ElementRef<HTMLElement>;

  private handler = (e: Event) => this.arkChange.emit((e as CustomEvent).detail);

  get localeJsonStr(): string | undefined {
    return this.localeJson ? JSON.stringify(this.localeJson) : undefined;
  }

  ngAfterViewInit(): void {
    this.pickerRef?.nativeElement?.addEventListener("ark-change", this.handler);
  }

  ngOnDestroy(): void {
    this.pickerRef?.nativeElement?.removeEventListener("ark-change", this.handler);
  }
}
