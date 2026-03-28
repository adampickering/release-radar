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
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "@untitledui/icons";
import { CalendarCell } from "@/components/application/date-picker/cell";
import { Avatar } from "@/components/base/avatar/avatar";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";
import { CalendarColumnHeader } from "../base-components/calendar-column-header";
import { CalendarDwViewCell } from "../base-components/calendar-dw-view-cell";
import { PositionedEvent } from "../base-components/calendar-positioned-event";
import { CalendarRowLabel } from "../base-components/calendar-row-label";
import { CalendarTimeMarker } from "../base-components/calendar-time-marker";
import { eventViewColors } from "../base-components/calendar-month-view-event";
import { type ZonedEvent, SLOT_HEIGHT, EVENT_TYPE_LABELS, getStartOfDay, getEndOfDay, getEventsForDay, isAllDayEvent } from "../utils/calendar-helpers";

// ─── All-Day Bar ────────────────────────────────────────────────────────────

interface AllDayBarProps {
    events: ZonedEvent[];
    onEventClick?: (eventId: string) => void;
}

const AllDayBar = ({ events, onEventClick }: AllDayBarProps) => {
    if (events.length === 0) return null;

    return (
        <div className="border-b border-secondary bg-secondary_subtle px-3 py-2">
            <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-quaternary">All day</div>
            <div className="flex flex-wrap gap-1.5">
                {events.map((event) => (
                    <Button
                        key={event.id}
                        color="tertiary"
                        size="xs"
                        onClick={() => onEventClick?.(event.id)}
                        className={cx(
                            "!gap-1.5 !rounded-md !px-2 !py-1 !text-xs !font-medium !ring-1 !ring-inset *:data-text:contents",
                            eventViewColors[event.color || "gray"].root,
                            eventViewColors[event.color || "gray"].label,
                        )}
                    >
                        {event.avatarUrl && <Avatar src={event.avatarUrl} alt="" size="xs" />}
                        {event.title}
                    </Button>
                ))}
            </div>
        </div>
    );
};

// ─── Empty State ────────────────────────────────────────────────────────────

const EmptyDayState = () => (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16">
        <CalendarIcon className="size-8 text-fg-quaternary" />
        <p className="text-sm font-medium text-tertiary">No releases this day</p>
    </div>
);

// ─── Release Cards (for all-day only view) ──────────────────────────────────

interface ReleaseCardsProps {
    events: ZonedEvent[];
    onEventClick?: (eventId: string) => void;
}

const ReleaseCards = ({ events, onEventClick }: ReleaseCardsProps) => (
    <div className="flex flex-1 flex-col gap-3 overflow-auto p-4 md:p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-quaternary">
            {events.length} {events.length === 1 ? "release" : "releases"}
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
                <Button
                    key={event.id}
                    color="tertiary"
                    size="xs"
                    noTextPadding
                    onClick={() => onEventClick?.(event.id)}
                    className={cx(
                        "!items-start !gap-3 !rounded-xl !border !p-4 text-left hover:!bg-transparent hover:shadow-sm",
                        "!border-secondary !bg-primary",
                        "*:data-text:contents",
                    )}
                >
                    {event.avatarUrl && <Avatar src={event.avatarUrl} alt="" size="md" />}
                    <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                        <span className="truncate text-sm font-semibold text-primary">{event.title}</span>
                        <div className="flex items-center gap-1.5">
                            <span className={cx("size-2 rounded-full", eventViewColors[event.color || "gray"].dot)} />
                            <span className="text-xs text-tertiary">{EVENT_TYPE_LABELS[event.color || "gray"] || "Other"}</span>
                        </div>
                    </div>
                </Button>
            ))}
        </div>
    </div>
);

// ─── Mobile Single Day Grid (time grid for timed events) ────────────────────

interface MobileSingleDayGridProps {
    dayToDisplay: CalendarDate;
    dayEvents: ZonedEvent[];
    timeZone: string;
    locale: string;
    currentTime: ZonedDateTime;
    setSelectedDate: (date: CalendarDate | null) => void;
    timeFormatter: DateFormatter;
    onEventClick?: (eventId: string) => void;
    className?: string;
}

const MobileSingleDayGrid = ({ dayToDisplay, dayEvents, timeZone, setSelectedDate, timeFormatter, onEventClick, className }: MobileSingleDayGridProps) => {
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
                        onEventClick={onEventClick}
                    />
                );
            })}
        </div>
    );
};

// ─── Sidebar Release List ───────────────────────────────────────────────────

