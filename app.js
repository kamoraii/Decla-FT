// =========================
// APP.JS
// =========================
// CONTROLE GENERAL APP
// =========================

// =========================
// ETAT APPLICATION
// =========================

let aemItems = [];

let pendingDocuments = [];

let nextId = 1;

let nextPendingId = 1;

// =========================
// ELEMENTS DOM
// =========================

const dropzone =
document.getElementById('dropzone');

const fileInput =
document.getElementById('fileInput');

const processBtn =
document.getElementById('processBtn');

const addRowBtn =
document.getElementById('addRowBtn');

const exportJsonBtn =
document.getElementById('exportJsonBtn');

const exportPdfBtn =
document.getElementById('exportPdfBtn');

const clearBtn =
document.getElementById('clearBtn');

const tableBody =
document.getElementById('tableBody');

const totalsBlock =
document.getElementById('totalsBlock');

const logArea =
document.getElementById('logArea');

const pendingZone =
document.getElementById('pendingZone');

const pendingList =
document.getElementById('pendingList');

// =========================
// LOGS
// =========================

function addLog(message){

    const div =
    document.createElement('div');

    div.textContent =
    `[${new Date().toLocaleTimeString()}] ${message}`;

    logArea.appendChild(div);

    logArea.scrollTop =
    logArea.scrollHeight;
}

// =========================
// LOCAL STORAGE
// =========================

function saveData(){

    localStorage.setItem(
        'aemData',
        JSON.stringify(aemItems)
    );
}

function loadData(){

    const raw =
    localStorage.getItem('aemData');

    if(raw){

        try{

            aemItems =
            JSON.parse(raw);

            renderTable();

            addLog(
            `💾 ${aemItems.length} AEM restaurées.`
            );

        }catch(err){

            addLog(
            `Erreur restauration localStorage`
            );
        }
    }
}

// =========================
// AJOUT TABLEAU
// =========================

function addAEMToTable(entry){

    if(!entry.date || !entry.employeur){

        addLog(
        `❌ Date ou employeur manquant`
        );

        return;
    }

    const newItem = {

        id: nextId++,

        date: entry.date,

        employeur: entry.employeur,

        heures: entry.heures || '',

        brut: entry.brut || ''
    };

    // =========================
    // DOUBLON STRICT
    // =========================

    if(isDuplicate(newItem,aemItems)){

        addLog(
        `⚠️ Doublon ignoré`
        );

        return;
    }

    aemItems.push(newItem);

    saveData();

    renderTable();

    addLog(
    `✅ AEM ajoutée`
    );
}

// =========================
// TABLEAU
// =========================

