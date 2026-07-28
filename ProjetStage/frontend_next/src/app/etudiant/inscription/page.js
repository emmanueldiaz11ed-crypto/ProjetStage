import { redirect } from "next/navigation";

export default function DashboardRedirect() {
  redirect("/etudiant/inscription/etape-1");
  return null;
} 