import type { CalendarDate, ZonedDateTime } from "@internationalized/date";
import type { DateFormatter } from "@react-aria/i18n";
import { CalendarDwViewEvent } from "./calendar-dw-view-event";
import { type ZonedEvent, getEndOfDay } from "../utils/calendar-helpers";

export interface PositionedEventProps {
    event: ZonedEvent;
    dayStart: ZonedDateTime;
    timeZone: string;
    slotHeight: number;
    overlapIndex: number;
    totalOverlapping: number;
    setSelectedDate: (date: CalendarDate | null) => void;
    timeFormatter: DateFormatter;
    onEventClick?: (eventId: string) => void;
}

export const PositionedEvent = ({ event, dayStart, timeZone, slotHeight, overlapIndex, timeFormatter, onEventClick }: PositionedEventProps) => {
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
            onClick={() => onEventClick?.(event.id)}
        >
            <CalendarDwViewEvent label={event.title} supportingText={supportingText} color={event.color} withDot={event.dot} />
        </div>
    );
};
