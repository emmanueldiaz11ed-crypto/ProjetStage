import { redirect } from "next/navigation";

export default function DashboardAdminRedirect() {
  redirect("/gestion-notes/dashboard/tableau-de-bord");
  return null;
} 