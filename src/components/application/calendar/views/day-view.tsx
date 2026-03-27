import { useLayoutEffect, useMemo, useRef } from "react";
import {
    CalendarDate,
    CalendarDateTime,
    type ZonedDateTime,
    endOfWeek,
    isToday as isDateToday,
    isSameDay,
    startOfWeek,
    toCalendarDate,
    toZoned,
} from "@internationalized/date";
import type { DateFormatter } from "@react-aria/i18n";
import {
    Calendar as AriaCalendar,
    CalendarGrid as AriaCalendarGrid,
    CalendarGridBody as AriaCalendarGridBody,
    CalendarGridHeader as AriaCalendarGridHeader,
    CalendarHeaderCell as AriaCalendarHeaderCell,
    Heading as AriaHeading,
} from "react-aria-components";
import { ChevronLeft, ChevronRight } from "@untitledui/icons";
import { CalendarCell } from "@/components/application/date-picker/cell";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";
import { CalendarColumnHeader } from "../base-components/calendar-column-header";
import { CalendarDwViewCell } from "../base-components/calendar-dw-view-cell";
import { CalendarDwViewEvent } from "../base-components/calendar-dw-view-event";
import { CalendarRowLabel } from "../base-components/calendar-row-label";
import { CalendarTimeMarker } from "../base-components/calendar-time-marker";
import { type ZonedEvent, SLOT_HEIGHT, getStartOfDay, getEndOfDay, getEventsForDay } from "../utils/calendar-helpers";

interface PositionedEventProps {
    event: ZonedEvent;
    dayStart: ZonedDateTime;
    timeZone: string;
    slotHeight: number;
    overlapIndex: number;
    totalOverlapping: number;
    setSelectedDate: (date: CalendarDate | null) => void;
    timeFormatter: DateFormatter;
}

const PositionedEvent = ({ event, dayStart, timeZone, slotHeight, overlapIndex, setSelectedDate, timeFormatter }: PositionedEventProps) => {
    const formatTime = (dateTime: ZonedDateTime) => timeFormatter.format(dateTime.toDate());

    const startZoned = event.start;
    const endZoned = event.end;

    const dayEnd = getEndOfDay(dayStart, timeZone);
    const clampedStart = startZoned.compare(dayStart) < 0 ? dayStart : startZoned;
    const clampedEnd = endZoned.compare(dayEnd) > 0 ? dayEnd : endZoned;

    const startMinutes = clampedStart.hour * 60 + clampedStart.minute;
    const endMinutes = clampedEnd.hour * 60 + clampedEnd.minute;
    const durationMinutes = Math.max(15, endMinutes - startMinutes);

    const top = (startMinutes / 30) * slotHeight;
    const height = Math.max(slotHeight / 2, (durationMinutes / 30) * slotHeight);

    const horizontalOffset = 0;

    const displayTime = durationMinutes > 30;
    const supportingText = displayTime ? formatTime(startZoned) : undefined;

    return (
        <div
            key={event.id}
            className="absolute w-full px-1.5 py-1.5"
            style={{
                top: `${top}px`,
                height: `${height}px`,
                left: `${horizontalOffset}px`,
                zIndex: overlapIndex,
            }}
            onClick={() => setSelectedDate(toCalendarDate(startZoned))}
        >
            <CalendarDwViewEvent label={event.title} supportingText={supportingText} color={event.color} withDot={event.dot} />
        </div>
    );
};

interface MobileSingleDayGridProps {
    dayToDisplay: CalendarDate;
    dayEvents: ZonedEvent[];
    timeZone: string;
    locale: string;
    currentTime: ZonedDateTime;
    setSelectedDate: (date: CalendarDate | null) => void;
    timeFormatter: DateFormatter;
    className?: string;
}

