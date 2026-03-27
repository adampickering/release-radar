import {
    CalendarDate,
    type ZonedDateTime,
    endOfMonth,
    endOfWeek,
    startOfMonth,
    startOfWeek,
    toZoned,
} from "@internationalized/date";
import type { CalendarEvent } from "../calendar";

export type ZonedEvent = Omit<CalendarEvent, "start" | "end"> & {
    start: ZonedDateTime;
    end: ZonedDateTime;
};

export const SLOT_HEIGHT = 48;

export const getStartOfDay = (date: ZonedDateTime | CalendarDate, timeZone: string): ZonedDateTime => {
    const zoned = date instanceof CalendarDate ? toZoned(date, timeZone) : date;
    return zoned.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
};

export const getEndOfDay = (date: ZonedDateTime | CalendarDate, timeZone: string): ZonedDateTime => {
    const zoned = date instanceof CalendarDate ? toZoned(date, timeZone) : date;
    return zoned.set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
};

export const getDaysInVisibleMonthGrid = (anchorDate: CalendarDate, locale: string): CalendarDate[] => {
    const monthStart = startOfMonth(anchorDate);
    const monthEnd = endOfMonth(anchorDate);
    const weekStart = startOfWeek(monthStart, locale);
    const weekEnd = endOfWeek(monthEnd, locale);

    const days: CalendarDate[] = [];
    let day = weekStart;
    while (day.compare(weekEnd) <= 0) {
        days.push(day);
        day = day.add({ days: 1 });
    }
    return days;
};

export const getEventsForDay = (allEvents: ZonedEvent[], targetDate: CalendarDate, timeZone: string): ZonedEvent[] => {
    const dayStart = getStartOfDay(targetDate, timeZone);
    const dayEnd = getEndOfDay(targetDate, timeZone);

    return allEvents
        .filter((event) => {
            return event.start.compare(dayEnd) < 0 && event.end.compare(dayStart) > 0;
        })
        .sort((a, b) => a.start.compare(b.start));
};