function renderTable(){

    tableBody.innerHTML = '';

    let totalHeures = 0;

    let totalBrut = 0;

    // =========================
    // TRI CHRONO
    // =========================

    const sorted =
    [...aemItems].sort((a,b)=>{

        return parseDate(a.date)
        - parseDate(b.date);
    });

    for(const item of sorted){

        const row =
        tableBody.insertRow();

        // =========================
        // DATE
        // =========================

        const tdDate =
        row.insertCell();

        const dateInput =
        document.createElement('input');

        dateInput.type = 'date';

        if(item.date){

            const parts =
            item.date.split('/');

            if(parts.length === 3){

                dateInput.value =
                `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }

        dateInput.onchange = e => {

            const val = e.target.value;

            if(val){

                const p =
                val.split('-');

                item.date =
                `${p[2]}/${p[1]}/${p[0]}`;

                saveData();

                renderTable();
            }
        };

        tdDate.appendChild(dateInput);

        // =========================
        // EMPLOYEUR
        // =========================

        const tdEmp =
        row.insertCell();

        const empInput =
        document.createElement('input');

        empInput.value =
        item.employeur;

        empInput.setAttribute(
        'list',
        'employeursList'
        );

        empInput.onchange = e => {

            item.employeur =
            e.target.value;

            saveData();
        };

        tdEmp.appendChild(empInput);

        // =========================
        // HEURES
        // =========================

        const tdH =
        row.insertCell();

        const hInput =
        document.createElement('input');

        hInput.value =
        item.heures;

        hInput.onchange = e => {

            item.heures =
            e.target.value;

            saveData();

            renderTable();
        };

        tdH.appendChild(hInput);

        // =========================
        // BRUT
        // =========================

        const tdB =
        row.insertCell();

        const bInput =
        document.createElement('input');

        bInput.value =
        item.brut;

        bInput.onchange = e => {

            item.brut =
            e.target.value;

            saveData();

            renderTable();
        };

        tdB.appendChild(bInput);

        // =========================
        // DELETE
        // =========================

        const tdDel =
        row.insertCell();

        const delBtn =
        document.createElement('button');

        delBtn.textContent = '✖';

        delBtn.className = 'btn';

        delBtn.onclick = ()=>{

            aemItems =
            aemItems.filter(
                i => i.id !== item.id
            );

            saveData();

            renderTable();
        };

        tdDel.appendChild(delBtn);

        // =========================
        // TOTALS
        // =========================

        const h =
        parseFloat(item.heures);

        const b =
        parseFloat(item.brut);

        if(!isNaN(h))
        totalHeures += h;

        if(!isNaN(b))
        totalBrut += b;
    }

    totalsBlock.innerHTML =

    `<div>
    <strong>Total heures :</strong>
    ${totalHeures.toFixed(2)} h
    </div>

    <div>
    <strong>Total brut :</strong>
    ${totalBrut.toFixed(2)} €
    </div>

    <div>
    <strong>AEM :</strong>
    ${sorted.length}
    </div>`;

    buildEmployeursList();
}

// =========================
// DATE TRI
// =========================

function parseDate(dateStr){

    if(!dateStr)
    return 0;

    const parts =
    dateStr.split('/');

    if(parts.length !== 3)
    return 0;

    return new Date(
        parts[2],
        parts[1]-1,
        parts[0]
    ).getTime();
}

// =========================
// LISTE EMPLOYEURS
// =========================

function buildEmployeursList(){

    let list =
    document.getElementById(
    'employeursList'
    );

    if(list)
    list.remove();

    list =
    document.createElement('datalist');

    list.id =
    'employeursList';

    const unique =
    [...new Set(
        aemItems.map(i=>i.employeur)
    )];

    for(const emp of unique){

        const option =
        document.createElement('option');

        option.value = emp;

        list.appendChild(option);
    }

    document.body.appendChild(list);
}

// =========================
// DOCUMENTS EN ATTENTE
// =========================

function addPendingDocument(doc){

    pendingDocuments.push({

        id: nextPendingId++,

        ...doc
    });

    renderPendingDocuments();
}

// =========================
// RENDU ATTENTE
// =========================

function renderPendingDocuments(){

    if(pendingDocuments.length === 0){

        pendingZone.style.display =
        'none';

        return;
    }

    pendingZone.style.display =
    'block';

    pendingList.innerHTML = '';

    for(const doc of pendingDocuments){

        const div =
        document.createElement('div');

        div.className =
        'pending-item';

        // PREVIEW

        const preview =
        document.createElement('div');

        preview.className =
        'pending-preview';

        if(typeof doc.preview === 'string'){

            const img =
            document.createElement('img');

            img.src = doc.preview;

            preview.appendChild(img);

        }else if(
            doc.preview instanceof
            HTMLCanvasElement
        ){

            preview.appendChild(doc.preview);
        }

        div.appendChild(preview);

        // FIELDS

        const fields =
        document.createElement('div');

        fields.className =
        'pending-fields';

        fields.innerHTML = `

        <input
        type="date"
        value="${toInputDate(doc.extracted.date)}"
        id="date_${doc.id}">

        <input
        type="text"
        value="${escapeHtml(doc.extracted.employeur)}"
        placeholder="Employeur"
        list="employeursList"
        id="emp_${doc.id}">

        <input
        type="text"
        value="${escapeHtml(doc.extracted.heures)}"
        placeholder="Heures"
        id="h_${doc.id}">

        <input
        type="text"
        value="${escapeHtml(doc.extracted.brut)}"
        placeholder="Brut"
        id="b_${doc.id}">
        `;

        div.appendChild(fields);

        // ACTIONS

        const actions =
        document.createElement('div');

        const valBtn =
        document.createElement('button');

        valBtn.textContent =
        '✅ Valider';

        valBtn.className =
        'btn btn-green';

        valBtn.onclick = ()=>{

            const dateVal =
            document
            .getElementById(
            `date_${doc.id}`
            ).value;

            let finalDate = '';

            if(dateVal){

                const p =
                dateVal.split('-');

                finalDate =
                `${p[2]}/${p[1]}/${p[0]}`;
            }

            addAEMToTable({

                date: finalDate,

                employeur:
                document
                .getElementById(
                `emp_${doc.id}`
                ).value,

                heures:
                document
                .getElementById(
                `h_${doc.id}`
                ).value,

                brut:
                document
                .getElementById(
                `b_${doc.id}`
                ).value
            });

            pendingDocuments =
            pendingDocuments.filter(
                d => d.id !== doc.id
            );

            renderPendingDocuments();
        };

        actions.appendChild(valBtn);

        div.appendChild(actions);

        pendingList.appendChild(div);
    }
}

// =========================
// INPUT DATE
// =========================

function toInputDate(dateStr){

    if(!dateStr)
    return '';

    const p =
    dateStr.split('/');

    if(p.length !== 3)
    return '';

    return `${p[2]}-${p[1]}-${p[0]}`;
}

// =========================
// HTML SAFE
// =========================

function escapeHtml(str){

    if(!str)
    return '';

    return str
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

// =========================
// PROCESS FILE
// =========================

async function processFile(file){

    addLog(
    `📄 ${file.name}`
    );

    const result =
    await extractTextOCR(file);

    if(!result){

        addLog(
        `❌ OCR impossible`
        );

        return;
    }

    const parsed =
    parseAEM(result.text);

    addPendingDocument({

        file:file,

        preview:result.preview,

        extracted:parsed
    });
}

// =========================
// MULTI FILES
// =========================

async function processFiles(files){

    for(const file of files){

        await processFile(file);
    }

    addLog(
    `✅ Analyse terminée`
    );
}

// =========================
// EVENTS
// =========================

dropzone.addEventListener(
'click',
()=>fileInput.click()
);

processBtn.addEventListener(
'click',
()=>fileInput.click()
);

fileInput.addEventListener(
'change',
async e => {

    const files =
    Array.from(e.target.files);

    await processFiles(files);

    fileInput.value = '';
}
);

dropzone.addEventListener(
'dragover',
e => {

    e.preventDefault();

    dropzone.style.background =
    '#eef2ff';
}
);

dropzone.addEventListener(
'dragleave',
()=>{

    dropzone.style.background =
    '#fafafa';
}
);

dropzone.addEventListener(
'drop',
async e => {

    e.preventDefault();

    dropzone.style.background =
    '#fafafa';

    const files =
    Array.from(
        e.dataTransfer.files
    );

    await processFiles(files);
}
);

addRowBtn.addEventListener(
'click',
()=>{

    addAEMToTable({

        date:'',

        employeur:'',

        heures:'',

        brut:''
    });
}
);

exportJsonBtn.addEventListener(
'click',
()=>{

    const blob =
    new Blob(

        [
            JSON.stringify(
                aemItems,
                null,
                2
            )
        ],

        {
            type:'application/json'
        }
    );

    const url =
    URL.createObjectURL(blob);

    const a =
    document.createElement('a');

    a.href = url;

    a.download =
    'aem_export.json';

    a.click();

    URL.revokeObjectURL(url);

    addLog(
    `💾 Export JSON OK`
    );
}
);

exportPdfBtn.addEventListener(
'click',
()=>window.print()
);

clearBtn.addEventListener(
'click',
()=>{

    if(confirm(
    'Tout effacer ?'
    )){

        aemItems = [];

        pendingDocuments = [];

        saveData();

        renderTable();

        renderPendingDocuments();

        addLog(
        `🗑️ Données effacées`
        );
    }
}
);

// =========================
// START
// =========================

loadData();

renderTable();
