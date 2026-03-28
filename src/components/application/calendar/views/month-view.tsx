import React, { useCallback, useMemo } from "react";
import {
    CalendarDate,
    type ZonedDateTime,
    endOfMonth,
    endOfWeek,
    isSameDay,
    isSameMonth,
    isToday as isDateToday,
    startOfMonth,
    startOfWeek,
    toCalendarDate,
    toZoned,
    today,
} from "@internationalized/date";
import type { DateFormatter } from "@react-aria/i18n";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";
import { CalendarColumnHeader } from "../base-components/calendar-column-header";
import { CalendarMonthViewCell } from "../base-components/calendar-month-view-cell";
import { CalendarMonthViewEvent } from "../base-components/calendar-month-view-event";
import { type ZonedEvent, getDaysInVisibleMonthGrid, getEventsForDay, getStartOfDay, getEndOfDay } from "../utils/calendar-helpers";

export interface MonthViewProps {
    currentMonthDate: CalendarDate;
    selectedDate: CalendarDate | null;
    zonedEvents: ZonedEvent[];
    locale: string;
    timeZone: string;
    setSelectedDate: (date: CalendarDate) => void;
    fullDateFormatter: DateFormatter;
    shortWeekdayFormatter: DateFormatter;
    timeFormatter: DateFormatter;
    className?: string;
    onEventClick?: (eventId: string) => void;
    onDayClick?: (date: CalendarDate) => void;
    hideAddButton?: boolean;
}

