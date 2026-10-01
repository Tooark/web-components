import {
  type AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Input,
  inject,
  type OnDestroy,
  Output,
  ViewChild
} from "@angular/core";
import type { ArkDatepickerLang, ArkIntent, ArkTheme } from "@tooark/core";
import type { ArkClock as ArkClockElement } from "@tooark/web-components";
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
    [attr.locale-json]="localeJson"
    [attr.theme]="theme"
    [attr.intent]="intent"
    [attr.seconds]="seconds ? '' : null"
    [attr.step-minutes]="stepMinutes"
    [attr.hours-format]="hoursFormat">
  </ark-clock>`
})
export class ArkClockComponent implements AfterViewInit, OnDestroy {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** O `ark-clock` que este wrapper renderiza, com os métodos e propriedades do elemento; `null` antes da view. */
  get element(): ArkClockElement | null {
    return this.host.nativeElement.querySelector<ArkClockElement>(":scope > ark-clock");
  }

  @Input() testid: string | undefined;
  @Input() value: string | undefined;
  @Input() lang: ArkDatepickerLang = "en";
  /** JSON com strings próprias (hours, minutes, seconds), mesclado sobre o inglês, quando lang é "custom". */
  @Input() localeJson: string | undefined;
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
