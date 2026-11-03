import "server-only";
import { connection } from "next/server";

/** Fecha de hoy (ISO) leída en tiempo de petición; nunca en prerender. */
export async function today() {
  await connection();
  return new Date().toISOString().slice(0, 10);
}

export async function hourNow() {
  await connection();
  return new Date().getHours();
}
