"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTheme } from "./lib/ThemeContext";
import { fmt } from "./utils/format";
import { genId } from "./utils/format";
import { calcProject, calcFinancement, calcCashFlow, calcFiscalite } from "./utils/calc";
import { useAuth } from "./lib/AuthContext";
import { loadProjectsFromDB, saveProjectToDB, deleteProjectFromDB, migrateLocalProjects } from "./utils/supabase-storage";
import Dashboard from "./components/Dashboard";
import InfoTab from "./components/InfoTab";
import TravauxTab from "./components/TravauxTab";
import FinancementTab from "./components/FinancementTab";
import SyntheseTab from "./components/SyntheseTab";

const EMPTY_PROJECT = () => ({
  id: genId(),
  name: "Nouveau projet",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  info: {
    adresse: "", ville: "", cp: "", surface: 0,
    prixVente: 0, negociation: 0, fraisNotaire: 8, fraisAgence: 0,
    taxeFonciere: 0, prixM2Renove: 2000, assurancePNO: 600,
    chargesCopro: 0, fraisGestion: 7, tauxVacance: 5, assuranceGLI: 0,
    apport: 20, tauxCredit: 3.5, dureeCredit: 20,
  },
  lots: [],
  quantities: {},
  customMat: {},
  customMo: {},
  customItems: {},
  notes: {},
});

