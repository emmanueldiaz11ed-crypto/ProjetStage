"use client";
import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import authAPI from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";

export default function LogoutPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const executed = useRef(false);

  useEffect(() => {

    if (executed.current) return;
    executed.current = true;

    try {
      authAPI.logout();
      setUser(null);
      alert("Vous êtes déconnecté.");
      router.push("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }

  }, [router, setUser]);

  return null;
}