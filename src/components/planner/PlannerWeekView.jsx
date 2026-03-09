import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDisplayDate, todayString } from "@/features/planner/date-utils";

export function PlannerWeekView({ weekGroupedTasks, onOpenDay, scopeLabel }) {
  return (
    <Card className="rounded-[28px] shadow-sm border-0">
      <CardHeader>
        <CardTitle className="text-2xl">Vue semaine - {scopeLabel}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {weekGroupedTasks.map(({ date, tasks }) => (
          <div key={date} className="rounded-3xl border border-slate-200 p-4 bg-white">
            <div className="flex items-center justify-between gap-4">
              <button onClick={() => onOpenDay(date)} className="text-left">
                <div className="text-lg font-medium capitalize">{formatDisplayDate(date)}</div>
                <div className="text-sm text-slate-500">{tasks.filter((t) => !t.completed).length} actif(s)</div>
              </button>
              {date === todayString() && <Badge className="rounded-xl">Aujourd'hui</Badge>}
            </div>
            <Separator className="my-4" />
            {tasks.length === 0 ? (
              <p className="text-sm text-slate-500">Aucun bloc prevu.</p>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
                    <div className="min-w-0">
                      <div className={`font-medium truncate ${task.completed ? "line-through text-slate-400" : ""}`}>
                        {task.title}
                      </div>
                    </div>
                  </div>
                ))}
                {tasks.length > 5 && <p className="text-xs text-slate-500">+ {tasks.length - 5} autre(s)</p>}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
