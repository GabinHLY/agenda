import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddTaskDialog } from "@/components/planner/AddTaskDialog";
import { Button } from "@/components/ui/button";
import plannerMark from "@/assets/planner-mark.svg";

export function PlannerHeader({
  user,
  view,
  setView,
  plannerScope,
  setPlannerScope,
  sharing,
  onLogout,
  dialogOpen,
  setDialogOpen,
  form,
  setForm,
  onAddTask,
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Planner MVP</p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight flex items-center gap-3">
          <img src={plannerMark} alt="Planner mark" className="w-9 h-9" />
          Ton agenda, sans le gras inutile
        </h1>
        <p className="text-slate-600 mt-2 max-w-2xl">
          Jour, semaine, priorites, recurrences simples, notes du jour. Pas d'excuse. Pas de bazar.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={plannerScope} onValueChange={setPlannerScope}>
          <TabsList className="rounded-2xl">
            <TabsTrigger value="personal">Perso</TabsTrigger>
            <TabsTrigger value="shared">Partage</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={view} onValueChange={setView}>
          <TabsList className="rounded-2xl">
            <TabsTrigger value="day">Jour</TabsTrigger>
            <TabsTrigger value="week">Semaine</TabsTrigger>
          </TabsList>
        </Tabs>

        {plannerScope === "shared" && sharing?.code ? (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-700">
            Code partage: <span className="font-semibold tracking-wide">{sharing.code}</span>
          </div>
        ) : null}

        <AddTaskDialog
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          form={form}
          setForm={setForm}
          onAddTask={onAddTask}
        />

        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
          <p className="text-sm text-slate-600 max-w-[180px] truncate">{user?.name || user?.email}</p>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={onLogout}>
            Deconnexion
          </Button>
        </div>
      </div>
    </div>
  );
}
