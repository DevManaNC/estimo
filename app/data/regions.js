// Regional price multipliers — Hérault (34) as baseline (1.0)
// Multipliers applied to material + labor costs
// Source: approximate regional cost-of-living and construction market differences

export const DEPARTMENTS = {
  "01": { name: "Ain", region: "Auvergne-Rhône-Alpes", multiplier: 1.05 },
  "02": { name: "Aisne", region: "Hauts-de-France", multiplier: 0.90 },
  "03": { name: "Allier", region: "Auvergne-Rhône-Alpes", multiplier: 0.90 },
  "04": { name: "Alpes-de-Haute-Provence", region: "PACA", multiplier: 1.00 },
  "05": { name: "Hautes-Alpes", region: "PACA", multiplier: 1.00 },
  "06": { name: "Alpes-Maritimes", region: "PACA", multiplier: 1.20 },
  "07": { name: "Ardèche", region: "Auvergne-Rhône-Alpes", multiplier: 0.95 },
  "08": { name: "Ardennes", region: "Grand Est", multiplier: 0.88 },
  "09": { name: "Ariège", region: "Occitanie", multiplier: 0.90 },
  "10": { name: "Aube", region: "Grand Est", multiplier: 0.90 },
  "11": { name: "Aude", region: "Occitanie", multiplier: 0.95 },
  "12": { name: "Aveyron", region: "Occitanie", multiplier: 0.90 },
  "13": { name: "Bouches-du-Rhône", region: "PACA", multiplier: 1.10 },
  "14": { name: "Calvados", region: "Normandie", multiplier: 0.95 },
  "15": { name: "Cantal", region: "Auvergne-Rhône-Alpes", multiplier: 0.88 },
  "16": { name: "Charente", region: "Nouvelle-Aquitaine", multiplier: 0.90 },
  "17": { name: "Charente-Maritime", region: "Nouvelle-Aquitaine", multiplier: 0.95 },
  "18": { name: "Cher", region: "Centre-Val de Loire", multiplier: 0.88 },
  "19": { name: "Corrèze", region: "Nouvelle-Aquitaine", multiplier: 0.90 },
  "21": { name: "Côte-d'Or", region: "Bourgogne-Franche-Comté", multiplier: 0.95 },
  "22": { name: "Côtes-d'Armor", region: "Bretagne", multiplier: 0.92 },
  "23": { name: "Creuse", region: "Nouvelle-Aquitaine", multiplier: 0.85 },
  "24": { name: "Dordogne", region: "Nouvelle-Aquitaine", multiplier: 0.90 },
  "25": { name: "Doubs", region: "Bourgogne-Franche-Comté", multiplier: 0.95 },
  "26": { name: "Drôme", region: "Auvergne-Rhône-Alpes", multiplier: 0.98 },
  "27": { name: "Eure", region: "Normandie", multiplier: 0.95 },
  "28": { name: "Eure-et-Loir", region: "Centre-Val de Loire", multiplier: 0.95 },
  "29": { name: "Finistère", region: "Bretagne", multiplier: 0.92 },
  "2A": { name: "Corse-du-Sud", region: "Corse", multiplier: 1.15 },
  "2B": { name: "Haute-Corse", region: "Corse", multiplier: 1.15 },
  "30": { name: "Gard", region: "Occitanie", multiplier: 0.98 },
  "31": { name: "Haute-Garonne", region: "Occitanie", multiplier: 1.05 },
  "32": { name: "Gers", region: "Occitanie", multiplier: 0.88 },
  "33": { name: "Gironde", region: "Nouvelle-Aquitaine", multiplier: 1.05 },
  "34": { name: "Hérault", region: "Occitanie", multiplier: 1.00 },
  "35": { name: "Ille-et-Vilaine", region: "Bretagne", multiplier: 1.00 },
  "36": { name: "Indre", region: "Centre-Val de Loire", multiplier: 0.85 },
  "37": { name: "Indre-et-Loire", region: "Centre-Val de Loire", multiplier: 0.95 },
  "38": { name: "Isère", region: "Auvergne-Rhône-Alpes", multiplier: 1.05 },
  "39": { name: "Jura", region: "Bourgogne-Franche-Comté", multiplier: 0.92 },
  "40": { name: "Landes", region: "Nouvelle-Aquitaine", multiplier: 0.95 },
  "41": { name: "Loir-et-Cher", region: "Centre-Val de Loire", multiplier: 0.90 },
  "42": { name: "Loire", region: "Auvergne-Rhône-Alpes", multiplier: 0.95 },
  "43": { name: "Haute-Loire", region: "Auvergne-Rhône-Alpes", multiplier: 0.88 },
  "44": { name: "Loire-Atlantique", region: "Pays de la Loire", multiplier: 1.02 },
  "45": { name: "Loiret", region: "Centre-Val de Loire", multiplier: 0.95 },
  "46": { name: "Lot", region: "Occitanie", multiplier: 0.88 },
  "47": { name: "Lot-et-Garonne", region: "Nouvelle-Aquitaine", multiplier: 0.88 },
  "48": { name: "Lozère", region: "Occitanie", multiplier: 0.88 },
  "49": { name: "Maine-et-Loire", region: "Pays de la Loire", multiplier: 0.95 },
  "50": { name: "Manche", region: "Normandie", multiplier: 0.90 },
  "51": { name: "Marne", region: "Grand Est", multiplier: 0.92 },
  "52": { name: "Haute-Marne", region: "Grand Est", multiplier: 0.85 },
  "53": { name: "Mayenne", region: "Pays de la Loire", multiplier: 0.88 },
  "54": { name: "Meurthe-et-Moselle", region: "Grand Est", multiplier: 0.95 },
  "55": { name: "Meuse", region: "Grand Est", multiplier: 0.85 },
  "56": { name: "Morbihan", region: "Bretagne", multiplier: 0.95 },
  "57": { name: "Moselle", region: "Grand Est", multiplier: 0.95 },
  "58": { name: "Nièvre", region: "Bourgogne-Franche-Comté", multiplier: 0.85 },
  "59": { name: "Nord", region: "Hauts-de-France", multiplier: 0.98 },
  "60": { name: "Oise", region: "Hauts-de-France", multiplier: 1.00 },
  "61": { name: "Orne", region: "Normandie", multiplier: 0.88 },
  "62": { name: "Pas-de-Calais", region: "Hauts-de-France", multiplier: 0.90 },
  "63": { name: "Puy-de-Dôme", region: "Auvergne-Rhône-Alpes", multiplier: 0.95 },
  "64": { name: "Pyrénées-Atlantiques", region: "Nouvelle-Aquitaine", multiplier: 1.00 },
  "65": { name: "Hautes-Pyrénées", region: "Occitanie", multiplier: 0.90 },
  "66": { name: "Pyrénées-Orientales", region: "Occitanie", multiplier: 0.95 },
  "67": { name: "Bas-Rhin", region: "Grand Est", multiplier: 1.02 },
  "68": { name: "Haut-Rhin", region: "Grand Est", multiplier: 1.00 },
  "69": { name: "Rhône", region: "Auvergne-Rhône-Alpes", multiplier: 1.15 },
  "70": { name: "Haute-Saône", region: "Bourgogne-Franche-Comté", multiplier: 0.85 },
  "71": { name: "Saône-et-Loire", region: "Bourgogne-Franche-Comté", multiplier: 0.90 },
  "72": { name: "Sarthe", region: "Pays de la Loire", multiplier: 0.90 },
  "73": { name: "Savoie", region: "Auvergne-Rhône-Alpes", multiplier: 1.10 },
  "74": { name: "Haute-Savoie", region: "Auvergne-Rhône-Alpes", multiplier: 1.15 },
  "75": { name: "Paris", region: "Île-de-France", multiplier: 1.35 },
  "76": { name: "Seine-Maritime", region: "Normandie", multiplier: 0.95 },
  "77": { name: "Seine-et-Marne", region: "Île-de-France", multiplier: 1.15 },
  "78": { name: "Yvelines", region: "Île-de-France", multiplier: 1.25 },
  "79": { name: "Deux-Sèvres", region: "Nouvelle-Aquitaine", multiplier: 0.88 },
  "80": { name: "Somme", region: "Hauts-de-France", multiplier: 0.90 },
  "81": { name: "Tarn", region: "Occitanie", multiplier: 0.92 },
  "82": { name: "Tarn-et-Garonne", region: "Occitanie", multiplier: 0.90 },
  "83": { name: "Var", region: "PACA", multiplier: 1.10 },
  "84": { name: "Vaucluse", region: "PACA", multiplier: 1.00 },
  "85": { name: "Vendée", region: "Pays de la Loire", multiplier: 0.95 },
  "86": { name: "Vienne", region: "Nouvelle-Aquitaine", multiplier: 0.90 },
  "87": { name: "Haute-Vienne", region: "Nouvelle-Aquitaine", multiplier: 0.90 },
  "88": { name: "Vosges", region: "Grand Est", multiplier: 0.88 },
  "89": { name: "Yonne", region: "Bourgogne-Franche-Comté", multiplier: 0.88 },
  "90": { name: "Territoire de Belfort", region: "Bourgogne-Franche-Comté", multiplier: 0.92 },
  "91": { name: "Essonne", region: "Île-de-France", multiplier: 1.20 },
  "92": { name: "Hauts-de-Seine", region: "Île-de-France", multiplier: 1.30 },
  "93": { name: "Seine-Saint-Denis", region: "Île-de-France", multiplier: 1.20 },
  "94": { name: "Val-de-Marne", region: "Île-de-France", multiplier: 1.20 },
  "95": { name: "Val-d'Oise", region: "Île-de-France", multiplier: 1.15 },
  "971": { name: "Guadeloupe", region: "DOM", multiplier: 1.25 },
  "972": { name: "Martinique", region: "DOM", multiplier: 1.25 },
  "973": { name: "Guyane", region: "DOM", multiplier: 1.30 },
  "974": { name: "La Réunion", region: "DOM", multiplier: 1.20 },
  "976": { name: "Mayotte", region: "DOM", multiplier: 1.30 },
};

