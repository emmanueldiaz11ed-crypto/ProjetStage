"use client";
import { useState } from "react";
import { getEtudiantParcours, getFigureUrl } from "@/services/eplApi";

const studentCards = [
  { label: "Nom / Prénoms", field: "nom_prenoms" },
  { label: "Sexe", field: "sexe" },
  { label: "Cohorte", field: "cohorte" },
  { label: "Filière", field: "filiere" },
  { label: "Moyenne globale", field: "moyenne_globale" },
  { label: "Taux de réussite", field: "taux_reussite_global", percent: true },
  { label: "Crédits totaux", field: "credits_total" },
  { label: "Crédits validés", field: "credits_valides" },
  { label: "Rang", field: "rang" },
];

export default function VueEtudiant() {
  const [id, setId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getEtudiantParcours(id);
      setData(res);
    } catch (e) {
      console.error(e);
      setData(null);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Vue Étudiant</h1>
      <div className="grid gap-4 md:grid-cols-[1fr_auto] items-end mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Identifiant étudiant</label>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="anonymat ou carte"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <button
          onClick={load}
          className="inline-flex items-center justify-center rounded-lg bg-blue-700 px-5 py-2 text-white hover:bg-blue-800 transition"
        >
          Charger
        </button>
      </div>

      {loading && <div className="mb-4 text-sm text-gray-600">Chargement...</div>}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            {studentCards.map((card) => (
              <div key={card.field} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm text-slate-500 mb-2">{card.label}</div>
                <div className="text-2xl font-semibold text-slate-900">
                  {data[card.field] != null
                    ? card.percent
                      ? `${Number(data[card.field]).toFixed(1)} %`
                      : data[card.field]
                    : "-"}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm mb-8">
            <h2 className="text-lg font-semibold mb-4">Parcours académique</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2">UE</th>
                    <th className="px-3 py-2">Note</th>
                    <th className="px-3 py-2">Crédits</th>
                    <th className="px-3 py-2">Semestre</th>
                    <th className="px-3 py-2">Résultat</th>
                  </tr>
                </thead>
                <tbody>
                  {data.parcours?.map((row, index) => (
                    <tr key={index} className="border-t border-slate-200">
                      <td className="px-3 py-2">{row.ue || row.nom || "-"}</td>
                      <td className="px-3 py-2">{row.note ?? "-"}</td>
                      <td className="px-3 py-2">{row.credit ?? "-"}</td>
                      <td className="px-3 py-2">{row.semestre ?? "-"}</td>
                      <td className="px-3 py-2">{row.resultat || row.statut || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-semibold text-slate-600">Comparaison à la cohorte</div>
              <img
                src={getFigureUrl("student_cohorte", { ue: id })}
                alt="Comparaison à la cohorte"
                className="h-72 w-full rounded-xl object-contain border border-slate-200 bg-slate-50"
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-semibold text-slate-600">Top de la cohorte</div>
              <img
                src={getFigureUrl("courbe_cohortes", { cohorte: data.cohorte })}
                alt="Top cohorte"
                className="h-72 w-full rounded-xl object-contain border border-slate-200 bg-slate-50"
              />
            </div>
          </div>
        </>
      ) : (
        !loading && <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Saisissez un identifiant et cliquez sur Charger.</div>
      )}
    </div>
  );
}
