// Frontend JS - Dashboard interactif - Refactorisation complète
const API_URL = "http://localhost:8000";

// ÉTAT GLOBAL
let dashboardMeta = {};
let currentAnalysis = "global";
let currentFilters = {};
let allUEs = [];
let filteredUEs = [];
let currentPage = 1;
let currentSort = { field: null, direction: "asc" };
let sidebarCollapsed = false;
let _abortCtrl = null;
let _searchTimer = null;

const ITEMS_PER_PAGE = 20;

// Configurations des analyses
const ANALYSE_CONFIG = {
  global: {
    nom: "Vue Globale",
    icone: "chart",
    filtres: []
  },
  annee: {
    nom: "Par Annee",
    icone: "calendar",
    filtres: ["annee"]
  },
  semestre: {
    nom: "Par Semestre",
    icone: "calendar-alt",
    filtres: ["semestre"]
  },
  cohorte: {
    nom: "Par Cohorte",
    icone: "graduation-cap",
    filtres: ["cohorte", "annee_opt", "semestre_opt"]
  },
  filiere: {
    nom: "Analyse Filière",
    icone: "building",
    filtres: ["filiere", "semestre_opt", "ue_opt"]
  },
  departement: {
    nom: "Analyse Département",
    icone: "sitemap",
    filtres: ["filieres_multi", "semestre_opt"]
  },
  etudiant: {
    nom: "Parcours Etudiant",
    icone: "user",
    filtres: []
  }
};

// INITIALISATION
document.addEventListener("DOMContentLoaded", async () => {
  loadThemePreference();
  await loadMetadata();
  setupEventListeners();
  renderSidebar();
  // Restaurer l'état si disponible, sinon charger la vue globale
  try {
    const raw = localStorage.getItem('dashboardAppState');
    if (raw) {
      const st = JSON.parse(raw);
      if (st?.analysis) currentAnalysis = st.analysis;
      if (st?.filters) currentFilters = st.filters;
    }
  } catch (e) {
    console.warn('Impossible de restaurer l\'état au démarrage', e);
  }
  selectAnalysis(currentAnalysis || "global");
});

// MÉTADONNÉES
async function loadMetadata() {
  try {
    const res = await fetch(`${API_URL}/meta/disponibilites`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    dashboardMeta = await res.json();
  } catch (err) {
    console.error("Erreur métadonnées:", err);
    showToast("Impossible de charger les métadonnées", "error");
  }
}

// ÉVÉNEMENTS
function setupEventListeners() {
  // Toggle sidebar
  document.getElementById("sidebar-toggle-btn")?.addEventListener("click", toggleSidebar);
  document.getElementById("menu-burger")?.addEventListener("click", openSidebar);
  document.getElementById("close-sidebar")?.addEventListener("click", closeSidebar);
  document.getElementById("sidebar-overlay")?.addEventListener("click", closeSidebar);

  // Upload CSV
  document.getElementById("csv-upload-btn")?.addEventListener("click", () => {
    document.getElementById("csv-file-input").click();
  });
  document.getElementById("csv-file-input")?.addEventListener("change", handleCSVUpload);

  // Recherche étudiant
  document.getElementById("btn-search-etudiant")?.addEventListener("click", searchEtudiant);
  document.getElementById("search-etudiant")?.addEventListener("keydown", e => {
    if (e.key === "Enter") searchEtudiant();
  });

  // Thème
  document.getElementById("theme-toggle-btn")?.addEventListener("click", toggleTheme);

  // Fermer modales avec Escape
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeAllModals();
    }
  });
}

// SIDEBAR
function renderSidebar() {
  const sidebarList = document.getElementById("sidebar-analysis-list");
  if (!sidebarList) return;

  sidebarList.innerHTML = Object.entries(ANALYSE_CONFIG).map(([key, config]) => {
    const count = getDashboardCount(key);
    const badge = count ? `<span class="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">${count}</span>` : '';
    return `
      <li class="mb-2">
        <button title="${config.nom}" class="sidebar-nav-btn w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-3 analysis-nav" data-analysis="${key}">
          <span class="icon">${getAnalysisIcon(config.icone)}</span>
          <span class="sidebar-label">${config.nom}</span>
          ${badge}
        </button>
      </li>
    `;
  }).join("");

  // Attacher les écouteurs de navigation
  document.querySelectorAll(".analysis-nav").forEach(btn => {
    btn.addEventListener("click", () => {
      const analysis = btn.dataset.analysis;
      selectAnalysis(analysis);
    });
  });
}

function getDashboardCount(analysis) {
  switch(analysis) {
    case "annee": return dashboardMeta.annees?.length || 0;
    case "cohorte": return dashboardMeta.cohortes?.length || 0;
    case "filiere": return dashboardMeta.filieres?.length || 0;
    case "semestre": return dashboardMeta.semestres?.length || 0;
    default: return 0;
  }
}

