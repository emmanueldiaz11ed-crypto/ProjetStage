"use client";
import React from "react";
import { FaFacebook, FaPhone, FaEnvelope, FaMapMarkerAlt, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white py-10 px-4 mt-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        
        {/* Logo + Présentation */}
        <div>
          <h2 className="text-xl font-bold mb-3">EPLPEDAGO</h2>
          <p className="text-sm">
            Plateforme pédagogique de l’École Polytechnique de Lomé. Suivez votre parcours en toute simplicité.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <FaPhone />  22 25 66 42
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope /> contact@epl.ul
            </li>
            <li className="flex items-center gap-2">
              <FaMapMarkerAlt />01BP1515,  Université de Lomé, Togo
            </li>
          </ul>
        </div>

        {/* Réseaux sociaux */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Suivez-nous</h3>
          <div className="flex gap-4 text-xl">
            <a href="https://www.facebook.com/p/Ecole-Polytechnique-de-Lom%C3%A9-UL-100087985756069/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:scale-110 transition h-30 ">
              <FaFacebook />
            </a>
            <a href="https://www.linkedin.com/company/%C3%A9cole-polytechnique-de-lom%C3%A9-ul/?trk=similar-pages" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:scale-110 transition h-30 ">
              <FaLinkedin />
            </a>
          </div>
        </div> 

      </div>

      <div className="text-center text-sm mt-10 border-t border-white/30 pt-4">
        © {new Date().getFullYear()} EPLPEDAGO - Tous droits réservés
      </div>
    </footer>
  );
}