/**
 * Get the multiplier for a department code (from postal code).
 * Extracts department from first 2 digits (or 3 for DOM-TOM).
 */
export function getMultiplier(cp) {
  if (!cp || cp.length < 2) return 1.0;

  // DOM-TOM: 3-digit department codes (971, 972, etc.)
  if (cp.startsWith("97")) {
    const dept3 = cp.slice(0, 3);
    if (DEPARTMENTS[dept3]) return DEPARTMENTS[dept3].multiplier;
  }

  // Corse
  if (cp.startsWith("20")) {
    const code = parseInt(cp, 10);
    // 20000-20190 = Corse-du-Sud (2A), 20200+ = Haute-Corse (2B)
    const dept = code < 20200 ? "2A" : "2B";
    return DEPARTMENTS[dept]?.multiplier ?? 1.0;
  }

  const dept2 = cp.slice(0, 2);
  return DEPARTMENTS[dept2]?.multiplier ?? 1.0;
}

/**
 * Get department info from postal code
 */
export function getDepartment(cp) {
  if (!cp || cp.length < 2) return null;

  if (cp.startsWith("97")) {
    const dept3 = cp.slice(0, 3);
    if (DEPARTMENTS[dept3]) return { code: dept3, ...DEPARTMENTS[dept3] };
  }

  if (cp.startsWith("20")) {
    const code = parseInt(cp, 10);
    const dept = code < 20200 ? "2A" : "2B";
    if (DEPARTMENTS[dept]) return { code: dept, ...DEPARTMENTS[dept] };
  }

  const dept2 = cp.slice(0, 2);
  if (DEPARTMENTS[dept2]) return { code: dept2, ...DEPARTMENTS[dept2] };
  return null;
}
