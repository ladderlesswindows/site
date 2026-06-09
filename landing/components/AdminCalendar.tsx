"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: Record<string, unknown>;
  backgroundColor: string;
};

type AdminCalendarProps = {
  events: CalendarEvent[];
  onEventDrop: (info: { event: { id: string; start: Date | null }; revert: () => void }) => void;
  onEventClick: (info: {
    event: {
      start: Date | null;
      end: Date | null;
      extendedProps: Record<string, unknown>;
    };
  }) => void;
  onSelect: (selectInfo: { startStr: string }) => void;
};

export function AdminCalendar({
  events,
  onEventDrop,
  onEventClick,
  onSelect,
}: AdminCalendarProps) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      }}
      editable
      droppable
      selectable
      select={onSelect}
      events={events}
      eventDrop={onEventDrop}
      eventClick={onEventClick}
      height="auto"
      slotMinTime="06:00:00"
      slotMaxTime="21:00:00"
      nowIndicator
      eventTimeFormat={{
        hour: "numeric",
        minute: "2-digit",
        meridiem: "short",
      }}
    />
  );
}