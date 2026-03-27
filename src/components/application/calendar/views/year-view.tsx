import { useMemo, useState } from "react";
import { CalendarDate, getLocalTimeZone, toCalendarDate, today } from "@internationalized/date";
import { Grid01, List } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge } from "@/components/base/badges/badges";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { eventViewColors, type EventViewColor } from "../base-components/calendar-month-view-event";
import { type ZonedEvent, EVENT_TYPE_LABELS } from "../utils/calendar-helpers";

export interface YearViewProps {
    currentYear: number;
    zonedEvents: ZonedEvent[];
    locale: string;
    timeZone: string;
    onDayClick: (date: CalendarDate) => void;
    onMonthClick: (month: number) => void;
    onEventClick?: (eventId: string) => void;
    className?: string;
}

interface MonthData {
    month: number;
    name: string;
    events: ZonedEvent[];
    typeBreakdown: { type: EventViewColor; label: string; count: number }[];
}

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
    Object.entries(EVENT_TYPE_LABELS).map(([k, v]) => [k, `${v}s`]),
);

const TYPE_ORDER: EventViewColor[] = ["green", "purple", "orange", "blue", "gray"];

const TYPE_BADGE_COLORS: Record<string, "success" | "purple" | "orange" | "blue" | "gray"> = {
    green: "success",
    purple: "purple",
    orange: "orange",
    blue: "blue",
    gray: "gray",
};

const MAX_RELEASES_SHOWN = 5;

type YearViewLayout = "cards" | "timeline";

