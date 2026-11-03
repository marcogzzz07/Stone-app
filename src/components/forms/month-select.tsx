"use client";

import { useRouter } from "next/navigation";
import { NativeSelect } from "@/components/forms/native-select";

/** Selector de mes que navega al cambiar (sin botón aparte). */
export function MonthSelect({ options, value, basePath, param = "mes" }: { options: { value: string; label: string }[]; value: string; basePath: string; param?: string }) {
  const router = useRouter();
  return (
    <NativeSelect
      aria-label="Mes del informe"
      value={value}
      className="w-48"
      onChange={(e) => router.push(`${basePath}?${param}=${encodeURIComponent(e.target.value)}`)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </NativeSelect>
  );
}
