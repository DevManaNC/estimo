"use client";

import { useCallback, useRef } from "react";
import { C, si } from "../styles";
import { fmt } from "../utils/format";
import { LOT_TYPES } from "../data/pricing";

export default function InfoTab({ current, calc, updateInfo, setLots, renameProject }) {
  const info = current.info;
  const cpTimer = useRef(null);

  const handleCpChange = useCallback((value) => {
    updateInfo("cp", value);
    if (cpTimer.current) clearTimeout(cpTimer.current);
    if (value.length === 5) {
      cpTimer.current = setTimeout(() => {
        fetch(`https://geo.api.gouv.fr/communes?codePostal=${value}&fields=nom&limit=1`)
          .then(r => r.json())
          .then(data => { if (data.length > 0) updateInfo("ville", data[0].nom); })
          .catch(() => {});
      }, 300);
    }
  }, [updateInfo]);

  return (
    <>
      {/* Le bien */}
      <div style={si.card}><div style={{ padding: 16 }}>
        <h3 style={{ color: C.gold, margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Le bien</h3>
        <div style={si.row}>
          <div style={{ flex: "2 1 200px" }}>
            <div style={si.label}>Nom du projet</div>
            <input style={si.input} value={current.name} onChange={e => renameProject(current.id, e.target.value)} />
          </div>
        </div>
        <div style={si.row}>
          <div style={{ flex: "2 1 200px" }}><div style={si.label}>Adresse</div><input style={si.input} value={info.adresse} onChange={e => updateInfo("adresse", e.target.value)} placeholder="15 Rue Mandajors" /></div>
          <div style={{ flex: "0 0 100px" }}><div style={si.label}>CP</div><input style={si.input} value={info.cp} onChange={e => handleCpChange(e.target.value)} placeholder="34000" /></div>
          <div style={{ flex: "1 1 140px" }}><div style={si.label}>Ville</div><input style={si.input} value={info.ville} onChange={e => updateInfo("ville", e.target.value)} placeholder="Montpellier" /></div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}><div style={si.label}>Surface (m²)</div><input type="text" inputMode="decimal" style={si.input} value={info.surface || ""} onChange={e => updateInfo("surface", +e.target.value || 0)} /></div>
          <div style={{ flex: 1 }}><div style={si.label}>Prix m² rénové marché</div><input type="text" inputMode="decimal" style={si.input} value={info.prixM2Renove || ""} onChange={e => updateInfo("prixM2Renove", +e.target.value || 0)} /></div>
        </div>
      </div></div>

      {/* Acquisition */}
      <div style={si.card}><div style={{ padding: 16 }}>
        <h3 style={{ color: C.gold, margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Acquisition</h3>
        <div style={si.row}>
          <div style={{ flex: 1, minWidth: 130 }}><div style={si.label}>Prix FAI</div><input type="text" inputMode="decimal" style={si.input} value={info.prixVente || ""} onChange={e => updateInfo("prixVente", +e.target.value || 0)} /></div>
          <div style={{ flex: 1, minWidth: 130 }}><div style={si.label}>Négociation</div><input type="text" inputMode="decimal" style={si.input} value={info.negociation || ""} onChange={e => updateInfo("negociation", +e.target.value || 0)} /></div>
          <div style={{ flex: "0 0 90px" }}><div style={si.label}>Notaire %</div><input type="text" inputMode="decimal" style={si.input} value={info.fraisNotaire || ""} onChange={e => updateInfo("fraisNotaire", +e.target.value || 0)} /></div>
        </div>
        <div style={si.row}>
          <div style={{ flex: 1 }}><div style={si.label}>Frais agence</div><input type="text" inputMode="decimal" style={si.input} value={info.fraisAgence || ""} onChange={e => updateInfo("fraisAgence", +e.target.value || 0)} /></div>
          <div style={{ flex: 1 }}><div style={si.label}>Taxe foncière /an</div><input type="text" inputMode="decimal" style={si.input} value={info.taxeFonciere || ""} onChange={e => updateInfo("taxeFonciere", +e.target.value || 0)} /></div>
          <div style={{ flex: 1 }}><div style={si.label}>Assurance PNO /an</div><input type="text" inputMode="decimal" style={si.input} value={info.assurancePNO || ""} onChange={e => updateInfo("assurancePNO", +e.target.value || 0)} /></div>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 16, padding: 14, background: "#08080f", borderRadius: 8, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div><div style={si.label}>Net vendeur</div><div style={{ fontSize: 17, fontWeight: 700 }}>{fmt(calc.prixNet)}</div></div>
          <div><div style={si.label}>Frais notaire</div><div style={{ fontSize: 17, fontWeight: 700 }}>{fmt(calc.fraisNotaireEur)}</div></div>
          <div><div style={si.label}>Acte en main</div><div style={{ fontSize: 20, fontWeight: 800, color: C.gold }}>{fmt(calc.acteEnMain)}</div></div>
        </div>
      </div></div>

      {/* Charges enrichies */}
      <div style={si.card}><div style={{ padding: 16 }}>
        <h3 style={{ color: C.gold, margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Charges & Gestion</h3>
        <div style={si.row}>
          <div style={{ flex: 1 }}><div style={si.label}>Charges copro /an</div><input type="text" inputMode="decimal" style={si.input} value={info.chargesCopro || ""} onChange={e => updateInfo("chargesCopro", +e.target.value || 0)} placeholder="0" /></div>
          <div style={{ flex: 1 }}><div style={si.label}>Frais gestion (%)</div><input type="text" inputMode="decimal" style={si.input} value={info.fraisGestion || ""} onChange={e => updateInfo("fraisGestion", +e.target.value || 0)} placeholder="7" /></div>
        </div>
        <div style={si.row}>
          <div style={{ flex: 1 }}><div style={si.label}>Taux vacance (%)</div><input type="text" inputMode="decimal" style={si.input} value={info.tauxVacance || ""} onChange={e => updateInfo("tauxVacance", +e.target.value || 0)} placeholder="5" /></div>
          <div style={{ flex: 1 }}><div style={si.label}>Assurance GLI /an</div><input type="text" inputMode="decimal" style={si.input} value={info.assuranceGLI || ""} onChange={e => updateInfo("assuranceGLI", +e.target.value || 0)} placeholder="0" /></div>
        </div>
        {calc.chargesAn > 0 && (
          <div style={{ padding: 10, background: "#08080f", borderRadius: 8, marginTop: 6, textAlign: "center" }}>
            <div style={si.label}>Total charges annuelles</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.red }}>{fmt(calc.chargesAn)}</div>
            <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>
              dont gestion : {fmt(calc.fraisGestionEur)}/an
            </div>
          </div>
        )}
      </div></div>

      {/* Lots & Loyers */}
      <div style={si.card}><div style={{ padding: 16 }}>
        <h3 style={{ color: C.gold, margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Lots & Loyers</h3>
        {current.lots.map((l, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 8, padding: 10, background: "#08080f", borderRadius: 8, flexWrap: "wrap" }}>
            <div style={{ width: 40 }}><div style={si.label}>Qté</div><input type="text" inputMode="decimal" min={1} style={si.inputSm} value={l.qty} onChange={e => setLots(ls => ls.map((x, j) => j === i ? { ...x, qty: +e.target.value || 1 } : x))} /></div>
            <div style={{ flex: "1 1 110px" }}><div style={si.label}>Type</div><select style={si.input} value={l.type} onChange={e => setLots(ls => ls.map((x, j) => j === i ? { ...x, type: e.target.value, loyer: LOT_TYPES.find(t => t.value === e.target.value)?.r || x.loyer } : x))}>{LOT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
            <div style={{ width: 80 }}><div style={si.label}>Loyer</div><input type="text" inputMode="decimal" style={si.inputSm} value={l.loyer} onChange={e => setLots(ls => ls.map((x, j) => j === i ? { ...x, loyer: +e.target.value || 0 } : x))} /></div>
            <div style={{ width: 70 }}><div style={si.label}>Mode</div><select style={si.input} value={l.meuble ? "m" : "n"} onChange={e => setLots(ls => ls.map((x, j) => j === i ? { ...x, meuble: e.target.value === "m" } : x))}><option value="m">Meublé</option><option value="n">Nu</option></select></div>
            <button onClick={() => setLots(ls => ls.filter((_, j) => j !== i))} style={{ background: "#2a1015", color: "#e74c3c", border: "none", borderRadius: 6, padding: "8px 12px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>&#x2715;</button>
          </div>
        ))}
        <button onClick={() => setLots(ls => [...ls, { type: "t2", loyer: 500, meuble: true, qty: 1 }])} style={{ width: "100%", padding: 10, background: "transparent", border: `2px dashed ${C.inputBorder}`, borderRadius: 8, color: C.gold, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>+ Ajouter un lot</button>
        {current.lots.length > 0 && (
          <div style={{ display: "flex", gap: 20, marginTop: 12, justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}><div style={si.label}>Mensuel</div><div style={{ fontSize: 18, fontWeight: 800, color: C.green }}>{fmt(calc.loyerMensuel)}</div></div>
            <div style={{ textAlign: "center" }}><div style={si.label}>Annuel</div><div style={{ fontSize: 18, fontWeight: 800, color: C.green }}>{fmt(calc.loyerAnnuel)}</div></div>
            <div style={{ textAlign: "center" }}><div style={si.label}>Effectif /an</div><div style={{ fontSize: 18, fontWeight: 800, color: C.orange }}>{fmt(calc.loyerEffectif)}</div></div>
          </div>
        )}
      </div></div>
    </>
  );
}
