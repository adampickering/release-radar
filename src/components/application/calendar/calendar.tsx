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