const MobileSingleDayGrid = ({ dayToDisplay, dayEvents, timeZone, setSelectedDate, timeFormatter, className }: MobileSingleDayGridProps) => {
    const dayStart = useMemo(() => getStartOfDay(dayToDisplay, timeZone), [dayToDisplay, timeZone]);

    return (
        <div className={cx("relative flex-1", className)}>
            {Array.from({ length: 48 }).map((_, slotIndex) => (
                <CalendarDwViewCell
                    key={`mobile-slot-${dayToDisplay.toString()}-${slotIndex}`}
                    className={cx("before:border-r-0", slotIndex === 47 && "before:border-b-0")}
                />
            ))}

            {dayEvents.map((event, index) => {
                const overlapIndex = dayEvents.filter((e, i) => i < index && event.start.compare(e.end) < 0 && event.end.compare(e.start) > 0).length;
                const totalOverlapping = dayEvents.filter((e) => event.start.compare(e.end) < 0 && event.end.compare(e.start) > 0).length;

                return (
                    <PositionedEvent
                        key={event.id}
                        event={event}
                        dayStart={dayStart}
                        timeZone={timeZone}
                        slotHeight={SLOT_HEIGHT}
                        overlapIndex={overlapIndex}
                        totalOverlapping={totalOverlapping}
                        setSelectedDate={setSelectedDate}
                        timeFormatter={timeFormatter}
                    />
                );
            })}
        </div>
    );
};

export interface DayViewProps {
    dayToDisplay: CalendarDate;
    selectedDate: CalendarDate | null;
    zonedEvents: ZonedEvent[];
    locale: string;
    timeZone: string;
    currentTime: ZonedDateTime;
    setSelectedDate: (date: CalendarDate | null) => void;
    shortWeekdayFormatter: DateFormatter;
    timeFormatter: DateFormatter;
    hourOnlyFormatter: DateFormatter;
    className?: string;
    view?: string;
}

