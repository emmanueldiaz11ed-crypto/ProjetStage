import api from "./api";

const AffectationService = {
    affecter : async(ue,professeur)=> {
        const response = await api.post("notes/affectations/", { ue, professeur });
        return response.data;
    },
    desaffecter : async(ue_id,prof_id)=> {
        const response = await api.post(`notes/affectations/supprimer/?ue_id=${ue_id}&prof_id=${prof_id}`);
        return response.data;
    },
};

export default AffectationService;