"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export default function GestionGuard({ children }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    // Vérifier si l'utilisateur a un des rôles autorisés
    const hasGestionRole = user.role === "gestionnaire" ||
      user.role === "chef_service_exam" ||
      user.role === "professeur" ||
      user.role === "admin" ||
      user.is_staff ||
      user.is_superuser;

    if (!hasGestionRole) {
      // Rediriger vers la page d'accueil ou une page d'erreur
      router.push("/");
      return;
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Vérifier si l'utilisateur a un des rôles autorisés
  const hasGestionRole = user.role === "gestionnaire" ||
    user.role === "chef_service_exam" ||
    user.role === "professeur" ||
    user.role === "admin" ||
    user.is_staff ||
    user.is_superuser;

  if (!hasGestionRole) {
    return null;
  }

  return children;
}
