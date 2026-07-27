"use client";
import { useAuth } from "@/contexts/AuthContext";
import MenuLateralGestionnaire from "../../../components/navigation/MenuLateralGestionnaire";
import MenuLateralChefServiceExamen from "../../../components/navigation/MenuLateralChefServiceExamen";
import MenuLateralProfesseur from "../../../components/navigation/MenuLateralProfesseur";
import MenuLateralAdmin from "../../../components/navigation/MenuLateralAdmin";
import Header from "../../../components/ui/Header";
import GestionGuard from "@/components/common/GestionGuard";
import DataUploadModal from "@/components/common/DataUploadModal";


function getMenuComponent(role) {
  switch(role) {
    case 'gestionnaire':
      return MenuLateralGestionnaire;
    case 'chef_service_exam':
      return MenuLateralChefServiceExamen;
    case 'professeur':
    case 'enseignant':
      return MenuLateralProfesseur;
    case 'admin':
    default:
      return MenuLateralAdmin;
  }
}

export default function DashboardAdminLayout({ children }) {
  const { user } = useAuth();
  const MenuComponent = user ? getMenuComponent(user.role) : MenuLateralGestionnaire;

  return (
    <GestionGuard>
      <>
        {/* Header en haut */}
        <header className="fixed top-0 left-0 right-0 z-40  bg-gradient-to-r from-teal-700 to-teal-700">
          <Header />
        </header>
        <aside className="hidden md:block fixed top-15 left-0 h-screen z-30">
          <MenuComponent />
        </aside>
        <main className="md:ml-64 flex-1 min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100 font-sans flex flex-col items-center justify-start px-4 py-12 pt-24 gap-8">
          {children}
        </main>
        
        {/* Upload Modal Button */}
        <DataUploadModal />
      </>
    </GestionGuard>
  );
}