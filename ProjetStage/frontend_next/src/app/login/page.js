"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Formulaire from "@/components/ui/Formulaire.js";
import Link from "next/link";
import { authAPI } from '@/services/authService';
import { useAuth } from "@/contexts/AuthContext";
export default function Connexion() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  
  const champs = [
    {
      nom: "identifiant",
      label: "Identifiant",
      placeholder: "username",
      requis: true,
    },
    {
      nom: "motdepasse",
      label: "Mot de passe",
      type: "password",
      placeholder: "password",
      requis: true,
    },
  ];
  
  async function handleFormSubmit(valeurs) {
  setError("");
  setLoading(true);

  try {
    const data = await authAPI.login(valeurs.identifiant, valeurs.motdepasse);
    setUser(data.user);

    if (data.user.role === "etudiant") {

      const inscriptionRedirect = localStorage.getItem('inscription_redirect');
      if (inscriptionRedirect) {
        localStorage.removeItem('inscription_redirect');
        router.push("/etudiant/inscription/redirect");
        return;
      }

      const etudiantRedirect = localStorage.getItem('etudiant_redirect');
      if (etudiantRedirect) {
        const redirectPath = etudiantRedirect;
        localStorage.removeItem('etudiant_redirect');
        router.push(redirectPath);
        return;
      }

      router.push("/etudiant/inscription/redirect");
      return;
    }

    const roleRoutes = {
      professeur: "/enseignant/dashboard",
      admin: "/administration/dashboard",
      resp_notes: "/gestion-notes/dashboard",
      resp_inscription: "/resp_inscription/dashboard/gestionEtudiant",
      gestionnaire: "/gestion/dashboard/mon-etablissement",
      secretaire: "/secretariat/dashboard",
      chef_service_examen: "/gestion-service-examen/dashboard",
    };

    const route = roleRoutes[data.user.role] || "/programmes";
    router.push(route);

  } catch (error) {

    console.error("Erreur de connexion", error);

    if (error.response) {
      if (error.response.status === 401) {
        setError("Identifiant ou mot de passe incorrect");
      } else if (error.response.status === 400) {
        setError("Veuillez remplir tous les champs");
      } else if (error.response.status === 500) {
        setError("Erreur serveur. Veuillez réessayer plus tard");
      } else {
        setError("Une erreur est survenue. Veuillez réessayer");
      }
    } else if (error.request) {
      setError("Impossible de contacter le serveur. Vérifiez votre connexion internet");
    } else {
      setError("Une erreur inattendue est survenue");
    }

  } finally {
    setLoading(false);
  }
}
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 py-12">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl px-8 py-10 w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-blue-900 mb-6 text-center">
          Connexion
        </h1>
        
        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-start">
              <svg 
                className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                  clipRule="evenodd" 
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">
                  Erreur de connexion
                </p>
                <p className="text-sm text-red-700 mt-1">
                  Erreur lors de la connexion. Réessayez.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <Formulaire champs={champs} onSubmit={handleFormSubmit} />
        
        <div className="mt-6 text-center flex flex-col gap-2">
          <Link 
            href="/forgot-password" 
            className="text-sm text-blue-600 hover:underline hover:text-blue-800 transition-colors"
          >
            Mot de passe oublié ?
          </Link>
          
          <Link 
            href="/" 
            className="text-blue-700 hover:underline transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
        
        {/* Indicateur de chargement */}
        {loading && (
          <div className="mt-4 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 mt-2">Connexion en cours...</p>
          </div>
        )}
      </div>
    </div>
  );
}