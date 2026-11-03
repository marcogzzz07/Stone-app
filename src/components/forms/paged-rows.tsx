"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

/**
 * Tabla paginada (DataTable.md: más de 15 filas → paginación). Recibe el
 * encabezado y las filas ya renderizadas en el servidor; aquí solo se
 * muestran de 20 en 20 con Anterior / Siguiente.
 */
export function PagedTable({
  header,
  rows,
  pageSize = 20,
  empty,
  columns,
}: {
  header: ReactNode;
  rows: ReactNode[];
  pageSize?: number;
  empty: string;
  columns: number;
}) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pages - 1);
  const slice = rows.slice(current * pageSize, (current + 1) * pageSize);
  return (
    <>
      <Table>
        {header}
        <TableBody>
          {slice}
          {rows.length === 0 && (
            <TableRow><TableCell colSpan={columns} className="py-8 text-center text-ink-3">{empty}</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
      {rows.length > pageSize && (
        <div className="flex items-center justify-between border-t px-4 py-2 text-[13px] text-ink-2">
          <span className="tnum">
            {current * pageSize + 1}–{Math.min(rows.length, (current + 1) * pageSize)} de {rows.length}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={current === 0} onClick={() => setPage(current - 1)}>
              <ChevronLeft /> Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
              Siguiente <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
