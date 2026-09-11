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
import type { ArkCarouselSnap, ArkIntent, ArkTheme } from "@tooark/core";
import { ensureTooarkComponentsRegistered } from "./register";

@Component({
  selector: "ark-carousel-wrapper",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
  <ark-carousel
    #carousel
    [attr.testid]="testid"
    [attr.theme]="theme"
    [attr.intent]="intent"
    [attr.accent-color]="accentColor"
    [attr.slides-per-view]="slidesPerView"
    [attr.gap]="gap"
    [attr.start-index]="startIndex"
    [attr.autoplay-delay]="autoplayDelay"
    [attr.snap]="snap"
    [attr.loop]="loop ? '' : null"
    [attr.autoplay]="autoplay ? '' : null"
    [attr.drag-free]="dragFree ? '' : null"
    [attr.show-dots]="showDots ? null : 'false'"
    [attr.show-arrows]="showArrows ? null : 'false'">
    <ng-content></ng-content>
  </ark-carousel>`
})
export class ArkCarouselComponent implements AfterViewInit, OnDestroy {
  constructor() {
    ensureTooarkComponentsRegistered();
  }

  @Input() testid: string | undefined;
  @Input() theme: ArkTheme = "auto";
  @Input() intent: ArkIntent = "primary";
  @Input() accentColor: string | undefined;
  @Input() slidesPerView = 1;
  @Input() gap = 12;
  @Input() startIndex = 0;
  @Input() loop = false;
  @Input() autoplay = false;
  @Input() autoplayDelay = 4200;
  @Input() showDots = true;
  @Input() showArrows = true;
  @Input() dragFree = false;
  @Input() snap: ArkCarouselSnap = "mandatory";

  @Output() arkSlideChange = new EventEmitter<{ index: number }>();

  @ViewChild("carousel", { static: false }) carouselRef!: ElementRef<HTMLElement>;

  private handler = (e: Event) => this.arkSlideChange.emit((e as CustomEvent).detail);

  ngAfterViewInit(): void {
    this.carouselRef?.nativeElement?.addEventListener("ark-slide-change", this.handler);
  }

  ngOnDestroy(): void {
    this.carouselRef?.nativeElement?.removeEventListener("ark-slide-change", this.handler);
  }
}
