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
  const aidesTravaux = Math.min(safe(info.aidesTravaux), totalTTC);
  const travauxNet = totalTTC - aidesTravaux;
  const montantTotal = acteEnMain + travauxNet;
  const coutM2 = info.surface > 0 ? Math.round(montantTotal / safe(info.surface, 1)) : 0;

  const lotMode = (l) => l.mode || (l.meuble ? "lld" : "nu");
  const loyerMensuel = lots.reduce((s, l) => s + safe(l.loyer) * safe(l.qty, 1), 0);
  const loyerMensuelNu = lots.filter(l => lotMode(l) === "nu").reduce((s, l) => s + safe(l.loyer) * safe(l.qty, 1), 0);
  const loyerMensuelLLD = lots.filter(l => lotMode(l) === "lld").reduce((s, l) => s + safe(l.loyer) * safe(l.qty, 1), 0);
  const loyerMensuelLCD = lots.filter(l => lotMode(l) === "lcd").reduce((s, l) => s + safe(l.loyer) * safe(l.qty, 1), 0);
  const loyerAnnuel = loyerMensuel * 12;
  const loyerAnnuelNu = loyerMensuelNu * 12;
  const loyerAnnuelBIC = (loyerMensuelLLD + loyerMensuelLCD) * 12;
  const loyerAnnuelLCD = loyerMensuelLCD * 12;

  const isCopro = (info.ownership || "mono") === "copro";
  const chargesCopro = isCopro ? safe(info.chargesCopro) : 0;
  const fondsTravauxCopro = isCopro ? safe(info.fondsTravauxCopro) : 0;
  const fraisGestionPct = safe(info.fraisGestion, 0, 100);
  const tauxVacance = safe(info.tauxVacance, 0, 100);
  const assuranceGLI = safe(info.assuranceGLI);

  const fraisGestionEur = Math.round(loyerAnnuel * fraisGestionPct / 100);
  const chargesAn = safe(info.taxeFonciere) + safe(info.assurancePNO) + chargesCopro + fondsTravauxCopro + assuranceGLI + fraisGestionEur;
  const loyerEffectif = Math.round(loyerAnnuel * (1 - tauxVacance / 100));

  const rentaBrute = montantTotal > 0 ? (loyerAnnuel / montantTotal) * 100 : 0;
  const rentaNette = montantTotal > 0 ? ((loyerEffectif - chargesAn) / montantTotal) * 100 : 0;
  const plusValue = (safe(info.prixM2Renove) - coutM2) * safe(info.surface);

  return {
    etapes, totalTTC, totalHT, totalMat, totalMo,
    acteEnMain, montantTotal, coutM2,
    loyerMensuel, loyerAnnuel, loyerEffectif,
    loyerAnnuelNu, loyerAnnuelBIC, loyerAnnuelLCD,
    rentaBrute, rentaNette, plusValue,
    fraisNotaireEur, prixNet, chargesAn, fraisGestionEur,
    chargesCopro, fondsTravauxCopro, isCopro,
    aidesTravaux, travauxNet,
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
  const chargesMensuelles = Math.round((safe(info.taxeFonciere) + safe(info.assurancePNO) + calc.chargesCopro + calc.fondsTravauxCopro + safe(info.assuranceGLI)) / 12);
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

  const loyerBIC = calc.loyerAnnuelBIC || 0;
  const loyerNu = calc.loyerAnnuelNu || 0;
  const loyerLCD = calc.loyerAnnuelLCD || 0;
  const hasLCDOnly = loyerLCD > 0 && loyerLCD === loyerBIC;

  // Allocation proportionnelle des charges/intérêts/amortissements par régime
  const shareBIC = loyerAnnuel > 0 ? loyerBIC / loyerAnnuel : 0;
  const shareNu = loyerAnnuel > 0 ? loyerNu / loyerAnnuel : 0;

  const chargesGlobales = safe(info.taxeFonciere) + safe(info.assurancePNO) +
    calc.chargesCopro + calc.fondsTravauxCopro + safe(info.assuranceGLI) +
    Math.round(loyerAnnuel * safe(info.fraisGestion, 0, 100) / 100);
  const interetsAnnuels = fin.duree > 0 ? Math.round(fin.interets / fin.duree) : 0;
  const valeurAmortissable = calc.acteEnMain * 0.85;
  const amortissementImmo = Math.round(valeurAmortissable / 30);
  const amortissementTravaux = calc.totalTTC > 0 ? Math.round(calc.totalTTC / 10) : 0;

  // BIC (meublé LLD + LCD) — LMNP
  let bic = null;
  if (loyerBIC > 0) {
    // LCD non classé : abattement 30% (seuil 15k€) depuis 2025. LLD/LCD classé : 50%.
    const tauxAbattement = hasLCDOnly ? 30 : 50;
    const microBIC = {
      abattement: tauxAbattement,
      revenuImposable: Math.round(loyerBIC * (1 - tauxAbattement / 100)),
      note: hasLCDOnly ? "LCD non classé : 30% (seuil 15 000€)" : "50% (seuil 77 700€)",
    };
    const charges = Math.round(chargesGlobales * shareBIC);
    const interets = Math.round(interetsAnnuels * shareBIC);
    const amortImmo = Math.round(amortissementImmo * shareBIC);
    const amortTrav = Math.round(amortissementTravaux * shareBIC);
    const totalDeductions = charges + interets + amortImmo + amortTrav;
    const revenuImposable = Math.max(0, loyerBIC - totalDeductions);
    const reel = { chargesDeductibles: charges, interetsAnnuels: interets, amortissementImmo: amortImmo, amortissementTravaux: amortTrav, totalDeductions, revenuImposable };
    const avantageReel = microBIC.revenuImposable - reel.revenuImposable;
    bic = { loyerAnnuel: loyerBIC, microBIC, reel, avantageReel, regime: avantageReel > 0 ? "reel" : "micro" };
  }

  // Foncier (nu)
  let foncier = null;
  if (loyerNu > 0) {
    const microFoncier = {
      abattement: 30,
      revenuImposable: Math.round(loyerNu * 0.7),
      note: "30% (seuil 15 000€)",
    };
    const charges = Math.round(chargesGlobales * shareNu);
    const interets = Math.round(interetsAnnuels * shareNu);
    const totalDeductions = charges + interets;
    const revenuImposable = Math.max(0, loyerNu - totalDeductions);
    // Déficit foncier : si charges (hors intérêts) > loyer, imputation sur revenu global jusqu'à 10 700€
    const chargesHorsInterets = charges;
    const deficitBrut = Math.max(0, chargesHorsInterets - loyerNu);
    const deficitImputableRevenuGlobal = Math.min(deficitBrut, 10700);
    const reel = { chargesDeductibles: charges, interetsAnnuels: interets, totalDeductions, revenuImposable, deficitImputableRevenuGlobal };
    const avantageReel = microFoncier.revenuImposable - reel.revenuImposable;
    foncier = { loyerAnnuel: loyerNu, microFoncier, reel, avantageReel, regime: avantageReel > 0 ? "reel" : "micro" };
  }

  // Denormandie (location nue uniquement, plafond 300 000€, travaux ≥ 25% coût total)
  let denormandie = null;
  if (info.denormandieEnabled && loyerNu > 0) {
    const duree = safe(info.denormandieDuree, 6, 12);
    const tauxMap = { 6: 12, 9: 18, 12: 21 };
    const taux = tauxMap[duree] || 18;
    const baseEligible = Math.min(calc.acteEnMain + calc.totalTTC, 300000);
    const reductionTotale = Math.round(baseEligible * taux / 100);
    const reductionAnnuelle = Math.round(reductionTotale / duree);
    const travauxRatio = (calc.acteEnMain + calc.totalTTC) > 0 ? calc.totalTTC / (calc.acteEnMain + calc.totalTTC) : 0;
    const eligible = travauxRatio >= 0.25;
    denormandie = { taux, duree, reductionTotale, reductionAnnuelle, travauxRatio, eligible };
  }

  // Loc'Avantages — réduction sur loyers nets annuels (nu uniquement)
  let locAvantages = null;
  if (info.locAvantagesEnabled && loyerNu > 0) {
    const tauxMap = { loc1: 15, loc2: 35, loc3: 65 };
    const taux = tauxMap[info.locAvantagesNiveau || "loc1"] ?? 15;
    const chargesNu = foncier?.reel.chargesDeductibles || 0;
    const loyerNet = Math.max(0, loyerNu - chargesNu);
    const reductionAnnuelle = Math.round(loyerNet * taux / 100);
    locAvantages = { niveau: info.locAvantagesNiveau || "loc1", taux, loyerNet, reductionAnnuelle };
  }

  // Impôt estimé à la TMI
  const tmi = safe(info.tmi, 0, 100);
  const primary = bic || foncier;
  const primaryImposable = primary?.regime === "reel" ? primary.reel.revenuImposable : (primary?.microBIC?.revenuImposable ?? primary?.microFoncier?.revenuImposable ?? 0);
  const prelevementsSociaux = 17.2;
  const impotIR = Math.round(primaryImposable * tmi / 100);
  const impotPS = Math.round(primaryImposable * prelevementsSociaux / 100);
  const reductionsTotales = (denormandie?.reductionAnnuelle || 0) + (locAvantages?.reductionAnnuelle || 0);
  const impotFinal = Math.max(0, impotIR + impotPS - reductionsTotales);

  return {
    bic, foncier, denormandie, locAvantages,
    loyerAnnuel, tmi,
    impotIR, impotPS, reductionsTotales, impotFinal,
    // legacy
    microBIC: bic?.microBIC || primary?.microBIC || primary?.microFoncier,
    reel: primary?.reel,
    regime: primary?.regime,
    avantageReel: primary?.avantageReel ?? 0,
  };
}

