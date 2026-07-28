// app/en-savoir-plus/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaFacebook, FaLinkedin } from "react-icons/fa";


export default function EnSavoirPlusPage() {
  return (
    <div className="font-sans">
      {/* HERO SECTION */}
      <section className="relative h-[60vh]  bg-center text-white flex items-center justify-center "style={{ backgroundImage: "url('/images/epl.jpg')" }}> 
        <div className="bg-black/50 w-full h-full absolute top-0 left-0 z-0"></div>
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">En savoir plus sur l’EPL</h1>
          <p className="text-lg md:text-xl">Découvrez notre histoire, nos valeurs et nos partenaires</p>
        </div>
      </section>

      {/* SECTION PRESENTATION */}
      <section className="py-16 px-6 bg-white text-gray-800">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Qui sommes-nous ?</h2>
            <p> <strong>à propos :</strong> L’Ecole Polytechnique de Lomé,fruit de la fusion de l’Ecole nationale supérieure d’ingénieurs (ENSI)et du Centre informatique et de calcul(CIC), vise à former et à créer des techniciens supérieurs, des ingénieurs et des docteurs dans le domaine des sciences de la technologie (génie électrique, industriel, mécanique et de l'aéronautique ; génie civil, génie des procédés et génie informatique)"</p>
            <p> <strong>Date de création :</strong> Année-Scolaire 2022-2023</p>
            <p> <strong>Admission :</strong> Par concours national</p>
          </div>
          <div>
            <Image src="/images/epl2.jpg" alt="EPL" width={500} height={300} className="rounded-xl shadow-md" />
          </div>
        </div>
      </section>

      {/* SECTION SERVICES */}
      <section className="py-16 px-6 bg-blue-50 text-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-8">Nos qualités de service</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {["Encadrement rigoureux", "Innovation pédagogique", "Services numériques", "Esprit de communauté"].map((service, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <h3 className="font-semibold text-lg">{service}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION PROGRAMMES */}
        <section className="py-16 px-6 bg-blue-50 text-black text-center">
          <h2 className="text-2xl font-bold mb-4">Nos programmes</h2>
          <p className="mb-6">Découvrez nos filières en Licence Fondamentale (LF) et Professionnelle (LP)</p>
          <Link href="/programmes">
            <button className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-6 rounded-full">Voir les programmes</button>
          </Link>
        </section>
    
      {/* PARTENAIRES */}
      <section className="py-16 px-6 bg-white-900 text-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Nos partenaires</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 items-center justify-center">
            {[
              "utbm.png",
              "utt.png",
              "LFL.jpeg",
              "eur-ace.png",
              "cdefi.png",
              "grandes-ecoles.png",
            ].map((img, i) => (
              <div key={i} className="flex items-center justify-center">
                <Image
                  src={`/images/partenaires/${img}`}
                  alt={`Partenaire ${i + 1}`}
                  width={120}
                  height={60}
                  className="object-contain max-h-16"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* PARTENARIATS ACADEMIQUES */}
      <section className="py-16 px-6 bg-blue-900 text-white">
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-center mb-6">Ils nous font confiance</h3>
            <p className="text-center mb-6 text-white-600">Nos partenariats avec des entreprises de renom renforcent l’employabilité de nos étudiants.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-center">
              {["yas.png", "betra.png", "anac.jpeg", "boston.jpeg"].map((img, i) => (
                <Image
                  key={i}
                  src={`/images/partenaires/${img}`}
                  alt={`Entreprise partenaire ${i + 1}`}
                  width={60}
                  height={60}
                  className="mx-auto "
                />
              ))}
            </div>
          </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-blue-800 text-white py-10 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">Contact</h3>
            <p>Email : contact@epl.ul</p>
            <p>Téléphone : 22 25 66 42</p>
            <p>Adresse :01BP1515, Université de Lomé, Togo</p>
          </div>
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
          <div > <h3 className="font-semibold text-lg ">Liens utiles</h3>
              <Link href="/programmes" className="underline">Nos programmes</Link></div>
        </div>
      </footer>
    </div>
  );
}
