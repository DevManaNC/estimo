"use client";

import { useState } from "react";
import { useTheme } from "../lib/ThemeContext";
import { ETAPES } from "../data/pricing";
import { LOT_TYPES } from "../data/pricing";
import { fmt, fmtDec } from "../utils/format";

export default function SyntheseTab({ current, calc, fin, cashFlow, fiscalite }) {
  const { C, si } = useTheme();
  const [showExport, setShowExport] = useState(false);
  const info = current.info;

  const getMat = (item) => current?.customMat[item.id] !== undefined && current.customMat[item.id] !== "" ? Number(current.customMat[item.id]) : item.mat;
  const getMo = (item) => current?.customMo[item.id] !== undefined && current.customMo[item.id] !== "" ? Number(current.customMo[item.id]) : item.mo;
  const getQty = (item) => current?.quantities[item.id] || 0;
  const itemTotal = (item) => getQty(item) * (getMat(item) + getMo(item));

  const allItems = calc.etapes.flatMap(e => e.items);
  const maxEtapeTTC = Math.max(...calc.etapes.map(e => e.ttc), 1);

  const MetricCard = ({ label, value, color, sub }) => (
    <div style={{ ...si.card, padding: 16, textAlign: "center" }}>
      <div style={si.label}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || C.text, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>{sub}</div>}
    </div>
  );

  return (
    <>
      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
        <MetricCard label="Acte en main" value={fmt(calc.acteEnMain)} color={C.gold} />
        <MetricCard label="Travaux TTC" value={fmtDec(calc.totalTTC)} color={C.blue} sub={`Mat: ${fmt(calc.totalMat)} | MO: ${fmt(calc.totalMo)}`} />
        <MetricCard label="Total projet" value={fmtDec(calc.montantTotal)} color={C.green} sub={info.surface > 0 ? `${fmt(calc.coutM2)}/m²` : ""} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginTop: 2 }}>
        <MetricCard label="Loyer mensuel" value={fmt(calc.loyerMensuel)} color={C.green} sub={`${fmt(calc.loyerAnnuel)}/an`} />
        <MetricCard label="Renta brute" value={calc.rentaBrute.toFixed(2) + "%"} color={calc.rentaBrute >= 8 ? C.green : calc.rentaBrute >= 5 ? "#f1c40f" : C.red} />
        <MetricCard label="Renta nette" value={calc.rentaNette.toFixed(2) + "%"} color={calc.rentaNette >= 6 ? C.green : calc.rentaNette >= 4 ? "#f1c40f" : C.red} sub={`Charges: ${fmt(calc.chargesAn)}/an`} />
      </div>

      {/* Cash-flow & financement summary */}
      {fin && fin.mensualite > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginTop: 2 }}>
          <MetricCard label="Mensualité crédit" value={fmt(fin.mensualite)} color={C.blue} sub={`${fin.duree} ans à ${(fin.tauxAnnuel * 100).toFixed(1)}%`} />
          <MetricCard label="Cash-flow /mois" value={`${cashFlow.cashFlowAvantImpot >= 0 ? "+" : ""}${fmt(cashFlow.cashFlowAvantImpot)}`} color={cashFlow.cashFlowAvantImpot >= 0 ? C.green : C.red} />
          <MetricCard label="Cash-on-Cash" value={cashFlow.cashOnCash.toFixed(2) + "%"} color={cashFlow.cashOnCash >= 10 ? C.green : cashFlow.cashOnCash >= 5 ? "#f1c40f" : C.red} sub={`Apport: ${fmt(fin.apportEur)}`} />
        </div>
      )}

      {/* Bar chart - répartition par étape */}
      <div style={si.card}><div style={{ padding: 16 }}>
        <h3 style={{ color: C.gold, margin: "0 0 16px", fontSize: 14 }}>Répartition par étape</h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 160, padding: "0 4px" }}>
          {calc.etapes.map(e => {
            const pct = maxEtapeTTC > 0 ? (e.ttc / maxEtapeTTC) * 100 : 0;
            return (
              <div key={e.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 10, color: e.ttc > 0 ? e.color : C.dim, fontWeight: 700 }}>
                  {e.ttc > 0 ? `${(e.ttc / 1000).toFixed(0)}k` : ""}
                </div>
                <div style={{
                  width: "100%", maxWidth: 50,
                  height: `${Math.max(pct, 2)}%`,
                  background: e.ttc > 0 ? `linear-gradient(to top, ${e.color}, ${e.color}88)` : C.btnBg,
                  borderRadius: "4px 4px 0 0",
                  transition: "height 0.3s ease",
                }} />
                <div style={{ fontSize: 9, color: C.dim, textAlign: "center", lineHeight: 1.2 }}>{e.icon}</div>
              </div>
            );
          })}
        </div>
      </div></div>

      {/* Matériaux vs Main d&apos;oeuvre */}
      {calc.totalTTC > 0 && (
        <div style={si.card}><div style={{ padding: 16 }}>
          <h3 style={{ color: C.gold, margin: "0 0 12px", fontSize: 14 }}>Mat. vs Main d&apos;oeuvre</h3>
          <div style={{ display: "flex", height: 24, borderRadius: 6, overflow: "hidden" }}>
            <div style={{ width: `${(calc.totalMat / (calc.totalMat + calc.totalMo)) * 100}%`, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>Mat {((calc.totalMat / (calc.totalMat + calc.totalMo)) * 100).toFixed(0)}%</span>
            </div>
            <div style={{ flex: 1, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>MO {((calc.totalMo / (calc.totalMat + calc.totalMo)) * 100).toFixed(0)}%</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 12, color: C.blue }}>{fmt(calc.totalMat)}</span>
            <span style={{ fontSize: 12, color: C.green }}>{fmt(calc.totalMo)}</span>
          </div>
        </div></div>
      )}

      {/* Détail par étape */}
      <div style={si.card}><div style={{ padding: 16 }}>
        <h3 style={{ color: C.gold, margin: "0 0 12px", fontSize: 14 }}>Détail par étape</h3>
        {calc.etapes.filter(e => e.ht > 0).map(e => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderLeft: `3px solid ${e.color}`, marginBottom: 6, background: C.surface, borderRadius: "0 6px 6px 0" }}>
            <div>
              <span style={{ color: e.color, fontWeight: 700, fontSize: 13 }}>{e.num}. {e.label}</span>
              <span style={{ fontSize: 10, color: C.dim, marginLeft: 8 }}>Mat {fmt(e.matT)} · MO {fmt(e.moT)}</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{fmtDec(e.ttc)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: 10, background: C.green + "15", borderRadius: 6, marginTop: 6 }}>
          <span style={{ color: C.green, fontWeight: 700 }}>TOTAL TTC</span>
          <span style={{ color: C.green, fontWeight: 800, fontSize: 18 }}>{fmtDec(calc.totalTTC)}</span>
        </div>
      </div></div>

      {/* Détail postes chiffrés */}
      <div style={si.card}><div style={{ padding: 16 }}>
        <h3 style={{ color: C.gold, margin: "0 0 12px", fontSize: 14 }}>Détail postes chiffrés</h3>
        {calc.etapes.map(etape => {
          const used = etape.items.filter(i => getQty(i) > 0);
          if (!used.length) return null;
          return (
            <div key={etape.id} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: etape.color, marginBottom: 4, padding: "4px 0", borderBottom: `1px solid ${etape.color}22` }}>
                {etape.num}. {etape.label}
              </div>
              {used.map(item => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", fontSize: 12 }}>
                  <span style={{ color: C.muted }}>
                    {getQty(item)} {item.unit} × {item.label} <span style={{ color: C.dim }}>(mat {getMat(item)}€ + mo {getMo(item)}€)</span>
                  </span>
                  <span style={{ fontWeight: 600, color: C.text }}>{fmt(itemTotal(item))}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div></div>

      {/* Fiscalité LMNP */}
      {fiscalite && (
        <div style={si.card}><div style={{ padding: 16 }}>
          <h3 style={{ color: C.gold, margin: "0 0 14px", fontSize: 14 }}>Fiscalité LMNP</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {/* Micro-BIC */}
            <div style={{ flex: "1 1 200px", background: fiscalite.regime === "micro" ? C.green + "15" : C.surface, border: fiscalite.regime === "micro" ? `1px solid ${C.green}44` : `1px solid ${C.cardBorder}`, borderRadius: 8, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Micro-BIC</span>
                {fiscalite.regime === "micro" && <span style={{ fontSize: 10, background: C.green + "22", color: C.green, padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>Recommandé</span>}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Loyer brut : {fmt(fiscalite.loyerAnnuel)}</div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Abattement : -50%</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginTop: 8 }}>Imposable : {fmt(fiscalite.microBIC.revenuImposable)}/an</div>
            </div>
            {/* Réel */}
            <div style={{ flex: "1 1 200px", background: fiscalite.regime === "reel" ? C.green + "15" : C.surface, border: fiscalite.regime === "reel" ? `1px solid ${C.green}44` : `1px solid ${C.cardBorder}`, borderRadius: 8, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Réel LMNP</span>
                {fiscalite.regime === "reel" && <span style={{ fontSize: 10, background: C.green + "22", color: C.green, padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>Recommandé</span>}
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>Charges déductibles : {fmt(fiscalite.reel.chargesDeductibles)}</div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>Intérêts d&apos;emprunt : {fmt(fiscalite.reel.interetsAnnuels)}/an</div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>Amort. immobilier : {fmt(fiscalite.reel.amortissementImmo)}/an</div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>Amort. travaux : {fmt(fiscalite.reel.amortissementTravaux)}/an</div>
              <div style={{ fontSize: 11, color: C.dim, marginBottom: 4, borderTop: `1px solid ${C.cardBorder}`, paddingTop: 4, marginTop: 4 }}>Total déductions : {fmt(fiscalite.reel.totalDeductions)}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginTop: 4 }}>Imposable : {fmt(fiscalite.reel.revenuImposable)}/an</div>
            </div>
          </div>
          {fiscalite.avantageReel !== 0 && (
            <div style={{ textAlign: "center", marginTop: 12, padding: 10, background: C.surface, borderRadius: 8 }}>
              <span style={{ fontSize: 13, color: C.green, fontWeight: 700 }}>
                Économie en {fiscalite.regime === "reel" ? "réel" : "micro-BIC"} : {fmt(Math.abs(fiscalite.avantageReel))}/an d&apos;assiette imposable
              </span>
            </div>
          )}
        </div></div>
      )}

      {/* Plus-value latente */}
      {(info.prixM2Renove || 0) > 0 && (info.surface || 0) > 0 && (
        <div style={si.card}><div style={{ padding: 16 }}>
          <h3 style={{ color: C.gold, margin: "0 0 12px", fontSize: 14 }}>Plus-value latente</h3>
          <div style={{ display: "flex", gap: 20, justifyContent: "space-around", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}><div style={si.label}>Coût/m²</div><div style={{ fontSize: 18, fontWeight: 800 }}>{fmt(calc.coutM2)}</div></div>
            <div style={{ textAlign: "center" }}><div style={si.label}>Marché/m²</div><div style={{ fontSize: 18, fontWeight: 800 }}>{fmt(info.prixM2Renove)}</div></div>
            <div style={{ textAlign: "center" }}><div style={si.label}>Plus-value</div><div style={{ fontSize: 22, fontWeight: 800, color: calc.plusValue > 0 ? C.green : C.red }}>{fmtDec(calc.plusValue)}</div></div>
          </div>
        </div></div>
      )}

      {/* Export */}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setShowExport(!showExport)} style={{ flex: 1, padding: 14, background: `linear-gradient(135deg,${C.gold},#8b6b3d)`, border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 700 }}>
          {showExport ? "Masquer" : "Exporter récapitulatif"}
        </button>
        <button onClick={() => window.print()} style={{ padding: "14px 20px", background: C.btnBg, border: `1px solid ${C.cardBorder}`, borderRadius: 10, color: C.muted, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
          Imprimer / PDF
        </button>
      </div>

      {showExport && (
        <textarea readOnly value={(() => {
          let t = `PRÉ-CHIFFRAGE — ${current.name}\n${info.adresse} ${info.cp} ${info.ville} — ${info.surface}m²\n${"═".repeat(55)}\n\nACQUISITION\n  Prix FAI: ${fmt(info.prixVente)} | Négo: -${fmt(info.negociation)} | Notaire: ${fmt(calc.fraisNotaireEur)}\n  → Acte en main: ${fmt(calc.acteEnMain)}\n\nTRAVAUX\n`;
          calc.etapes.forEach(etape => {
            if (etape.ht === 0) return;
            t += `\n  ${etape.num}. ${etape.label} — ${fmtDec(etape.ttc)} TTC (Mat: ${fmt(etape.matT)} / MO: ${fmt(etape.moT)})\n`;
            etape.items.filter(i => getQty(i) > 0).forEach(i => {
              t += `     ${getQty(i)} ${i.unit} × ${i.label} (${getMat(i)}€ + ${getMo(i)}€) = ${fmt(itemTotal(i))}\n`;
            });
          });
          t += `\n  TOTAL TTC: ${fmtDec(calc.totalTTC)}\n\nLOTS\n`;
          current.lots.forEach(l => {
            const tp = LOT_TYPES.find(x => x.value === l.type);
            t += `  ${l.qty}× ${tp?.label} — ${fmt(l.loyer)}/mois ${l.meuble ? "meublé" : "nu"}\n`;
          });
          t += `  → Mensuel: ${fmt(calc.loyerMensuel)} | Annuel: ${fmt(calc.loyerAnnuel)}\n`;
          t += `  → Effectif (vacance ${info.tauxVacance || 0}%): ${fmt(calc.loyerEffectif)}/an\n`;
          t += `\nCHARGES ANNUELLES: ${fmt(calc.chargesAn)}\n`;
          t += `  Foncière: ${fmt(info.taxeFonciere || 0)} | PNO: ${fmt(info.assurancePNO || 0)} | Copro: ${fmt(info.chargesCopro || 0)} | GLI: ${fmt(info.assuranceGLI || 0)} | Gestion: ${fmt(calc.fraisGestionEur)}\n`;
          if (fin && fin.mensualite > 0) {
            t += `\nFINANCEMENT\n  Apport: ${fmt(fin.apportEur)} (${fin.apportPct}%) | Emprunt: ${fmt(fin.emprunt)}\n  Mensualité: ${fmt(fin.mensualite)} sur ${fin.duree} ans à ${(fin.tauxAnnuel * 100).toFixed(1)}%\n  Intérêts: ${fmt(fin.interets)}\n  Cash-flow: ${cashFlow.cashFlowAvantImpot >= 0 ? "+" : ""}${fmt(cashFlow.cashFlowAvantImpot)}/mois\n`;
          }
          t += `\nSYNTHÈSE\n  Total: ${fmtDec(calc.montantTotal)} (${fmt(calc.coutM2)}/m²)\n  Brute: ${calc.rentaBrute.toFixed(2)}% | Nette: ${calc.rentaNette.toFixed(2)}%\n  Plus-value: ${fmtDec(calc.plusValue)}\n`;
          if (fiscalite) {
            t += `\nFISCALITÉ LMNP\n  Micro-BIC: ${fmt(fiscalite.microBIC.revenuImposable)} imposable\n  Réel: ${fmt(fiscalite.reel.revenuImposable)} imposable\n  → ${fiscalite.regime === "reel" ? "Réel" : "Micro-BIC"} recommandé\n`;
          }
          return t;
        })()} onClick={e => e.target.select()} style={{ width: "100%", minHeight: 400, background: C.surface, border: `1px solid ${C.cardBorder}`, borderRadius: 8, color: C.muted, padding: 14, fontSize: 11, fontFamily: "monospace", resize: "vertical", boxSizing: "border-box", marginTop: 12 }} />
      )}
    </>
  );
}