function getAnalysisIcon(icone) {
  const icons = {
    chart: "G",
    calendar: "A",
    "calendar-alt": "S",
    "graduation-cap": "C",
    building: "F",
    sitemap: "D",
    user: "E"
  };
  return icons[icone] || "G";
}

function toggleSidebar() {
  sidebarCollapsed = !sidebarCollapsed;
  const sidebar = document.getElementById("sidebar");
  const toggle = document.getElementById("sidebar-toggle-btn");
  if (sidebar) {
    sidebar.classList.toggle("collapsed", sidebarCollapsed);
  }
  if (toggle) {
    toggle.textContent = sidebarCollapsed ? "Show" : "Hide";
  }
}

function openSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.classList.remove("-translate-x-full");
  document.getElementById("sidebar-overlay")?.classList.remove("hidden");
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar) sidebar.classList.add("-translate-x-full");
  document.getElementById("sidebar-overlay")?.classList.add("hidden");
}

// SÉLECTION D'ANALYSE
function selectAnalysis(analysis) {
  currentAnalysis = analysis;
  currentFilters = getDefaultFiltersForAnalysis(analysis);
  currentPage = 1;

  // Mettre en surbrillance la navigation
  document.querySelectorAll(".analysis-nav").forEach(btn => {
    const isActive = btn.dataset.analysis === analysis;
    btn.classList.toggle("bg-blue-100", isActive);
    btn.classList.toggle("dark:bg-blue-900", isActive);
  });

  renderAnalysisFilters(analysis);
  applySavedFilters(currentFilters);

  if (analysis !== "etudiant") {
    loadDashboard(analysis, currentFilters);
  } else {
    renderEtudiantSection();
  }

  document.getElementById("main-content")?.scrollIntoView({ behavior: "smooth" });
  closeSidebar();
}

// RENDU DES FILTRES
function renderAnalysisFilters(analysis) {
  const container = document.getElementById("analysis-filters");
  if (!container) return;

  const config = ANALYSE_CONFIG[analysis];
  if (!config || !config.filtres.length) {
    container.innerHTML = "";
    return;
  }

  const filterHTML = config.filtres.map(filtre => {
    if (filtre === "annee") {
      return createSelect("Annee", "filter-annee", dashboardMeta.annees || []);
    } else if (filtre === "semestre") {
      return createSelect("Semestre", "filter-semestre", dashboardMeta.semestres || []);
    } else if (filtre === "cohorte") {
      return createSelect("Cohorte", "filter-cohorte", dashboardMeta.cohortes || []);
    } else if (filtre === "filiere") {
      return createSelect("Filiere", "filter-filiere", dashboardMeta.filieres || []);
    } else if (filtre === "ue_opt") {
      return createMultiSelect("Matiere (optionnel)", "filter-ue", dashboardMeta.ues || []);
    } else if (filtre === "annee_opt") {
      return createSelect("Annee (optionnel)", "filter-annee", dashboardMeta.annees || [], true);
    } else if (filtre === "semestre_opt") {
      return createSelect("Semestre (optionnel)", "filter-semestre", dashboardMeta.semestres || [], true);
    } else if (filtre === "filieres_multi") {
      return createMultiSelect("Filieres", "filter-filieres", dashboardMeta.filieres || []);
    }
    return "";
  }).join("");

  container.innerHTML = `
    <div class="space-y-3 mb-4">
      ${filterHTML}
      <button id="apply-filters-btn" class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition">
        Appliquer
      </button>
    </div>
  `;

  document.getElementById("apply-filters-btn")?.addEventListener("click", async () => {
    currentFilters = getActiveFilters(analysis);
    currentPage = 1;
    await loadDashboard(analysis, currentFilters);
  });

  setupFilterDependencies();
}

function createSelect(label, id, options, optional = false) {
  const optionsHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join("");
  const defaultOption = optional ? `<option value="">Tous</option>` : `<option value="">Choisir...</option>`;
  return `
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">${label}</label>
      <select id="${id}" class="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600">
        ${defaultOption}
        ${optionsHTML}
      </select>
    </div>
  `;
}

function createMultiSelect(label, id, options) {
  const optionsHTML = options.map(opt => `
    <label class="flex items-center mb-2">
      <input type="checkbox" class="form-checkbox mr-2" value="${opt}" />
      <span>${opt}</span>
    </label>
  `).join("");

  return `
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${label}</label>
      <div id="${id}-options" class="border rounded-lg p-3 dark:bg-gray-700 dark:border-gray-600">
        ${optionsHTML}
      </div>
    </div>
  `;
}

