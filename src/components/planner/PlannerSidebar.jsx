import React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatShortDate } from "@/features/planner/date-utils";

export function PlannerSidebar({
  stats,
  overdueTasks,
  onMoveTaskToToday,
}) {
  return (
    <div className="space-y-6">
      <Card className="rounded-[28px] shadow-sm border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Tableau de bord</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <StatBlock label="Total" value={stats.total} />
            <StatBlock label="Faits" value={stats.completed} />
            <StatBlock label="Actifs" value={stats.active} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[28px] shadow-sm border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <RotateCcw className="w-5 h-5" /> En retard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {overdueTasks.length === 0 ? (
            <p className="text-sm text-slate-500">Rien a rattraper. Pour une fois, c'est propre.</p>
          ) : (
            overdueTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="rounded-2xl border border-slate-200 p-3 bg-white">
                <div className="font-medium">{task.title}</div>
                <div className="text-xs text-slate-500 mt-1">{formatShortDate(task.date)}</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl mt-3"
                  onClick={() => onMoveTaskToToday(task.id)}
                >
                  Deplacer a aujourd'hui
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatBlock({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-100 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
    </div>
  );
}
