import { useEffect, useMemo, useState } from "react";
import {
    CalendarDate,
    getLocalTimeZone,
    now,
    parseAbsoluteToLocal,
    startOfWeek,
    today,
} from "@internationalized/date";
import { useDateFormatter, useLocale } from "@react-aria/i18n";
import { cx } from "@/utils/cx";
import { CalendarHeader } from "./base-components/calendar-header";
import type { EventViewColor } from "./base-components/calendar-month-view-event";
import type { ViewOption } from "./base-components/calendar-view-dropdown";
import { DayView } from "./views/day-view";
import { MonthView } from "./views/month-view";
import { WeekView } from "./views/week-view";
import { YearView } from "./views/year-view";

export type CalendarEvent = {
    id: string;
    title: string;
    start: Date;
    end: Date;
    color?: EventViewColor;
    dot?: boolean;
    avatarUrl?: string;
    showTime?: boolean;
};

const viewOptions: ViewOption[] = [
    { value: "day", label: "Day view", addon: "D" },
    { value: "week", label: "Week view", addon: "W" },
    { value: "month", label: "Month view", addon: "M" },
    { value: "year", label: "Year to date", addon: "Y" },
];

const getStartOfDay = (date: ZonedDateTime | CalendarDate, timeZone: string): ZonedDateTime => {
    const zoned = date instanceof CalendarDate ? toZoned(date, timeZone) : date;

    return zoned.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
};

const getEndOfDay = (date: ZonedDateTime | CalendarDate, timeZone: string): ZonedDateTime => {
    const zoned = date instanceof CalendarDate ? toZoned(date, timeZone) : date;

    return zoned.set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
};