function getActiveFilters(analysis) {
  const filters = {};
  const config = ANALYSE_CONFIG[analysis];
  if (!config) return filters;

  config.filtres.forEach(filtre => {
    let value;
    if (filtre === "filieres_multi") {
      const checkboxes = document.querySelectorAll("#filter-filieres-options input:checked");
      value = Array.from(checkboxes).map(cb => cb.value).join(",");
    } else if (filtre === "ue_opt") {
      const checkboxes = document.querySelectorAll("#filter-ue-options input:checked");
      value = Array.from(checkboxes).map(cb => cb.value).join(",");
    } else if (filtre.includes("_opt")) {
      const baseFiltre = filtre.replace("_opt", "");
      const el = document.getElementById(`filter-${baseFiltre}`);
      value = el?.value || null;
    } else {
      const el = document.getElementById(`filter-${filtre}`);
      value = el?.value || null;
    }
    if (value && value !== "") {
      const key = filtre.replace("_opt", "").replace("_multi", "");
      filters[key] = value;
    }
  });

  return filters;
}

function setupFilterDependencies() {
  const cohorteEl = document.getElementById("filter-cohorte");
  const anneeEl = document.getElementById("filter-annee");

  if (cohorteEl) {
    cohorteEl.addEventListener("change", async () => {
      await reloadFilterOptions({ cohorte: cohorteEl.value });
    });
  }

  if (anneeEl) {
    anneeEl.addEventListener("change", async () => {
      await reloadFilterOptions({ annee: anneeEl.value });
    });
  }
}

function getDefaultFiltersForAnalysis(analysis) {
  const defaults = {};
  switch (analysis) {
    case "annee":
      if (dashboardMeta.annees?.length) defaults.annee = dashboardMeta.annees[0];
      break;
    case "semestre":
      if (dashboardMeta.semestres?.length) defaults.semestre = dashboardMeta.semestres[0];
      break;
    case "cohorte":
      if (dashboardMeta.cohortes?.length) defaults.cohorte = dashboardMeta.cohortes[0];
      break;
    case "filiere":
      if (dashboardMeta.filieres?.length) defaults.filiere = dashboardMeta.filieres[0];
      break;
    case "departement":
      if (dashboardMeta.filieres?.length) defaults.filieres = dashboardMeta.filieres.slice(0, 1).join(",");
      break;
    default:
      break;
  }
  return defaults;
}

function applySavedFilters(filters) {
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (key === "filieres") {
      document.querySelectorAll("#filter-filieres-options input").forEach(cb => {
        cb.checked = value.split(/[,|]/).includes(cb.value);
      });
      return;
    }
    if (key === "ue") {
      document.querySelectorAll("#filter-ue-options input").forEach(cb => {
        cb.checked = value.split(/[,|]/).includes(cb.value);
      });
      return;
    }
    const element = document.getElementById(`filter-${key}`);
    if (element) element.value = value;
  });
}

async function reloadFilterOptions(filters) {
  try {
    const params = new URLSearchParams();
    if (filters.cohorte) params.set("cohorte", filters.cohorte);
    if (filters.annee) params.set("annee", filters.annee);

    const res = await fetch(`${API_URL}/meta/disponibilites?${params.toString()}`);
    if (!res.ok) return;

    const meta = await res.json();
    if (filters.cohorte) {
      updateSelectOptions("filter-annee", meta.annees || [], true);
      updateSelectOptions("filter-semestre", meta.semestres || [], true);
    } else if (filters.annee) {
      updateSelectOptions("filter-semestre", meta.semestres || [], true);
    }
  } catch (err) {
    console.warn("Impossible de recharger les filtres", err);
  }
}

function updateSelectOptions(id, options, includeAll = false) {
  const select = document.getElementById(id);
  if (!select) return;
  const defaultOption = includeAll ? `<option value="">Tous</option>` : `<option value="">Choisir...</option>`;
  const html = [defaultOption].concat((options || []).map(opt => `<option value="${opt}">${opt}</option>`)).join("");
  select.innerHTML = html;
}

