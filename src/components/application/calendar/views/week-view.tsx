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
import { Calendar as CalendarIcon } from "@untitledui/icons";
import { Avatar } from "@/components/base/avatar/avatar";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";
import { CalendarColumnHeader } from "../base-components/calendar-column-header";
import { CalendarDwViewCell } from "../base-components/calendar-dw-view-cell";
import { PositionedEvent } from "../base-components/calendar-positioned-event";
import { CalendarRowLabel } from "../base-components/calendar-row-label";
import { CalendarTimeMarker } from "../base-components/calendar-time-marker";
import { eventViewColors } from "../base-components/calendar-month-view-event";
import { type ZonedEvent, SLOT_HEIGHT, getStartOfDay, getEndOfDay, getEventsForDay, isAllDayEvent } from "../utils/calendar-helpers";

// ─── All-Day Row (week view) ────────────────────────────────────────────────

interface WeekAllDayRowProps {
    days: CalendarDate[];
    zonedEvents: ZonedEvent[];
    timeZone: string;
    onEventClick?: (eventId: string) => void;
}

const WeekAllDayRow = ({ days, zonedEvents, timeZone, onEventClick }: WeekAllDayRowProps) => {
    const allDayByDay = useMemo(() => {
        return days.map((day) => {
            const dayEvents = getEventsForDay(zonedEvents, day, timeZone);
            return dayEvents.filter(isAllDayEvent);
        });
    }, [days, zonedEvents, timeZone]);

    const hasAny = allDayByDay.some((events) => events.length > 0);
    if (!hasAny) return null;

    return (
        <div className="grid h-48 grid-cols-7 overflow-y-auto border-b border-secondary bg-secondary_subtle pl-18">
            {allDayByDay.map((events, i) => (
                <div key={days[i].toString()} className={cx("flex flex-col gap-1 border-r border-secondary px-1 py-1.5", i === 6 && "border-r-0")}>
                    {events.map((event) => (
                        <Button
                            key={event.id}
                            color="tertiary"
                            size="xs"
                            onClick={() => onEventClick?.(event.id)}
                            className={cx(
                                "!gap-1 truncate !rounded !px-1.5 !py-0.5 !text-[11px] !font-medium !ring-1 !ring-inset *:data-text:contents",
                                eventViewColors[event.color || "gray"].root,
                                eventViewColors[event.color || "gray"].label,
                            )}
                        >
                            {event.avatarUrl && <Avatar src={event.avatarUrl} alt="" size="xs" />}
                            <span className="truncate">{event.title}</span>
                        </Button>
                    ))}
                </div>
            ))}
        </div>
    );
};

// ─── Empty State ────────────────────────────────────────────────────────────

const EmptyWeekState = () => (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16">
        <CalendarIcon className="size-8 text-fg-quaternary" />
        <p className="text-sm font-medium text-tertiary">No releases this week</p>
    </div>
);

// ─── Week View Day Column ───────────────────────────────────────────────────

interface WeekViewDayProps {
    day: CalendarDate;
    isLastDay: boolean;
    visibleEvents: ZonedEvent[];
    timeZone: string;
    slotHeight: number;
    setSelectedDate: (date: CalendarDate | null) => void;
    timeFormatter: DateFormatter;
    onEventClick?: (eventId: string) => void;
}

const WeekViewDay = ({ day, isLastDay, visibleEvents, timeZone, slotHeight, setSelectedDate, timeFormatter, onEventClick }: WeekViewDayProps) => {
    const dateKey = day.toString();
    const dayEvents = useMemo(() => {
        const all = getEventsForDay(visibleEvents, day, timeZone);
        return all.filter((e) => !isAllDayEvent(e));
    }, [visibleEvents, day, timeZone]);
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
                            onEventClick={onEventClick}
                        />
                    );
                })}
            </div>
        </div>
    );
};

// ─── WeekView ───────────────────────────────────────────────────────────────

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
    onEventClick?: (eventId: string) => void;
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
    onEventClick,
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

    const hasNoEvents = visibleEvents.length === 0;
    const hasOnlyAllDay = visibleEvents.length > 0 && visibleEvents.every(isAllDayEvent);

    const earliestTimedEvent = useMemo(() => {
        const timed = visibleEvents.filter((e) => !isAllDayEvent(e));
        if (timed.length === 0) {
            return toZoned(currentWeekStart, timeZone).set({ hour: 8 });
        }
        return timed.reduce((earliest, current) => {
            return current.start.compare(earliest.start) < 0 ? current : earliest;
        }).start;
    }, [visibleEvents, currentWeekStart, timeZone]);

    useLayoutEffect(() => {
        if (view === "week" && scrollContainerRef.current && earliestTimedEvent) {
            const startMinutes = earliestTimedEvent.hour * 60 + earliestTimedEvent.minute;
            let targetScrollTop = Math.max(0, (startMinutes / 30) * SLOT_HEIGHT);
            targetScrollTop = Math.max(0, targetScrollTop - SLOT_HEIGHT);

            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = targetScrollTop;
            }
        }
    }, [view, earliestTimedEvent, currentMonthDate]);

    return (
        <div className={cx("flex flex-1 flex-col overflow-auto", className)}>
            {/* Column headers */}
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

            {/* All-day row */}
            <WeekAllDayRow days={days} zonedEvents={zonedEvents} timeZone={timeZone} onEventClick={onEventClick} />

            {/* Empty state */}
            {hasNoEvents && <EmptyWeekState />}

            {/* Time grid (only show if there are timed events) */}
            {!hasNoEvents && !hasOnlyAllDay && (
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
                                    onEventClick={onEventClick}
                                />
                            );
                        })}
                    </div>

                    {showTimeMarker && <CalendarTimeMarker style={{ top: `${timeMarkerTop}px` }}>{formatTime(localCurrentTime)}</CalendarTimeMarker>}
                </div>
            )}
        </div>
    );
};
