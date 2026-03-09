import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RECURRENCE, WEEKDAY_OPTIONS } from "@/features/planner/constants";

export function AddTaskDialog({ dialogOpen, setDialogOpen, form, setForm, onAddTask }) {
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl rounded-3xl">
        <DialogHeader>
          <DialogTitle>Ajouter un bloc</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 pt-2">
          <Input
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Ex : Deep work CLUTCH"
            className="rounded-2xl"
          />
          <div className="grid sm:grid-cols-1 gap-3">
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
              className="rounded-2xl"
            />
          </div>
          <div className="grid sm:grid-cols-1 gap-3">
            <Select
              value={form.recurrence}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  recurrence: value,
                  weekDays: value === "weekly" ? prev.weekDays : [],
                }))
              }
            >
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Recurrence" />
              </SelectTrigger>
              <SelectContent>
                {RECURRENCE.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.recurrence === "weekly" ? (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Jours de repetition</p>
              <div className="grid grid-cols-4 gap-2">
                {WEEKDAY_OPTIONS.map((day) => {
                  const isActive = form.weekDays.includes(day.value);
                  return (
                    <button
                      type="button"
                      key={day.value}
                      className={`rounded-xl border px-3 py-2 text-sm transition ${
                        isActive
                          ? "border-sky-500 bg-sky-50 text-sky-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                      onClick={() => {
                        setForm((prev) => {
                          const exists = prev.weekDays.includes(day.value);
                          const nextWeekDays = exists
                            ? prev.weekDays.filter((v) => v !== day.value)
                            : [...prev.weekDays, day.value];
                          return { ...prev, weekDays: nextWeekDays.sort((a, b) => a - b) };
                        });
                      }}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500">
                Selectionne les jours voulus, ex: lun, mar, jeu, sam.
              </p>
            </div>
          ) : null}

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <Checkbox
              checked={Boolean(form.timerEnabled)}
              onCheckedChange={(checked) =>
                setForm((prev) => ({
                  ...prev,
                  timerEnabled: Boolean(checked),
                }))
              }
            />
            Ajouter un timer sur cette activite
          </label>

          <Textarea
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Contexte, objectif, ou rappel utile"
            className="rounded-2xl min-h-[120px]"
          />
          <Button onClick={onAddTask} className="rounded-2xl">
            Creer le bloc
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
