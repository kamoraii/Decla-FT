function normalizeText(text) {
  return text
    .replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractField(text, label, maxLength = 80) {
  const index = text.toLowerCase().indexOf(label.toLowerCase());

  if (index === -1) return "";

  const after = text.substring(index + label.length);

  return after
    .trim()
    .substring(0, maxLength)
    .split("  ")[0]
    .trim();
}

function extractDate(text, label) {
  const regex = new RegExp(
    label + ".*?(\\d{2})\\s?(\\d{2})\\s?(\\d{4})",
    "i"
  );

  const match = text.match(regex);

  if (!match) return "";

  return `${match[1]}/${match[2]}/${match[3]}`;
}

function extractHours(text) {
  const regex =
    /Nombre d.?heures effectuées.*?(\d+[.,]?\d*)/i;

  const match = text.match(regex);

  if (!match) return "";

  return match[1].replace(",", ".");
}

function extractBrut(text) {
  const regex =
    /SALAIRES BRUTS.*?(\d+[.,]?\d*)/i;

  const match = text.match(regex);

  if (!match) return "";

  return match[1].replace(",", ".");
}

function isAEM(text) {
  const checks = [
    "ATTESTATION (AEM)",
    "Nombre d'heures effectuées",
    "SALAIRES BRUTS",
    "Raison Sociale"
  ];

  return checks.every(c =>
    text.toLowerCase().includes(c.toLowerCase())
  );
}

function parseAEM(rawText) {

  const text = normalizeText(rawText);

  console.log("[PARSER] Analyse structure AEM...");

  if (!isAEM(text)) {
    console.log("[PARSER] Document refusé : pas une AEM");
    return null;
  }

  const employeur =
    extractField(text, "Raison Sociale");

  const dateDebut =
    extractDate(text, "Date d'embauche");

  const dateFin =
    extractDate(text, "Date de fin du contrat de travail");

  const heures =
    extractHours(text);

  const brut =
    extractBrut(text);

  let dateFinale = "";

  if (dateDebut && dateFin) {

    if (dateDebut === dateFin) {
      dateFinale = dateDebut;
    } else {
      dateFinale =
        `${dateDebut} au ${dateFin}`;
    }

  } else {
    dateFinale = dateDebut || dateFin;
  }

  return {
    date: dateFinale,
    employeur: employeur,
    heures: heures,
    brut: brut
  };
}