/**
 * Calcule le TRI (Taux de Rendement Interne) via Newton-Raphson,
 * fallback bisection si non convergence.
 * flows[0] = investissement initial (négatif)
 * flows[1..N] = cash-flow annuel + valeur de revente nette en dernière année
 */
export function irr(flows, guess = 0.08) {
  if (flows.length < 2) return null;
  const npv = (r) => flows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + r, t), 0);
  const dnpv = (r) => flows.reduce((acc, cf, t) => acc - (t * cf) / Math.pow(1 + r, t + 1), 0);

  let r = guess;
  for (let i = 0; i < 60; i++) {
    const f = npv(r);
    const df = dnpv(r);
    if (Math.abs(df) < 1e-10) break;
    const rNext = r - f / df;
    if (!Number.isFinite(rNext)) break;
    if (Math.abs(rNext - r) < 1e-7) return rNext;
    r = rNext;
    if (r <= -0.999) { r = -0.9; break; }
  }
  let lo = -0.99, hi = 10;
  let fLo = npv(lo), fHi = npv(hi);
  if (fLo * fHi > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fMid = npv(mid);
    if (Math.abs(fMid) < 1e-6) return mid;
    if (fLo * fMid < 0) { hi = mid; fHi = fMid; } else { lo = mid; fLo = fMid; }
  }
  return (lo + hi) / 2;
}

