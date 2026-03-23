"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── PRICING DATA (Hérault / Montpellier — AE artisan rates 2024-2025) ───
const ETAPES = [
  { id: "demolition", num: 1, label: "Démolition", icon: "💥", tva: 10, color: "#e74c3c",
    items: [
      { id: "depose_cloisons", label: "Dépose cloisons", unit: "m²", mat: 0, mo: 8, desc: "Démontage cloisons non porteuses" },
      { id: "depose_sols", label: "Dépose revêtement sol", unit: "m²", mat: 0, mo: 7, desc: "Arrachage carrelage, parquet, moquette" },
      { id: "depose_fauxplafond", label: "Dépose faux plafond", unit: "m²", mat: 0, mo: 6, desc: "Démontage placo plafond + ossature" },
      { id: "depose_faience", label: "Dépose faïence murale", unit: "m²", mat: 0, mo: 9, desc: "Piochage faïence SdB/cuisine" },
      { id: "depose_cuisine", label: "Dépose cuisine", unit: "u", mat: 0, mo: 200, desc: "Démontage complet cuisine équipée" },
      { id: "depose_sanitaires", label: "Dépose sanitaires", unit: "u", mat: 0, mo: 80, desc: "WC, lavabo, baignoire/douche" },
      { id: "evacuation_gravats", label: "Évacuation gravats", unit: "m³", mat: 45, mo: 30, desc: "Chargement + déchetterie (ou benne)" },
      { id: "benne", label: "Location benne 8m³", unit: "u", mat: 350, mo: 0, desc: "Benne livrée + enlevée" },
    ]
  },
  { id: "preparation", num: 2, label: "Préparation", icon: "🔧", tva: 10, color: "#e67e22",
    items: [
      { id: "detapissage", label: "Détapissage murs", unit: "m²", mat: 1, mo: 6, desc: "Décolleuse vapeur + grattage" },
      { id: "ratissage", label: "Ratissage/enduit murs", unit: "m²", mat: 3, mo: 10, desc: "Enduit de lissage 2 passes" },
      { id: "ragreage", label: "Ragréage sol", unit: "m²", mat: 8, mo: 10, desc: "Ragréage auto-lissant P3" },
      { id: "bloc_serrure", label: "Bloc serrure + béquillage", unit: "u", mat: 45, mo: 25, desc: "Gamme HOPE ou équivalent" },
      { id: "detalonnage", label: "Détalonnage portes", unit: "u", mat: 0, mo: 15, desc: "1cm chambres, 18mm pièces humides" },
      { id: "rebouchage_trous", label: "Rebouchage trous/saignées", unit: "forfait", mat: 30, mo: 15, desc: "MAP + enduit, par pièce environ" },
      { id: "nettoyage_chantier", label: "Nettoyage chantier", unit: "m²", mat: 1, mo: 3, desc: "Nettoyage fin de chaque phase" },
      { id: "branchement_provisoire", label: "Branchement élec provisoire", unit: "forfait", mat: 80, mo: 120, desc: "Coffret chantier si nécessaire" },
    ]
  },
  { id: "menuiserie", num: 3, label: "Menuiseries", icon: "🪟", tva: 10, color: "#f39c12",
    items: [
      { id: "fenetre_pvc_std", label: "Fenêtre PVC (≈120×135)", unit: "u", mat: 250, mo: 150, desc: "Double vitrage 4-20-4, pose rénovation" },
      { id: "fenetre_pvc_grande", label: "Fenêtre PVC (≈180×135)", unit: "u", mat: 380, mo: 180, desc: "Double vitrage, pose rénovation" },
      { id: "porte_fenetre_pvc", label: "Porte-fenêtre PVC", unit: "u", mat: 450, mo: 200, desc: "Double vitrage, 1 ou 2 vantaux" },
      { id: "porte_paliere", label: "Porte palière CF30 — 5pts", unit: "u", mat: 500, mo: 200, desc: "Coupe-feu 30min, 5 points" },
      { id: "porte_interieure", label: "Porte intérieure âme pleine", unit: "u", mat: 120, mo: 80, desc: "Lisse blanche + huisserie" },
      { id: "velux_mk04", label: "Vélux MK04 (78×98)", unit: "u", mat: 350, mo: 250, desc: "Confort GGL + raccord + store" },
      { id: "velux_sk06", label: "Vélux SK06 (114×118)", unit: "u", mat: 500, mo: 280, desc: "Confort GGL + raccord + store" },
      { id: "volet_roulant", label: "Volet roulant PVC manuel", unit: "u", mat: 180, mo: 100, desc: "Rénovation, coffre extérieur" },
      { id: "seuil_porte_entree", label: "Seuil + habillage porte", unit: "u", mat: 30, mo: 40, desc: "Finition pourtour porte palière" },
    ]
  },
  { id: "platrerie", num: 4, label: "Plâtrerie & Isolation", icon: "🧱", tva: 10, color: "#2ecc71",
    items: [
      { id: "cloison_distrib", label: "Cloison distrib. BA13", unit: "m²", mat: 12, mo: 18, desc: "Rail+montant 48, BA13, bandes" },
      { id: "cloison_isolee", label: "Cloison isolée (logements)", unit: "m²", mat: 18, mo: 24, desc: "Double ossature 48, LDV 45, 2×BA13" },
      { id: "cloison_hydro", label: "Cloison hydrofuge (SdB)", unit: "m²", mat: 18, mo: 22, desc: "BA13 hydro verte, ossature 48" },
      { id: "cloison_sad", label: "Cloison SAD coupe-feu", unit: "m²", mat: 22, mo: 28, desc: "LDV 100 + montant 48 ×2, 2×BA13" },
      { id: "doublage_mur", label: "Doublage mur périph. 140mm", unit: "m²", mat: 16, mo: 22, desc: "Optima 2 / rail+montant, LDV 140" },
      { id: "faux_plafond_suspendu", label: "Faux plafond suspendu", unit: "m²", mat: 12, mo: 20, desc: "Suspentes + fourrures + BA13" },
      { id: "faux_plafond_isole", label: "Faux plafond isolé 200mm", unit: "m²", mat: 18, mo: 24, desc: "Suspentes + fourrures + BA13 + LDV" },
      { id: "plafond_autoporte", label: "Plafond autoporté", unit: "m²", mat: 14, mo: 22, desc: "Rails périph + montants doublés" },
      { id: "isolation_rampants", label: "Isolation rampants 300mm", unit: "m²", mat: 22, mo: 20, desc: "LDV 260 kraft + BA13" },
      { id: "trappe_visite", label: "Trappe de visite", unit: "u", mat: 25, mo: 30, desc: "Accès combles / gaines" },
    ]
  },
  { id: "elec_plomb", num: 5, label: "Élec / Plomb / SdB", icon: "⚡", tva: 10, color: "#1abc9c",
    items: [
      { id: "tableau_elec", label: "Tableau électrique complet", unit: "u", mat: 350, mo: 300, desc: "Schneider XE, disj. diff. A+AC" },
      { id: "point_elec", label: "Point électrique (prise/inter)", unit: "u", mat: 12, mo: 35, desc: "Legrand Dooxie + câblage" },
      { id: "spot_led", label: "Spot LED encastré", unit: "u", mat: 15, mo: 20, desc: "IP20/IP44, perçage + raccord" },
      { id: "alimentation_eau", label: "Alimentation eau (EC+EF)", unit: "u", mat: 40, mo: 80, desc: "Par point d'eau, multicouche/PER" },
      { id: "evacuation_eu", label: "Évacuation EU/EV", unit: "u", mat: 30, mo: 70, desc: "PVC Ø32 à Ø100" },
      { id: "chauffe_eau", label: "Chauffe-eau électrique", unit: "u", mat: 280, mo: 150, desc: "100L ou 150L + raccords" },
      { id: "meuble_vasque", label: "Meuble vasque + miroir", unit: "u", mat: 250, mo: 80, desc: "60-80cm, miroir éclairé" },
      { id: "receveur_douche", label: "Receveur + paroi douche", unit: "u", mat: 350, mo: 200, desc: "80×80 grès, paroi verre 8mm" },
      { id: "wc_complet", label: "WC céramique + abattant", unit: "u", mat: 120, mo: 80, desc: "Frein de chute" },
      { id: "seche_serviette", label: "Sèche-serviette 500W", unit: "u", mat: 100, mo: 60, desc: "Électrique + thermostat" },
      { id: "carrelage_sol_sdb", label: "Carrelage sol SdB", unit: "m²", mat: 25, mo: 35, desc: "Grès cérame 60×60 rectifié" },
      { id: "faience_mur_sdb", label: "Faïence murale SdB", unit: "m²", mat: 22, mo: 35, desc: "60×30 ou 60×60, baguettes alu" },
      { id: "etancheite_sdb", label: "Étanchéité SdB (SPEC)", unit: "m²", mat: 12, mo: 10, desc: "Primaire + résine + bande" },
      { id: "consuel", label: "Consuel (attestation)", unit: "u", mat: 180, mo: 0, desc: "Par logement créé" },
    ]
  },
  { id: "sol", num: 6, label: "Sols", icon: "🪵", tva: 10, color: "#3498db",
    items: [
      { id: "sous_couche", label: "Sous-couche 5mm", unit: "m²", mat: 4, mo: 2, desc: "Acoustique Udirev ou equiv." },
      { id: "parquet_stratifie", label: "Parquet stratifié chêne 8mm", unit: "m²", mat: 12, mo: 12, desc: "Lamidecor 33, 4 chanfreins" },
      { id: "plinthes", label: "Plinthes blanches 95×9mm", unit: "ml", mat: 3, mo: 5, desc: "Bord arrondi + joint acrylique" },
      { id: "barre_seuil", label: "Barre de seuil 5-en-1", unit: "u", mat: 12, mo: 8, desc: "Par passage de porte" },
      { id: "nez_marche", label: "Nez de marche", unit: "ml", mat: 15, mo: 12, desc: "Si escalier, alu ou bois" },
    ]
  },
  { id: "peinture", num: 7, label: "Peinture", icon: "🎨", tva: 10, color: "#9b59b6",
    items: [
      { id: "peinture_murs", label: "Peinture murs (impre+2c)", unit: "m²", mat: 4, mo: 10, desc: "Impression + 2 couches satinées" },
      { id: "peinture_plafond", label: "Peinture plafond", unit: "m²", mat: 3, mo: 9, desc: "Impression + 2 couches mat" },
      { id: "peinture_3d", label: "Peinture 3D (pan coloré)", unit: "m²", mat: 5, mo: 12, desc: "Mat coloré + vernis" },
      { id: "peinture_boiseries", label: "Peinture boiseries/plinthes", unit: "ml", mat: 2, mo: 5, desc: "Acrylique blanche" },
      { id: "peinture_radiateur", label: "Peinture radiateur", unit: "u", mat: 8, mo: 20, desc: "Sous-couche métal + laque" },
    ]
  },
  { id: "cuisine", num: 8, label: "Cuisine", icon: "🍳", tva: 20, color: "#e91e63",
    items: [
      { id: "cuisine_meuble_bas", label: "Meubles bas cuisine", unit: "ml", mat: 120, mo: 60, desc: "Brico Dépôt, Garcinia blanche" },
      { id: "cuisine_meuble_haut", label: "Meubles hauts", unit: "ml", mat: 80, mo: 50, desc: "Au-dessus des meubles bas" },
      { id: "plan_travail", label: "Plan de travail hêtre", unit: "ml", mat: 65, mo: 40, desc: "4cm, verni marine 3 couches" },
      { id: "credence", label: "Crédence", unit: "ml", mat: 20, mo: 25, desc: "Alu-composite ou stratifié" },
      { id: "evier_robinet", label: "Évier + mitigeur", unit: "u", mat: 100, mo: 60, desc: "Inox, mitigeur éco" },
      { id: "plaque_cuisson", label: "Plaque de cuisson", unit: "u", mat: 150, mo: 40, desc: "2 ou 4 feux" },
      { id: "hotte_casquette", label: "Hotte casquette", unit: "u", mat: 60, mo: 40, desc: "60cm" },
      { id: "four_encastrable", label: "Four encastrable", unit: "u", mat: 200, mo: 40, desc: "Multifonction basique" },
      { id: "frigo_encastre", label: "Frigo encastré", unit: "u", mat: 300, mo: 40, desc: "Avec congélation séparée" },
      { id: "colonne_frigo", label: "Colonne frigo", unit: "u", mat: 150, mo: 60, desc: "Meuble colonne" },
    ]
  },
  { id: "autre", num: 9, label: "Autre / Divers", icon: "📦", tva: 20, color: "#607d8b",
    items: [
      { id: "compteur_elec", label: "Création compteur élec", unit: "u", mat: 800, mo: 200, desc: "Enedis + raccordement" },
      { id: "compteur_eau", label: "Création compteur eau", unit: "u", mat: 100, mo: 200, desc: "Kit + plombier + validation" },
      { id: "compteur_communs", label: "Compteur parties communes", unit: "u", mat: 300, mo: 150, desc: "Éclairage communs" },
      { id: "climatisation", label: "Clim réversible", unit: "u", mat: 400, mo: 250, desc: "Airton mono-split" },
      { id: "vmc", label: "VMC simple flux", unit: "u", mat: 80, mo: 120, desc: "Par logement" },
      { id: "interphone", label: "Interphone/Digicode", unit: "u", mat: 200, mo: 150, desc: "Platine + combinés" },
      { id: "boites_lettres", label: "Boîtes aux lettres", unit: "u", mat: 50, mo: 30, desc: "Normalisée" },
      { id: "nuki_keypad", label: "Nuki+Keypad", unit: "u", mat: 280, mo: 40, desc: "Serrure connectée" },
      { id: "geometre", label: "Géomètre (EDD+Carrez)", unit: "forfait", mat: 2500, mo: 0, desc: "Division + mesurage" },
      { id: "architecte_dp", label: "Architecte / DP / PC", unit: "forfait", mat: 1500, mo: 0, desc: "Plans + déclaration préalable" },
      { id: "divers_consommables", label: "Consommables divers", unit: "forfait", mat: 300, mo: 0, desc: "Joints, scotch, bâches..." },
    ]
  },
  { id: "ameublement", num: 10, label: "Ameublement", icon: "🛋️", tva: 20, color: "#795548",
    items: [
      { id: "lit_140", label: "Lit 140×200 + matelas", unit: "u", mat: 300, mo: 30, desc: "Cadre + mémoire de forme" },
      { id: "literie", label: "Literie complète", unit: "u", mat: 80, mo: 0, desc: "Oreillers, couette, alèse" },
      { id: "bureau_chaise", label: "Bureau + chaise", unit: "u", mat: 120, mo: 20, desc: "Bureau + chaise métal" },
      { id: "table_chevet", label: "Table de chevet + lampe", unit: "u", mat: 50, mo: 0, desc: "Par chambre" },
      { id: "dressing_ouvert", label: "Dressing ouvert", unit: "u", mat: 80, mo: 30, desc: "Penderie + cintres" },
      { id: "canape", label: "Canapé", unit: "u", mat: 350, mo: 30, desc: "Fixe ou convertible" },
      { id: "table_basse", label: "Table basse + tapis", unit: "u", mat: 80, mo: 0, desc: "Salon" },
      { id: "meuble_tv", label: "Meuble TV + TV murale", unit: "u", mat: 350, mo: 40, desc: "Meuble + TV + fixation" },
      { id: "table_manger", label: "Table + chaises", unit: "u", mat: 200, mo: 20, desc: "Table + 4 chaises" },
      { id: "deco_cadres", label: "Déco (cadres, miroir)", unit: "u", mat: 150, mo: 0, desc: "Cadres + miroir + lampe" },
      { id: "vaisselle_ustensiles", label: "Vaisselle & ustensiles", unit: "u", mat: 100, mo: 0, desc: "Set complet" },
      { id: "console_entree", label: "Console entrée", unit: "u", mat: 60, mo: 0, desc: "Entrée + paillasson" },
      { id: "micro_ondes", label: "Micro-ondes", unit: "u", mat: 60, mo: 0, desc: "À partir du T3" },
    ]
  },
];