// CHARGEMENT DU DASHBOARD
async function loadDashboard(analysis, filters) {
  if (_abortCtrl) _abortCtrl.abort();
  _abortCtrl = new AbortController();

  setLoading(true);
  try {
    let apiEndpoint = "";
    const params = new URLSearchParams(filters);

    switch(analysis) {
      case "global":
        apiEndpoint = "/dashboard/aggregates";
        break;
      case "annee":
        apiEndpoint = `/dashboard/aggregates?annee=${filters.annee || ""}`;
        break;
      case "semestre":
        apiEndpoint = `/dashboard/aggregates?semestre=${filters.semestre || ""}`;
        break;
      case "cohorte":
        apiEndpoint = `/dashboard/aggregates?cohorte=${filters.cohorte || ""}${filters.annee ? `&annee=${filters.annee}` : ""}${filters.semestre ? `&semestre=${filters.semestre}` : ""}`;
        break;
      case "filiere":
        if (!filters.filiere) {
          showToast("Veuillez selectionner une filiere", "error");
          setLoading(false);
          return;
        }
        apiEndpoint = `/analyse/filiere?filiere=${filters.filiere}${filters.semestre ? `&semestre=${filters.semestre}` : ""}${filters.ue ? `&ue=${filters.ue}` : ""}`;
        break;
      case "departement":
        if (!filters.filieres) {
          showToast("Veuillez selectionner au moins une filiere", "error");
          setLoading(false);
          return;
        }
        apiEndpoint = `/analyse/departement?filieres=${filters.filieres}${filters.semestre ? `&semestre=${filters.semestre}` : ""}`;
        break;
      default:
        return;
    }

    const res = await fetch(`${API_URL}${apiEndpoint}`, { signal: _abortCtrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    renderAnalysisContent(analysis, filters, data);

  } catch (err) {
    if (err.name !== "AbortError") {
      console.error("Erreur chargement dashboard:", err);
      showToast("Impossible de charger l'analyse", "error");
    }
  } finally {
    setLoading(false);
  }
}

// RENDU DU CONTENU D'ANALYSE
function renderAnalysisContent(analysis, filters, data) {
  const mainContent = document.getElementById("main-content");
  if (!mainContent) return;

  const renderer = window[`renderAnalysis_${analysis}`] || renderAnalysisGeneric;
  mainContent.innerHTML = renderer(filters, data);

  // Générer les graphiques
  renderCharts(analysis, filters);
}

function renderAnalysisGeneric(filters, data) {
  const titre = ANALYSE_CONFIG[currentAnalysis].nom;
  const filterText = Object.keys(filters).length > 0
    ? Object.entries(filters).map(([k, v]) => `${k}: ${v}`).join(" | ")
    : "";

  return renderAnalysisBase(titre, filterText, data, filters);
}

function renderAnalysis_global(filters, data) {
  return renderAnalysisBase("Vue Globale", "", data, filters);
}

function renderAnalysis_annee(filters, data) {
  const filterText = filters.annee ? `Annee: ${filters.annee}` : "";
  return renderAnalysisBase("Par Année", filterText, data, filters);
}

function renderAnalysis_semestre(filters, data) {
  const filterText = filters.semestre ? `Semestre: ${filters.semestre}` : "";
  return renderAnalysisBase("Par Semestre", filterText, data, filters);
}

function renderAnalysis_cohorte(filters, data) {
  const parts = [];
  if (filters.cohorte) parts.push(`Cohorte: ${filters.cohorte}`);
  if (filters.annee) parts.push(`Annee: ${filters.annee}`);
  if (filters.semestre) parts.push(`Semestre: ${filters.semestre}`);
  return renderAnalysisBase("Par Cohorte", parts.join(" | "), data, filters);
}

function renderAnalysis_filiere(filters, data) {
  const parts = [];
  if (filters.filiere) parts.push(`Filiere: ${filters.filiere}`);
  if (filters.semestre) parts.push(`Semestre: ${filters.semestre}`);
  if (filters.ue) parts.push(`UE: ${filters.ue}`);
  return renderAnalysisBase("Analyse Filière", parts.join(" | "), data, filters);
}

function renderAnalysis_departement(filters, data) {
  const parts = [];
  if (filters.filieres) parts.push(`Filieres: ${filters.filieres}`);
  if (filters.semestre) parts.push(`Semestre: ${filters.semestre}`);
  return renderAnalysisBase("Analyse Département", parts.join(" | "), data, filters);
}

function renderAnalysisBase(title, filterText, data, filters = {}) {
  return `
    <div class="p-8">
      <h2 class="text-2xl font-bold mb-2">${title}</h2>
      ${filterText ? `<p class="text-gray-600 dark:text-gray-400 mb-6">${filterText}</p>` : ""}
      <div class="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-4">Statistiques</h3>
        ${renderStatisticsTable(data)}
      </div>
      ${data.taux_reussite != null ? renderInterpretationBlock(data) : ""}
      ${data.tableau_ue && data.tableau_ue.length > 0 ? `
        <div class="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-4">Matieres</h3>
          ${renderUETable(data.tableau_ue)}
        </div>
      ` : ""}
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-4">Graphiques</h3>
        <div id="additional-charts" class="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
      </div>
      <button onclick="openComparisonModal('${currentAnalysis}', ${JSON.stringify(filters).replace(/"/g, '&quot;')})" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Comparer
      </button>
    </div>
  `;
}

// TABLEAU STATISTIQUES
function renderStatisticsTable(data) {
  const stats = [
    { label: "Effectif", key: "effectif" },
    { label: "Moyenne", key: "moyenne" },
    { label: "Mediane", key: "mediane" },
    { label: "Ecart-type", key: "ecart_type" },
    { label: "Variance", key: "variance" },
    { label: "Minimum", key: "minimum" },
    { label: "Maximum", key: "maximum" },
    { label: "Q1", key: "q1" },
    { label: "Q3", key: "q3" },
    { label: "IQR", key: "iqr" },
    { label: "Taux de reussite", key: "taux_reussite" },
    { label: "Nombre de recus", key: "nombre_recus" },
    { label: "Nombre d'ajournes", key: "nombre_ajournes" }
  ];

  const rows = stats.map(stat => {
    const value = data[stat.key];
    const displayValue = value != null ? formatStatValue(stat.key, value) : "-";
    return `
      <tr class="border-b dark:border-gray-700">
        <td class="px-4 py-2 font-medium">${stat.label}</td>
        <td class="px-4 py-2">${displayValue}</td>
      </tr>
    `;
  }).join("");

  return `
    <table class="w-full text-sm">
      <thead class="bg-gray-100 dark:bg-gray-700">
        <tr>
          <th class="px-4 py-2 text-left">Indicateur</th>
          <th class="px-4 py-2 text-left">Valeur</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function formatStatValue(key, value) {
  if (value === null || value === undefined) return "-";
  if (["effectif", "nombre_recus", "nombre_ajournes"].includes(key)) {
    return Number(value).toLocaleString();
  }
  if (key === "taux_reussite") {
    return `${Number(value).toFixed(1)}%`;
  }
  return Number(value).toFixed(2);
}

// BLOC INTERPRÉTATION
function renderInterpretationBlock(data) {
  const taux = data.taux_reussite || 0;
  const moyenne = data.moyenne || 0;
  const ecartType = data.ecart_type || 0;
  const q1 = data.q1 || 0;
  const genMoyenne = data.moyenne_global || moyenne;

  let bgColor = "bg-red-100 text-red-800 border-red-300";
  if (taux >= 70) bgColor = "bg-green-100 text-green-800 border-green-300";
  else if (taux >= 50) bgColor = "bg-orange-100 text-orange-800 border-orange-300";

  let interpretation = "";
  if (moyenne != null && taux != null) {
    interpretation = `La moyenne est de ${moyenne.toFixed(2)}/20 avec un taux de reussite de ${taux.toFixed(1)}%. `;
  }

  if (ecartType > 3.5) {
    interpretation += `L'ecart-type eleve (${ecartType.toFixed(2)}) indique une forte heterogeneite des resultats.`;
  } else if (q1 < 7) {
    interpretation += `Le premier quartile bas (${q1.toFixed(2)}) indique des difficultes en bas du classement.`;
  } else if (moyenne > genMoyenne) {
    interpretation += `Cette analyse depasse la moyenne generale (${genMoyenne.toFixed(2)}).`;
  }

  return `
    <div class="mb-8 border rounded-lg p-6 ${bgColor}">
      <h3 class="font-semibold mb-2">Interpretation</h3>
      <p>${interpretation}</p>
    </div>
  `;
}

// TABLEAU UES
function renderUETable(ues) {
  if (!ues || ues.length === 0) return "<p>Aucune matiere disponible</p>";

  const rows = ues.slice(0, 10).map(ue => `
    <tr class="border-b dark:border-gray-700">
      <td class="px-4 py-2">${ue.ue || "-"}</td>
      <td class="px-4 py-2">${(ue.moyenne || 0).toFixed(2)}</td>
      <td class="px-4 py-2">${(ue.taux_reussite || 0).toFixed(1)}%</td>
      <td class="px-4 py-2">${ue.effectif || 0}</td>
    </tr>
  `).join("");

  return `
    <table class="w-full text-sm">
      <thead class="bg-gray-100 dark:bg-gray-700">
        <tr>
          <th class="px-4 py-2 text-left">Matiere</th>
          <th class="px-4 py-2 text-left">Moyenne</th>
          <th class="px-4 py-2 text-left">Taux Reussite</th>
          <th class="px-4 py-2 text-left">Effectif</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

// GRAPHIQUES
function renderCharts(analysis, filters) {
  const container = document.getElementById("additional-charts");
  if (!container) return;

  const qs = new URLSearchParams(filters);
  const charts = getChartsByAnalysis(analysis, filters);

  container.innerHTML = charts.map(([view, title]) => `
    <div class="bg-white dark:bg-gray-800 p-4 rounded-xl border shadow-sm">
      <h4 class="font-semibold mb-3 text-gray-700 dark:text-gray-300">${title}</h4>
      <img src="${API_URL}/figures?view=${view}&${qs}" class="w-full rounded" alt="${title}" loading="lazy"
        onerror="this.parentElement.innerHTML='<p class=\\'text-sm text-gray-400 py-8 text-center\\'>Donnees insuffisantes</p>'">
    </div>
  `).join("");
}

function getChartsByAnalysis(analysis, filters) {
  const charts = {
    global: [
      ["heatmap_ue_semestre", "Heatmap UE/Semestre"],
      ["courbe_cohortes", "Evolution moyennes par cohorte"],
      ["evolution_taux_by_semestre", "Taux reussite par semestre"],
      ["courbe_moyenne_par_sexe", "Moyennes par sexe"],
      ["validation_global", "Taux validation par cohorte"],
      ["donut", "Repartition reussite/echec"]
    ],
    annee: [
      ["evolution_moyenne_by_annee", `Evolution moyennes`],
      ["evolution_taux_by_semestre", "Taux reussite"],
      ["histogram", "Distribution notes"],
      ["donut", "Repartition reussite/echec"]
    ],
    semestre: [
      ["histogram", "Distribution notes"],
      ["boxplot", "Boxplot global"],
      ["boxplot_by_sex", "Distribution par sexe"],
      ["donut", "Repartition reussite/echec"]
    ],
    cohorte: [
      ["courbe_cohortes", "Evolution cohorte"],
      ["histogram", "Distribution notes"],
      ["evolution_taux_by_semestre", "Taux reussite"],
      ["donut", "Repartition reussite/echec"]
    ],
    filiere: [
      ["histogram", "Distribution notes"],
      ["boxplot", "Distribution globale"],
      ["donut", "Repartition reussite/echec"]
    ],
    departement: [
      ["histogram", "Distribution notes"],
      ["boxplot", "Distribution globale"],
      ["donut", "Repartition reussite/echec"]
    ]
  };

  return charts[analysis] || [];
}

// COMPARAISON
function openComparisonModal(analysis, filters) {
  const modalId = "compare-modal";
  const modalExists = document.getElementById(modalId);
  if (modalExists) modalExists.remove();

  let options = [];
  let title = "Comparer";
  let endpoint = null;
  let paramName = null;
  let currentLabel = null;

  if (analysis === "filiere") {
    title = "Comparer des filières";
    options = (dashboardMeta.filieres || []).filter(f => f !== filters.filiere);
    endpoint = "/analyse/filiere/batch";
    paramName = "filieres";
    currentLabel = filters.filiere;
  } else if (analysis === "departement") {
    title = "Comparer des départements";
    const departements = [
      { key: "GC", label: "GC" },
      { key: "GE", label: "GE" },
      { key: "GM", label: "GM" },
      { key: "GI", label: "GI" }
    ];
    options = departements.map(d => d.key);
    endpoint = "/analyse/departement/batch";
    paramName = "departements";
    currentLabel = filters.filieres || "";
  } else {
    showToast("Comparaison disponible uniquement pour Filière ou Département", "info");
    return;
  }

  const checkboxes = options.map(opt => `
      <label class="flex items-center gap-2 mb-2">
        <input type="checkbox" class="compare-checkbox" value="${opt}" />
        <span>${opt}</span>
      </label>
    `).join("");

  const modalHTML = `
    <div id="${modalId}" role="dialog" aria-modal="true" aria-labelledby="compare-modal-title" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
      <div class="w-full max-w-xl bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          <h3 id="compare-modal-title" class="text-lg font-semibold text-gray-900 dark:text-gray-100">${title}</h3>
          <button id="compare-modal-close" class="text-gray-500 hover:text-gray-900 dark:text-gray-300">X</button>
        </div>
        <div class="px-6 py-4 space-y-4">
          <p class="text-sm text-gray-600 dark:text-gray-300">Sélectionnez jusqu’à 3 éléments à comparer.</p>
          <div class="grid grid-cols-2 gap-4 max-h-72 overflow-y-auto border rounded-lg p-4 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            ${checkboxes}
          </div>
        </div>
        <div class="flex justify-end gap-3 px-6 py-4 border-t dark:border-gray-700">
          <button id="compare-modal-cancel" class="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg">Annuler</button>
          <button id="compare-modal-ok" class="px-4 py-2 bg-blue-600 text-white rounded-lg">OK - Comparer</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
  document.getElementById("compare-modal-close")?.addEventListener("click", () => document.getElementById(modalId)?.remove());
  document.getElementById("compare-modal-cancel")?.addEventListener("click", () => document.getElementById(modalId)?.remove());
  document.getElementById("compare-modal-ok")?.addEventListener("click", async () => {
    const checked = Array.from(document.querySelectorAll(".compare-checkbox:checked")).map(cb => cb.value);
    if (!checked.length) {
      showToast("Selectionnez au moins un element", "error");
      return;
    }
    document.getElementById(modalId)?.remove();

    let query = null;
    if (analysis === "filiere") {
      query = `${paramName}=${checked.join(",")}`;
      if (filters.semestre) query += `&semestre=${filters.semestre}`;
      await renderComparisonTable(endpoint, query, checked, currentLabel, "Filière");
    } else if (analysis === "departement") {
      query = `${paramName}=${checked.join("|")}`;
      if (filters.semestre) query += `&semestre=${filters.semestre}`;
      await renderComparisonTable(endpoint, query, checked, currentLabel, "Département");
    }
  });
}

async function renderComparisonTable(endpoint, query, selectedItems, currentLabel, labelType) {
  try {
    const res = await fetch(`${API_URL}${endpoint}?${query}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const rows = selectedItems.map(item => {
      const itemData = data[item] || data[item.replace(/\|/g, "-")];
      if (!itemData) return "";
      const difference = itemData.moyenne != null && itemData.taux_reussite != null
        ? `<span class=\"text-xs text-gray-500\">Δ Moyenne: ${(itemData.moyenne - (data[currentLabel]?.moyenne || 0)).toFixed(2)}, Δ Taux: ${(itemData.taux_reussite - (data[currentLabel]?.taux_reussite || 0)).toFixed(1)}%</span>`
        : "";
      return `
        <tr class="border-b dark:border-gray-700 ${item === currentLabel ? 'bg-blue-50 dark:bg-blue-900' : ''}">
          <td class="px-4 py-2 font-medium">${item}</td>
          <td class="px-4 py-2">${itemData.moyenne != null ? itemData.moyenne.toFixed(2) : '-'}</td>
          <td class="px-4 py-2">${itemData.mediane != null ? itemData.mediane.toFixed(2) : '-'}</td>
          <td class="px-4 py-2">${itemData.q1 != null ? itemData.q1.toFixed(2) : '-'}</td>
          <td class="px-4 py-2">${itemData.q3 != null ? itemData.q3.toFixed(2) : '-'}</td>
          <td class="px-4 py-2">${itemData.ecart_type != null ? itemData.ecart_type.toFixed(2) : '-'}</td>
          <td class="px-4 py-2">${itemData.taux_reussite != null ? itemData.taux_reussite.toFixed(1) + '%' : '-'}</td>
          <td class="px-4 py-2">${itemData.effectif || 0}</td>
        </tr>
        <tr><td colspan="8" class="px-4 py-1 text-xs text-gray-500">${difference}</td></tr>
      `;
    }).join("");

    const compareHtml = `
      <div class="p-8">
        <h2 class="text-2xl font-bold mb-4">Comparaison ${labelType}</h2>
        <div class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <table class="w-full text-sm">
            <thead class="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th class="px-4 py-2 text-left">${labelType}</th>
                <th class="px-4 py-2 text-left">Moyenne</th>
                <th class="px-4 py-2 text-left">Médiane</th>
                <th class="px-4 py-2 text-left">Q1</th>
                <th class="px-4 py-2 text-left">Q3</th>
                <th class="px-4 py-2 text-left">Écart-type</th>
                <th class="px-4 py-2 text-left">Taux réussite</th>
                <th class="px-4 py-2 text-left">Effectif</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
        <div class="mt-4 flex flex-wrap gap-3">
          <button id="export-comparison-csv" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Exporter CSV</button>
          <button onclick="selectAnalysis('${analysis}')" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">Revenir à l'analyse</button>
        </div>
      </div>
    `;

    document.getElementById("main-content").innerHTML = compareHtml;
    document.getElementById("export-comparison-csv")?.addEventListener("click", () => exportComparisonToCSV(data, selectedItems, labelType));
  } catch (err) {
    console.error("Erreur comparaison:", err);
    showToast("Impossible de charger la comparaison", "error");
  }
}

