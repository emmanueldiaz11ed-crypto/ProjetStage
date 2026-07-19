import api from "./api";
const FiliereService = {
  getFilieres: async () => {
    const response = await api.get("/inscription/filiere/");
    return response.data;
  },
  createFiliere: async (nom, abbreviation, departement, parcours) => {
    const filiereData = { nom, abbreviation, departement, parcours };
    const response = await api.post("/inscription/filiere/", filiereData);
    return response.data;
  },
  updateFiliere: async (id, nom, abbreviation, departement, parcours) => {
    const filiereData = { nom, abbreviation, departement, parcours };
    const response = await api.put(`/inscription/filiere/${id}/`, filiereData);
    return response.data;
  },
  deleteFiliere: async (id) => {
    const response = await api.delete(`/inscription/filiere/${id}/`);
    return response.data;
  },
  getFilieresByDepartement: async (departementId) => {
  const response = await api.get(`/inscription/filiere/by-departement/?departement=${departementId}`);
  return response.data;
},

};

export default FiliereService;