const LOT_TYPES = [
  { value: "studio", label: "Studio", r: 350 }, { value: "t1", label: "T1", r: 380 },
  { value: "t1bis", label: "T1 Bis", r: 420 }, { value: "t2", label: "T2", r: 500 },
  { value: "t2bis", label: "T2 Bis", r: 540 }, { value: "t3", label: "T3", r: 650 },
  { value: "t4", label: "T4", r: 780 }, { value: "coloc", label: "Chambre coloc", r: 380 },
  { value: "local", label: "Local commercial", r: 500 }, { value: "garage", label: "Garage", r: 80 },
];

const fmt = (n) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " €";
const fmtDec = (n) => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " €";
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const STORAGE_KEY = "chiffrage-projects-v1";

const EMPTY_PROJECT = () => ({
  id: genId(), name: "Nouveau projet", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  info: { adresse: "", ville: "", cp: "", surface: 0, prixVente: 0, negociation: 0, fraisNotaire: 8, fraisAgence: 0, taxeFonciere: 0, prixM2Renove: 2000, assurancePNO: 600 },
  lots: [], quantities: {}, customMat: {}, customMo: {},
});

// ─── localStorage persistence ───
function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveProjects(projects) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)); } catch (e) { console.error("Save failed", e); }
}

// ─── Calc helpers ───
function calcProject(p) {
  const { info, lots, quantities, customMat, customMo } = p;
  const gM = (item) => customMat[item.id] !== undefined && customMat[item.id] !== "" ? customMat[item.id] : item.mat;
  const gO = (item) => customMo[item.id] !== undefined && customMo[item.id] !== "" ? customMo[item.id] : item.mo;
  const gQ = (item) => quantities[item.id] || 0;
  const etapes = ETAPES.map(e => {
    const ht = e.items.reduce((s, i) => s + gQ(i) * (gM(i) + gO(i)), 0);
    return { ...e, ht, ttc: Math.round(ht * (1 + e.tva / 100)), matT: e.items.reduce((s, i) => s + gQ(i) * gM(i), 0), moT: e.items.reduce((s, i) => s + gQ(i) * gO(i), 0) };
  });
  const totalTTC = etapes.reduce((s, e) => s + e.ttc, 0);
  const totalMat = etapes.reduce((s, e) => s + e.matT, 0);
  const totalMo = etapes.reduce((s, e) => s + e.moT, 0);
  const prixNet = info.prixVente - info.negociation;
  const fraisNotaireEur = Math.round(prixNet * info.fraisNotaire / 100);
  const acteEnMain = prixNet + fraisNotaireEur + info.fraisAgence;
  const montantTotal = acteEnMain + totalTTC;
  const coutM2 = info.surface > 0 ? Math.round(montantTotal / info.surface) : 0;
  const loyerMensuel = lots.reduce((s, l) => s + l.loyer * l.qty, 0);
  const loyerAnnuel = loyerMensuel * 12;
  const chargesAn = info.taxeFonciere + info.assurancePNO;
  const rentaBrute = montantTotal > 0 ? (loyerAnnuel / montantTotal) * 100 : 0;
  const rentaNette = montantTotal > 0 ? ((loyerAnnuel - chargesAn) / montantTotal) * 100 : 0;
  const plusValue = (info.prixM2Renove - coutM2) * (info.surface || 0);
  return { etapes, totalTTC, totalMat, totalMo, acteEnMain, montantTotal, coutM2, loyerMensuel, loyerAnnuel, rentaBrute, rentaNette, plusValue, fraisNotaireEur, prixNet, chargesAn };
}