export const YearView = ({
    currentYear,
    zonedEvents,
    locale,
    timeZone,
    onMonthClick,
    onEventClick,
    className,
}: YearViewProps) => {
    const [layout, setLayout] = useState<YearViewLayout>("cards");
    const todayDate = today(getLocalTimeZone());
    const maxMonth = currentYear === todayDate.year ? todayDate.month : 12;

    const monthsData: MonthData[] = useMemo(() => {
        const yearStart = new CalendarDate(currentYear, 1, 1);
        const yearEnd = new CalendarDate(currentYear, 12, 31);

        const byMonth = new Map<number, ZonedEvent[]>();
        for (let m = 1; m <= maxMonth; m++) byMonth.set(m, []);

        for (const event of zonedEvents) {
            const eventDate = toCalendarDate(event.start);
            if (eventDate.compare(yearStart) >= 0 && eventDate.compare(yearEnd) <= 0) {
                const m = eventDate.month;
                if (m <= maxMonth) {
                    byMonth.get(m)!.push(event);
                }
            }
        }

        return Array.from({ length: maxMonth }, (_, i) => {
            const month = i + 1;
            const events = byMonth.get(month) || [];

            const typeCounts = new Map<EventViewColor, number>();
            for (const evt of events) {
                const color = evt.color || "gray";
                typeCounts.set(color, (typeCounts.get(color) || 0) + 1);
            }

            const typeBreakdown = TYPE_ORDER
                .filter((t) => typeCounts.has(t))
                .map((t) => ({
                    type: t,
                    label: TYPE_LABELS[t] || t,
                    count: typeCounts.get(t)!,
                }));

            const name = new Date(currentYear, month - 1, 1).toLocaleString(locale, { month: "long" });

            return { month, name, events, typeBreakdown };
        });
    }, [zonedEvents, currentYear, maxMonth, locale]);

    return (
        <div className={cx("flex flex-1 flex-col overflow-auto", className)}>
            {/* Layout toggle */}
            <div className="flex items-center justify-end px-4 pt-4 md:px-6">
                <ButtonGroup
                    selectedKeys={[layout]}
                    selectionMode="single"
                    disallowEmptySelection
                    onSelectionChange={(keys) => {
                        if (keys instanceof Set) {
                            const val = keys.values().next().value?.toString();
                            if (val === "cards" || val === "timeline") setLayout(val);
                        }
                    }}
                    size="sm"
                >
                    <ButtonGroupItem id="cards" iconLeading={Grid01} />
                    <ButtonGroupItem id="timeline" iconLeading={List} />
                </ButtonGroup>
            </div>

            <div className="flex-1 p-4 md:px-6">
                {layout === "cards" ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {monthsData.map((data) => (
                            <MonthSummaryCard
                                key={data.month}
                                data={data}
                                onMonthClick={onMonthClick}
                                onEventClick={onEventClick}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="mx-auto max-w-3xl">
                        {[...monthsData].reverse().map((data) => (
                            <MonthTimelineSection
                                key={data.month}
                                data={data}
                                locale={locale}
                                currentYear={currentYear}
                                onMonthClick={onMonthClick}
                                onEventClick={onEventClick}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Cards Layout ────────────────────────────────────────────────────────────

interface MonthSummaryCardProps {
    data: MonthData;
    onMonthClick: (month: number) => void;
    onEventClick?: (eventId: string) => void;
}

const MonthSummaryCard = ({ data, onMonthClick, onEventClick }: MonthSummaryCardProps) => {
    const { month, name, events, typeBreakdown } = data;
    const total = events.length;
    const shown = events.slice(0, MAX_RELEASES_SHOWN);
    const remaining = total - MAX_RELEASES_SHOWN;

    return (
        <div className="flex flex-col rounded-xl border border-secondary bg-primary p-4 transition duration-100 ease-linear hover:shadow-sm">
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => onMonthClick(month)}
                    className="text-sm font-semibold text-primary transition duration-100 ease-linear hover:text-brand-secondary"
                >
                    {name}
                </button>
                <span className="text-xs font-medium text-tertiary">
                    {total} {total === 1 ? "release" : "releases"}
                </span>
            </div>

            {total > 0 && (
                <div className="mt-3 flex flex-col gap-2">
                    <div className="flex h-2 w-full overflow-hidden rounded-full bg-tertiary">
                        {typeBreakdown.map((tb) => (
                            <div
                                key={tb.type}
                                className={cx("h-full", eventViewColors[tb.type].dot)}
                                style={{ width: `${(tb.count / total) * 100}%` }}
                            />
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {typeBreakdown.map((tb) => (
                            <div key={tb.type} className="flex items-center gap-1">
                                <span className={cx("size-2 rounded-full", eventViewColors[tb.type].dot)} />
                                <span className="text-[11px] text-tertiary">
                                    {tb.count} {tb.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {total > 0 && (
                <div className="mt-3 flex flex-col gap-1">
                    {shown.map((event) => (
                        <button
                            key={event.id}
                            type="button"
                            onClick={() => onEventClick?.(event.id)}
                            className="flex items-center gap-2 rounded-md px-1.5 py-1 cursor-pointer text-left transition duration-100 ease-linear hover:bg-secondary"
                        >
                            {event.avatarUrl && (
                                <Avatar src={event.avatarUrl} alt="" size="xs" />
                            )}
                            <span className="flex-1 truncate text-xs font-medium text-secondary">
                                {event.title}
                            </span>
                            <span className={cx("size-2 shrink-0 rounded-full", eventViewColors[event.color || "gray"].dot)} />
                        </button>
                    ))}
                    {remaining > 0 && (
                        <button
                            type="button"
                            onClick={() => onMonthClick(month)}
                            className="mt-1 text-left text-xs font-medium text-brand-secondary transition duration-100 ease-linear hover:text-brand-secondary_hover"
                        >
                            +{remaining} more
                        </button>
                    )}
                </div>
            )}

            {total === 0 && (
                <p className="mt-3 text-xs text-quaternary">No releases this month.</p>
            )}
        </div>
    );
};

// ─── Timeline Layout ─────────────────────────────────────────────────────────

interface MonthTimelineSectionProps {
    data: MonthData;
    locale: string;
    currentYear: number;
    onMonthClick: (month: number) => void;
    onEventClick?: (eventId: string) => void;
}

const MonthTimelineSection = ({ data, locale, currentYear, onMonthClick, onEventClick }: MonthTimelineSectionProps) => {
    const { month, name, events, typeBreakdown } = data;
    const total = events.length;

    // Group events by date within this month
    const eventsByDate = useMemo(() => {
        const groups: { dateLabel: string; events: ZonedEvent[] }[] = [];
        const dateMap = new Map<string, ZonedEvent[]>();
        const dateOrder: string[] = [];

        for (const event of events) {
            const dateKey = toCalendarDate(event.start).toString();
            if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, []);
                dateOrder.push(dateKey);
            }
            dateMap.get(dateKey)!.push(event);
        }

        for (const dateKey of dateOrder) {
            const evts = dateMap.get(dateKey)!;
            const d = new Date(currentYear, month - 1, Number.parseInt(dateKey.split("-")[2]));
            const dateLabel = d.toLocaleDateString(locale, { weekday: "short", month: "short", day: "numeric" });
            groups.push({ dateLabel, events: evts });
        }

        return groups;
    }, [events, locale, currentYear, month]);

    return (
        <div className="relative mb-8 last:mb-0">
            {/* Month header */}
            <div className="sticky top-0 z-10 flex items-center gap-3 bg-primary pb-3">
                <button
                    type="button"
                    onClick={() => onMonthClick(month)}
                    className="text-base font-semibold text-primary transition duration-100 ease-linear hover:text-brand-secondary"
                >
                    {name}
                </button>
                <span className="text-xs font-medium text-tertiary">
                    {total} {total === 1 ? "release" : "releases"}
                </span>
                <div className="flex gap-1.5">
                    {typeBreakdown.map((tb) => (
                        <Badge key={tb.type} size="sm" color={TYPE_BADGE_COLORS[tb.type] || "gray"} type="pill-color">
                            {tb.count} {tb.label}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Timeline line */}
            <div className="relative border-l-2 border-secondary pl-6">
                {eventsByDate.map((group) => (
                    <div key={group.dateLabel} className="relative mb-4 last:mb-0">
                        {/* Date dot on the timeline */}
                        <div className="absolute -left-[31px] top-0.5 size-3.5 rounded-full border-2 border-secondary bg-primary" />

                        {/* Date label */}
                        <p className="mb-1.5 text-xs font-medium text-tertiary">{group.dateLabel}</p>

                        {/* Releases for this date */}
                        <div className="flex flex-col gap-1">
                            {group.events.map((event) => (
                                <button
                                    key={event.id}
                                    type="button"
                                    onClick={() => onEventClick?.(event.id)}
                                    className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 cursor-pointer text-left transition duration-100 ease-linear hover:bg-secondary"
                                >
                                    {event.avatarUrl && (
                                        <Avatar src={event.avatarUrl} alt="" size="xs" />
                                    )}
                                    <span className="flex-1 truncate text-sm font-medium text-secondary">
                                        {event.title}
                                    </span>
                                    <span className={cx("size-2 shrink-0 rounded-full", eventViewColors[event.color || "gray"].dot)} />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
