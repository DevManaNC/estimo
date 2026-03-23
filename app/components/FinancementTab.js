"use client";

import { useState } from "react";
import { C, si } from "../styles";
import { fmt } from "../utils/format";

export default function FinancementTab({ current, calc, fin, cashFlow, updateInfo }) {
  const [showAmort, setShowAmort] = useState(false);
  const info = current.info;

  // Build amortization table
  const amortTable = [];
  if (fin.emprunt > 0 && fin.nbMois > 0) {
    const tauxMensuel = fin.tauxAnnuel / 12;
    let restant = fin.emprunt;
    let cumulCF = 0;
    for (let a = 1; a <= fin.duree; a++) {
      let intAn = 0, capAn = 0;
      for (let m = 0; m < 12; m++) {
        const int = restant * tauxMensuel;
        const cap = fin.mensualite - int;
        intAn += int; capAn += cap; restant -= cap;
      }
      cumulCF += cashFlow.cashFlowAvantImpot * 12;
      amortTable.push({ a, cap: Math.round(capAn), int: Math.round(intAn), restant: Math.max(0, Math.round(restant)), cumulCF: Math.round(cumulCF) });
    }
  }

  const MetricCard = ({ label, value, color, sub }) => (
    <div style={{ ...si.card, padding: 16, textAlign: "center", flex: "1 1 140px" }}>
      <div style={si.label}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || C.text, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>{sub}</div>}
    </div>
  );

  return (
    <>
      {/* Paramètres crédit */}
      <div style={si.card}><div style={{ padding: 16 }}>
        <h3 style={{ color: C.gold, margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Paramètres du crédit</h3>
        <div style={si.row}>
          <div style={{ flex: 1 }}>
            <div style={si.label}>Apport (%)</div>
            <input type="text" inputMode="decimal" style={si.input} value={info.apport || ""} onChange={e => updateInfo("apport", +e.target.value || 0)} placeholder="20" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={si.label}>Taux annuel (%)</div>
            <input type="text" inputMode="decimal" step="0.1" style={si.input} value={info.tauxCredit || ""} onChange={e => updateInfo("tauxCredit", +e.target.value || 0)} placeholder="3.5" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={si.label}>Durée (ans)</div>
            <select style={si.input} value={info.dureeCredit || 20} onChange={e => updateInfo("dureeCredit", +e.target.value)}>
              {[10, 15, 20, 25, 30].map(d => <option key={d} value={d}>{d} ans</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 16, padding: 14, background: "#08080f", borderRadius: 8, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div><div style={si.label}>Montant total</div><div style={{ fontSize: 16, fontWeight: 700 }}>{fmt(calc.montantTotal)}</div></div>
          <div><div style={si.label}>Apport</div><div style={{ fontSize: 16, fontWeight: 700, color: C.gold }}>{fmt(fin.apportEur)}</div></div>
          <div><div style={si.label}>Emprunt</div><div style={{ fontSize: 20, fontWeight: 800, color: C.blue }}>{fmt(fin.emprunt)}</div></div>
        </div>
      </div></div>

      {/* Résultats crédit */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <MetricCard label="Mensualité" value={fmt(fin.mensualite)} color={C.blue} sub={`${fin.duree} ans × 12 mois`} />
        <MetricCard label="Coût total crédit" value={fmt(fin.coutTotal)} color={C.text} />
        <MetricCard label="Intérêts totaux" value={fmt(fin.interets)} color={C.red} sub={fin.emprunt > 0 ? `${((fin.interets / fin.emprunt) * 100).toFixed(1)}% du capital` : ""} />
      </div>

      {/* Cash-flow */}
      <div style={si.card}><div style={{ padding: 16 }}>
        <h3 style={{ color: C.gold, margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Cash-flow mensuel</h3>

        <div style={{ background: "#08080f", borderRadius: 8, padding: 14 }}>
          {[
            { label: "Loyer effectif (après vacance)", value: cashFlow.loyerEffectifMensuel, color: C.green, sign: "+" },
            { label: "Mensualité crédit", value: fin.mensualite, color: C.red, sign: "-" },
            { label: "Charges (foncier, PNO, copro, GLI)", value: cashFlow.chargesMensuelles, color: C.red, sign: "-" },
            { label: "Frais de gestion", value: cashFlow.gestionMensuelle, color: C.red, sign: "-" },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 3 ? "1px solid #1a1a2e" : "none" }}>
              <span style={{ fontSize: 13, color: C.muted }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: row.color }}>{row.sign} {fmt(row.value)}</span>
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", marginTop: 8, borderTop: `2px solid ${C.cardBorder}` }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>Cash-flow mensuel</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: cashFlow.cashFlowAvantImpot >= 0 ? C.green : C.red }}>
              {cashFlow.cashFlowAvantImpot >= 0 ? "+" : ""}{fmt(cashFlow.cashFlowAvantImpot)}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <MetricCard label="Cash-flow annuel" value={`${cashFlow.cashFlowAnnuel >= 0 ? "+" : ""}${fmt(cashFlow.cashFlowAnnuel)}`} color={cashFlow.cashFlowAnnuel >= 0 ? C.green : C.red} />
          <MetricCard label="Cash-on-Cash" value={cashFlow.cashOnCash.toFixed(2) + "%"} color={cashFlow.cashOnCash >= 10 ? C.green : cashFlow.cashOnCash >= 5 ? "#f1c40f" : C.red} sub="Rendement sur apport" />
        </div>
      </div></div>

      {/* Tableau d'amortissement */}
      {amortTable.length > 0 && (
        <div style={si.card}><div style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ color: C.gold, margin: 0, fontSize: 14, fontWeight: 700 }}>Tableau d'amortissement</h3>
            <button onClick={() => setShowAmort(!showAmort)} style={si.btn("#1a1a2e", C.muted)}>
              {showAmort ? "Masquer" : "Afficher"}
            </button>
          </div>

          {showAmort && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.cardBorder}` }}>
                    {["Année", "Capital", "Intérêts", "Restant dû", "CF cumulé"].map(h => (
                      <th key={h} style={{ padding: "8px 6px", textAlign: "right", color: C.dim, fontWeight: 600, fontSize: 10, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {amortTable.map(r => (
                    <tr key={r.a} style={{ borderBottom: "1px solid #0e0e1a" }}>
                      <td style={{ padding: "6px", textAlign: "right", color: C.muted }}>{r.a}</td>
                      <td style={{ padding: "6px", textAlign: "right", color: C.green }}>{fmt(r.cap)}</td>
                      <td style={{ padding: "6px", textAlign: "right", color: C.red }}>{fmt(r.int)}</td>
                      <td style={{ padding: "6px", textAlign: "right", fontWeight: 600 }}>{fmt(r.restant)}</td>
                      <td style={{ padding: "6px", textAlign: "right", fontWeight: 600, color: r.cumulCF >= 0 ? C.green : C.red }}>{r.cumulCF >= 0 ? "+" : ""}{fmt(r.cumulCF)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div></div>
      )}
    </>
  );
}
