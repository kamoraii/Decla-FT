// =========================
// PARSER.JS
// =========================
// PARSER SPECIAL AEM
// STRUCTURE DOCUMENTAIRE
// =========================

// OBJECTIF :
// Ne PAS lire tout le document.
//
// Chercher UNIQUEMENT
// les zones administratives utiles.
//
// =========================

// =========================
// PARSER PRINCIPAL
// =========================

function parseAEM(text){

    addLog(
    `[PARSER] Analyse structure AEM...`
    );

    // =========================
    // NETTOYAGE OCR
    // =========================

    const clean = text

    // espaces
    .replace(/\s+/g,' ')

    // apostrophes
    .replace(/[’‘`]/g,"'")

    // erreurs OCR fréquentes
    .replace(/\|/g,'I')

    // accents OCR
    .replace(/effectuees/gi,'effectuées')

    // doubles espaces
    .replace(/\s{2,}/g,' ')

    .trim();

    // =========================
    // VALIDATION AEM
    // =========================

    const isAEM =

        /unedic/i.test(clean)

        &&

        /attestation/i.test(clean)

        &&

        /heures/i.test(clean)

        &&

        /salaires?\s+bruts?/i.test(clean);

    if(!isAEM){

        addLog(
        `[PARSER] Document ignoré : pas une AEM`
        );

        return {

            complete:false,

            ignored:true
        };
    }

    addLog(
    `[PARSER] Structure AEM reconnue`
    );

    // =========================
    // EMPLOYEUR
    // =========================

    let employeur = '';

    const employeurRegex =

    /Raison\s+Sociale[\s\S]{0,80}?(?:ou\s+nom)?\s*([A-Z0-9][A-Z0-9\s\-&']{2,60})/i;

    const empMatch =
    clean.match(employeurRegex);

    if(empMatch){

        employeur =
        empMatch[1]
        .trim();
    }

    // =========================
    // DATE DEBUT
    // =========================

    let dateDebut = '';

    const debutRegex =

    /Date\s+d[’']embauche[\s\S]{0,40}?(\d{1,2})[\s\/](\d{1,2})[\s\/](\d{4})/i;

    const debutMatch =
    clean.match(debutRegex);

    if(debutMatch){

        dateDebut =

        `${debutMatch[1]}/` +
        `${debutMatch[2]}/` +
        `${debutMatch[3]}`;
    }

    // =========================
    // DATE FIN
    // =========================

    let dateFin = '';

    const finRegex =

    /Date\s+de\s+fin\s+du\s+contrat[\s\S]{0,40}?(\d{1,2})[\s\/](\d{1,2})[\s\/](\d{4})/i;

    const finMatch =
    clean.match(finRegex);

    if(finMatch){

        dateFin =

        `${finMatch[1]}/` +
        `${finMatch[2]}/` +
        `${finMatch[3]}`;
    }

    // =========================
    // DATE FINALE
    // =========================

    let finalDate = '';

    if(dateDebut && dateFin){

        if(dateDebut === dateFin){

            finalDate =
            dateDebut;

        }else{

            finalDate =
            `${dateDebut} au ${dateFin}`;
        }

    }else{

        finalDate =
        dateDebut || dateFin || '';
    }

    // =========================
    // HEURES
    // =========================

    let heures = '';

    const heuresRegex =

    /Nombre\s+d.?HEURES[\s\S]{0,40}?(\d+[.,]?\d*)/i;

    const heuresMatch =
    clean.match(heuresRegex);

    if(heuresMatch){

        heures =
        heuresMatch[1]
        .replace(',', '.');
    }

    // =========================
    // BRUT
    // =========================

    let brut = '';

    const brutRegex =

    /SALAIRES?\s+BRUTS?[\s\S]{0,40}?(\d+[.,]?\d*)/i;

    const brutMatch =
    clean.match(brutRegex);

    if(brutMatch){

        brut =
        brutMatch[1]
        .replace(',', '.');
    }

    // =========================
    // LOGS
    // =========================

    addLog(
    `[PARSER] Employeur : ${employeur || 'non trouvé'}`
    );

    addLog(
    `[PARSER] Date : ${finalDate || 'non trouvée'}`
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

        employeur:
        employeur || '',

        date:
        finalDate || '',

        heures:
        heures || '',

        brut:
        brut || '',

        complete:
        (
            employeur !== ''
            &&
            finalDate !== ''
        )
    };
}

// =========================
// DOUBLON STRICT
// =========================

function isDuplicate(newItem, existingItems){

    return existingItems.some(item =>

        item.date === newItem.date

        &&

        item.employeur ===
        newItem.employeur

        &&

        item.heures ===
        newItem.heures

        &&

        item.brut ===
        newItem.brut
    );
}