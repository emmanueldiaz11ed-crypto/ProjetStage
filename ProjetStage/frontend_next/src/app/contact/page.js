"use client"
import React from "react";

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 font-sans px-4 py-12">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl px-8 py-10 w-full max-w-lg animate-fade-in">
        <h1 className="text-3xl font-extrabold text-blue-900 mb-4 text-center">Contactez-nous</h1>
        <form className="flex flex-col gap-6 mb-8">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Nom</label>
            <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70" placeholder="Votre nom" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input type="email" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70" placeholder="Votre email" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Message</label>
            <textarea className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/70" rows={4} placeholder="Votre message" />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-full shadow transition-all">Envoyer</button>
        </form>
        <div className="text-gray-700 text-sm mb-2"><span className="font-bold">Adresse :</span> Université de Lomé, EPL, 1BP 1515 Lomé1-TOGO</div>
        <div className="text-gray-700 text-sm mb-2"><span className="font-bold">Email :</span> epl_ul@univ-lome.tg</div>
        <div className="text-gray-700 text-sm"><span className="font-bold">Téléphone :</span> +228 22 25 66 42</div>
      </div>
    </div>
  );
} 