export function calcTRI(info, calc, fin, cashFlow) {
  const duree = safe(info.dureeDetention, 1, 50) || Math.min(safe(info.dureeCredit, 1, 30) || 20, 20);
  const appreciation = safe(info.appreciationAnnuelle, -10, 20) / 100;
  const apportInitial = fin.apportEur || calc.montantTotal;
  if (apportInitial <= 0) return null;

  const valeurMarcheInit = safe(info.prixM2Renove) * safe(info.surface) || calc.montantTotal;
  const valeurRevente = valeurMarcheInit * Math.pow(1 + appreciation, duree);

  const amort = calcAmortissement(fin);
  let capitalRestant = 0;
  if (amort.length > 0) {
    if (duree >= amort.length) capitalRestant = 0;
    else capitalRestant = amort[duree - 1]?.restant ?? 0;
  }

  const cfAnnuel = cashFlow.cashFlowAnnuel || 0;
  const flows = [-apportInitial];
  for (let t = 1; t <= duree; t++) {
    flows.push(t === duree ? cfAnnuel + (valeurRevente - capitalRestant) : cfAnnuel);
  }
  const tri = irr(flows);
  return {
    duree, appreciation, apportInitial,
    valeurReventeEstimee: Math.round(valeurRevente),
    capitalRestant: Math.round(capitalRestant),
    cashFlowCumule: cfAnnuel * duree,
    valeurTerminaleNette: Math.round(valeurRevente - capitalRestant),
    tri: tri !== null && Number.isFinite(tri) ? tri * 100 : null,
  };
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
