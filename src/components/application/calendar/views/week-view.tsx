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
    setSelectedDate: (date: CalendarDate) => void;
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

interface WeekViewDayProps {
    day: CalendarDate;
    isLastDay: boolean;
    visibleEvents: ZonedEvent[];
    timeZone: string;
    slotHeight: number;
    setSelectedDate: (date: CalendarDate | null) => void;
    timeFormatter: DateFormatter;
}

const WeekViewDay = ({ day, isLastDay, visibleEvents, timeZone, slotHeight, setSelectedDate, timeFormatter }: WeekViewDayProps) => {
    const dateKey = day.toString();
    const dayEvents = useMemo(() => getEventsForDay(visibleEvents, day, timeZone), [visibleEvents, day, timeZone]);
    const dayStart = useMemo(() => getStartOfDay(day, timeZone), [day, timeZone]);

    return (
        <div className="flex flex-col border-secondary">
            <div className="relative flex-1 bg-primary" style={{ minHeight: `${48 * slotHeight}px` }}>
                {Array.from({ length: 48 }).map((_, slotIndex) => (
                    <CalendarDwViewCell key={`slot-${dateKey}-${slotIndex}`} className={cx("last:before:border-b-0", isLastDay && "before:border-r-0")} />
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
                            slotHeight={slotHeight}
                            overlapIndex={overlapIndex}
                            totalOverlapping={totalOverlapping}
                            setSelectedDate={setSelectedDate}
                            timeFormatter={timeFormatter}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export interface WeekViewProps {
    currentMonthDate: CalendarDate;
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

export const WeekView = ({
    currentMonthDate,
    selectedDate,
    zonedEvents,
    locale,
    timeZone,
    currentTime,
    setSelectedDate,
    shortWeekdayFormatter,
    timeFormatter,
    hourOnlyFormatter,
    className,
    view,
}: WeekViewProps) => {
    const currentWeekStart = startOfWeek(currentMonthDate, locale);
    const currentWeekEnd = endOfWeek(currentMonthDate, locale);
    const localCurrentTime = currentTime;
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const formatTime = (dateTime: ZonedDateTime) => timeFormatter.format(dateTime.toDate());

    const showTimeMarker =
        localCurrentTime.compare(toZoned(currentWeekStart, timeZone)) >= 0 && localCurrentTime.compare(toZoned(currentWeekEnd, timeZone).add({ days: 1 })) < 0;

    const days: CalendarDate[] = [];
    let dayIterator = currentWeekStart;
    while (dayIterator.compare(currentWeekEnd) <= 0) {
        days.push(dayIterator);
        dayIterator = dayIterator.add({ days: 1 });
    }

    const hours = Array.from({ length: 24 }, (_, i) => i);

    let timeMarkerTop = 0;
    if (showTimeMarker) {
        const startOfVisibleDay = getStartOfDay(localCurrentTime, timeZone);
        const minutesFromTop = localCurrentTime.hour * 60 + localCurrentTime.minute - (startOfVisibleDay.hour * 60 + startOfVisibleDay.minute);
        timeMarkerTop = (minutesFromTop / 30) * SLOT_HEIGHT;
    }

    const visibleEvents = zonedEvents.filter((event) => {
        const eventStartDay = toCalendarDate(event.start);
        const eventEndDay = toCalendarDate(event.end);
        return eventStartDay.compare(currentWeekEnd) <= 0 && eventEndDay.compare(currentWeekStart) >= 0;
    });

    const earliestEventTimeInWeek = useMemo(() => {
        if (visibleEvents.length === 0) {
            return toZoned(currentWeekStart, timeZone).set({ hour: 8 });
        }
        return visibleEvents.reduce((earliest, current) => {
            return current.start.compare(earliest.start) < 0 ? current : earliest;
        }).start;
    }, [visibleEvents, currentWeekStart, timeZone]);

    useLayoutEffect(() => {
        if (view === "week" && scrollContainerRef.current && earliestEventTimeInWeek) {
            const startMinutes = earliestEventTimeInWeek.hour * 60 + earliestEventTimeInWeek.minute;
            let targetScrollTop = Math.max(0, (startMinutes / 30) * SLOT_HEIGHT);
            targetScrollTop = Math.max(0, targetScrollTop - SLOT_HEIGHT);

            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = targetScrollTop;
            }
        }
    }, [view, earliestEventTimeInWeek, currentMonthDate]);

    return (
        <div className={cx("flex flex-1 flex-col overflow-auto", className)}>
            <div className="sticky top-0 z-10 grid grid-cols-7 bg-primary pl-18 shadow-sm dark:border-b dark:border-secondary">
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
                            className="cursor-pointer first:before:-left-px first:before:border-l"
                        />
                    );
                })}
            </div>

            <div ref={scrollContainerRef} className="relative flex flex-1 overflow-y-auto">
                <div className="flex h-max w-18 flex-col border-r border-secondary">
                    {hours.map((hour) => {
                        const time = new CalendarDateTime(currentWeekStart.year, currentWeekStart.month, currentWeekStart.day, hour);
                        const timeString = hourOnlyFormatter.format(toZoned(time, timeZone).toDate());
                        return <CalendarRowLabel key={`time-${hour}`}>{timeString}</CalendarRowLabel>;
                    })}
                </div>

                <div className="grid flex-1 grid-cols-7">
                    {days.map((day, index) => {
                        const isLastDay = index === days.length - 1;
                        return (
                            <WeekViewDay
                                key={day.toString()}
                                day={day}
                                isLastDay={isLastDay}
                                visibleEvents={visibleEvents}
                                timeZone={timeZone}
                                slotHeight={SLOT_HEIGHT}
                                setSelectedDate={setSelectedDate}
                                timeFormatter={timeFormatter}
                            />
                        );
                    })}
                </div>

                {showTimeMarker && <CalendarTimeMarker style={{ top: `${timeMarkerTop}px` }}>{formatTime(localCurrentTime)}</CalendarTimeMarker>}
            </div>
        </div>
    );
};
