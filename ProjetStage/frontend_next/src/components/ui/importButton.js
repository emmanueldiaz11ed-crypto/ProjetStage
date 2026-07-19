"use client";

import React, { useState, useEffect } from "react";
import { 
  FaUserGraduate, 
  FaSearch, 
  FaFilter, 
  FaEdit, 
  FaTrash, 
  FaPlus,
  FaFileExport,
  FaArrowLeft,
  FaArrowRight
} from "react-icons/fa";
import { useRouter } from "next/navigation";

// Données statiques de démonstration
const initialEtudiants = [
  { id: 1, num_carte: "12458", nom: "AKAKPO", prenom: "Koffi Eli", email: "thquin@gmail.com", connect: "90251455", parcours: "Informatique", filiere: "Licence Pro" },
  { id: 2, num_carte: "14587", nom: "ATOUPI", prenom: "Abla Emi", email: "ablae@example.com", connect: "90251456", parcours: "Commerce", filiere: "Licence Pro" },
  { id: 3, num_carte: "12454", nom: "DOSSOU", prenom: "Komi", email: "komid@example.com", connect: "90251457", parcours: "Informatique", filiere: "Master" },
  { id: 4, num_carte: "45484", nom: "BASSOWOU", prenom: "Afi", email: "afia@example.com", connect: "90251458", parcours: "Gestion", filiere: "Licence" },
  { id: 5, num_carte: "21545", nom: "ANANI", prenom: "Marc", email: "marca@example.com", connect: "90251459", parcours: "Commerce", filiere: "Master" },
  { id: 6, num_carte: "24111", nom: "ATOU", prenom: "Koffi Eli", email: "koffie@example.com", connect: "90251460", parcours: "Informatique", filiere: "Licence Pro" },
  { id: 7, num_carte: "85641", nom: "WOLU", prenom: "Kossi Eduard", email: "kossie@example.com", connect: "90251461", parcours: "Gestion", filiere: "Licence" },
  { id: 8, num_carte: "23564", nom: "AGBOVI", prenom: "Julie", email: "juliea@example.com", connect: "90251462", parcours: "Commerce", filiere: "Licence Pro" },
  { id: 9, num_carte: "50232", nom: "DJOBO", prenom: "Alice", email: "aliced@example.com", connect: "90251463", parcours: "Informatique", filiere: "Master" },
  { id: 10, num_carte: "12457", nom: "ADJOVI", prenom: "Thomas", email: "thomasa@example.com", connect: "90251464", parcours: "Gestion", filiere: "Master" },
];

// Options pour les filtres
const parcoursOptions = ["Tous", "Informatique", "Commerce", "Gestion"];
const filiereOptions = ["Tous", "Licence", "Licence Pro", "Master"];

export default function GestionEtudiantsAdmin() {
  const router = useRouter();
  const [etudiants, setEtudiants] = useState(initialEtudiants);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParcours, setSelectedParcours] = useState("Tous");
  const [selectedFiliere, setSelectedFiliere] = useState("Tous");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // Filtrer les étudiants en fonction des critères
  const filteredEtudiants = etudiants.filter(etudiant => {
    const matchesSearch = 
      etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.num_carte.includes(searchTerm) ||
      etudiant.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesParcours = selectedParcours === "Tous" || etudiant.parcours === selectedParcours;
    const matchesFiliere = selectedFiliere === "Tous" || etudiant.filiere === selectedFiliere;
    alert("ok" + " " + matchesParcours + " " + matchesFiliere);
    
    return matchesSearch && matchesParcours && matchesFiliere;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEtudiants = filteredEtudiants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEtudiants.length / itemsPerPage);

  // Changer de page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Exporter les données en CSV
  const exportToCSV = () => {
    const headers = ["Numéro Carte", "Nom", "Prénom", "Email", "Connect", "Parcours", "Filière"];
    const csvData = [
      headers.join(","),
      ...filteredEtudiants.map(e => 
        [e.num_carte, e.nom, e.prenom, e.email, e.connect, e.parcours, e.filiere].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "etudiants.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Modifier un étudiant
  const handleEdit = (etudiant) => {
    setEditingStudent({ ...etudiant });
  };

  // Sauvegarder les modifications
  const handleSave = () => {
    if (editingStudent) {
      setEtudiants(etudiants.map(e => 
        e.id === editingStudent.id ? editingStudent : e
      ));
      setEditingStudent(null);
    }
  };

  // Confirmer la suppression
  const confirmDelete = (etudiant) => {
    setStudentToDelete(etudiant);
    setShowDeleteConfirm(true);
  };

  // Supprimer un étudiant
  const handleDelete = () => {
    if (studentToDelete) {
      setEtudiants(etudiants.filter(e => e.id !== studentToDelete.id));
      setShowDeleteConfirm(false);
      setStudentToDelete(null);
    }
  };

  // Redirection vers la page d'inscription
  const goToInscription = () => {
    router.push("/etudiant/inscription/etape-1");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">Gestion des Étudiants</h1>
            <p className="opacity-90">Administration des étudiants par parcours et filière</p>
          </div>

          {/* Barre d'outils */}
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un étudiant..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedParcours}
                onChange={(e) => setSelectedParcours(e.target.value)}
              >
                {parcoursOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <select
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedFiliere}
                onChange={(e) => setSelectedFiliere(e.target.value)}
              >
                {filiereOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center"
              >
                <FaFileExport /> Exporter
              </button>
              <button
                onClick={goToInscription}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center"
              >
                <FaPlus /> Nouvel étudiant
              </button>
            </div>
          </div>

          {/* Tableau des étudiants */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carte</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connect</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parcours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filière</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentEtudiants.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      Aucun étudiant trouvé
                    </td>
                  </tr>
                ) : (
                  currentEtudiants.map(etudiant => (
                    <tr key={etudiant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{etudiant.num_carte}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{etudiant.nom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{etudiant.prenom}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{etudiant.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{etudiant.connect}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{etudiant.parcours}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{etudiant.filiere}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(etudiant)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => confirmDelete(etudiant)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between items-center sm:hidden">
              <button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
              </span>
              <button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredEtudiants.length)}
                  </span> sur <span className="font-medium">{filteredEtudiants.length}</span> étudiants
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <FaArrowLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <FaArrowRight className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Modal d'édition */}
        {editingStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Modifier l'étudiant</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Numéro de carte</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={editingStudent.num_carte}
                    onChange={(e) => setEditingStudent({...editingStudent, num_carte: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={editingStudent.nom}
                    onChange={(e) => setEditingStudent({...editingStudent, nom: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prénom</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={editingStudent.prenom}
                    onChange={(e) => setEditingStudent({...editingStudent, prenom: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={editingStudent.email}
                    onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-5 sm:mt-6 flex gap-3">
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setEditingStudent(null)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleSave}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmer la suppression</h3>
              <p className="text-sm text-gray-500">
                Êtes-vous sûr de vouloir supprimer l'étudiant {studentToDelete?.nom} {studentToDelete?.prenom} ?
                Cette action est irréversible.
              </p>
              <div className="mt-5 sm:mt-6 flex gap-3">
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={handleDelete}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}