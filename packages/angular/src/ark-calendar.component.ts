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
import type { ArkCalendarEvent, ArkDatepickerLang, ArkIntent, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-calendar-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-calendar
    #calendar
    [attr.testid]="testid"
    [attr.lang]="lang"
    [attr.locale-json]="localeJsonStr"
    [attr.theme]="theme"
    [attr.intent]="intent"
    [attr.accent-color]="accentColor"
    [attr.value]="value"
    [attr.min]="min"
    [attr.max]="max"
    [attr.events]="eventsStr"
    [attr.event-display]="eventDisplay">
  </ark-calendar>`
})
export class ArkCalendarComponent implements AfterViewInit, OnDestroy {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  @Input() lang: ArkDatepickerLang = "en";
  @Input() localeJson: Record<string, unknown> | undefined;
  @Input() theme: ArkTheme = "auto";
  @Input() intent: ArkIntent = "primary";
  @Input() accentColor: string | undefined;
  @Input() value: string | undefined;
  @Input() min: string | undefined;
  @Input() max: string | undefined;
  @Input() events: ArkCalendarEvent[] | undefined;
  @Input() eventDisplay: "dots" | "count" | "list" | undefined;
  @Output() arkChange = new EventEmitter<{ value: string | null; date: Date | null; events: ArkCalendarEvent[] }>();

  @ViewChild("calendar", { static: false }) calendarRef!: ElementRef<HTMLElement>;

  private handler = (e: Event) => this.arkChange.emit((e as CustomEvent).detail);

  get eventsStr(): string | undefined {
    return this.events ? JSON.stringify(this.events) : undefined;
  }

  get localeJsonStr(): string | undefined {
    return this.localeJson ? JSON.stringify(this.localeJson) : undefined;
  }

  ngAfterViewInit(): void {
    this.calendarRef?.nativeElement?.addEventListener("ark-change", this.handler);
  }

  ngOnDestroy(): void {
    this.calendarRef?.nativeElement?.removeEventListener("ark-change", this.handler);
  }
}
