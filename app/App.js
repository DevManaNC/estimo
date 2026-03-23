"use client";

import { useState, useCallback, useRef } from "react";
import { C, si } from "./styles";
import { fmt } from "./utils/format";
import { genId } from "./utils/format";
import { loadProjects, saveProjects } from "./utils/storage";
import { calcProject, calcFinancement, calcCashFlow, calcFiscalite } from "./utils/calc";
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
  const [projects, setProjects] = useState(() => loadProjects());
  const [currentId, setCurrentId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("info");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const saveTimer = useRef(null);

  const persist = useCallback((np) => {
    setProjects(np);
    setSaving(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { saveProjects(np); setSaving(false); }, 400);
  }, []);

  const current = projects.find(p => p.id === currentId);

  const updateProject = useCallback((fn) => {
    persist(projects.map(p => p.id === currentId ? { ...fn(p), updatedAt: new Date().toISOString() } : p));
  }, [projects, currentId, persist]);

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

  const createProject = () => {
    const np = EMPTY_PROJECT();
    persist([...projects, np]);
    setCurrentId(np.id);
    setTab("info");
  };

  const duplicateProject = (id) => {
    const src = projects.find(p => p.id === id);
    if (!src) return;
    const np = { ...JSON.parse(JSON.stringify(src)), id: genId(), name: src.name + " (copie)", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    persist([...projects, np]);
  };

  const deleteProject = (id) => {
    persist(projects.filter(p => p.id !== id));
    if (currentId === id) setCurrentId(null);
    setConfirmDelete(null);
  };

  const renameProject = (id, name) => {
    persist(projects.map(p => p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p));
  };

  const handleImport = (data) => {
    const merged = [...projects];
    data.forEach(p => {
      if (!merged.find(x => x.id === p.id)) merged.push(p);
    });
    persist(merged);
  };

  // ─── Dashboard ───
  if (!currentId) {
    return (
      <Dashboard
        projects={projects}
        onOpen={(id) => { setCurrentId(id); setTab("info"); }}
        onCreate={createProject}
        onDuplicate={duplicateProject}
        onDelete={deleteProject}
        onImport={handleImport}
        confirmDelete={confirmDelete}
        setConfirmDelete={setConfirmDelete}
      />
    );
  }

  // ─── Project Editor ───
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
      <div className="no-print" style={{ background: "linear-gradient(135deg,#0f0f1a,#161628)", borderBottom: `1px solid ${C.cardBorder}`, padding: "14px 16px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setCurrentId(null)} style={{ background: "none", border: `1px solid ${C.inputBorder}`, borderRadius: 8, color: C.gold, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>&#x2190;</button>
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
      <div className="no-print" style={{ display: "flex", gap: 2, padding: "8px 12px", background: "#0a0a14", borderBottom: "1px solid #1a1a30", position: "sticky", top: 0, zIndex: 20, justifyContent: "center", flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 16px",
            background: tab === t.id ? C.gold + "22" : "transparent",
            border: tab === t.id ? `1px solid ${C.gold}55` : "1px solid transparent",
            borderRadius: 8,
            color: tab === t.id ? C.gold : "#666",
            cursor: "pointer", fontSize: 13,
            fontWeight: tab === t.id ? 700 : 500,
            fontFamily: "'DM Sans',sans-serif",
          }}>
            {t.l}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 12px 60px" }}>
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
