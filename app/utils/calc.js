import { ETAPES } from "../data/pricing.js";
import { getMultiplier } from "../data/regions.js";

/** Clamp a number to a safe range, defaulting to 0 for non-finite values */
function safe(v, min = 0, max = Infinity) {
  const n = Number(v);
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
}

export function calcProject(p) {
  const { info, lots, quantities, customMat = {}, customMo = {}, customItems = {} } = p;
  const mult = getMultiplier(info.cp);
  // Apply regional multiplier to default prices only (not user-customized prices)
  const gM = (item) => customMat[item.id] !== undefined && customMat[item.id] !== "" ? safe(customMat[item.id]) : Math.round(safe(item.mat) * mult * 100) / 100;
  const gO = (item) => customMo[item.id] !== undefined && customMo[item.id] !== "" ? safe(customMo[item.id]) : Math.round(safe(item.mo) * mult * 100) / 100;
  const gQ = (item) => safe(quantities[item.id]);

  const etapes = ETAPES.map(e => {
    const extras = (customItems[e.id] || []);
    const allItems = [...e.items, ...extras];
    const ht = allItems.reduce((s, i) => s + gQ(i) * (gM(i) + gO(i)), 0);
    const matT = allItems.reduce((s, i) => s + gQ(i) * gM(i), 0);
    const moT = allItems.reduce((s, i) => s + gQ(i) * gO(i), 0);
    return { ...e, items: allItems, ht, ttc: Math.round(ht * (1 + e.tva / 100)), matT, moT };
  });

  const totalTTC = etapes.reduce((s, e) => s + e.ttc, 0);
  const totalHT = etapes.reduce((s, e) => s + e.ht, 0);
  const totalMat = etapes.reduce((s, e) => s + e.matT, 0);
  const totalMo = etapes.reduce((s, e) => s + e.moT, 0);

  const prixNet = safe(info.prixVente) - safe(info.negociation);
  const fraisNotaireEur = Math.round(prixNet * safe(info.fraisNotaire, 0, 100) / 100);
  const acteEnMain = prixNet + fraisNotaireEur + safe(info.fraisAgence);
  const montantTotal = acteEnMain + totalTTC;
  const coutM2 = info.surface > 0 ? Math.round(montantTotal / safe(info.surface, 1)) : 0;

  const loyerMensuel = lots.reduce((s, l) => s + safe(l.loyer) * safe(l.qty, 1), 0);
  const loyerAnnuel = loyerMensuel * 12;

  const chargesCopro = safe(info.chargesCopro);
  const fraisGestionPct = safe(info.fraisGestion, 0, 100);
  const tauxVacance = safe(info.tauxVacance, 0, 100);
  const assuranceGLI = safe(info.assuranceGLI);

  const fraisGestionEur = Math.round(loyerAnnuel * fraisGestionPct / 100);
  const chargesAn = safe(info.taxeFonciere) + safe(info.assurancePNO) + chargesCopro + assuranceGLI + fraisGestionEur;
  const loyerEffectif = Math.round(loyerAnnuel * (1 - tauxVacance / 100));

  const rentaBrute = montantTotal > 0 ? (loyerAnnuel / montantTotal) * 100 : 0;
  const rentaNette = montantTotal > 0 ? ((loyerEffectif - chargesAn) / montantTotal) * 100 : 0;
  const plusValue = (safe(info.prixM2Renove) - coutM2) * safe(info.surface);

  return {
    etapes, totalTTC, totalHT, totalMat, totalMo,
    acteEnMain, montantTotal, coutM2,
    loyerMensuel, loyerAnnuel, loyerEffectif,
    rentaBrute, rentaNette, plusValue,
    fraisNotaireEur, prixNet, chargesAn, fraisGestionEur,
    regionalMultiplier: mult,
  };
}

