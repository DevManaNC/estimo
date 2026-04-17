"use client";

import { useState } from "react";
import { useTheme } from "../lib/ThemeContext";
import { ETAPES } from "../data/pricing";
import { fmt, fmtDec, genId } from "../utils/format";

export default function TravauxTab({ current, calc, setQty, setMatC, setMoC, addCustomItem, removeCustomItem, setNote }) {
  const { C, si } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ label: "", unit: "u", mat: 0, mo: 0, desc: "" });

  const getMat = (item) => current?.customMat[item.id] !== undefined && current.customMat[item.id] !== "" ? Number(current.customMat[item.id]) : item.mat;
  const getMo = (item) => current?.customMo[item.id] !== undefined && current.customMo[item.id] !== "" ? Number(current.customMo[item.id]) : item.mo;
  const getQty = (item) => current?.quantities[item.id] || 0;
  const itemTotal = (item) => getQty(item) * (getMat(item) + getMo(item));

  const etape = ETAPES[activeStep];
  const detail = calc.etapes[activeStep];

  const customItems = current.customItems?.[etape.id] || [];
  const allItems = [...etape.items, ...customItems];

  const filteredItems = search
    ? allItems.filter(i => i.label.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase()))
    : allItems;

  const handleAddItem = () => {
    if (!newItem.label.trim()) return;
    const item = { ...newItem, id: `custom_${genId()}`, mat: Number(newItem.mat) || 0, mo: Number(newItem.mo) || 0 };
    addCustomItem(etape.id, item);
    setNewItem({ label: "", unit: "u", mat: 0, mo: 0, desc: "" });
    setShowAddForm(false);
  };

  return (
    <>
      {/* Step pills */}
      <div style={{ display: "flex", gap: 3, overflowX: "auto", padding: "0 0 12px" }}>
        {ETAPES.map((e, i) => (
          <button key={e.id} onClick={() => { setActiveStep(i); setSearch(""); }} style={{
            padding: "8px 10px", background: activeStep === i ? e.color + "20" : C.surfaceAlt,
            border: activeStep === i ? `1px solid ${e.color}55` : `1px solid ${C.cardBorder}`,
            borderRadius: 8, color: activeStep === i ? e.color : C.dim,
            cursor: "pointer", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
            fontFamily: "'DM Sans',sans-serif", flexShrink: 0,
          }}>
            {e.icon} {e.num}
          </button>
        ))}
      </div>

      {/* Total TTC banner */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12, padding: "8px 12px", background: C.surfaceAlt, borderRadius: 8, justifyContent: "space-between" }}>
        <input
          style={{ ...si.input, maxWidth: 220, fontSize: 12 }}
          placeholder="Rechercher un poste..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div>
          <span style={{ color: C.muted, fontSize: 13, fontWeight: 700 }}>Total TTC : </span>
          <span style={{ color: C.green, fontSize: 16, fontWeight: 800, marginLeft: 6 }}>{fmtDec(calc.totalTTC)}</span>
        </div>
      </div>

      {/* Etape card */}
      <div style={{ ...si.card, borderColor: etape.color + "33" }}>
        <div style={{ padding: "14px 16px", background: etape.color + "08", borderBottom: `1px solid ${etape.color}22` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div>
              <span style={{ fontSize: 22, marginRight: 8 }}>{etape.icon}</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: etape.color }}>{etape.num}. {etape.label}</span>
              <span style={{ fontSize: 11, color: C.dim, marginLeft: 10 }}>TVA {etape.tva}%</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: C.muted }}>TOTAL ÉTAPE TTC</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: detail.ttc > 0 ? etape.color : C.dim }}>{fmtDec(detail.ttc)}</div>
            </div>
          </div>
          {detail.ht > 0 && (
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
              <span style={{ fontSize: 11, color: C.muted }}>Mat: <b style={{ color: C.text }}>{fmt(detail.matT)}</b></span>
              <span style={{ fontSize: 11, color: C.muted }}>MO: <b style={{ color: C.text }}>{fmt(detail.moT)}</b></span>
            </div>
          )}
        </div>

        {/* Column headers */}
        <div style={{ display: "flex", gap: 6, padding: "8px 16px", borderBottom: `1px solid ${C.cardBorder}`, background: C.surface }}>
          <div style={{ flex: "1 1 180px", fontSize: 10, color: C.dim, fontWeight: 700 }}>POSTE</div>
          <div style={{ width: 55, fontSize: 10, color: C.dim, fontWeight: 700, textAlign: "center" }}>QTÉ</div>
          <div style={{ width: 30, fontSize: 10, color: C.dim, fontWeight: 700, textAlign: "center" }}>U.</div>
          <div style={{ width: 70, fontSize: 10, color: C.dim, fontWeight: 700, textAlign: "center" }}>MAT €</div>
          <div style={{ width: 70, fontSize: 10, color: C.dim, fontWeight: 700, textAlign: "center" }}>MO €</div>
          <div style={{ width: 80, fontSize: 10, color: C.dim, fontWeight: 700, textAlign: "right" }}>TOTAL</div>
        </div>

        {/* Items */}
        {filteredItems.map(item => {
          const q = getQty(item);
          const tot = itemTotal(item);
          const isCustom = item.id.startsWith("custom_");
          const note = current.notes?.[item.id] || "";

          return (
            <div key={item.id} style={{ borderBottom: `1px solid ${C.card}` }}>
              <div style={{ display: "flex", gap: 6, padding: "8px 16px", alignItems: "center", background: q > 0 ? C.green + "12" : "transparent" }}>
                <div style={{ flex: "1 1 180px", minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: q > 0 ? C.text : C.muted }}>{item.label}</span>
                    {isCustom && <span style={{ fontSize: 9, color: C.gold, background: C.gold + "22", padding: "1px 4px", borderRadius: 3 }}>perso</span>}
                  </div>
                  <div style={{ fontSize: 10, color: C.dim, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.desc}</div>
                </div>
                <div style={{ width: 55 }}>
                  <input type="text" inputMode="decimal" min={0} style={{ ...si.inputSm, background: q > 0 ? C.green + "25" : C.input }} value={current.quantities[item.id] ?? ""} onChange={e => setQty(item.id, e.target.value)} placeholder="0" />
                </div>
                <div style={{ width: 30, fontSize: 10, color: C.dim, textAlign: "center" }}>{item.unit}</div>
                <div style={{ width: 70 }}>
                  <input type="text" inputMode="decimal" min={0} style={si.inputSm} value={current.customMat[item.id] ?? ""} onChange={e => setMatC(item.id, e.target.value)} placeholder={String(item.mat)} />
                </div>
                <div style={{ width: 70 }}>
                  <input type="text" inputMode="decimal" min={0} style={si.inputSm} value={current.customMo[item.id] ?? ""} onChange={e => setMoC(item.id, e.target.value)} placeholder={String(item.mo)} />
                </div>
                <div style={{ width: 80, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: tot > 0 ? C.text : C.dim }}>{tot > 0 ? fmt(tot) : "—"}</span>
                  {isCustom && <button onClick={() => removeCustomItem(etape.id, item.id)} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 11, padding: 0 }}>&#x2715;</button>}
                </div>
              </div>

              {/* Note */}
              {q > 0 && (
                <div style={{ padding: "0 16px 6px" }}>
                  <input
                    style={{ ...si.input, fontSize: 11, padding: "4px 8px", background: C.surface, color: C.muted }}
                    placeholder="Ajouter une note..."
                    value={note}
                    onChange={e => setNote(item.id, e.target.value)}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Add custom item */}
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.cardBorder}` }}>
          {!showAddForm ? (
            <button onClick={() => setShowAddForm(true)} style={{ width: "100%", padding: 8, background: "transparent", border: `1px dashed ${C.inputBorder}`, borderRadius: 6, color: C.gold, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
              + Poste personnalisé
            </button>
          ) : (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: "2 1 150px" }}>
                <div style={si.label}>Libellé</div>
                <input style={si.input} value={newItem.label} onChange={e => setNewItem(n => ({ ...n, label: e.target.value }))} placeholder="Ex: Habillage escalier" />
              </div>
              <div style={{ width: 55 }}>
                <div style={si.label}>Unité</div>
                <select style={si.input} value={newItem.unit} onChange={e => setNewItem(n => ({ ...n, unit: e.target.value }))}>
                  {["u", "m²", "ml", "m³", "forfait"].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div style={{ width: 65 }}>
                <div style={si.label}>Mat €</div>
                <input type="text" inputMode="decimal" style={si.inputSm} value={newItem.mat || ""} onChange={e => setNewItem(n => ({ ...n, mat: e.target.value }))} />
              </div>
              <div style={{ width: 65 }}>
                <div style={si.label}>MO €</div>
                <input type="text" inputMode="decimal" style={si.inputSm} value={newItem.mo || ""} onChange={e => setNewItem(n => ({ ...n, mo: e.target.value }))} />
              </div>
              <button onClick={handleAddItem} style={si.btn(C.green + "22", C.green)}>OK</button>
              <button onClick={() => setShowAddForm(false)} style={si.btn(C.btnBg, C.muted)}>&#x2715;</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
