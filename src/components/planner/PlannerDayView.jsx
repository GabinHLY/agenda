import React from "react";
import { Pause, Play, StickyNote, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RECURRENCE } from "@/features/planner/constants";
import { formatDisplayDate } from "@/features/planner/date-utils";

export function PlannerDayView({
  selectedDate,
  tasks,
  selectedNote,
  scopeLabel,
  onToggleTask,
  onDeleteTask,
  onToggleTimer,
  onResetTimer,
  onClearCompleted,
  onUpdateNote,
}) {
  return (
    <>
      <Card className="rounded-[28px] shadow-sm border-0">
        <CardHeader className="pb-3 flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl capitalize">{formatDisplayDate(selectedDate)}</CardTitle>
            <p className="text-slate-500 mt-2">
              Tu n'as pas besoin de 20 taches. Tu as besoin d'en finir quelques-unes.
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-2">Planning {scopeLabel}</p>
          </div>
          <Button variant="outline" className="rounded-2xl" onClick={onClearCompleted}>
            Nettoyer les terminees
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center bg-slate-50">
              <p className="text-lg font-medium">Rien de prevu</p>
              <p className="text-slate-500 mt-2">Soit tu es libre, soit tu pilotes ta journee au hasard.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`rounded-3xl border p-4 md:p-5 transition ${
                  task.completed ? "bg-slate-50 border-slate-200 opacity-70" : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <Checkbox checked={task.completed} onCheckedChange={() => onToggleTask(task.id)} className="mt-1" />
                    <div className="min-w-0">
                      <div
                        className={`text-lg font-medium ${
                          task.completed ? "line-through text-slate-500" : "text-slate-900"
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {task.recurrence !== "none" && (
                          <Badge
                            variant="outline"
                            className="rounded-xl px-2.5 py-1 bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {RECURRENCE.find((r) => r.value === task.recurrence)?.label}
                          </Badge>
                        )}

                        {task.timerEnabled ? (
                          <Badge variant="outline" className="rounded-xl px-2.5 py-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                            Timer {formatDuration(task.elapsedTimerSeconds || 0)}
                          </Badge>
                        ) : null}
                      </div>

                      {task.timerEnabled ? (
                        <div className="mt-3 flex items-center gap-2">
                          <Button
                            size="sm"
                            className="rounded-xl"
                            onClick={() => onToggleTimer(task.id)}
                            disabled={task.completed}
                          >
                            {task.timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            {task.timerRunning ? "Pause" : "Demarrer"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => onResetTimer(task.id)}
                            disabled={task.completed && !task.elapsedTimerSeconds}
                          >
                            Reset
                          </Button>
                        </div>
                      ) : null}

                      {task.notes && <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap">{task.notes}</p>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl shrink-0"
                    onClick={() => onDeleteTask(task.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="rounded-[28px] shadow-sm border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <StickyNote className="w-5 h-5" /> Notes du jour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={selectedNote}
            onChange={(e) => onUpdateNote(e.target.value)}
            placeholder="Ce qui compte aujourd'hui, ce que tu dois eviter, ou le plan minimal a respecter."
            className="rounded-3xl min-h-[180px]"
          />
        </CardContent>
      </Card>
    </>
  );
}

function formatDuration(totalSeconds) {
  const safe = Math.max(0, Number(totalSeconds || 0));
  const h = Math.floor(safe / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((safe % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(safe % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
}