function exportComparisonToCSV(data, selectedItems, labelType) {
  const headers = [labelType, "Moyenne", "Médiane", "Q1", "Q3", "Écart-type", "Taux réussite", "Effectif"];
  const rows = selectedItems.map(item => {
    const itemData = data[item] || data[item.replace(/\|/g, "-")] || {};
    return [
      item,
      itemData.moyenne != null ? itemData.moyenne.toFixed(2) : "",
      itemData.mediane != null ? itemData.mediane.toFixed(2) : "",
      itemData.q1 != null ? itemData.q1.toFixed(2) : "",
      itemData.q3 != null ? itemData.q3.toFixed(2) : "",
      itemData.ecart_type != null ? itemData.ecart_type.toFixed(2) : "",
      itemData.taux_reussite != null ? itemData.taux_reussite.toFixed(1) + "%" : "",
      itemData.effectif != null ? itemData.effectif : ""
    ].join(",");
  });

  const csvContent = [headers.join(",")].concat(rows).join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `comparaison_${labelType.toLowerCase().replace(/ /g, "_")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// SECTION ÉTUDIANT
function renderEtudiantSection() {
  const mainContent = document.getElementById("main-content");
  if (!mainContent) return;

  mainContent.innerHTML = `
    <div class="p-8">
      <h2 class="text-2xl font-bold mb-6">Parcours Etudiant</h2>
      <div id="etudiant-search" class="mb-6 bg-white dark:bg-gray-800 rounded-lg p-6">
        <div class="flex gap-3">
          <label for="search-etudiant-input" class="sr-only">Rechercher un étudiant par anonymat ou numéro de carte</label>
          <input type="text" id="search-etudiant-input" placeholder="Anonymat ou Numero de carte" 
            class="flex-1 border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600">
          <button id="btn-search-etudiant-modal" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Chercher
          </button>
        </div>
      </div>
      <div id="etudiant-results" class="bg-white dark:bg-gray-800 rounded-lg p-6"></div>
    </div>
  `;

  document.getElementById("btn-search-etudiant-modal")?.addEventListener("click", searchEtudiant);
  document.getElementById("search-etudiant-input")?.addEventListener("keydown", e => {
    if (e.key === "Enter") searchEtudiant();
  });
}

async function searchEtudiant() {
  const input = document.getElementById("search-etudiant-input");
  const id = input?.value.trim();
  if (!id) return;

  try {
    const res = await fetch(`${API_URL}/etudiants/${encodeURIComponent(id)}/parcours`);
    if (!res.ok) throw new Error("Non trouvé");
    const data = await res.json();
    
    const results = document.getElementById("etudiant-results");
    if (results) {
      results.innerHTML = `
        <h3 class="text-lg font-semibold mb-4">${data.nom_prenoms || data.anonymat}</h3>
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div><strong>Anonymat:</strong> ${data.anonymat}</div>
          <div><strong>Carte:</strong> ${data.carte || "-"}</div>
          <div><strong>Sexe:</strong> ${data.sexe || "-"}</div>
          <div><strong>Cohorte:</strong> ${data.cohorte || "-"}</div>
          <div><strong>Moyenne:</strong> ${(data.moyenne_globale || 0).toFixed(2)}</div>
          <div><strong>Taux Reussite:</strong> ${(data.taux_reussite_global || 0).toFixed(1)}%</div>
        </div>
        <h4 class="font-semibold mb-3">Parcours</h4>
        <table class="w-full text-sm">
          <thead><tr><th class="px-2 py-1">UE</th><th class="px-2 py-1">Semestre</th><th class="px-2 py-1">Note</th><th class="px-2 py-1">Credit</th></tr></thead>
          <tbody>
            ${data.parcours.map(p => `<tr><td class="px-2 py-1">${p.ue}</td><td class="px-2 py-1">${p.semestre}</td><td class="px-2 py-1">${(p.note || 0).toFixed(2)}</td><td class="px-2 py-1">${p.credit || 0}</td></tr>`).join("")}
          </tbody>
        </table>
      `;
    }
  } catch (err) {
    document.getElementById("etudiant-results").innerHTML = `<p class="text-red-600">Etudiant non trouve</p>`;
  }
}

// UPLOAD CSV
async function handleCSVUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_URL}/data/upload`, { method: "POST", body: formData });
    if (!res.ok) throw new Error(`Erreur: ${await res.text()}`);
    const data = await res.json();
    
    showToast(`CSV charge avec succes: ${data.rows} lignes`, "success");
    
    // Recharger les métadonnées et rafraichir
    await loadMetadata();
    renderSidebar();
    await loadDashboard(currentAnalysis, currentFilters);

  } catch (err) {
    showToast(`Erreur upload: ${err.message}`, "error");
  }

  e.target.value = "";
}

