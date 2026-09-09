import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from "@angular/core";
import type { ArkDatepickerLang, ArkIntent, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-clock-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-clock
    #clock
    [attr.testid]="testid"
    [attr.value]="value"
    [attr.lang]="lang"
    [attr.theme]="theme"
    [attr.intent]="intent"
    [attr.seconds]="seconds ? '' : null"
    [attr.step-minutes]="stepMinutes"
    [attr.hours-format]="hoursFormat">
  </ark-clock>`
})
export class ArkClockComponent implements AfterViewInit, OnDestroy {
  constructor () {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  @Input() value: string | undefined;
  @Input() lang: ArkDatepickerLang = "en";
  @Input() theme: ArkTheme = "auto";
  @Input() intent: ArkIntent = "primary";
  @Input() seconds = false;
  @Input() stepMinutes: number | undefined;
  @Input() hoursFormat: "24" | "12" = "24";
  @Output() arkChange = new EventEmitter<{ value: string }>();

  @ViewChild("clock", { static: false }) clockRef!: ElementRef<HTMLElement>;

  private handler = (e: Event) => this.arkChange.emit((e as CustomEvent).detail);

  ngAfterViewInit(): void {
    this.clockRef?.nativeElement?.addEventListener("ark-change", this.handler);
  }

  ngOnDestroy(): void {
    this.clockRef?.nativeElement?.removeEventListener("ark-change", this.handler);
  }
}
