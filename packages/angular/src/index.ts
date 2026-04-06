import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnDestroy } from "@angular/core";
import { registerTooarkComponents } from "@tooark/core";

registerTooarkComponents();

@Component({
  selector: "ark-button-wrapper",
  standalone: true,
  template: `<ark-button [attr.type]="type" [attr.disabled]="disabled ? '' : null" [attr.variant]="variant" [attr.size]="size"><ng-content></ng-content></ark-button>`
})
export class ArkButtonComponent {
  @Input() type: "button" | "submit" | "reset" = "button";
  @Input() disabled = false;
  @Input() variant: "primary" | "secondary" | "outline" | "ghost" = "primary";
  @Input() size: "sm" | "md" | "lg" = "md";
}

@Component({
  selector: "ark-datepicker-wrapper",
  standalone: true,
  template: `<ark-datepicker #picker [attr.lang]="lang" [attr.locale-json]="localeJsonStr" [attr.value]="value" [attr.min]="min" [attr.max]="max"></ark-datepicker>`
})
export class ArkDatepickerComponent implements AfterViewInit, OnDestroy {
  @Input() lang: "en" | "pt" | "es" | "custom" = "en";
  @Input() localeJson: Record<string, unknown> | undefined;
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
