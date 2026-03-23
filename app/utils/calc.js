import { ETAPES } from "../data/pricing";

export function calcProject(p) {
  const { info, lots, quantities, customMat = {}, customMo = {}, customItems = {} } = p;
  const gM = (item) => customMat[item.id] !== undefined && customMat[item.id] !== "" ? Number(customMat[item.id]) : item.mat;
  const gO = (item) => customMo[item.id] !== undefined && customMo[item.id] !== "" ? Number(customMo[item.id]) : item.mo;
  const gQ = (item) => quantities[item.id] || 0;

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

  const prixNet = (info.prixVente || 0) - (info.negociation || 0);
  const fraisNotaireEur = Math.round(prixNet * (info.fraisNotaire || 0) / 100);
  const acteEnMain = prixNet + fraisNotaireEur + (info.fraisAgence || 0);
  const montantTotal = acteEnMain + totalTTC;
  const coutM2 = info.surface > 0 ? Math.round(montantTotal / info.surface) : 0;

  const loyerMensuel = lots.reduce((s, l) => s + (l.loyer || 0) * (l.qty || 1), 0);
  const loyerAnnuel = loyerMensuel * 12;

  const chargesCopro = info.chargesCopro || 0;
  const fraisGestionPct = info.fraisGestion || 0;
  const tauxVacance = info.tauxVacance || 0;
  const assuranceGLI = info.assuranceGLI || 0;

  const fraisGestionEur = Math.round(loyerAnnuel * fraisGestionPct / 100);
  const chargesAn = (info.taxeFonciere || 0) + (info.assurancePNO || 0) + chargesCopro + assuranceGLI + fraisGestionEur;
  const loyerEffectif = Math.round(loyerAnnuel * (1 - tauxVacance / 100));

  const rentaBrute = montantTotal > 0 ? (loyerAnnuel / montantTotal) * 100 : 0;
  const rentaNette = montantTotal > 0 ? ((loyerEffectif - chargesAn) / montantTotal) * 100 : 0;
  const plusValue = ((info.prixM2Renove || 0) - coutM2) * (info.surface || 0);

  return {
    etapes, totalTTC, totalHT, totalMat, totalMo,
    acteEnMain, montantTotal, coutM2,
    loyerMensuel, loyerAnnuel, loyerEffectif,
    rentaBrute, rentaNette, plusValue,
    fraisNotaireEur, prixNet, chargesAn, fraisGestionEur,
  };
}

export function calcFinancement(info, montantTotal) {
  const apportPct = info.apport || 0;
  const apportEur = Math.round(montantTotal * apportPct / 100);
  const emprunt = montantTotal - apportEur;
  const tauxAnnuel = (info.tauxCredit || 0) / 100;
  const tauxMensuel = tauxAnnuel / 12;
  const duree = info.dureeCredit || 20;
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
  const tauxVacance = info.tauxVacance || 0;
  const fraisGestionPct = info.fraisGestion || 0;

  const loyerEffectifMensuel = Math.round(calc.loyerMensuel * (1 - tauxVacance / 100));
  const chargesMensuelles = Math.round(((info.taxeFonciere || 0) + (info.assurancePNO || 0) + (info.chargesCopro || 0) + (info.assuranceGLI || 0)) / 12);
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
  const chargesDeductibles = (info.taxeFonciere || 0) + (info.assurancePNO || 0) +
    (info.chargesCopro || 0) + (info.assuranceGLI || 0) +
    Math.round(loyerAnnuel * (info.fraisGestion || 0) / 100);

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
