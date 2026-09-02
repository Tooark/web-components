import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from "@angular/core";
import type { ArkDatepickerLang, ArkIntent, ArkSchedulerEvent, ArkSchedulerView, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

ensureTooarkComponentsRegistered();

@Component({
  selector: "ark-scheduler-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-scheduler
    #scheduler
    [attr.testid]="testid"
    [attr.view]="view"
    [attr.date]="date"
    [attr.events]="eventsStr"
    [attr.lang]="lang"
    [attr.theme]="theme"
    [attr.intent]="intent"
    [attr.views]="views"
    [attr.hour-start]="hourStart"
    [attr.hour-end]="hourEnd"
    [attr.slot-minutes]="slotMinutes"
    [attr.hours-format]="hoursFormat">
  </ark-scheduler>`
})
export class ArkSchedulerComponent implements AfterViewInit, OnDestroy {
  @Input() testid: string | undefined;
  @Input() view: ArkSchedulerView = "week";
  @Input() date: string | undefined;
  @Input() events: ArkSchedulerEvent[] | undefined;
  @Input() lang: ArkDatepickerLang = "en";
  @Input() theme: ArkTheme = "auto";
  @Input() intent: ArkIntent = "primary";
  @Input() views: string | undefined;
  @Input() hourStart: number | undefined;
  @Input() hourEnd: number | undefined;
  @Input() slotMinutes: number | undefined;
  @Input() hoursFormat: "24" | "12" | undefined;

  @Output() arkEventClick = new EventEmitter<{ event: ArkSchedulerEvent; id: string | null }>();
  @Output() arkSlotClick = new EventEmitter<{ start: string; end: string; allDay: boolean }>();
  @Output() arkViewChange = new EventEmitter<{ view: string }>();
  @Output() arkRangeChange = new EventEmitter<{ start: string; end: string; view: string }>();

  @ViewChild("scheduler", { static: false }) schedulerRef!: ElementRef<HTMLElement>;

  private eventClickHandler = (e: Event) => this.arkEventClick.emit((e as CustomEvent).detail);
  private slotClickHandler = (e: Event) => this.arkSlotClick.emit((e as CustomEvent).detail);
  private viewChangeHandler = (e: Event) => this.arkViewChange.emit((e as CustomEvent).detail);
  private rangeChangeHandler = (e: Event) => this.arkRangeChange.emit((e as CustomEvent).detail);

  get eventsStr(): string | undefined {
    return this.events ? JSON.stringify(this.events) : undefined;
  }

  ngAfterViewInit(): void {
    const el = this.schedulerRef?.nativeElement;
    if (!el) return;
    el.addEventListener("ark-event-click", this.eventClickHandler);
    el.addEventListener("ark-slot-click", this.slotClickHandler);
    el.addEventListener("ark-view-change", this.viewChangeHandler);
    el.addEventListener("ark-range-change", this.rangeChangeHandler);
  }

  ngOnDestroy(): void {
    const el = this.schedulerRef?.nativeElement;
    if (!el) return;
    el.removeEventListener("ark-event-click", this.eventClickHandler);
    el.removeEventListener("ark-slot-click", this.slotClickHandler);
    el.removeEventListener("ark-view-change", this.viewChangeHandler);
    el.removeEventListener("ark-range-change", this.rangeChangeHandler);
  }
}