// ─── Styles ───
const C = { bg: "#080810", card: "#0e0e1a", cardBorder: "#1e1e3a", input: "#12122a", inputBorder: "#252545", gold: "#c9a96e", green: "#2ecc71", blue: "#3498db", text: "#e0e0e0", muted: "#888", dim: "#555" };

export default function App() {
  const [projects, setProjects] = useState(() => loadProjects());
  const [currentId, setCurrentId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("info");
  const [activeStep, setActiveStep] = useState(0);
  const [showExport, setShowExport] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const saveTimer = useRef(null);

  const persist = useCallback((np) => {
    setProjects(np); setSaving(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { saveProjects(np); setSaving(false); }, 400);
  }, []);

  const current = projects.find(p => p.id === currentId);
  const updateProject = useCallback((fn) => { persist(projects.map(p => p.id === currentId ? { ...fn(p), updatedAt: new Date().toISOString() } : p)); }, [projects, currentId, persist]);
  const updateInfo = (k, v) => updateProject(p => ({ ...p, info: { ...p.info, [k]: v } }));
  const setQty = (id, v) => updateProject(p => ({ ...p, quantities: { ...p.quantities, [id]: v === "" ? "" : Number(v) } }));
  const setMatC = (id, v) => updateProject(p => ({ ...p, customMat: { ...p.customMat, [id]: v === "" ? "" : Number(v) } }));
  const setMoC = (id, v) => updateProject(p => ({ ...p, customMo: { ...p.customMo, [id]: v === "" ? "" : Number(v) } }));
  const setLots = (fn) => updateProject(p => ({ ...p, lots: typeof fn === "function" ? fn(p.lots) : fn }));

  const createProject = () => { const np = EMPTY_PROJECT(); persist([...projects, np]); setCurrentId(np.id); setTab("info"); };
  const duplicateProject = (id) => { const src = projects.find(p => p.id === id); if (!src) return; const np = { ...JSON.parse(JSON.stringify(src)), id: genId(), name: src.name + " (copie)", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; persist([...projects, np]); };
  const deleteProject = (id) => { persist(projects.filter(p => p.id !== id)); if (currentId === id) setCurrentId(null); setConfirmDelete(null); };
  const renameProject = (id, name) => { persist(projects.map(p => p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p)); };

  const calc = current ? calcProject(current) : null;
  const getMat = (item) => current?.customMat[item.id] !== undefined && current.customMat[item.id] !== "" ? current.customMat[item.id] : item.mat;
  const getMo = (item) => current?.customMo[item.id] !== undefined && current.customMo[item.id] !== "" ? current.customMo[item.id] : item.mo;
  const getQty = (item) => current?.quantities[item.id] || 0;
  const itemTotal = (item) => getQty(item) * (getMat(item) + getMo(item));

  const si = {
    input: { background: C.input, border: `1px solid ${C.inputBorder}`, borderRadius: 6, color: C.text, padding: "7px 10px", fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: "none", width: "100%", boxSizing: "border-box" },
    inputSm: { background: C.input, border: `1px solid ${C.inputBorder}`, borderRadius: 5, color: C.text, padding: "6px 8px", fontSize: 12, fontFamily: "'DM Sans',sans-serif", outline: "none", width: "100%", boxSizing: "border-box", textAlign: "right" },
    label: { fontSize: 10, color: "#777", textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600 },
    card: { background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, marginBottom: 12, overflow: "hidden" },
    btn: (bg, cl) => ({ padding: "10px 18px", background: bg, border: "none", borderRadius: 8, color: cl, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }),
  };

  // ═══════════ DASHBOARD ═══════════
  if (!currentId) return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg,#0f0f1a,#161628)", borderBottom: `1px solid ${C.cardBorder}`, padding: "28px 20px 22px", textAlign: "center" }}>
        <div style={{ fontSize: 10, color: C.gold, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700 }}>Investissement locatif</div>
        <h1 style={{ margin: "4px 0 0", fontSize: 26, fontWeight: 800, background: "linear-gradient(90deg,#c9a96e,#e8d5a8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MES CHIFFRAGES</h1>
        <p style={{ color: C.dim, fontSize: 13, margin: "8px 0 0" }}>{projects.length} projet{projects.length !== 1 ? "s" : ""}</p>
      </div>
      <div style={{ maxWidth: 700, margin: "20px auto", padding: "0 16px" }}>
        <button onClick={createProject} style={{ width: "100%", padding: 18, background: `linear-gradient(135deg,${C.gold},#8b6b3d)`, border: "none", borderRadius: 12, color: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", marginBottom: 20 }}>+ Nouveau chiffrage</button>
        {projects.length === 0 && <div style={{ textAlign: "center", padding: "60px 20px", color: C.dim }}><div style={{ fontSize: 48, marginBottom: 16 }}>🏗️</div><p>Aucun projet. Créez votre premier chiffrage.</p></div>}
        {[...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map(p => {
          const pc = calcProject(p);
          return (
            <div key={p.id} style={{ ...si.card, marginBottom: 12 }}><div style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.gold, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: C.dim }}>{p.info.adresse ? `${p.info.adresse}, ` : ""}{p.info.cp} {p.info.ville}{p.info.surface ? ` — ${p.info.surface} m²` : ""}</div>
                  <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>Modifié {new Date(p.updatedAt).toLocaleDateString("fr-FR")} {new Date(p.updatedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => { setCurrentId(p.id); setTab("info"); }} style={si.btn(C.gold + "22", C.gold)}>Ouvrir</button>
                  <button onClick={() => duplicateProject(p.id)} style={si.btn("#1a1a2e", C.muted)} title="Dupliquer">⧉</button>
                  {confirmDelete !== p.id ? <button onClick={() => setConfirmDelete(p.id)} style={si.btn("#2a1015", "#e74c3c")}>✕</button> : <button onClick={() => deleteProject(p.id)} style={si.btn("#e74c3c", "#fff")}>Confirmer</button>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                {[{ l: "Projet", v: pc.montantTotal > 0 ? fmt(pc.montantTotal) : "—", c: C.green }, { l: "Travaux", v: pc.totalTTC > 0 ? fmt(pc.totalTTC) : "—", c: C.blue }, { l: "Loyer", v: pc.loyerMensuel > 0 ? `${fmt(pc.loyerMensuel)}/m` : "—", c: C.blue }, { l: "Renta", v: pc.rentaBrute > 0 ? pc.rentaBrute.toFixed(1) + "%" : "—", c: pc.rentaBrute >= 8 ? C.green : pc.rentaBrute >= 5 ? "#f1c40f" : "#e74c3c" }].map((m, i) => (
                  <div key={i} style={{ padding: "6px 10px", background: "#08080f", borderRadius: 6 }}><div style={{ fontSize: 9, color: C.dim, textTransform: "uppercase" }}>{m.l}</div><div style={{ fontSize: 14, fontWeight: 700, color: m.c }}>{m.v}</div></div>
                ))}
              </div>
            </div></div>
          );
        })}
      </div>
    </div>
  );

  // ═══════════ PROJECT EDITOR ═══════════
  const info = current.info;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans',sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0f0f1a,#161628)", borderBottom: `1px solid ${C.cardBorder}`, padding: "14px 16px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => { setCurrentId(null); setShowExport(false); }} style={{ background: "none", border: `1px solid ${C.inputBorder}`, borderRadius: 8, color: C.gold, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>←</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.gold, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{current.name}</div>
            <div style={{ fontSize: 11, color: C.dim }}>{info.adresse ? `${info.adresse}, ` : ""}{info.cp} {info.ville}{info.surface ? ` — ${info.surface}m²` : ""}</div>
          </div>
          <div style={{ fontSize: 10, color: saving ? C.dim : C.green, flexShrink: 0 }}>{saving ? "💾…" : "✓"}</div>
          {calc.montantTotal > 0 && <div style={{ display: "flex", gap: 10, fontSize: 11, flexShrink: 0 }}>
            <span style={{ color: C.green, fontWeight: 700 }}>{fmt(calc.montantTotal)}</span>
            <span style={{ color: calc.rentaBrute >= 8 ? C.green : "#f1c40f", fontWeight: 700 }}>{calc.rentaBrute.toFixed(1)}%</span>
          </div>}
        </div>
      </div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, padding: "8px 12px", background: "#0a0a14", borderBottom: "1px solid #1a1a30", position: "sticky", top: 0, zIndex: 20, justifyContent: "center" }}>
        {[{ id: "info", l: "🏠 Bien & Lots" }, { id: "travaux", l: "🔨 Travaux" }, { id: "synthese", l: "📊 Synthèse" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 20px", background: tab === t.id ? C.gold + "22" : "transparent", border: tab === t.id ? `1px solid ${C.gold}55` : "1px solid transparent", borderRadius: 8, color: tab === t.id ? C.gold : "#666", cursor: "pointer", fontSize: 13, fontWeight: tab === t.id ? 700 : 500, fontFamily: "'DM Sans',sans-serif" }}>{t.l}</button>
        ))}
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 12px 60px" }}>

        {/* ─── INFO TAB ─── */}
        {tab === "info" && <>
          <div style={si.card}><div style={{ padding: 16 }}>
            <h3 style={{ color: C.gold, margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>📍 Le bien</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}><div style={{ flex: "2 1 200px" }}><div style={si.label}>Nom du projet</div><input style={si.input} value={current.name} onChange={e => renameProject(current.id, e.target.value)} /></div></div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <div style={{ flex: "2 1 200px" }}><div style={si.label}>Adresse</div><input style={si.input} value={info.adresse} onChange={e => updateInfo("adresse", e.target.value)} placeholder="15 Rue Mandajors" /></div>
              <div style={{ flex: "0 0 100px" }}><div style={si.label}>CP</div><input style={si.input} value={info.cp} onChange={e => updateInfo("cp", e.target.value)} placeholder="34000" /></div>
              <div style={{ flex: "1 1 140px" }}><div style={si.label}>Ville</div><input style={si.input} value={info.ville} onChange={e => updateInfo("ville", e.target.value)} placeholder="Montpellier" /></div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}><div style={si.label}>Surface (m²)</div><input type="number" style={si.input} value={info.surface || ""} onChange={e => updateInfo("surface", +e.target.value || 0)} /></div>
              <div style={{ flex: 1 }}><div style={si.label}>Prix m² rénové marché</div><input type="number" style={si.input} value={info.prixM2Renove || ""} onChange={e => updateInfo("prixM2Renove", +e.target.value || 0)} /></div>
            </div>
          </div></div>
          <div style={si.card}><div style={{ padding: 16 }}>
            <h3 style={{ color: C.gold, margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>💰 Acquisition</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <div style={{ flex: 1, minWidth: 130 }}><div style={si.label}>Prix FAI</div><input type="number" style={si.input} value={info.prixVente || ""} onChange={e => updateInfo("prixVente", +e.target.value || 0)} /></div>
              <div style={{ flex: 1, minWidth: 130 }}><div style={si.label}>Négociation</div><input type="number" style={si.input} value={info.negociation || ""} onChange={e => updateInfo("negociation", +e.target.value || 0)} /></div>
              <div style={{ flex: "0 0 90px" }}><div style={si.label}>Notaire %</div><input type="number" style={si.input} value={info.fraisNotaire || ""} onChange={e => updateInfo("fraisNotaire", +e.target.value || 0)} /></div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}><div style={si.label}>Frais agence</div><input type="number" style={si.input} value={info.fraisAgence || ""} onChange={e => updateInfo("fraisAgence", +e.target.value || 0)} /></div>
              <div style={{ flex: 1 }}><div style={si.label}>Taxe foncière /an</div><input type="number" style={si.input} value={info.taxeFonciere || ""} onChange={e => updateInfo("taxeFonciere", +e.target.value || 0)} /></div>
              <div style={{ flex: 1 }}><div style={si.label}>Assurance PNO /an</div><input type="number" style={si.input} value={info.assurancePNO || ""} onChange={e => updateInfo("assurancePNO", +e.target.value || 0)} /></div>
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 16, padding: 14, background: "#08080f", borderRadius: 8, flexWrap: "wrap", justifyContent: "space-between" }}>
              <div><div style={si.label}>Net vendeur</div><div style={{ fontSize: 17, fontWeight: 700 }}>{fmt(calc.prixNet)}</div></div>
              <div><div style={si.label}>Frais notaire</div><div style={{ fontSize: 17, fontWeight: 700 }}>{fmt(calc.fraisNotaireEur)}</div></div>
              <div><div style={si.label}>Acte en main</div><div style={{ fontSize: 20, fontWeight: 800, color: C.gold }}>{fmt(calc.acteEnMain)}</div></div>
            </div>
          </div></div>
          <div style={si.card}><div style={{ padding: 16 }}>
            <h3 style={{ color: C.gold, margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>🔑 Lots & Loyers</h3>
            {current.lots.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 8, padding: 10, background: "#08080f", borderRadius: 8, flexWrap: "wrap" }}>
                <div style={{ width: 40 }}><div style={si.label}>Qté</div><input type="number" min={1} style={si.inputSm} value={l.qty} onChange={e => setLots(ls => ls.map((x, j) => j === i ? { ...x, qty: +e.target.value || 1 } : x))} /></div>
                <div style={{ flex: "1 1 110px" }}><div style={si.label}>Type</div><select style={si.input} value={l.type} onChange={e => setLots(ls => ls.map((x, j) => j === i ? { ...x, type: e.target.value, loyer: LOT_TYPES.find(t => t.value === e.target.value)?.r || x.loyer } : x))}>{LOT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
                <div style={{ width: 80 }}><div style={si.label}>Loyer €</div><input type="number" style={si.inputSm} value={l.loyer} onChange={e => setLots(ls => ls.map((x, j) => j === i ? { ...x, loyer: +e.target.value || 0 } : x))} /></div>
                <div style={{ width: 70 }}><div style={si.label}>Mode</div><select style={si.input} value={l.meuble ? "m" : "n"} onChange={e => setLots(ls => ls.map((x, j) => j === i ? { ...x, meuble: e.target.value === "m" } : x))}><option value="m">Meublé</option><option value="n">Nu</option></select></div>
                <button onClick={() => setLots(ls => ls.filter((_, j) => j !== i))} style={{ background: "#2a1015", color: "#e74c3c", border: "none", borderRadius: 6, padding: "8px 12px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>✕</button>
              </div>
            ))}
            <button onClick={() => setLots(ls => [...ls, { type: "t2", loyer: 500, meuble: true, qty: 1 }])} style={{ width: "100%", padding: 10, background: "transparent", border: `2px dashed ${C.inputBorder}`, borderRadius: 8, color: C.gold, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>+ Ajouter un lot</button>
            {current.lots.length > 0 && <div style={{ display: "flex", gap: 20, marginTop: 12, justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}><div style={si.label}>Mensuel</div><div style={{ fontSize: 18, fontWeight: 800, color: C.green }}>{fmt(calc.loyerMensuel)}</div></div>
              <div style={{ textAlign: "center" }}><div style={si.label}>Annuel</div><div style={{ fontSize: 18, fontWeight: 800, color: C.green }}>{fmt(calc.loyerAnnuel)}</div></div>
            </div>}
          </div></div>
        </>}

        {/* ─── TRAVAUX TAB ─── */}
        {tab === "travaux" && (() => { const etape = ETAPES[activeStep]; const detail = calc.etapes[activeStep]; return <>
          <div style={{ display: "flex", gap: 3, overflowX: "auto", padding: "0 0 12px" }}>
            {ETAPES.map((e, i) => <button key={e.id} onClick={() => setActiveStep(i)} style={{ padding: "8px 10px", background: activeStep === i ? e.color + "20" : "#0a0a14", border: activeStep === i ? `1px solid ${e.color}55` : "1px solid #1a1a30", borderRadius: 8, color: activeStep === i ? e.color : C.dim, cursor: "pointer", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>{e.icon} {e.num}</button>)}
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 12, padding: "8px 12px", background: "#0a0a14", borderRadius: 8, justifyContent: "flex-end" }}>
            <span style={{ color: C.muted, fontSize: 13, fontWeight: 700 }}>Total TTC : </span><span style={{ color: C.green, fontSize: 16, fontWeight: 800, marginLeft: 6 }}>{fmtDec(calc.totalTTC)}</span>
          </div>
          <div style={{ ...si.card, borderColor: etape.color + "33" }}>
            <div style={{ padding: "14px 16px", background: etape.color + "08", borderBottom: `1px solid ${etape.color}22` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                <div><span style={{ fontSize: 22, marginRight: 8 }}>{etape.icon}</span><span style={{ fontSize: 16, fontWeight: 800, color: etape.color }}>{etape.num}. {etape.label}</span><span style={{ fontSize: 11, color: "#666", marginLeft: 10 }}>TVA {etape.tva}%</span></div>
                <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: C.muted }}>TOTAL ÉTAPE TTC</div><div style={{ fontSize: 20, fontWeight: 800, color: detail.ttc > 0 ? etape.color : "#333" }}>{fmtDec(detail.ttc)}</div></div>
              </div>
              {detail.ht > 0 && <div style={{ display: "flex", gap: 16, marginTop: 8 }}><span style={{ fontSize: 11, color: C.muted }}>Mat: <b style={{ color: "#aaa" }}>{fmt(detail.matT)}</b></span><span style={{ fontSize: 11, color: C.muted }}>MO: <b style={{ color: "#aaa" }}>{fmt(detail.moT)}</b></span></div>}
            </div>
            <div style={{ display: "flex", gap: 6, padding: "8px 16px", borderBottom: "1px solid #1a1a2e", background: "#08080f" }}>
              <div style={{ flex: "1 1 180px", fontSize: 10, color: C.dim, fontWeight: 700 }}>POSTE</div>
              <div style={{ width: 55, fontSize: 10, color: C.dim, fontWeight: 700, textAlign: "center" }}>QTÉ</div>
              <div style={{ width: 30, fontSize: 10, color: C.dim, fontWeight: 700, textAlign: "center" }}>U.</div>
              <div style={{ width: 70, fontSize: 10, color: C.dim, fontWeight: 700, textAlign: "center" }}>MAT €</div>
              <div style={{ width: 70, fontSize: 10, color: C.dim, fontWeight: 700, textAlign: "center" }}>MO €</div>
              <div style={{ width: 80, fontSize: 10, color: C.dim, fontWeight: 700, textAlign: "right" }}>TOTAL</div>
            </div>
            {etape.items.map(item => { const q = getQty(item); const tot = itemTotal(item); return (
              <div key={item.id} style={{ display: "flex", gap: 6, padding: "8px 16px", borderBottom: "1px solid #0e0e1a", alignItems: "center", background: q > 0 ? "#0a0f0a" : "transparent" }}>
                <div style={{ flex: "1 1 180px", minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, color: q > 0 ? "#ddd" : C.muted }}>{item.label}</div><div style={{ fontSize: 10, color: C.dim, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.desc}</div></div>
                <div style={{ width: 55 }}><input type="number" min={0} style={{ ...si.inputSm, background: q > 0 ? "#152015" : C.input }} value={current.quantities[item.id] ?? ""} onChange={e => setQty(item.id, e.target.value)} placeholder="0" /></div>
                <div style={{ width: 30, fontSize: 10, color: "#666", textAlign: "center" }}>{item.unit}</div>
                <div style={{ width: 70 }}><input type="number" min={0} style={si.inputSm} value={current.customMat[item.id] ?? ""} onChange={e => setMatC(item.id, e.target.value)} placeholder={String(item.mat)} /></div>
                <div style={{ width: 70 }}><input type="number" min={0} style={si.inputSm} value={current.customMo[item.id] ?? ""} onChange={e => setMoC(item.id, e.target.value)} placeholder={String(item.mo)} /></div>
                <div style={{ width: 80, textAlign: "right", fontSize: 13, fontWeight: 700, color: tot > 0 ? C.text : "#333" }}>{tot > 0 ? fmt(tot) : "—"}</div>
              </div>
            ); })}
          </div>
        </>; })()}

        {/* ─── SYNTHESE TAB ─── */}
        {tab === "synthese" && <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
            {[{ l: "Acte en main", v: fmt(calc.acteEnMain), c: C.gold }, { l: "Travaux TTC", v: fmtDec(calc.totalTTC), c: C.blue, sub: `Mat: ${fmt(calc.totalMat)} | MO: ${fmt(calc.totalMo)}` }, { l: "Total projet", v: fmtDec(calc.montantTotal), c: C.green, sub: info.surface > 0 ? `${fmt(calc.coutM2)}/m²` : "" }].map((x, i) => (
              <div key={i} style={{ ...si.card, padding: 16, textAlign: "center" }}><div style={si.label}>{x.l}</div><div style={{ fontSize: 22, fontWeight: 800, color: x.c, marginTop: 6 }}>{x.v}</div>{x.sub && <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>{x.sub}</div>}</div>))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginTop: 2 }}>
            {[{ l: "Loyer mensuel", v: fmt(calc.loyerMensuel), c: C.green, sub: `${fmt(calc.loyerAnnuel)}/an` }, { l: "Renta brute", v: calc.rentaBrute.toFixed(2) + "%", c: calc.rentaBrute >= 8 ? C.green : calc.rentaBrute >= 5 ? "#f1c40f" : "#e74c3c" }, { l: "Renta nette", v: calc.rentaNette.toFixed(2) + "%", c: calc.rentaNette >= 6 ? C.green : calc.rentaNette >= 4 ? "#f1c40f" : "#e74c3c", sub: `Charges: ${fmt(calc.chargesAn)}/an` }].map((x, i) => (
              <div key={i} style={{ ...si.card, padding: 16, textAlign: "center" }}><div style={si.label}>{x.l}</div><div style={{ fontSize: 22, fontWeight: 800, color: x.c, marginTop: 6 }}>{x.v}</div>{x.sub && <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>{x.sub}</div>}</div>))}
          </div>
          <div style={si.card}><div style={{ padding: 16 }}>
            <h3 style={{ color: C.gold, margin: "0 0 12px", fontSize: 14 }}>Détail par étape</h3>
            {calc.etapes.filter(e => e.ht > 0).map(e => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderLeft: `3px solid ${e.color}`, marginBottom: 6, background: "#08080f", borderRadius: "0 6px 6px 0" }}>
                <div><span style={{ color: e.color, fontWeight: 700, fontSize: 13 }}>{e.num}. {e.label}</span><span style={{ fontSize: 10, color: C.dim, marginLeft: 8 }}>Mat {fmt(e.matT)} · MO {fmt(e.moT)}</span></div>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{fmtDec(e.ttc)}</span>
              </div>))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: 10, background: "#0a1a0d", borderRadius: 6, marginTop: 6 }}><span style={{ color: C.green, fontWeight: 700 }}>TOTAL TTC</span><span style={{ color: C.green, fontWeight: 800, fontSize: 18 }}>{fmtDec(calc.totalTTC)}</span></div>
          </div></div>
          <div style={si.card}><div style={{ padding: 16 }}>
            <h3 style={{ color: C.gold, margin: "0 0 12px", fontSize: 14 }}>Détail postes chiffrés</h3>
            {ETAPES.map(etape => { const used = etape.items.filter(i => getQty(i) > 0); if (!used.length) return null; return (
              <div key={etape.id} style={{ marginBottom: 12 }}><div style={{ fontSize: 12, fontWeight: 700, color: etape.color, marginBottom: 4, padding: "4px 0", borderBottom: `1px solid ${etape.color}22` }}>{etape.num}. {etape.label}</div>
                {used.map(item => <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", fontSize: 12 }}><span style={{ color: "#999" }}>{getQty(item)} {item.unit} × {item.label} <span style={{ color: C.dim }}>(mat {getMat(item)}€ + mo {getMo(item)}€)</span></span><span style={{ fontWeight: 600, color: "#ccc" }}>{fmt(itemTotal(item))}</span></div>)}
              </div>); })}
          </div></div>
          {info.prixM2Renove > 0 && info.surface > 0 && <div style={si.card}><div style={{ padding: 16 }}>
            <h3 style={{ color: C.gold, margin: "0 0 12px", fontSize: 14 }}>📈 Plus-value latente</h3>
            <div style={{ display: "flex", gap: 20, justifyContent: "space-around", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}><div style={si.label}>Coût/m²</div><div style={{ fontSize: 18, fontWeight: 800 }}>{fmt(calc.coutM2)}</div></div>
              <div style={{ textAlign: "center" }}><div style={si.label}>Marché/m²</div><div style={{ fontSize: 18, fontWeight: 800 }}>{fmt(info.prixM2Renove)}</div></div>
              <div style={{ textAlign: "center" }}><div style={si.label}>Plus-value</div><div style={{ fontSize: 22, fontWeight: 800, color: calc.plusValue > 0 ? C.green : "#e74c3c" }}>{fmtDec(calc.plusValue)}</div></div>
            </div>
          </div></div>}
          <button onClick={() => setShowExport(!showExport)} style={{ width: "100%", padding: 14, background: `linear-gradient(135deg,${C.gold},#8b6b3d)`, border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 700 }}>📋 {showExport ? "Masquer" : "Exporter récapitulatif"}</button>
          {showExport && <textarea readOnly value={(() => {
            let t = `PRÉ-CHIFFRAGE — ${current.name}\n${info.adresse} ${info.cp} ${info.ville} — ${info.surface}m²\n${"═".repeat(55)}\n\nACQUISITION\n  Prix FAI: ${fmt(info.prixVente)} | Négo: -${fmt(info.negociation)} | Notaire: ${fmt(calc.fraisNotaireEur)}\n  → Acte en main: ${fmt(calc.acteEnMain)}\n\nTRAVAUX\n`;
            ETAPES.forEach(etape => { const d = calc.etapes.find(x => x.id === etape.id); if (!d || d.ht === 0) return; t += `\n  ${etape.num}. ${etape.label} — ${fmtDec(d.ttc)} TTC (Mat: ${fmt(d.matT)} / MO: ${fmt(d.moT)})\n`; etape.items.filter(i => getQty(i) > 0).forEach(i => { t += `     ${getQty(i)} ${i.unit} × ${i.label} (${getMat(i)}€ + ${getMo(i)}€) = ${fmt(itemTotal(i))}\n`; }); });
            t += `\n  TOTAL TTC: ${fmtDec(calc.totalTTC)}\n\nLOTS\n`; current.lots.forEach(l => { const tp = LOT_TYPES.find(x => x.value === l.type); t += `  ${l.qty}× ${tp?.label} — ${fmt(l.loyer)}/mois ${l.meuble ? "meublé" : "nu"}\n`; });
            t += `  → Mensuel: ${fmt(calc.loyerMensuel)} | Annuel: ${fmt(calc.loyerAnnuel)}\n\nSYNTHÈSE\n  Total: ${fmtDec(calc.montantTotal)} (${fmt(calc.coutM2)}/m²)\n  Brute: ${calc.rentaBrute.toFixed(2)}% | Nette: ${calc.rentaNette.toFixed(2)}%\n  Plus-value: ${fmtDec(calc.plusValue)}\n`; return t;
          })()} onClick={e => e.target.select()} style={{ width: "100%", minHeight: 350, background: "#08080f", border: `1px solid ${C.cardBorder}`, borderRadius: 8, color: "#999", padding: 14, fontSize: 11, fontFamily: "monospace", resize: "vertical", boxSizing: "border-box", marginTop: 12 }} />}
        </>}
      </div>
    </div>
  );
}
