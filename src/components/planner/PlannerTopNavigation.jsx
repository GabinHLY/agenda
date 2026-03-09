import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { addDays, todayString } from "@/features/planner/date-utils";

export function PlannerTopNavigation({ selectedDate, setSelectedDate, weekDates }) {
  return (
    <Card className="rounded-[28px] shadow-sm border-0">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-slate-700">Navigation semaine</div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl"
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => setSelectedDate(todayString())}
            >
              Aujourd'hui
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl"
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 rounded-2xl border border-slate-100 bg-white p-2">
          {weekDates.map((date) => {
            const isActive = date === selectedDate;

            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className="rounded-xl py-2 text-center transition hover:bg-slate-50"
              >
                <div className="text-[11px] font-medium text-slate-400">{weekdayLabel(date)}</div>
                <div className={`mt-1 text-lg leading-none ${isActive ? "text-sky-500 font-semibold" : "text-slate-700"}`}>
                  {dayNumber(date)}
                </div>
                <div className="h-3 mt-1 flex items-center justify-center">
                  {isActive ? <span className="h-1 w-1 rounded-full bg-sky-500" /> : null}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function weekdayLabel(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(d);
}

function dayNumber(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.getDate();
}
