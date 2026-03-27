import { useMemo } from "react";
import {
    CalendarDate,
    endOfMonth,
    endOfWeek,
    isToday as isDateToday,
    isSameMonth,
    startOfMonth,
    startOfWeek,
    today,
} from "@internationalized/date";
import { cx } from "@/utils/cx";
import { eventViewColors, type EventViewColor } from "./calendar-month-view-event";
import type { ZonedEvent } from "../utils/calendar-helpers";

interface CalendarYearMiniMonthProps {
    year: number;
    month: number; // 1-12
    locale: string;
    timeZone: string;
    eventsByDate: Map<string, ZonedEvent[]>;
    onDayClick: (date: CalendarDate) => void;
    onMonthClick: (month: number) => void;
}

export const CalendarYearMiniMonth = ({
    year,
    month,
    locale,
    timeZone,
    eventsByDate,
    onDayClick,
    onMonthClick,
}: CalendarYearMiniMonthProps) => {
    const anchorDate = new CalendarDate(year, month, 1);
    const todayDate = today(timeZone);

    const monthName = useMemo(() => {
        return new Date(year, month - 1, 1).toLocaleString(locale, { month: "long" });
    }, [year, month, locale]);

    const weekdays = useMemo(() => {
        const firstDay = startOfWeek(todayDate, locale);
        return Array.from({ length: 7 }).map((_, i) => {
            const d = firstDay.add({ days: i });
            return new Date(d.year, d.month - 1, d.day).toLocaleString(locale, { weekday: "narrow" });
        });
    }, [locale, todayDate]);

    const days = useMemo(() => {
        const mStart = startOfMonth(anchorDate);
        const mEnd = endOfMonth(anchorDate);
        const wStart = startOfWeek(mStart, locale);
        const wEnd = endOfWeek(mEnd, locale);

        const result: CalendarDate[] = [];
        let day = wStart;
        while (day.compare(wEnd) <= 0) {
            result.push(day);
            day = day.add({ days: 1 });
        }
        return result;
    }, [anchorDate, locale]);

    return (
        <div className="flex flex-col gap-2">
            {/* Month heading */}
            <button
                type="button"
                onClick={() => onMonthClick(month)}
                className="text-left text-sm font-semibold text-primary transition duration-100 ease-linear hover:text-brand-secondary"
            >
                {monthName}
            </button>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-0">
                {weekdays.map((wd, i) => (
                    <div key={i} className="flex size-7 items-center justify-center text-[10px] font-medium text-quaternary">
                        {wd}
                    </div>
                ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-0">
                {days.map((date) => {
                    const dateKey = date.toString();
                    const isCurrentMonth = isSameMonth(date, anchorDate);
                    const isTodayFlag = isDateToday(date, timeZone);
                    const dayEvents = eventsByDate.get(dateKey) || [];
                    const hasEvents = dayEvents.length > 0;

                    return (
                        <button
                            key={dateKey}
                            type="button"
                            onClick={() => hasEvents && onDayClick(date)}
                            className={cx(
                                "flex flex-col items-center justify-center rounded-md py-0.5",
                                "size-7 text-[11px]",
                                isCurrentMonth ? "text-secondary" : "text-quaternary opacity-30",
                                isTodayFlag && "bg-brand-solid text-white font-semibold",
                                hasEvents && isCurrentMonth && !isTodayFlag && "cursor-pointer hover:bg-secondary",
                                !hasEvents && "cursor-default",
                            )}
                        >
                            <span>{date.day}</span>
                            {hasEvents && isCurrentMonth && (
                                <div className="flex gap-px mt-px">
                                    {dayEvents.slice(0, 3).map((evt, i) => (
                                        <span
                                            key={i}
                                            className={cx(
                                                "size-1 rounded-full",
                                                eventViewColors[evt.color || "gray"].dot,
                                            )}
                                        />
                                    ))}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
