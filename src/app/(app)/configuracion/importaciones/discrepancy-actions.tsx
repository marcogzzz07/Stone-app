"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setDiscrepancyStatus, type DiscrepancyState } from "./actions";

/** Marcar como vista o resolver con una nota corta. Reabrir si fue un error. */
export function DiscrepancyActions({ id, status }: { id: string; status: string }) {
  const [state, action, pending] = useActionState<DiscrepancyState, FormData>(setDiscrepancyStatus, undefined);
  const [resolving, setResolving] = useState(false);

  if (status === "resolved") {
    return (
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="open" />
        <Button type="submit" variant="ghost" size="sm" disabled={pending}>Reabrir</Button>
      </form>
    );
  }
  if (resolving) {
    return (
      <form action={action} className="flex items-center gap-1.5">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="resolved" />
        <Input name="resolution" placeholder="Qué se decidió" required className="h-7 w-44 text-xs" autoFocus />
        <Button type="submit" size="sm" disabled={pending}>Guardar</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setResolving(false)}>Cancelar</Button>
        {state?.error && <span className="text-xs text-danger">{state.error}</span>}
      </form>
    );
  }
  return (
    <div className="flex items-center justify-end gap-1">
      {status === "open" && (
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value="acknowledged" />
          <Button type="submit" variant="ghost" size="sm" disabled={pending}>Vista</Button>
        </form>
      )}
      <Button type="button" variant="outline" size="sm" onClick={() => setResolving(true)}>Resolver</Button>
    </div>
  );
}