export function calcFinancement(info, montantTotal) {
  const apportPct = safe(info.apport, 0, 100);
  const apportEur = Math.round(montantTotal * apportPct / 100);
  const emprunt = montantTotal - apportEur;
  const tauxAnnuel = safe(info.tauxCredit, 0, 30) / 100;
  const tauxMensuel = tauxAnnuel / 12;
  const duree = safe(info.dureeCredit, 1, 30);
  const nbMois = duree * 12;

  let mensualite = 0;
  if (tauxMensuel > 0 && nbMois > 0 && emprunt > 0) {
    mensualite = (emprunt * tauxMensuel) / (1 - Math.pow(1 + tauxMensuel, -nbMois));
  } else if (nbMois > 0 && emprunt > 0) {
    mensualite = emprunt / nbMois;
  }

  const coutTotal = Math.round(mensualite * nbMois);
  const interets = coutTotal - emprunt;

  return {
    apportPct, apportEur, emprunt,
    mensualite: Math.round(mensualite),
    coutTotal, interets, nbMois, duree, tauxAnnuel,
  };
}

export function calcCashFlow(info, calc, fin) {
  const tauxVacance = safe(info.tauxVacance, 0, 100);
  const fraisGestionPct = safe(info.fraisGestion, 0, 100);

  const loyerEffectifMensuel = Math.round(calc.loyerMensuel * (1 - tauxVacance / 100));
  const chargesMensuelles = Math.round((safe(info.taxeFonciere) + safe(info.assurancePNO) + safe(info.chargesCopro) + safe(info.assuranceGLI)) / 12);
  const gestionMensuelle = Math.round(calc.loyerMensuel * fraisGestionPct / 100);

  const cashFlowAvantImpot = loyerEffectifMensuel - fin.mensualite - chargesMensuelles - gestionMensuelle;
  const cashFlowAnnuel = cashFlowAvantImpot * 12;
  const cashOnCash = fin.apportEur > 0 ? (cashFlowAnnuel / fin.apportEur) * 100 : 0;

  return {
    loyerEffectifMensuel, chargesMensuelles, gestionMensuelle,
    cashFlowAvantImpot, cashFlowAnnuel, cashOnCash,
  };
}

export function calcFiscalite(info, calc, fin) {
  const loyerAnnuel = calc.loyerAnnuel;
  if (loyerAnnuel === 0) return null;

  // Micro-BIC LMNP (abattement 50%)
  const microBIC = {
    abattement: 50,
    revenuImposable: Math.round(loyerAnnuel * 0.5),
  };

  // Regime reel LMNP
  const chargesDeductibles = safe(info.taxeFonciere) + safe(info.assurancePNO) +
    safe(info.chargesCopro) + safe(info.assuranceGLI) +
    Math.round(loyerAnnuel * safe(info.fraisGestion, 0, 100) / 100);

  const interetsAnnuels = fin.duree > 0 ? Math.round(fin.interets / fin.duree) : 0;
  const valeurAmortissable = calc.acteEnMain * 0.85; // hors terrain ~15%
  const amortissementImmo = Math.round(valeurAmortissable / 30); // 30 ans
  const amortissementTravaux = calc.totalTTC > 0 ? Math.round(calc.totalTTC / 10) : 0; // 10 ans
  const totalDeductions = chargesDeductibles + interetsAnnuels + amortissementImmo + amortissementTravaux;
  const revenuImposable = Math.max(0, loyerAnnuel - totalDeductions);

  const reel = {
    chargesDeductibles,
    interetsAnnuels,
    amortissementImmo,
    amortissementTravaux,
    totalDeductions,
    revenuImposable,
  };

  const avantageReel = microBIC.revenuImposable - reel.revenuImposable;
  const regime = avantageReel > 0 ? "reel" : "micro";

  return { microBIC, reel, loyerAnnuel, avantageReel, regime };
}

export function calcAmortissement(fin) {
  if (fin.emprunt <= 0 || fin.nbMois <= 0) return [];

  const tauxMensuel = fin.tauxAnnuel / 12;
  let capitalRestant = fin.emprunt;
  const tableau = [];

  for (let annee = 1; annee <= fin.duree; annee++) {
    let interetsAnnee = 0;
    let capitalAnnee = 0;

    for (let m = 0; m < 12; m++) {
      const interet = capitalRestant * tauxMensuel;
      const capital = fin.mensualite - interet;
      interetsAnnee += interet;
      capitalAnnee += capital;
      capitalRestant -= capital;
    }

    tableau.push({
      annee,
      mensualite: fin.mensualite,
      capital: Math.round(capitalAnnee),
      interets: Math.round(interetsAnnee),
      restant: Math.max(0, Math.round(capitalRestant)),
    });
  }

  return tableau;
}