const getDaysInVisibleMonthGrid = (anchorDate: CalendarDate, locale: string): CalendarDate[] => {
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

const getEventsForDay = (allEvents: ZonedEvent[], targetDate: CalendarDate, timeZone: string): ZonedEvent[] => {
    const dayStart = getStartOfDay(targetDate, timeZone);
    const dayEnd = getEndOfDay(targetDate, timeZone);

    return allEvents
        .filter((event) => {
            // Check if event interval overlaps with the day interval
            return event.start.compare(dayEnd) < 0 && event.end.compare(dayStart) > 0;
        })
        .sort((a, b) => a.start.compare(b.start));
};

interface PositionedEventProps {
    event: ZonedEvent;
    dayStart: ZonedDateTime; // Start of the day the event is being rendered in
    timeZone: string;
    slotHeight: number;
    overlapIndex: number;
    totalOverlapping: number; // To potentially calculate width more dynamically later
    setSelectedDate: (date: CalendarDate) => void;
    timeFormatter: DateFormatter;
}

const PositionedEvent = ({ event, dayStart, timeZone, slotHeight, overlapIndex, setSelectedDate, timeFormatter }: PositionedEventProps) => {
    const formatTime = (dateTime: ZonedDateTime) => timeFormatter.format(dateTime.toDate());

    const startZoned = event.start;
    const endZoned = event.end;

    // Clamp event start/end times to the visible day boundaries for height calculation
    const dayEnd = getEndOfDay(dayStart, timeZone); // Calculate dayEnd based on dayStart
    const clampedStart = startZoned.compare(dayStart) < 0 ? dayStart : startZoned;
    const clampedEnd = endZoned.compare(dayEnd) > 0 ? dayEnd : endZoned;

    const startMinutes = clampedStart.hour * 60 + clampedStart.minute;
    const endMinutes = clampedEnd.hour * 60 + clampedEnd.minute;
    const durationMinutes = Math.max(15, endMinutes - startMinutes);

    // Position based on 30-min slots (slotHeight = 24px)
    const top = (startMinutes / 30) * slotHeight;
    const height = Math.max(slotHeight / 2, (durationMinutes / 30) * slotHeight); // Min height 15min

    // Basic overlap handling - simple horizontal offset
    // const horizontalOffset = overlapIndex * 10;
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
    currentTime: ZonedDateTime; // For time marker
    setSelectedDate: (date: CalendarDate | null) => void;
    timeFormatter: DateFormatter;
    className?: string;
}

const MobileSingleDayGrid = ({ dayToDisplay, dayEvents, timeZone, setSelectedDate, timeFormatter, className }: MobileSingleDayGridProps) => {
    const dayStart = useMemo(() => getStartOfDay(dayToDisplay, timeZone), [dayToDisplay, timeZone]); // Calculate once

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

interface WeekViewProps {
    currentMonthDate: CalendarDate; // Anchor date for the week
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

const WeekView = ({
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

    // Calculate earliest event time for the entire week or default to 8 AM
    const earliestEventTimeInWeek = useMemo(() => {
        if (visibleEvents.length === 0) {
            // Default scroll target: 8 AM of the week start day
            return toZoned(currentWeekStart, timeZone).set({ hour: 8 });
        }
        // Find the earliest start time across all visible events in the week
        return visibleEvents.reduce((earliest, current) => {
            return current.start.compare(earliest.start) < 0 ? current : earliest;
        }).start;
    }, [visibleEvents, currentWeekStart, timeZone]);

    // Effect to scroll to the earliest event - Use useLayoutEffect
    useLayoutEffect(() => {
        // Only scroll if the view is 'week' and the ref is attached
        if (view === "week" && scrollContainerRef.current && earliestEventTimeInWeek) {
            const startMinutes = earliestEventTimeInWeek.hour * 60 + earliestEventTimeInWeek.minute;
            // Calculate target scroll, ensuring it's not negative
            let targetScrollTop = Math.max(0, (startMinutes / 30) * SLOT_HEIGHT);

            // Optional: Add an offset
            targetScrollTop = Math.max(0, targetScrollTop - SLOT_HEIGHT);

            // No need for setTimeout with useLayoutEffect for initial scroll
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = targetScrollTop;
            }
        }
        // Dependency array includes view and earliestEventTimeInWeek
        // currentMonthDate determines the week, which affects earliestEventTimeInWeek calculation
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
                {/* Time Gutter */}
                <div className="flex h-max w-18 flex-col border-r border-secondary">
                    {hours.map((hour) => {
                        const time = new CalendarDateTime(currentWeekStart.year, currentWeekStart.month, currentWeekStart.day, hour);
                        const timeString = hourOnlyFormatter.format(toZoned(time, timeZone).toDate());
                        return <CalendarRowLabel key={`time-${hour}`}>{timeString}</CalendarRowLabel>;
                    })}
                </div>

                {/* Desktop View: 7-Day Grid */}
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

                {/* Current Time Marker - Moved inside scroll container */}
                {showTimeMarker && <CalendarTimeMarker style={{ top: `${timeMarkerTop}px` }}>{formatTime(localCurrentTime)}</CalendarTimeMarker>}
            </div>
        </div>
    );
};

interface DayViewProps {
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

const DayView = ({
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
            // Iterate through each day the event spans
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

    // Calculate earliest event time or default to 8 AM
    const earliestEventTime = useMemo(() => {
        if (visibleEvents.length === 0) {
            // Default scroll target: 8 AM of the displayed day
            return toZoned(dayToDisplay, timeZone).set({ hour: 8 });
        }
        // Find the earliest start time among visible events
        return visibleEvents.reduce((earliest, current) => {
            return current.start.compare(earliest.start) < 0 ? current : earliest;
        }).start;
    }, [visibleEvents, dayToDisplay, timeZone]);

    // Effect to scroll to the earliest event - Use useLayoutEffect
    useLayoutEffect(() => {
        // Only scroll if the view is 'day' and the ref is attached
        if (view === "day" && scrollContainerRef.current && earliestEventTime) {
            const startMinutes = earliestEventTime.hour * 60 + earliestEventTime.minute;
            // Calculate target scroll, ensuring it's not negative
            let targetScrollTop = Math.max(0, (startMinutes / 30) * SLOT_HEIGHT);

            // Optional: Add an offset to show some context before the first event (e.g., scroll up by one slot height)
            targetScrollTop = Math.max(0, targetScrollTop - SLOT_HEIGHT);

            // No need for setTimeout with useLayoutEffect for initial scroll
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = targetScrollTop;
            }
        }
        // Dependency array includes view, earliestEventTime, and dayToDisplay to re-trigger on changes
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

interface CalendarProps {
    events: CalendarEvent[];
    view?: "month" | "week" | "day" | "year";
    className?: string;
    onEventClick?: (eventId: string) => void;
    hideSearch?: boolean;
    hideAddEvent?: boolean;
}

export const Calendar = ({ events, view: defaultView = "month", className, onEventClick, hideSearch, hideAddEvent }: CalendarProps) => {
    const { locale } = useLocale();
    const timeZone = useMemo(() => getLocalTimeZone(), []);

    const timeFormatter = useDateFormatter({ hour: "numeric", minute: "2-digit", hour12: true });
    const shortWeekdayFormatter = useDateFormatter({ weekday: "short" });
    const fullDateFormatter = useDateFormatter({ weekday: "long", month: "long", day: "numeric", year: "numeric" });
    const hourOnlyFormatter = useDateFormatter({ hour: "numeric", hour12: true });

    const [currentMonthDate, setCurrentMonthDate] = useState(() => today(timeZone));
    const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(currentMonthDate);
    const [view, setView] = useState<string>(defaultView);

    // Sync view when the parent forces a different view via prop
    useEffect(() => {
        if (defaultView) setView(defaultView);
    }, [defaultView]);
    const [currentTime, setCurrentTime] = useState(() => now(timeZone));
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(now(timeZone));
        }, 60000);
        return () => clearInterval(intervalId);
    }, [timeZone]);

    const zonedEvents = useMemo(() => {
        return events.map((event) => ({
            ...event,
            start: parseAbsoluteToLocal(event.start.toISOString()),
            end: parseAbsoluteToLocal(event.end.toISOString()),
        }));
    }, [events]);

    const headerDate = useMemo(() => {
        if (view === "year") {
            const now = new Date();
            return currentMonthDate.year === now.getFullYear() ? now : new Date(currentMonthDate.year, 0, 1);
        }
        return view === "day" && selectedDate ? selectedDate.toDate(timeZone) : currentMonthDate.toDate(timeZone);
    }, [view, selectedDate, currentMonthDate, timeZone]);

    const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
        let newDate: CalendarDate;
        const anchorDate = selectedDate || currentMonthDate;

        if (action === "TODAY") {
            newDate = today(timeZone);
        } else {
            const P = action === "PREV" ? -1 : 1;
            switch (view) {
                case "year":
                    newDate = new CalendarDate(currentMonthDate.year + P, 1, 1);
                    break;
                case "month":
                    newDate = currentMonthDate.add({ months: P });
                    break;
                case "week": {
                    const currentWeekStart = startOfWeek(anchorDate, locale);
                    newDate = currentWeekStart.add({ weeks: P });
                    break;
                }
                case "day":
                    newDate = anchorDate.add({ days: P });
                    break;
                default:
                    newDate = currentMonthDate;
            }
        }
        // Don't navigate into the future
        const todayDate = today(timeZone);
        if (newDate.compare(todayDate) > 0) {
            newDate = todayDate;
        }

        setCurrentMonthDate(newDate);
        if (action === "TODAY" || view === "day") {
            setSelectedDate(newDate);
        } else {
            setSelectedDate(null);
        }
    };

    // Keyboard shortcuts (single-key, like Google Calendar)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Skip if user is typing in an input/textarea or using a modifier
            const target = e.target as HTMLElement;
            if (e.metaKey || e.ctrlKey || e.altKey || target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

            switch (e.key.toLowerCase()) {
                case "d":
                    setView("day");
                    break;
                case "w":
                    setView("week");
                    break;
                case "m":
                    setView("month");
                    break;
                case "y":
                    setView("year");
                    break;
                case "t":
                    handleNavigate("TODAY");
                    break;
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const dayToDisplay = selectedDate || currentMonthDate;

    // Disable "next" when at current period
    const todayDate = today(timeZone);
    const isNextDisabled = useMemo(() => {
        const anchor = selectedDate || currentMonthDate;
        switch (view) {
            case "day":
                return anchor.compare(todayDate) >= 0;
            case "week": {
                const weekStart = startOfWeek(anchor, locale);
                const todayWeekStart = startOfWeek(todayDate, locale);
                return weekStart.compare(todayWeekStart) >= 0;
            }
            case "month":
                return currentMonthDate.year === todayDate.year && currentMonthDate.month === todayDate.month;
            case "year":
                return currentMonthDate.year >= todayDate.year;
            default:
                return false;
        }
    }, [view, currentMonthDate, selectedDate, todayDate, locale]);

    if (!isMounted) return null;

    return (
        <div
            role="application"
            aria-label="Calendar"
            className={cx(
                "flex flex-col overflow-hidden rounded-xl bg-primary shadow-xs ring ring-secondary",
                view === "month" ? "h-full md:min-h-[912px]" : view === "year" ? "h-full" : "h-[912px]",
                className,
            )}
        >
            <CalendarHeader
                date={headerDate}
                selectedView={view}
                onSelectionChange={setView}
                viewOptions={viewOptions}
                onClickPrev={() => handleNavigate("PREV")}
                onClickNext={() => handleNavigate("NEXT")}
                onClickToday={() => handleNavigate("TODAY")}
                isNextDisabled={isNextDisabled}
                hideSearch={hideSearch}
                hideAddEvent={hideAddEvent}
            />
            <main className="flex flex-1 overflow-hidden">
                {view === "month" && (
                    <MonthView
                        currentMonthDate={currentMonthDate}
                        selectedDate={selectedDate}
                        zonedEvents={zonedEvents}
                        locale={locale}
                        timeZone={timeZone}
                        setSelectedDate={setSelectedDate}
                        fullDateFormatter={fullDateFormatter}
                        shortWeekdayFormatter={shortWeekdayFormatter}
                        timeFormatter={timeFormatter}
                        onEventClick={onEventClick}
                        onDayClick={(date) => {
                            setSelectedDate(date);
                            setCurrentMonthDate(date);
                            setView("day");
                        }}
                        hideAddButton={hideAddEvent}
                    />
                )}
                {view === "week" && (
                    <>
                        <DayView
                            dayToDisplay={dayToDisplay}
                            selectedDate={selectedDate}
                            zonedEvents={zonedEvents}
                            locale={locale}
                            timeZone={timeZone}
                            currentTime={currentTime}
                            setSelectedDate={setSelectedDate}
                            shortWeekdayFormatter={shortWeekdayFormatter}
                            timeFormatter={timeFormatter}
                            hourOnlyFormatter={hourOnlyFormatter}
                            onEventClick={onEventClick}
                            view={view}
                            className="md:hidden"
                        />

                        <WeekView
                            currentMonthDate={currentMonthDate}
                            selectedDate={selectedDate}
                            zonedEvents={zonedEvents}
                            locale={locale}
                            timeZone={timeZone}
                            currentTime={currentTime}
                            setSelectedDate={setSelectedDate}
                            shortWeekdayFormatter={shortWeekdayFormatter}
                            timeFormatter={timeFormatter}
                            hourOnlyFormatter={hourOnlyFormatter}
                            onEventClick={onEventClick}
                            view={view}
                            className="max-md:hidden"
                        />
                    </>
                )}
                {view === "day" && (
                    <DayView
                        dayToDisplay={dayToDisplay}
                        selectedDate={selectedDate}
                        zonedEvents={zonedEvents}
                        locale={locale}
                        timeZone={timeZone}
                        currentTime={currentTime}
                        setSelectedDate={setSelectedDate}
                        shortWeekdayFormatter={shortWeekdayFormatter}
                        timeFormatter={timeFormatter}
                        hourOnlyFormatter={hourOnlyFormatter}
                        onEventClick={onEventClick}
                        view={view}
                    />
                )}
                {view === "year" && (
                    <YearView
                        currentYear={currentMonthDate.year}
                        zonedEvents={zonedEvents}
                        locale={locale}
                        timeZone={timeZone}
                        onDayClick={(date) => {
                            setSelectedDate(date);
                            setCurrentMonthDate(date);
                            setView("day");
                        }}
                        onMonthClick={(month) => {
                            setCurrentMonthDate(new CalendarDate(currentMonthDate.year, month, 1));
                            setView("month");
                        }}
                        onEventClick={onEventClick}
                    />
                )}
            </main>
        </div>
    );
};
