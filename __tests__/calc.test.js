import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { calcProject, calcFinancement, calcCashFlow, calcFiscalite, calcAmortissement } from "../app/utils/calc.js";

function makeProject(overrides = {}) {
  return {
    info: {
      adresse: "", ville: "", cp: "", surface: 100,
      prixVente: 200000, negociation: 10000, fraisNotaire: 8, fraisAgence: 0,
      taxeFonciere: 1500, prixM2Renove: 2500, assurancePNO: 600,
      chargesCopro: 600, fraisGestion: 7, tauxVacance: 5, assuranceGLI: 300,
      apport: 20, tauxCredit: 3.5, dureeCredit: 20,
      ...overrides.info,
    },
    lots: overrides.lots || [
      { type: "t2", loyer: 600, meuble: true, qty: 2 },
    ],
    quantities: overrides.quantities || {},
    customMat: overrides.customMat || {},
    customMo: overrides.customMo || {},
    customItems: overrides.customItems || {},
    notes: {},
  };
}

describe("calcProject", () => {
  test("calculates acquisition costs correctly", () => {
    const r = calcProject(makeProject());
    assert.equal(r.prixNet, 190000);
    assert.equal(r.fraisNotaireEur, 15200);
    assert.equal(r.acteEnMain, 205200);
  });

  test("calculates rent correctly with multiple lots", () => {
    const r = calcProject(makeProject({
      lots: [
        { type: "t2", loyer: 600, meuble: true, qty: 2 },
        { type: "studio", loyer: 400, meuble: true, qty: 1 },
      ],
    }));
    assert.equal(r.loyerMensuel, 1600);
    assert.equal(r.loyerAnnuel, 19200);
  });

  test("calculates effective rent with vacancy", () => {
    const r = calcProject(makeProject({ info: { tauxVacance: 10 } }));
    assert.equal(r.loyerEffectif, 12960);
  });

  test("handles zero surface without division by zero", () => {
    const r = calcProject(makeProject({ info: { surface: 0 } }));
    assert.equal(r.coutM2, 0);
    assert.ok(Number.isFinite(r.rentaBrute));
  });

  test("handles empty lots array", () => {
    const r = calcProject(makeProject({ lots: [] }));
    assert.equal(r.loyerMensuel, 0);
    assert.equal(r.loyerAnnuel, 0);
    assert.equal(r.rentaBrute, 0);
  });

  test("calculates gross and net yield", () => {
    const r = calcProject(makeProject());
    assert.ok(r.rentaBrute > 0);
    assert.ok(r.rentaNette > 0);
    assert.ok(r.rentaBrute > r.rentaNette);
  });

  test("cost per m2 is calculated correctly", () => {
    const r = calcProject(makeProject());
    assert.equal(r.coutM2, Math.round(r.montantTotal / 100));
  });
});

describe("calcFinancement", () => {
  test("calculates loan parameters correctly", () => {
    const r = calcFinancement({ apport: 20, tauxCredit: 3.5, dureeCredit: 20 }, 250000);
    assert.equal(r.apportEur, 50000);
    assert.equal(r.emprunt, 200000);
    assert.equal(r.duree, 20);
    assert.equal(r.nbMois, 240);
    assert.ok(r.mensualite > 0);
    assert.ok(r.coutTotal > r.emprunt);
    assert.ok(r.interets > 0);
  });

  test("handles 0% interest rate", () => {
    const r = calcFinancement({ apport: 10, tauxCredit: 0, dureeCredit: 10 }, 100000);
    assert.equal(r.mensualite, 750);
    assert.equal(r.interets, 0);
  });

  test("handles 100% down payment", () => {
    const r = calcFinancement({ apport: 100, tauxCredit: 3, dureeCredit: 20 }, 100000);
    assert.equal(r.emprunt, 0);
    assert.equal(r.mensualite, 0);
  });

  test("clamps interest rate to max 30%", () => {
    const r = calcFinancement({ apport: 0, tauxCredit: 50, dureeCredit: 20 }, 100000);
    assert.equal(r.tauxAnnuel, 0.30);
  });
});

describe("calcCashFlow", () => {
  test("calculates monthly cash flow", () => {
    const p = makeProject();
    const calc = calcProject(p);
    const fin = calcFinancement(p.info, calc.montantTotal);
    const cf = calcCashFlow(p.info, calc, fin);
    assert.ok(cf.loyerEffectifMensuel > 0);
    assert.equal(typeof cf.cashFlowAvantImpot, "number");
    assert.equal(cf.cashFlowAnnuel, cf.cashFlowAvantImpot * 12);
  });

  test("cash on cash is 0 when no down payment", () => {
    const p = makeProject({ info: { apport: 0 } });
    const calc = calcProject(p);
    const fin = calcFinancement(p.info, calc.montantTotal);
    const cf = calcCashFlow(p.info, calc, fin);
    assert.equal(cf.cashOnCash, 0);
  });
});

describe("calcFiscalite", () => {
  test("returns null when no rent", () => {
    const p = makeProject({ lots: [] });
    const calc = calcProject(p);
    const fin = calcFinancement(p.info, calc.montantTotal);
    assert.equal(calcFiscalite(p.info, calc, fin), null);
  });

  test("compares micro-BIC and reel regimes", () => {
    const p = makeProject();
    const calc = calcProject(p);
    const fin = calcFinancement(p.info, calc.montantTotal);
    const r = calcFiscalite(p.info, calc, fin);
    assert.notEqual(r, null);
    assert.equal(r.microBIC.revenuImposable, Math.round(r.loyerAnnuel * 0.5));
    assert.ok(r.reel.revenuImposable >= 0);
    assert.ok(["reel", "micro"].includes(r.regime));
  });

  test("reel deductions include all components", () => {
    const p = makeProject();
    const calc = calcProject(p);
    const fin = calcFinancement(p.info, calc.montantTotal);
    const r = calcFiscalite(p.info, calc, fin);
    assert.ok(r.reel.chargesDeductibles > 0);
    assert.ok(r.reel.amortissementImmo > 0);
    assert.equal(r.reel.totalDeductions,
      r.reel.chargesDeductibles + r.reel.interetsAnnuels + r.reel.amortissementImmo + r.reel.amortissementTravaux);
  });
});

describe("calcAmortissement", () => {
  const fin = { emprunt: 200000, nbMois: 240, duree: 20, tauxAnnuel: 0.035, mensualite: 1160 };

  test("generates correct number of rows", () => {
    const rows = calcAmortissement(fin);
    assert.equal(rows.length, 20);
    assert.equal(rows[0].annee, 1);
    assert.equal(rows[19].annee, 20);
  });

  test("capital remaining decreases to 0", () => {
    const rows = calcAmortissement(fin);
    assert.equal(rows[19].restant, 0);
    assert.ok(rows[0].restant > rows[19].restant);
  });

  test("returns empty for zero loan", () => {
    const rows = calcAmortissement({ emprunt: 0, nbMois: 240, duree: 20, tauxAnnuel: 0.035, mensualite: 0 });
    assert.equal(rows.length, 0);
  });

  test("interest decreases over time while capital increases", () => {
    const rows = calcAmortissement(fin);
    assert.ok(rows[0].interets > rows[19].interets);
    assert.ok(rows[0].capital < rows[19].capital);
  });
});