interface SidebarReleaseListProps {
    events: ZonedEvent[];
    onEventClick?: (eventId: string) => void;
}

const SidebarReleaseList = ({ events, onEventClick }: SidebarReleaseListProps) => {
    if (events.length === 0) return null;

    return (
        <div className="flex flex-col gap-1 border-t border-secondary px-6 py-4">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-quaternary">
                {events.length} {events.length === 1 ? "release" : "releases"}
            </p>
            {events.map((event) => (
                <Button
                    key={event.id}
                    color="tertiary"
                    size="xs"
                    noTextPadding
                    onClick={() => onEventClick?.(event.id)}
                    className="w-full !justify-start !gap-2 !rounded-md !px-1.5 !py-1 text-left hover:!bg-secondary *:data-text:contents"
                >
                    {event.avatarUrl && <Avatar src={event.avatarUrl} alt="" size="xs" />}
                    <span className="flex-1 truncate text-xs font-medium text-secondary">{event.title}</span>
                    <span className={cx("size-2 shrink-0 rounded-full", eventViewColors[event.color || "gray"].dot)} />
                </Button>
            ))}
        </div>
    );
};

// ─── DayView ────────────────────────────────────────────────────────────────

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
    onEventClick?: (eventId: string) => void;
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
    onEventClick,
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

    const allDayEvents = useMemo(() => visibleEvents.filter(isAllDayEvent), [visibleEvents]);
    const timedEvents = useMemo(() => visibleEvents.filter((e) => !isAllDayEvent(e)), [visibleEvents]);

    // Events for the currently selected date in the sidebar calendar
    const sidebarEvents = useMemo(() => {
        if (!selectedDate) return visibleEvents;
        return getEventsForDay(zonedEvents, selectedDate, timeZone);
    }, [zonedEvents, selectedDate, dayToDisplay, timeZone]);

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
        if (timedEvents.length === 0) {
            return toZoned(dayToDisplay, timeZone).set({ hour: 8 });
        }
        return timedEvents.reduce((earliest, current) => {
            return current.start.compare(earliest.start) < 0 ? current : earliest;
        }).start;
    }, [timedEvents, dayToDisplay, timeZone]);

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

    const hasNoEvents = visibleEvents.length === 0;
    const hasOnlyAllDay = allDayEvents.length > 0 && timedEvents.length === 0;

    return (
        <div className={cx("flex flex-1 flex-col overflow-auto", className)}>
            {/* Mobile week day headers */}
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
                <div className="flex h-full flex-1 flex-col overflow-auto">
                    {/* Empty state */}
                    {hasNoEvents && <EmptyDayState />}

                    {/* All-day only: show release cards */}
                    {hasOnlyAllDay && <ReleaseCards events={allDayEvents} onEventClick={onEventClick} />}

                    {/* Mixed: all-day bar + time grid */}
                    {!hasNoEvents && !hasOnlyAllDay && (
                        <>
                        <AllDayBar events={allDayEvents} onEventClick={onEventClick} />
                    </>
                    )}
                    {!hasNoEvents && !hasOnlyAllDay && (
                        <div ref={scrollContainerRef} className="relative flex flex-1 overflow-auto">
                            <div className="flex h-max w-14 flex-col border-r border-secondary md:w-18">
                                {hours.map((hour) => {
                                    const time = new CalendarDateTime(dayToDisplay.year, dayToDisplay.month, dayToDisplay.day, hour);
                                    const timeString = hourOnlyFormatter.format(toZoned(time, timeZone).toDate());
                                    return <CalendarRowLabel key={`time-${hour}`}>{timeString}</CalendarRowLabel>;
                                })}
                            </div>
                            <MobileSingleDayGrid
                                dayToDisplay={dayToDisplay}
                                dayEvents={timedEvents}
                                timeZone={timeZone}
                                locale={locale}
                                currentTime={currentTime}
                                setSelectedDate={setSelectedDate}
                                timeFormatter={timeFormatter}
                                onEventClick={onEventClick}
                            />
                            {showTimeMarker && <CalendarTimeMarker style={{ top: `${timeMarkerTop}px` }}>{formatTime(localCurrentTime)}</CalendarTimeMarker>}
                        </div>
                    )}
                </div>

                {/* Sidebar: mini calendar + release list */}
                <div className="sticky top-0 hidden h-full w-82 flex-col overflow-auto border-l border-secondary lg:flex">
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

                    {/* Release list for selected/current day */}
                    <SidebarReleaseList events={sidebarEvents} onEventClick={onEventClick} />
                </div>
            </div>
        </div>
    );
};