export const MonthView = ({
    currentMonthDate,
    selectedDate,
    zonedEvents,
    locale,
    timeZone,
    setSelectedDate,
    fullDateFormatter,
    shortWeekdayFormatter,
    timeFormatter,
    className,
    onEventClick,
    onDayClick,
    hideAddButton,
}: MonthViewProps) => {
    const monthStart = startOfMonth(currentMonthDate);
    const monthEnd = endOfMonth(currentMonthDate);
    const weekStart = startOfWeek(monthStart, locale);
    const weekEnd = endOfWeek(monthEnd, locale);

    const formatTimeForMonth = (dateTime: ZonedDateTime) => timeFormatter.format(dateTime.toDate());

    const days = useMemo(() => getDaysInVisibleMonthGrid(currentMonthDate, locale), [currentMonthDate, locale]);

    const weekdays = useMemo(() => {
        const firstDay = startOfWeek(today(timeZone), locale);
        return Array.from({ length: 7 }).map((_, i) => shortWeekdayFormatter.format(firstDay.add({ days: i }).toDate(timeZone)));
    }, [locale, timeZone, shortWeekdayFormatter]);

    const visibleEvents = zonedEvents.filter((event) => {
        const eventStartDay = toCalendarDate(event.start);
        const eventEndDay = toCalendarDate(event.end);
        return eventStartDay.compare(weekEnd) <= 0 && eventEndDay.compare(weekStart) >= 0;
    });

    const eventsByDay = useMemo(() => {
        const map = new Map<string, ZonedEvent[]>();
        days.forEach((day) => {
            const dateKey = day.toString();
            const dayEvents = getEventsForDay(visibleEvents, day, timeZone);
            map.set(dateKey, dayEvents);
        });
        return map;
    }, [days, visibleEvents, timeZone]);

    const MAX_EVENTS_PER_CELL = 3;

    const todayCalDate = today(timeZone);
    const targetDateForFooter = selectedDate || (isSameMonth(currentMonthDate, todayCalDate) ? todayCalDate : null);

    let eventsForFooter: ZonedEvent[] = [];
    if (targetDateForFooter) {
        const targetZoned = toZoned(targetDateForFooter, timeZone);
        const targetZonedStart = getStartOfDay(targetZoned, timeZone);
        const targetZonedEnd = getEndOfDay(targetZoned, timeZone);
        eventsForFooter = zonedEvents
            .filter((event) => {
                const eventStartDay = toCalendarDate(event.start);
                const eventEndDay = toCalendarDate(event.end);
                return (
                    isSameDay(eventStartDay, targetDateForFooter) ||
                    isSameDay(eventEndDay, targetDateForFooter) ||
                    (event.start.compare(targetZonedEnd) < 0 && event.end.compare(targetZonedStart) > 0)
                );
            })
            .sort((a, b) => a.start.compare(b.start));
    }

    const calculateEventSpan = useCallback(
        (event: ZonedEvent, currentDate: CalendarDate) => {
            const eventStartDay = toCalendarDate(event.start);
            const eventEndDay = toCalendarDate(event.end);
            const startsOnThisDay = isSameDay(currentDate, eventStartDay);

            if (!startsOnThisDay && eventStartDay.compare(currentDate) < 0) {
                const currentDayIndex = days.findIndex((d) => isSameDay(d, currentDate));
                const weekStartIndex = Math.floor(currentDayIndex / 7) * 7;
                const weekStartDate = days[weekStartIndex];
                const isFirstDayOfWeek = isSameDay(currentDate, weekStartDate);

                if (!isFirstDayOfWeek) {
                    return null;
                }
            }

            const currentDayIndex = days.findIndex((d) => isSameDay(d, currentDate));
            const weekEndIndex = Math.floor(currentDayIndex / 7) * 7 + 6;

            let spanDays = 1;
            let checkDay = currentDate.add({ days: 1 });
            let checkDayIndex = currentDayIndex + 1;

            while (checkDayIndex <= weekEndIndex && checkDay.compare(eventEndDay) <= 0) {
                spanDays++;
                checkDay = checkDay.add({ days: 1 });
                checkDayIndex++;
            }

            return spanDays;
        },
        [days],
    );

    const eventRenderMap = useMemo(() => {
        type EventCell = { event: ZonedEvent; span: number; isPlaceholder: boolean; row: number };
        const renderMap = new Map<string, EventCell[]>();

        days.forEach((day) => renderMap.set(day.toString(), []));

        const eventRowAssignments = new Map<string, number>();
        const rowOccupancyByDay = new Map<string, Set<string>[]>();
        days.forEach((day) => rowOccupancyByDay.set(day.toString(), []));

        const isWeekBoundaryStart = (dayIndex: number, eventStartDay: CalendarDate, currentDay: CalendarDate): boolean => {
            const startsOnCurrentDay = isSameDay(currentDay, eventStartDay);
            if (startsOnCurrentDay) return false;

            const weekStartIndex = Math.floor(dayIndex / 7) * 7;
            const weekStartDate = days[weekStartIndex];
            return isSameDay(currentDay, weekStartDate);
        };

        const findAvailableRow = (startDayIndex: number, span: number): number => {
            let row = 0;

            while (true) {
                let isAvailable = true;

                for (let offset = 0; offset < span; offset++) {
                    const dayIndex = startDayIndex + offset;
                    if (dayIndex >= days.length) break;

                    const dayKey = days[dayIndex].toString();
                    const occupancy = rowOccupancyByDay.get(dayKey)!;

                    if (occupancy[row]?.size > 0) {
                        isAvailable = false;
                        break;
                    }
                }

                if (isAvailable) return row;
                row++;
            }
        };

        const markRowAsOccupied = (startDayIndex: number, span: number, row: number, eventId: string) => {
            for (let offset = 0; offset < span; offset++) {
                const dayIndex = startDayIndex + offset;
                if (dayIndex >= days.length) break;

                const dayKey = days[dayIndex].toString();
                const occupancy = rowOccupancyByDay.get(dayKey)!;

                if (!occupancy[row]) {
                    occupancy[row] = new Set();
                }
                occupancy[row].add(eventId);
            }
        };

        days.forEach((day, dayIndex) => {
            const dateKey = day.toString();
            const eventsOnThisDay = eventsByDay.get(dateKey) || [];

            eventsOnThisDay.forEach((event) => {
                const span = calculateEventSpan(event, day);
                if (span === null) return;

                const eventStartDay = toCalendarDate(event.start);
                const isNewWeekSegment = isWeekBoundaryStart(dayIndex, eventStartDay, day);
                const hasExistingRow = eventRowAssignments.has(event.id);

                let row: number;
                if (hasExistingRow && !isNewWeekSegment) {
                    row = eventRowAssignments.get(event.id)!;
                } else {
                    row = findAvailableRow(dayIndex, span);
                    eventRowAssignments.set(event.id, row);
                }

                markRowAsOccupied(dayIndex, span, row, event.id);
                renderMap.get(dateKey)!.push({ event, span, isPlaceholder: false, row });

                for (let offset = 1; offset < span; offset++) {
                    const nextDayIndex = dayIndex + offset;
                    if (nextDayIndex >= days.length) break;

                    const nextDayKey = days[nextDayIndex].toString();
                    renderMap.get(nextDayKey)!.push({ event, span: 0, isPlaceholder: true, row });
                }
            });
        });

        renderMap.forEach((events) => events.sort((a, b) => a.row - b.row));

        return renderMap;
    }, [calculateEventSpan, days, eventsByDay]);

    return (
        <div className={cx("flex flex-1 flex-col", className)}>
            {/* Header Row */}
            <div className="grid grid-cols-7">
                {weekdays.map((weekday, index) => (
                    <CalendarColumnHeader key={index} weekDay={weekday} className="before:border-b" />
                ))}
            </div>

            {/* Grid Content */}
            <div
                className={cx(
                    "grid flex-1 grid-cols-7",
                    days.length > 35 ? "grid-rows-6" : days.length > 28 ? "grid-rows-5" : "grid-rows-4",
                )}
            >
                {days.map((date, index) => {
                    const dateKey = date.toString();
                    const isCurrentMonthFlag = isSameMonth(date, currentMonthDate);
                    const isTodayFlag = isDateToday(date, timeZone);
                    const isSelectedFlag = selectedDate ? isSameDay(date, selectedDate) : false;
                    const isLastRow = days.length > 35 ? index >= 35 : days.length > 28 ? index >= 28 : index >= 21;
                    const isLastColumn = (index + 1) % 7 === 0;

                    const eventsToRender = eventRenderMap.get(dateKey) || [];
                    const dayEvents = eventsByDay.get(dateKey) || [];

                    const eventsToShow = eventsToRender.slice(0, MAX_EVENTS_PER_CELL);
                    const remainingEventsCount = Math.max(0, dayEvents.length - MAX_EVENTS_PER_CELL);

                    return (
                        <CalendarMonthViewCell
                            key={dateKey}
                            day={date.day}
                            isDisabled={!isCurrentMonthFlag}
                            state={isSelectedFlag ? "selected" : isTodayFlag ? "current" : "default"}
                            className={cx(isLastRow && "before:border-b-0", isLastColumn && "before:border-r-0")}
                            hideAddButton={hideAddButton}
                            onClick={() => { if (isCurrentMonthFlag) { setSelectedDate(date); onDayClick?.(date); } }}
                        >
                            <div className="flex gap-1 max-md:pl-1 md:flex-col">
                                {eventsToShow.map(({ event, span, isPlaceholder }) => {
                                    if (isPlaceholder) {
                                        return (
                                            <div key={`${event.id}-placeholder`} className="pointer-events-none opacity-0">
                                                <CalendarMonthViewEvent label={event.title} collapseOnMobile={true} color={event.color} withDot={event.dot} avatarUrl={event.avatarUrl} />
                                            </div>
                                        );
                                    }

                                    const eventStartDay = toCalendarDate(event.start);
                                    const eventEndDay = toCalendarDate(event.end);
                                    const startsToday = isSameDay(date, eventStartDay);
                                    const endsToday = isSameDay(date, eventEndDay);
                                    const continuesPrior = eventStartDay.compare(date) < 0;
                                    const continuesAfter = eventEndDay.compare(date) > 0;

                                    const eventStartsAtDayStart = isSameDay(eventStartDay, toCalendarDate(getStartOfDay(event.start, timeZone)));
                                    const eventEndsAtDayEnd = isSameDay(eventEndDay, toCalendarDate(getEndOfDay(event.end, timeZone)));
                                    const isAllDayForCell =
                                        (continuesPrior && continuesAfter) ||
                                        (startsToday && continuesAfter && eventStartsAtDayStart) ||
                                        (continuesPrior && endsToday && eventEndsAtDayEnd);

                                    const supportingText = (isAllDayForCell || !event.showTime) ? undefined : formatTimeForMonth(event.start);

                                    const spanStyle =
                                        span > 1
                                            ? {
                                                  zIndex: 1,
                                                  width: `calc(${span * 100}% + ${(span - 1) * 16}px)`,
                                              }
                                            : undefined;

                                    return (
                                        <div key={event.id} style={spanStyle} className={cx(!isCurrentMonthFlag && "opacity-50")} onClick={(e) => { if (onEventClick) { e.stopPropagation(); onEventClick(event.id); } }}>
                                            <CalendarMonthViewEvent
                                                label={event.title}
                                                collapseOnMobile={true}
                                                supportingText={supportingText}
                                                color={event.color}
                                                withDot={event.dot}
                                                avatarUrl={event.avatarUrl}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {remainingEventsCount > 0 && (
                                <Button
                                    color="link-color"
                                    size="xs"
                                    onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDayClick?.(date); }}
                                    className="truncate !text-xs !font-semibold !text-utility-neutral-500 hover:!text-brand-secondary max-md:pl-1"
                                >
                                    {`${remainingEventsCount} more...`}
                                </Button>
                            )}
                        </CalendarMonthViewCell>
                    );
                })}
            </div>

            {targetDateForFooter && (
                <div className="border-t border-secondary px-4 py-5 md:hidden">
                    <h3 className="text-sm font-semibold text-primary">{fullDateFormatter.format(targetDateForFooter.toDate(timeZone))}</h3>

                    {eventsForFooter.length > 0 && (
                        <div className="mt-4 flex flex-col gap-1.5">
                            {eventsForFooter.slice(0, 3).map((event) => {
                                const eventStartDay = getStartOfDay(event.start, timeZone);
                                const eventEndDay = getEndOfDay(event.end, timeZone);
                                const isAllDay = event.start.compare(eventStartDay) <= 0 && event.end.compare(eventEndDay) >= 0;

                                const supportingText = (isAllDay || !event.showTime) ? undefined : formatTimeForMonth(event.start);

                                return (
                                    <div key={`footer-${event.id}`} onClick={() => onEventClick?.(event.id)}>
                                        <CalendarMonthViewEvent
                                            label={event.title}
                                            supportingText={supportingText}
                                            color={event.color}
                                            withDot={event.dot}
                                            avatarUrl={event.avatarUrl}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {eventsForFooter.length === 0 && <p className="mt-4 text-xs font-semibold text-quaternary">No events for this day.</p>}
                    {eventsForFooter.length > 3 && <p className="mt-4 text-xs font-semibold text-quaternary">{`${eventsForFooter.length - 3} more...`}</p>}
                </div>
            )}
        </div>
    );
};
