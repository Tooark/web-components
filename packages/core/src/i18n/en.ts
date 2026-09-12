import type { ArkDatepickerLocale } from "./types";

/** Strings de calendário em inglês; também é o fallback de qualquer lang desconhecido. */
export const en: ArkDatepickerLocale = {
  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ],
  monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  monthsMin: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
  weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  weekdaysMin: ["S", "M", "T", "W", "T", "F", "S"],
  today: "Today",
  clear: "Clear",
  close: "Close",
  firstDayOfWeek: 0,
  previousMonth: "Previous month",
  nextMonth: "Next month",
  openCalendar: "Open calendar",
  hours: "Hours",
  minutes: "Minutes",
  seconds: "Seconds",
  events: "events",
  week: "Week",
  day: "Day",
  month: "Month",
  agenda: "Agenda",
  holiday: "Holiday",
  allDay: "All day",
  noEvents: "No events"
};
