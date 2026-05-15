// =========================
// PARSER.JS
// =========================
// LOGIQUE ADMINISTRATIVE
// STRICTE AEM
// =========================

// IMPORTANT :
// Ce fichier ne fait PAS d’OCR.
// Il reçoit seulement du texte brut.
//
// Il applique uniquement :
// - extraction documentaire
// - logique AEM
// - anti-plausibilité
// - anti-calcul
//
// AUCUNE invention.
// =========================

// =========================
// PARSER PRINCIPAL
// =========================

function parseAEM(text){

    addLog(
    `[PARSER] Analyse documentaire...`
    );

    // =========================
    // NETTOYAGE OCR
    // =========================

    const clean = text

    // espaces
    .replace(/\s+/g,' ')

    // accents OCR
    .replace(/effectuees/gi,'effectuées')
    .replace(/effectives/gi,'effectuées')

    // apostrophes
    .replace(/[’‘`]/g,"'")

    // erreurs OCR fréquentes
    .replace(/\|/g,'I')

    // symbole euro
    .replace(/€/g,'€ ')

    // doubles espaces
    .replace(/\s{2,}/g,' ')

    .trim();

    // =========================
    // DATE
    // =========================

    let date = '';

    const datePatterns = [

        /Date de début du contrat\s*:?\s*(\d{1,2})[\/\s](\d{1,2})[\/\s](\d{4})/i,

        /(\d{1,2})\/(\d{1,2})\/(\d{4})/
    ];

    for(const regex of datePatterns){

        const match =
        clean.match(regex);

        if(match){

            date =
            `${match[1]}/${match[2]}/${match[3]}`;

            break;
        }
    }

    // =========================
    // EMPLOYEUR
    // =========================

    let employeur = '';

    const employeurPatterns = [

        /Raison Sociale\s*:?\s*([A-Z0-9\s\-&']+)/i,

        /Employeur\s*:?\s*([A-Z0-9\s\-&']+)/i
    ];

    for(const regex of employeurPatterns){

        const match =
        clean.match(regex);

        if(match){

            employeur =
            match[1]
            .trim()
            .substring(0,60);

            break;
        }
    }

    // =========================
    // HEURES
    // =========================

    let heures = '';

    const heuresPatterns = [

        /nombre.{0,20}heures.{0,20}(\d+[.,]?\d*)/i,

        /heures.{0,10}effectu.{0,10}(\d+[.,]?\d*)/i,

        /nombre d.?heures effectuees.{0,10}(\d+[.,]?\d*)/i
    ];

    for(const regex of heuresPatterns){

        const match =
        clean.match(regex);

        if(match){

            heures =
            match[1]
            .replace(',', '.');

            break;
        }
    }

    // =========================
    // BRUT
    // =========================

    let brut = '';

    const brutPatterns = [

        /salarie brut.{0,10}(\d+[.,]?\d*)/i,

        /salaire brut.{0,10}(\d+[.,]?\d*)/i,

        /brut.{0,10}(\d+[.,]?\d*)/i
    ];

    for(const regex of brutPatterns){

        const match =
        clean.match(regex);

        if(match){

            brut =
            match[1]
            .replace(',', '.');

            break;
        }
    }

    // =========================
    // LOGS
    // =========================

    addLog(
    `[PARSER] Date : ${date || 'non trouvée'}`
    );

    addLog(
    `[PARSER] Employeur : ${employeur || 'non trouvé'}`
    );

    addLog(
    `[PARSER] Heures : ${heures || 'non trouvées'}`
    );

    addLog(
    `[PARSER] Brut : ${brut || 'non trouvé'}`
    );

    // =========================
    // RETOUR
    // =========================

    return {

        date:
        date || '',

        employeur:
        employeur || '',

        heures:
        heures || '',

        brut:
        brut || '',

        complete:
        (
            date !== '' &&
            employeur !== ''
        )
    };
}

// =========================
// DOUBLON STRICT
// =========================

function isDuplicate(newItem, existingItems){

    return existingItems.some(item =>

        item.date === newItem.date &&

        item.employeur ===
        newItem.employeur &&

        item.heures ===
        newItem.heures &&

        item.brut ===
        newItem.brut
    );
}