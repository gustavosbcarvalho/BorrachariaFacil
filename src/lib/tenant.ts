import { redirect } from "next/navigation";
import { getSession } from "./auth";

/**
 * Retorna o borracharia_id da sessão atual.
 * Redireciona para /login se não autenticado ou sem borracharia.
 * Use em Server Components e Server Actions que precisam de escopo por tenant.
 */
export async function getTenantId(): Promise<string> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.user.borrachariaId) redirect("/login");
  return session.user.borrachariaId;
}

/**
 * Retorna sessão completa exigindo borracharia_id.
 */
export async function getTenantSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.user.borrachariaId) redirect("/login");
  return session;
}