// UTILITAIRES
function setLoading(active) {
  const btns = document.querySelectorAll("#apply-filters-btn");
  btns.forEach(btn => {
    btn.disabled = active;
    btn.textContent = active ? "Chargement..." : "Appliquer";
    btn.classList.toggle("opacity-60", active);
  });
}

function closeAllModals() {
  document.querySelectorAll("#compare-modal").forEach(el => el.remove());
  document.getElementById("sidebar-overlay")?.classList.add("hidden");
}

function showToast(message, type = "info") {
  const colors = { error: "bg-red-600", info: "bg-blue-600", success: "bg-green-600" };
  const toast = document.createElement("div");
  toast.className = `fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-lg text-white text-sm font-medium shadow-lg transition-opacity duration-300 ${colors[type] || colors.info}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function loadThemePreference() {
  const isDark = localStorage.getItem("theme") === "dark";
  document.body.classList.toggle("dark", isDark);
  updateThemeIcons(isDark);
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateThemeIcons(isDark);
}

// Sauvegarde simple de l'état de l'application
function saveDashboardState() {
  try {
    const state = { analysis: currentAnalysis, filters: currentFilters };
    localStorage.setItem('dashboardAppState', JSON.stringify(state));
  } catch (e) {
    console.warn('Impossible de sauvegarder l\'état du dashboard', e);
  }
}

function recordUnloadAttempt() {
  try {
    const raw = localStorage.getItem('dashboardUnloadCount');
    const count = raw ? Number(raw) || 0 : 0;
    localStorage.setItem('dashboardUnloadCount', String(count + 1));
    console.log('dashboard: unload count', count + 1);
  } catch (e) {
    console.warn('Impossible d\'enregistrer le compteur d\'unload', e);
  }
}

window.addEventListener('beforeunload', (event) => {
  saveDashboardState();
  recordUnloadAttempt();
  event.preventDefault();
  event.returnValue = 'Le site va se recharger ou se fermer. Voulez-vous continuer ?';
  return 'Le site va se recharger ou se fermer. Voulez-vous continuer ?';
});

function updateThemeIcons(isDark) {
  document.getElementById("theme-icon-light")?.classList.toggle("hidden", isDark);
  document.getElementById("theme-icon-dark")?.classList.toggle("hidden", !isDark);
}
