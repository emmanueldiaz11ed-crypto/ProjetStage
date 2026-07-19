import { redirect } from "next/navigation";

export default function DashboardProfRedirect() {
  redirect("/enseignant/dashboard/donnees-personnelles");
  return null;
} 