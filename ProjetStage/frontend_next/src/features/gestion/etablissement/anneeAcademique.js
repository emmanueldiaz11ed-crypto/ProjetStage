"use client";
import { useEffect, useState } from "react";
import AnneeAcademiqueService from "@/services/anneeAcademiqueService";

export default function AnneesAcademiquesPage() {

  const [annees, setAnnees] = useState([]);
  const [loading, setLoading] = useState(true);

  const chargerAnnees = async () => {
    try {
      const data = await AnneeAcademiqueService.getAll();
      setAnnees(data);
    } catch (error) {
      console.error("Erreur chargement années", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerAnnees();
  }, []);

  const activerAnnee = async (id) => {

    const updated = annees.map(a => ({
      ...a,
      est_active: a.id === id
    }));

    setAnnees(updated);

    try {
      await AnneeAcademiqueService.update(id, { est_active: true });
    } catch (error) {
      console.error(error);
      chargerAnnees();
    }
  };

  const toggleArchive = async (annee) => {

    if (!annee.est_active) {
      alert("Une année doit être active avant d'être archivée.");
      return;
    }

    try {

      const updated = !annee.est_archivee;

      await AnneeAcademiqueService.update(annee.id, {
        est_archivee: updated
      });

      setAnnees(prev =>
        prev.map(a =>
          a.id === annee.id ? { ...a, est_archivee: updated } : a
        )
      );

    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Chargement...</div>;
  }

  return (
    <div style={{ padding: "30px" }}>

      <h2 style={{ marginBottom: "25px" }}>
        Gestion des années académiques
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "20px"
        }}
      >

        {annees.map((annee) => (

          <div
            key={annee.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "20px",
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
            }}
          >

            <h3 style={{ marginBottom: "10px" }}>
              {annee.libelle}
            </h3>

            <div style={{ marginBottom: "10px" }}>
              <strong>Status :</strong>{" "}
              {annee.est_active ? (
                <span style={{ color: "green" }}>Active</span>
              ) : (
                <span style={{ color: "#888" }}>Inactive</span>
              )}
            </div>

            <div style={{ marginBottom: "15px" }}>
              <strong>Archivage :</strong>{" "}
              {annee.est_archivee ? (
                <span style={{ color: "orange" }}>Archivée</span>
              ) : (
                <span style={{ color: "#888" }}>Non archivée</span>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>

              <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <input
                  type="radio"
                  name="annee_active"
                  checked={annee.est_active}
                  onChange={() => activerAnnee(annee.id)}
                />
                Activer
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <input
                  type="checkbox"
                  checked={annee.est_archivee}
                  disabled={!annee.est_active}
                  onChange={() => toggleArchive(annee)}
                />
                Archiver
              </label>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}