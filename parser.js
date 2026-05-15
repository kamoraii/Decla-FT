// =========================
// PARSER.JS
// =========================
// SPECIAL AEM
// =========================

// =====================================================
// PARSER PRINCIPAL
// =====================================================

function parseAEM(text){

    addLog(
    `[PARSER] Analyse structure AEM...`
    );

    // =====================================================
    // NETTOYAGE OCR
    // =====================================================

    const clean = text

    .replace(/\s+/g,' ')

    .replace(/[’‘`]/g,"'")

    .replace(/\|/g,'I')

    .replace(/effectuees/gi,'effectuées')

    .replace(/\s{2,}/g,' ')

    .trim();

    // =====================================================
    // VALIDATION AEM SOUPLE
    // =====================================================

    const isAEM =

    /un.dic/i.test(clean)

    ||

    /aem/i.test(clean)

    ||

    /heures/i.test(clean)

    ||

    /salaires?\s+brut/i.test(clean);

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

    // =====================================================
    // EMPLOYEUR
    // =====================================================

    let employeur = '';

    const employeurRegex =

    /Raison\s+Sociale[\s\S]{0,80}?([A-Z0-9][A-Z0-9\s\-&']{2,60})/i;

    const employeurMatch =
    clean.match(employeurRegex);

    if(employeurMatch){

        employeur =
        employeurMatch[1]
        .trim();
    }

    // =====================================================
    // DATE DEBUT
    // =====================================================

    let dateDebut = '';

    const debutRegex =

    /Date\s+d.?embauche[\s\S]{0,50}?(\d{1,2})[\s\/](\d{1,2})[\s\/](\d{4})/i;

    const debutMatch =
    clean.match(debutRegex);

    if(debutMatch){

        dateDebut =

        `${debutMatch[1]}/` +
        `${debutMatch[2]}/` +
        `${debutMatch[3]}`;
    }

    // =====================================================
    // DATE FIN
    // =====================================================

    let dateFin = '';

    const finRegex =

    /Date\s+de\s+fin\s+du\s+contrat[\s\S]{0,50}?(\d{1,2})[\s\/](\d{1,2})[\s\/](\d{4})/i;

    const finMatch =
    clean.match(finRegex);

    if(finMatch){

        dateFin =

        `${finMatch[1]}/` +
        `${finMatch[2]}/` +
        `${finMatch[3]}`;
    }

    // =====================================================
    // DATE FINALE
    // =====================================================

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

    // =====================================================
    // HEURES
    // =====================================================

    let heures = '';

    const heuresRegex =

    /Nombre[\s\S]{0,30}?HEURES[\s\S]{0,30}?(\d+[.,]?\d*)/i;

    const heuresMatch =
    clean.match(heuresRegex);

    if(heuresMatch){

        heures =
        heuresMatch[1]
        .replace(',', '.');
    }

    // =====================================================
    // BRUT
    // =====================================================

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

    // =====================================================
    // LOGS
    // =====================================================

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

    // =====================================================
    // RETOUR
    // =====================================================

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

// =====================================================
// DOUBLONS STRICTS
// =====================================================

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