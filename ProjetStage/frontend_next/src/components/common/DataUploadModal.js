"use client";
import { useState } from "react";
import { FaFileUpload, FaTimes, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { uploadData } from "@/services/eplApi";

export default function DataUploadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState({ type: null, text: "" });

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer?.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    const allowedFormats = [".csv", ".parquet", ".xlsx", ".xls"];
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();

    if (!allowedFormats.includes(fileExtension)) {
      setMessage({
        type: "error",
        text: `Format non supporté. Formats acceptés: ${allowedFormats.join(", ")}`,
      });
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "Fichier trop volumineux. Taille max: 100 MB",
      });
      return;
    }

    setIsLoading(true);
    setMessage({ type: null, text: "" });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await uploadData(formData);

      setMessage({
        type: "success",
        text: `✅ Fichier uploadé avec succès! ${response.rows ?? response.count ?? 0} lignes importées.`,
      });

      // Fermer la modale après 2 secondes
      setTimeout(() => {
        setIsOpen(false);
        setMessage({ type: null, text: "" });
        // Recharger la page pour voir les nouvelles données
        window.location.reload();
      }, 2000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.detail || error.message || "Erreur lors de l'upload";
      setMessage({
        type: "error",
        text: `❌ Erreur: ${errorMsg}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Bouton Upload */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all transform hover:scale-110 hover:shadow-xl z-40"
        title="Importer des données"
      >
        <FaFileUpload className="text-xl" />
        <span>Importer les données</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 p-8 relative">
            {/* Bouton Fermeture */}
            <button
              onClick={() => {
                setIsOpen(false);
                setMessage({ type: null, text: "" });
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="text-xl" />
            </button>

            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaFileUpload className="text-teal-600" />
              Importer les données
            </h2>

            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-teal-500 bg-teal-50"
                  : "border-gray-300 bg-gray-50 hover:border-teal-500"
              }`}
            >
              <FaFileUpload className="text-4xl text-teal-500 mx-auto mb-4" />
              <p className="text-gray-700 font-semibold mb-2">
                Glissez votre fichier ici
              </p>
              <p className="text-sm text-gray-500 mb-4">ou cliquez pour sélectionner</p>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".csv,.parquet,.xlsx,.xls"
                disabled={isLoading}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="inline-block bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-lg cursor-pointer transition-all disabled:opacity-50"
              >
                Sélectionner un fichier
              </label>
            </div>

            {/* Formats acceptés */}
            <p className="text-xs text-gray-500 mt-4 text-center">
              Formats acceptés: CSV, Parquet, Excel (XLSX, XLS)
            </p>

            {/* Messages */}
            {message.text && (
              <div
                className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
                  message.type === "success"
                    ? "bg-green-50 border border-green-200"
                    : message.type === "error"
                    ? "bg-red-50 border border-red-200"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                {message.type === "success" && (
                  <FaCheckCircle className="text-green-600 text-lg flex-shrink-0 mt-0.5" />
                )}
                {message.type === "error" && (
                  <FaExclamationCircle className="text-red-600 text-lg flex-shrink-0 mt-0.5" />
                )}
                <p
                  className={`text-sm ${
                    message.type === "success"
                      ? "text-green-800"
                      : message.type === "error"
                      ? "text-red-800"
                      : "text-blue-800"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="mt-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              </div>
            )}

            {/* Boutons */}
            {!isLoading && message.type !== "success" && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  setMessage({ type: null, text: "" });
                }}
                className="w-full mt-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-all"
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