export default function App() {
  const { user, signOut } = useAuth();
  const { C, si } = useTheme();
  const [projects, setProjects] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("info");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [migrated, setMigrated] = useState(null);
  const saveTimer = useRef(null);
  const pendingSave = useRef(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const count = await migrateLocalProjects(user.id);
      if (count > 0) setMigrated(count);

      const dbProjects = await loadProjectsFromDB(user.id);
      setProjects(dbProjects);
      setMounted(true);
    })();
  }, [user]);

  const persistProject = useCallback((project) => {
    if (!user) return;
    setSaving(true);
    pendingSave.current = project;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await saveProjectToDB(user.id, project);
      pendingSave.current = null;
      setSaving(false);
    }, 800);
  }, [user]);

  const flushSave = useCallback(async () => {
    if (!pendingSave.current || !user) return;
    clearTimeout(saveTimer.current);
    await saveProjectToDB(user.id, pendingSave.current);
    pendingSave.current = null;
    setSaving(false);
  }, [user]);

  // Flush on page close/refresh
  useEffect(() => {
    const handler = () => {
      if (pendingSave.current && user) {
        clearTimeout(saveTimer.current);
        saveProjectToDB(user.id, pendingSave.current);
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [user]);

  const current = projects.find(p => p.id === currentId);

  const updateProject = useCallback((fn) => {
    setProjects(prev => {
      const np = prev.map(p => {
        if (p.id !== currentId) return p;
        const updated = { ...fn(p), updatedAt: new Date().toISOString() };
        persistProject(updated);
        return updated;
      });
      return np;
    });
  }, [currentId, persistProject]);

  const updateInfo = (k, v) => updateProject(p => ({ ...p, info: { ...p.info, [k]: v } }));
  const setQty = (id, v) => updateProject(p => ({ ...p, quantities: { ...p.quantities, [id]: v === "" ? "" : Number(v) } }));
  const setMatC = (id, v) => updateProject(p => ({ ...p, customMat: { ...p.customMat, [id]: v === "" ? "" : Number(v) } }));
  const setMoC = (id, v) => updateProject(p => ({ ...p, customMo: { ...p.customMo, [id]: v === "" ? "" : Number(v) } }));
  const setLots = (fn) => updateProject(p => ({ ...p, lots: typeof fn === "function" ? fn(p.lots) : fn }));

  const addCustomItem = (etapeId, item) => updateProject(p => ({
    ...p,
    customItems: { ...p.customItems, [etapeId]: [...(p.customItems?.[etapeId] || []), item] },
  }));

  const removeCustomItem = (etapeId, itemId) => updateProject(p => ({
    ...p,
    customItems: { ...p.customItems, [etapeId]: (p.customItems?.[etapeId] || []).filter(i => i.id !== itemId) },
    quantities: { ...p.quantities, [itemId]: undefined },
    customMat: { ...p.customMat, [itemId]: undefined },
    customMo: { ...p.customMo, [itemId]: undefined },
    notes: { ...p.notes, [itemId]: undefined },
  }));

  const setNote = (itemId, value) => updateProject(p => ({
    ...p,
    notes: { ...p.notes, [itemId]: value },
  }));

  const createProject = async () => {
    const np = EMPTY_PROJECT();
    setProjects(prev => [...prev, np]);
    setCurrentId(np.id);
    setTab("info");
    if (user) await saveProjectToDB(user.id, np);
  };

  const duplicateProject = async (id) => {
    const src = projects.find(p => p.id === id);
    if (!src) return;
    const np = { ...JSON.parse(JSON.stringify(src)), id: genId(), name: src.name + " (copie)", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setProjects(prev => [...prev, np]);
    if (user) await saveProjectToDB(user.id, np);
  };

  const deleteProject = async (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (currentId === id) setCurrentId(null);
    setConfirmDelete(null);
    await deleteProjectFromDB(id);
  };

  const renameProject = (id, name) => {
    setProjects(prev => {
      const np = prev.map(p => {
        if (p.id !== id) return p;
        const updated = { ...p, name, updatedAt: new Date().toISOString() };
        persistProject(updated);
        return updated;
      });
      return np;
    });
  };

  const handleImport = async (data) => {
    const merged = [...projects];
    for (const p of data) {
      if (!merged.find(x => x.id === p.id)) {
        merged.push(p);
        if (user) await saveProjectToDB(user.id, p);
      }
    }
    setProjects(merged);
  };

  if (!mounted) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: C.gold, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700 }}>Investissement locatif</div>
          <h1 style={{ margin: "4px 0 0", fontSize: 26, fontWeight: 800, background: "linear-gradient(90deg,#c9a96e,#e8d5a8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ESTIMO</h1>
          <p style={{ color: C.dim, fontSize: 13, marginTop: 12 }}>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!currentId) {
    return (
      <>
        {migrated && (
          <div style={{ background: C.green + "22", border: `1px solid ${C.green}44`, borderRadius: 8, padding: "10px 16px", margin: "12px 16px", maxWidth: 700, marginLeft: "auto", marginRight: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: C.green }}>{migrated} projet{migrated > 1 ? "s" : ""} importé{migrated > 1 ? "s" : ""} depuis votre navigateur</span>
            <button onClick={() => setMigrated(null)} style={{ background: "none", border: "none", color: C.green, cursor: "pointer", fontSize: 16 }}>&#x2715;</button>
          </div>
        )}
        <Dashboard
          projects={projects}
          onOpen={(id) => { setCurrentId(id); setTab("info"); }}
          onCreate={createProject}
          onDuplicate={duplicateProject}
          onDelete={deleteProject}
          onImport={handleImport}
          confirmDelete={confirmDelete}
          setConfirmDelete={setConfirmDelete}
          onSignOut={signOut}
          userEmail={user?.email}
        />
      </>
    );
  }

  const calc = calcProject(current);
  const fin = calcFinancement(current.info, calc.montantTotal);
  const cashFlow = calcCashFlow(current.info, calc, fin);
  const fiscalite = calcFiscalite(current.info, calc, fin);
  const info = current.info;

  const tabs = [
    { id: "info", l: "Bien & Lots" },
    { id: "travaux", l: "Travaux" },
    { id: "financement", l: "Financement" },
    { id: "synthese", l: "Synthèse" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans',sans-serif" }}>
      {/* Header */}
      <div className="no-print" style={{ background: `linear-gradient(135deg,${C.headerBg1},${C.headerBg2})`, borderBottom: `1px solid ${C.cardBorder}`, padding: "14px 16px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={async () => { await flushSave(); setCurrentId(null); }} style={{ background: "none", border: `1px solid ${C.inputBorder}`, borderRadius: 8, color: C.gold, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>&#x2190;</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.gold, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{current.name}</div>
            <div style={{ fontSize: 11, color: C.dim }}>{info.adresse ? `${info.adresse}, ` : ""}{info.cp} {info.ville}{info.surface ? ` — ${info.surface}m²` : ""}</div>
          </div>
          <div style={{ fontSize: 10, color: saving ? C.dim : C.green, flexShrink: 0 }}>{saving ? "..." : "✓"}</div>
          {calc.montantTotal > 0 && (
            <div style={{ display: "flex", gap: 10, fontSize: 11, flexShrink: 0 }}>
              <span style={{ color: C.green, fontWeight: 700 }}>{fmt(calc.montantTotal)}</span>
              <span style={{ color: calc.rentaBrute >= 8 ? C.green : "#f1c40f", fontWeight: 700 }}>{calc.rentaBrute.toFixed(1)}%</span>
              {cashFlow.cashFlowAvantImpot !== 0 && (
                <span style={{ color: cashFlow.cashFlowAvantImpot >= 0 ? C.green : C.red, fontWeight: 700 }}>
                  CF {cashFlow.cashFlowAvantImpot >= 0 ? "+" : ""}{fmt(cashFlow.cashFlowAvantImpot)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="no-print" style={{ display: "flex", gap: 2, padding: "8px 12px", background: C.surfaceAlt, borderBottom: `1px solid ${C.cardBorder}`, position: "sticky", top: 0, zIndex: 20, justifyContent: "center", flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 16px",
            background: tab === t.id ? C.gold + "22" : "transparent",
            border: tab === t.id ? `1px solid ${C.gold}55` : "1px solid transparent",
            borderRadius: 8,
            color: tab === t.id ? C.gold : C.dim,
            cursor: "pointer", fontSize: 13,
            fontWeight: tab === t.id ? 700 : 500,
            fontFamily: "'DM Sans',sans-serif",
          }}>
            {t.l}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 12px 60px" }}>
        <div style={{ background: C.gold + "15", border: `1px solid ${C.gold}33`, borderRadius: 8, padding: "8px 14px", marginBottom: 12, fontSize: 11, color: C.gold, lineHeight: 1.4 }}>
          Estimations indicatives basées sur des moyennes régionales — à ajuster selon devis réels.
        </div>
        {tab === "info" && (
          <InfoTab current={current} calc={calc} updateInfo={updateInfo} setLots={setLots} renameProject={renameProject} />
        )}
        {tab === "travaux" && (
          <TravauxTab current={current} calc={calc} setQty={setQty} setMatC={setMatC} setMoC={setMoC} addCustomItem={addCustomItem} removeCustomItem={removeCustomItem} setNote={setNote} />
        )}
        {tab === "financement" && (
          <FinancementTab current={current} calc={calc} fin={fin} cashFlow={cashFlow} updateInfo={updateInfo} />
        )}
        {tab === "synthese" && (
          <SyntheseTab current={current} calc={calc} fin={fin} cashFlow={cashFlow} fiscalite={fiscalite} />
        )}
      </div>
    </div>
  );
}
