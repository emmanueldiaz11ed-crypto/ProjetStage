"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUser, FaBook, FaClipboardList, FaProjectDiagram, FaFileAlt, FaUsers, FaChartBar, FaSignOutAlt, FaChalkboardTeacher, FaChevronDown, FaChevronUp, FaTachometerAlt, FaUserGraduate } from "react-icons/fa";
import NotificationBell from "@/features/notifications/notificationBell";

const mainLinks = [
  { href: "/enseignant/dashboard/donnees-personnelles", label: "Données personnelles", icon: <FaUser /> },
  { href: "/enseignant/dashboard/cours/mes-ues", label: "Mes UEs", icon: <FaChalkboardTeacher /> },
  { href: "/enseignant/dashboard/projets", label: "Projets", icon: <FaProjectDiagram /> },
  { href: "/enseignant/dashboard/articles", label: "Articles publiés", icon: <FaFileAlt /> },
  { href: "/enseignant/dashboard/encadrements", label: "Encadrements", icon: <FaUsers /> },
];

const statisticsLinks = [
  { href: "/gestion/dashboard/tableau-de-bord", label: "Vue globale", icon: <FaTachometerAlt /> },
  { href: "/gestion/dashboard/departement", label: "Vue Département", icon: <FaChartBar /> },
  { href: "/gestion/dashboard/filiere", label: "Vue Filière", icon: <FaUserGraduate /> },
  { href: "/gestion/dashboard/ue", label: "Vue UE", icon: <FaBook /> },
  { href: "/gestion/dashboard/comparaison", label: "Comparaison", icon: <FaProjectDiagram /> },
];

export default function MenuLateralProfesseur() {
  const pathname = usePathname();
  const [isStatsOpen, setIsStatsOpen] = useState(
    pathname?.includes('/tableau-de-bord') ||
    pathname?.includes('/departement') ||
    pathname?.includes('/filiere') ||
    pathname?.includes('/ue') ||
    pathname?.includes('/comparaison') ||
    false
  );

  return (
    <aside className="hidden md:flex flex-col gap-4 bg-white/70 backdrop-blur-2xl shadow-2xl w-64 h-screen sticky top-0 z-10 py-0 px-0  border-r border-black text-black">
      {/* Ajouter la cloche de notification */}
      <div className="flex-1 flex flex-col overflow-y-auto py-10 px-6">
        <div className="mb-8 flex items-center gap-2 justify-center">
          <span className="font-extrabold text-black text-2xl tracking-tight drop-shadow">EPL</span>
          <span className="bg-blue-100 text-black font-bold px-2 py-1  text-xs shadow">Enseignant</span>
          <span className="text-gray-400 text-sm"><NotificationBell /></span>
        </div>
        <nav className="flex flex-col gap-7 text-lg font-semibold">
          {/* Main Links */}
          {mainLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={
                (pathname === link.href
                  ? "bg-black-100 text-black-900 font-bold shadow-md "
                  : "text-black-700 hover:bg-blue-100 hover:text-black-900 ") +
                " px-4 py-2 transition flex items-center gap-3"
              }
            >
              <span className="text-xl">{link.icon}</span>
              {link.label}
            </Link>
          ))}

          {/* Statistics Collapsible Section */}
          <div className="flex flex-col gap-2 mt-3">
            <button
              onClick={() => setIsStatsOpen(!isStatsOpen)}
              className={
                (isStatsOpen
                  ? "bg-blue-100 text-black font-bold shadow-md "
                  : "text-black-700 hover:bg-blue-100 hover:text-black ") +
                " px-4 py-2 transition flex items-center gap-3 justify-between rounded-lg"
              }
            >
              <div className="flex items-center gap-3">
                <span className="text-xl"><FaChartBar /></span>
                <span>Statistiques</span>
              </div>
              {isStatsOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            
            {/* Statistics Sub-menu */}
            {isStatsOpen && (
              <div className="ml-4 flex flex-col gap-2 border-l-2 border-blue-400 pl-3">
                {statisticsLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={
                      (pathname === link.href
                        ? "bg-blue-50 text-black font-semibold "
                        : "text-gray-600 hover:text-black ") +
                      "rounded-lg px-3 py-2 transition flex items-center gap-2 text-sm"
                    }
                  >
                    <span className="text-lg">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
        <div className="text-xs text-gray-400 mt-8 select-none">&copy; EPL {new Date().getFullYear()}</div>
      </div>
    </aside>
  );
}