export const DayView = ({
    dayToDisplay,
    zonedEvents,
    locale,
    timeZone,
    currentTime,
    setSelectedDate,
    shortWeekdayFormatter,
    timeFormatter,
    hourOnlyFormatter,
    selectedDate,
    className,
    view,
}: DayViewProps) => {
    const currentWeekStart = startOfWeek(dayToDisplay, locale);
    const currentWeekEnd = endOfWeek(dayToDisplay, locale);
    const localCurrentTime = currentTime;

    const formatTime = (dateTime: ZonedDateTime) => timeFormatter.format(dateTime.toDate());

    const showTimeMarker = isSameDay(toCalendarDate(localCurrentTime), dayToDisplay);

    const hours = Array.from({ length: 24 }, (_, i) => i);

    let timeMarkerTop = 0;
    if (showTimeMarker) {
        const minutesFromDayStart = localCurrentTime.hour * 60 + localCurrentTime.minute;
        timeMarkerTop = (minutesFromDayStart / 30) * SLOT_HEIGHT;
    }

    const visibleEvents = useMemo(() => getEventsForDay(zonedEvents, dayToDisplay, timeZone), [zonedEvents, dayToDisplay, timeZone]);

    const highlightedDates = useMemo(() => {
        const datesWithEvents = new Set<string>();
        zonedEvents.forEach((event) => {
            let currentDate = toCalendarDate(event.start);
            const endDate = toCalendarDate(event.end);
            while (currentDate.compare(endDate) <= 0) {
                datesWithEvents.add(currentDate.toString());
                currentDate = currentDate.add({ days: 1 });
            }
        });
        return datesWithEvents;
    }, [zonedEvents]);

    const days: CalendarDate[] = [];
    let dayIterator = currentWeekStart;
    while (dayIterator.compare(currentWeekEnd) <= 0) {
        days.push(dayIterator);
        dayIterator = dayIterator.add({ days: 1 });
    }

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const earliestEventTime = useMemo(() => {
        if (visibleEvents.length === 0) {
            return toZoned(dayToDisplay, timeZone).set({ hour: 8 });
        }
        return visibleEvents.reduce((earliest, current) => {
            return current.start.compare(earliest.start) < 0 ? current : earliest;
        }).start;
    }, [visibleEvents, dayToDisplay, timeZone]);

    useLayoutEffect(() => {
        if (view === "day" && scrollContainerRef.current && earliestEventTime) {
            const startMinutes = earliestEventTime.hour * 60 + earliestEventTime.minute;
            let targetScrollTop = Math.max(0, (startMinutes / 30) * SLOT_HEIGHT);
            targetScrollTop = Math.max(0, targetScrollTop - SLOT_HEIGHT);

            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = targetScrollTop;
            }
        }
    }, [view, earliestEventTime, dayToDisplay]);

    return (
        <div className={cx("flex flex-1 flex-col overflow-auto", className)}>
            <div className="sticky top-0 z-20 grid grid-cols-7 bg-primary shadow-sm lg:hidden dark:border-b dark:border-secondary">
                {days.map((day) => {
                    const isTodayFlag = isDateToday(day, timeZone);
                    const dayToHighlight =
                        selectedDate && day.compare(currentWeekStart) >= 0 && day.compare(currentWeekEnd) <= 0 ? selectedDate : currentWeekStart;
                    const isSelectedFlag = isSameDay(day, dayToHighlight);
                    const weekDayShort = shortWeekdayFormatter.format(day.toDate(timeZone));

                    return (
                        <CalendarColumnHeader
                            key={`mobile-header-${day.toString()}`}
                            onClick={() => setSelectedDate(day)}
                            weekDay={weekDayShort}
                            day={day.day}
                            state={isSelectedFlag ? "selected" : isTodayFlag ? "current" : "default"}
                            className="cursor-pointer"
                        />
                    );
                })}
            </div>

            <div className="flex h-full flex-1">
                <div ref={scrollContainerRef} className="relative flex h-full flex-1 overflow-auto">
                    <div className="flex h-max w-14 flex-col border-r border-secondary md:w-18">
                        {hours.map((hour) => {
                            const time = new CalendarDateTime(dayToDisplay.year, dayToDisplay.month, dayToDisplay.day, hour);
                            const timeString = hourOnlyFormatter.format(toZoned(time, timeZone).toDate());
                            return <CalendarRowLabel key={`time-${hour}`}>{timeString}</CalendarRowLabel>;
                        })}
                    </div>
                    <MobileSingleDayGrid
                        dayToDisplay={dayToDisplay}
                        dayEvents={visibleEvents}
                        timeZone={timeZone}
                        locale={locale}
                        currentTime={currentTime}
                        setSelectedDate={setSelectedDate}
                        timeFormatter={timeFormatter}
                    />
                    {showTimeMarker && <CalendarTimeMarker style={{ top: `${timeMarkerTop}px` }}>{formatTime(localCurrentTime)}</CalendarTimeMarker>}
                </div>

                <div className="sticky top-0 hidden h-full w-82 flex-col overflow-auto border-l border-secondary mask-b-from-94% lg:flex">
                    <AriaCalendar aria-label="Calendar" className="px-6 py-5" value={selectedDate} onChange={(value) => setSelectedDate(value)}>
                        <header className="mb-3 flex items-center justify-between">
                            <Button slot="previous" iconLeading={ChevronLeft} size="sm" color="tertiary" className="size-8" />
                            <AriaHeading className="text-sm font-semibold text-fg-secondary" />
                            <Button slot="next" iconLeading={ChevronRight} size="sm" color="tertiary" className="size-8" />
                        </header>

                        <AriaCalendarGrid weekdayStyle="short" className="w-max">
                            <AriaCalendarGridHeader className="border-b-4 border-transparent">
                                {(day) => (
                                    <AriaCalendarHeaderCell className="p-0">
                                        <div className="flex size-10 items-center justify-center text-sm font-medium text-secondary">{day.slice(0, 2)}</div>
                                    </AriaCalendarHeaderCell>
                                )}
                            </AriaCalendarGridHeader>
                            <AriaCalendarGridBody className="[&_tr]:last-of-type]:border-none [&_td]:p-0 [&_tr]:border-b-4 [&_tr]:border-transparent">
                                {(date) => <CalendarCell date={date} isHighlighted={highlightedDates.has(date.toString())} />}
                            </AriaCalendarGridBody>
                        </AriaCalendarGrid>
                    </AriaCalendar>
                </div>
            </div>
        </div>
    );
};
