import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function PlannerSharedSpaceCard({
  sharing,
  canUseShared,
  loading,
  error,
  success,
  onCreate,
  onJoin,
  onLeave,
}) {
  const [spaceName, setSpaceName] = useState("Planning de l'equipe");
  const [inviteCode, setInviteCode] = useState("");

  if (canUseShared && sharing) {
    return (
      <Card className="rounded-[28px] shadow-sm border-0 bg-sky-50/80 border-sky-100">
        <CardHeader>
          <CardTitle className="text-xl">Planning partage actif</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <p>
            Espace: <span className="font-medium">{sharing.name}</span>
          </p>
          <p>
            Code d'invitation: <span className="font-semibold tracking-wide">{sharing.code}</span>
          </p>
          <p>
            Membres: {Array.isArray(sharing.members) ? sharing.members.map((member) => member.name).join(", ") : "-"}
          </p>
          <div className="pt-2">
            <Button variant="outline" className="rounded-2xl" disabled={loading} onClick={onLeave}>
              Quitter l'espace partage
            </Button>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[28px] shadow-sm border-0">
      <CardHeader>
        <CardTitle className="text-xl">Activer un planning partage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-slate-600">Creer un espace et envoyer le code a ton pote.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              placeholder="Nom du planning partage"
              className="rounded-2xl"
            />
            <Button className="rounded-2xl" disabled={loading} onClick={() => onCreate(spaceName)}>
              Creer
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-slate-600">Ou rejoins un espace existant avec un code.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Code ex: AB12CD"
              className="rounded-2xl uppercase"
            />
            <Button variant="outline" className="rounded-2xl" disabled={loading} onClick={() => onJoin(inviteCode)}>
              Rejoindre
            </Button>
          </div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
      </CardContent>
    </Card>
  );
}
