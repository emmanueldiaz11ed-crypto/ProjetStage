import api from "./api";

const RespSaisieService = {
    // Récupérer les informations du responsable de saisie connécté
    getResponsableSaisieConnecte: async () => {
        try {
            const response = await api.get("/utilisateurs/responsables-notes/get_me/");
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération du responsable de saisie connecté:", error);
            throw error;
        }
    },
};
export default RespSaisieService;
