"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "../lib/ThemeContext";
import { fmt } from "../utils/format";
import { LOT_TYPES, RENTAL_MODES, defaultLoyer } from "../data/pricing";
import { getDepartment } from "../data/regions";

export default function InfoTab({ current, calc, updateInfo, setLots, renameProject }) {
  const { C, si } = useTheme();
  const info = current.info;
  const updateInfoRef = useRef(updateInfo);
  updateInfoRef.current = updateInfo;

  useEffect(() => {
    if (!info.cp || info.cp.length !== 5) return;
    const controller = new AbortController();
    fetch(`/api/geo?cp=${info.cp}`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => { if (data.length > 0) updateInfoRef.current("ville", data[0].nom); })
      .catch(() => {});
    return () => controller.abort();
  }, [info.cp]);

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
          <div style={{ flex: "0 0 100px" }}><div style={si.label}>CP</div><input style={si.input} value={info.cp} onChange={e => updateInfo("cp", e.target.value)} placeholder="34000" /></div>
          <div style={{ flex: "1 1 140px" }}><div style={si.label}>Ville</div><input style={si.input} value={info.ville} onChange={e => updateInfo("ville", e.target.value)} placeholder="Montpellier" /></div>
        </div>
        {info.cp && info.cp.length >= 2 && (() => {
          const dept = getDepartment(info.cp);
          if (!dept) return null;
          return (
            <div style={{ fontSize: 11, color: C.muted, marginTop: -4, marginBottom: 8 }}>
              {dept.name} ({dept.code}) — coeff. régional : <span style={{ color: dept.multiplier !== 1 ? C.gold : C.green, fontWeight: 700 }}>{dept.multiplier.toFixed(2)}</span>
            </div>
          );
        })()}
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
        <div style={{ display: "flex", gap: 16, marginTop: 16, padding: 14, background: C.surface, borderRadius: 8, flexWrap: "wrap", justifyContent: "space-between" }}>
          <div><div style={si.label}>Net vendeur</div><div style={{ fontSize: 17, fontWeight: 700 }}>{fmt(calc.prixNet)}</div></div>
          <div><div style={si.label}>Frais notaire</div><div style={{ fontSize: 17, fontWeight: 700 }}>{fmt(calc.fraisNotaireEur)}</div></div>
          <div><div style={si.label}>Acte en main</div><div style={{ fontSize: 20, fontWeight: 800, color: C.gold }}>{fmt(calc.acteEnMain)}</div></div>
        </div>
      </div></div>

      {/* Structure de propriété */}
      <div style={si.card}><div style={{ padding: 16 }}>
        <h3 style={{ color: C.gold, margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Structure de propriété</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ v: "mono", l: "Monopropriété", d: "Bien entier détenu seul" }, { v: "copro", l: "Copropriété", d: "Lot(s) dans une copropriété" }].map(o => (
            <button
              key={o.v}
              onClick={() => updateInfo("ownership", o.v)}
              style={{
                flex: 1, padding: "12px 14px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                background: (info.ownership || "mono") === o.v ? C.gold + "22" : C.surface,
                border: (info.ownership || "mono") === o.v ? `1px solid ${C.gold}55` : `1px solid ${C.cardBorder}`,
                color: (info.ownership || "mono") === o.v ? C.gold : C.text,
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700 }}>{o.l}</div>
              <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>{o.d}</div>
            </button>
          ))}
        </div>
      </div></div>

      {/* Charges enrichies */}
      <div style={si.card}><div style={{ padding: 16 }}>
        <h3 style={{ color: C.gold, margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Charges & Gestion</h3>
        {(info.ownership || "mono") === "copro" && (
          <div style={si.row}>
            <div style={{ flex: 1 }}><div style={si.label}>Charges copro /an</div><input type="text" inputMode="decimal" style={si.input} value={info.chargesCopro || ""} onChange={e => updateInfo("chargesCopro", +e.target.value || 0)} placeholder="0" /></div>
            <div style={{ flex: 1 }}><div style={si.label}>Fonds travaux copro /an</div><input type="text" inputMode="decimal" style={si.input} value={info.fondsTravauxCopro || ""} onChange={e => updateInfo("fondsTravauxCopro", +e.target.value || 0)} placeholder="0" /></div>
          </div>
        )}
        <div style={si.row}>
          <div style={{ flex: 1 }}><div style={si.label}>Frais gestion (%)</div><input type="text" inputMode="decimal" style={si.input} value={info.fraisGestion || ""} onChange={e => updateInfo("fraisGestion", +e.target.value || 0)} placeholder="7" /></div>
          <div style={{ flex: 1 }}><div style={si.label}>Taux vacance (%)</div><input type="text" inputMode="decimal" style={si.input} value={info.tauxVacance || ""} onChange={e => updateInfo("tauxVacance", +e.target.value || 0)} placeholder="5" /></div>
        </div>
        <div style={si.row}>
          <div style={{ flex: 1 }}><div style={si.label}>Assurance GLI /an</div><input type="text" inputMode="decimal" style={si.input} value={info.assuranceGLI || ""} onChange={e => updateInfo("assuranceGLI", +e.target.value || 0)} placeholder="0" /></div>
        </div>
        {calc.chargesAn > 0 && (
          <div style={{ padding: 10, background: C.surface, borderRadius: 8, marginTop: 6, textAlign: "center" }}>
            <div style={si.label}>Total charges annuelles</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.red }}>{fmt(calc.chargesAn)}</div>
            <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>
              dont gestion : {fmt(calc.fraisGestionEur)}/an
            </div>
          </div>
        )}
      </div></div>

      {/* Fiscalité avancée */}
      <div style={si.card}><div style={{ padding: 16 }}>
        <h3 style={{ color: C.gold, margin: "0 0 10px", fontSize: 15, fontWeight: 700 }}>Fiscalité avancée</h3>
        <div style={si.row}>
          <div style={{ flex: 1 }}>
            <div style={si.label}>TMI (%) — tranche marginale</div>
            <select style={si.input} value={info.tmi ?? 30} onChange={e => updateInfo("tmi", +e.target.value)}>
              {[0, 11, 30, 41, 45].map(t => <option key={t} value={t}>{t}%</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <div style={si.label}>Aides travaux perçues (€)</div>
            <input type="text" inputMode="decimal" style={si.input} value={info.aidesTravaux || ""} onChange={e => updateInfo("aidesTravaux", +e.target.value || 0)} placeholder="0" />
            <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>MaPrimeRénov&apos;, CEE, subventions…</div>
          </div>
        </div>

        {/* Denormandie */}
        <div style={{ marginTop: 12, padding: 12, background: C.surface, borderRadius: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={!!info.denormandieEnabled} onChange={e => updateInfo("denormandieEnabled", e.target.checked)} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Denormandie</span>
            <span style={{ fontSize: 10, color: C.dim }}>(location nue, zones éligibles, travaux ≥ 25% coût total)</span>
          </label>
          {info.denormandieEnabled && (
            <div style={{ marginTop: 8, paddingLeft: 24 }}>
              <div style={si.label}>Durée d&apos;engagement</div>
              <select style={{ ...si.input, maxWidth: 180 }} value={info.denormandieDuree || 9} onChange={e => updateInfo("denormandieDuree", +e.target.value)}>
                <option value={6}>6 ans (12%)</option>
                <option value={9}>9 ans (18%)</option>
                <option value={12}>12 ans (21%)</option>
              </select>
            </div>
          )}
        </div>

        {/* Loc'Avantages */}
        <div style={{ marginTop: 8, padding: 12, background: C.surface, borderRadius: 8 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={!!info.locAvantagesEnabled} onChange={e => updateInfo("locAvantagesEnabled", e.target.checked)} />
            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Loc&apos;Avantages (ex Louer Abordable / Lana)</span>
            <span style={{ fontSize: 10, color: C.dim }}>(convention ANAH, location nue)</span>
          </label>
          {info.locAvantagesEnabled && (
            <div style={{ marginTop: 8, paddingLeft: 24 }}>
              <div style={si.label}>Niveau de loyer</div>
              <select style={{ ...si.input, maxWidth: 260 }} value={info.locAvantagesNiveau || "loc1"} onChange={e => updateInfo("locAvantagesNiveau", e.target.value)}>
                <option value="loc1">Loc1 — réduction 15%</option>
                <option value="loc2">Loc2 — réduction 35%</option>
                <option value="loc3">Loc3 — réduction 65%</option>
              </select>
            </div>
          )}
        </div>

        {/* Info MaPrimeRénov' */}
        <details style={{ marginTop: 10 }}>
          <summary style={{ cursor: "pointer", fontSize: 12, color: C.gold, fontWeight: 600 }}>Aides travaux — montants indicatifs 2025</summary>
          <div style={{ marginTop: 8, padding: 10, background: C.surface, borderRadius: 6, fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
            <div style={{ fontWeight: 700, color: C.text, marginBottom: 4 }}>MaPrimeRénov&apos; par geste (bailleurs)</div>
            <div>• Isolation murs/combles : 15–25 €/m²</div>
            <div>• Pompe à chaleur air/eau : 2 000–4 000 €</div>
            <div>• Chaudière biomasse : 2 500–7 000 €</div>
            <div>• Chauffe-eau thermodynamique : 400–1 200 €</div>
            <div style={{ fontWeight: 700, color: C.text, marginTop: 8, marginBottom: 4 }}>MaPrimeRénov&apos; rénovation d&apos;ampleur</div>
            <div>• Gain 2 classes DPE : jusqu&apos;à 10 000 €</div>
            <div>• Gain 3 classes : jusqu&apos;à 25 000 €</div>
            <div>• Gain 4 classes : jusqu&apos;à 40 000 €</div>
            <div style={{ fontWeight: 700, color: C.text, marginTop: 8, marginBottom: 4 }}>Autres</div>
            <div>• CEE (Certificats d&apos;Économie d&apos;Énergie) : variable selon fournisseur</div>
            <div>• Éco-PTZ : jusqu&apos;à 50 000 € à 0%</div>
            <div>• TVA 5,5% sur rénovation énergétique</div>
          </div>
        </details>
      </div></div>

      {/* Lots & Loyers */}
      <div style={si.card}><div style={{ padding: 16 }}>
        <h3 style={{ color: C.gold, margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Lots & Loyers</h3>
        {current.lots.map((l, i) => {
          const mode = l.mode || (l.meuble ? "lld" : "nu");
          return (
            <div key={i} style={{ marginBottom: 8, padding: 10, background: C.surface, borderRadius: 8 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ width: 40 }}><div style={si.label}>Qté</div><input type="text" inputMode="decimal" min={1} style={si.inputSm} value={l.qty} onChange={e => setLots(ls => ls.map((x, j) => j === i ? { ...x, qty: +e.target.value || 1 } : x))} /></div>
                <div style={{ flex: "1 1 110px" }}>
                  <div style={si.label}>Type</div>
                  <select style={si.input} value={l.type} onChange={e => {
                    const newType = e.target.value;
                    setLots(ls => ls.map((x, j) => j === i ? { ...x, type: newType, loyer: defaultLoyer(newType, x.mode || (x.meuble ? "lld" : "nu")) } : x));
                  }}>{LOT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
                </div>
                <div style={{ flex: "1 1 140px" }}>
                  <div style={si.label}>Mode location</div>
                  <select style={si.input} value={mode} onChange={e => {
                    const newMode = e.target.value;
                    setLots(ls => ls.map((x, j) => j === i ? { ...x, mode: newMode, meuble: newMode !== "nu", loyer: defaultLoyer(x.type, newMode) } : x));
                  }}>{RENTAL_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select>
                </div>
                <div style={{ width: 90 }}><div style={si.label}>Loyer /mois</div><input type="text" inputMode="decimal" style={si.inputSm} value={l.loyer} onChange={e => setLots(ls => ls.map((x, j) => j === i ? { ...x, loyer: +e.target.value || 0 } : x))} /></div>
                <button onClick={() => setLots(ls => ls.filter((_, j) => j !== i))} style={{ background: C.red + "22", color: C.red, border: "none", borderRadius: 6, padding: "8px 12px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>&#x2715;</button>
              </div>
              <div style={{ fontSize: 10, color: C.dim, marginTop: 4, paddingLeft: 48 }}>
                {RENTAL_MODES.find(m => m.value === mode)?.desc}
                {mode === "lcd" && " · saisir le revenu mensuel moyen (taux d'occupation déjà intégré)"}
              </div>
            </div>
          );
        })}
        <button onClick={() => setLots(ls => [...ls, { type: "t2", loyer: defaultLoyer("t2", "lld"), mode: "lld", meuble: true, qty: 1 }])} style={{ width: "100%", padding: 10, background: "transparent", border: `2px dashed ${C.inputBorder}`, borderRadius: 8, color: C.gold, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>+ Ajouter un lot</button>
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
