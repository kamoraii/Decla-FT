// =========================
// APP.JS
// =========================

let aemData = [];

let pendingData = [];

// =========================
// ELEMENTS
// =========================

const fileInput =
document.getElementById("fileInput");

const scanBtn =
document.getElementById("scanBtn");

const addManualBtn =
document.getElementById("addManualBtn");

const exportJsonBtn =
document.getElementById("exportJsonBtn");

const printBtn =
document.getElementById("printBtn");

const clearBtn =
document.getElementById("clearBtn");

const tableBody =
document.getElementById("tableBody");

const pendingContainer =
document.getElementById("pendingContainer");

const logArea =
document.getElementById("logArea");

// =========================
// LOG
// =========================

function addLog(message){

  const div =
  document.createElement("div");

  div.textContent =
  `[${new Date().toLocaleTimeString()}] ${message}`;

  logArea.appendChild(div);

  logArea.scrollTop =
  logArea.scrollHeight;
}

// =========================
// SAVE
// =========================

function saveData(){

  localStorage.setItem(
    "aemData",
    JSON.stringify(aemData)
  );
}

function loadData(){

  const raw =
  localStorage.getItem("aemData");

  if(raw){

    aemData =
    JSON.parse(raw);

    renderTable();
  }
}

// =========================
// TABLE
// =========================

function renderTable(){

  tableBody.innerHTML = "";

  let totalHeures = 0;

  let totalBrut = 0;

  aemData.sort((a,b)=>{

    return a.date.localeCompare(b.date);

  });

  for(const item of aemData){

    const tr =
    document.createElement("tr");

    tr.innerHTML = `

      <td>
        <input value="${item.date || ""}">
      </td>

      <td>
        <input value="${item.employeur || ""}">
      </td>

      <td>
        <input value="${item.heures || ""}">
      </td>

      <td>
        <input value="${item.brut || ""}">
      </td>

      <td>
        <button class="delete-btn">
          ✖
        </button>
      </td>
    `;

    tr.querySelector("button")
    .onclick = ()=>{

      aemData =
      aemData.filter(a=>a!==item);

      saveData();

      renderTable();
    };

    tableBody.appendChild(tr);

    totalHeures +=
    parseFloat(item.heures || 0);

    totalBrut +=
    parseFloat(item.brut || 0);
  }

  document.getElementById(
  "totalHeures"
  ).textContent =

  `Total heures : ${totalHeures}`;

  document.getElementById(
  "totalBrut"
  ).textContent =

  `Total brut : ${totalBrut.toFixed(2)} €`;

  document.getElementById(
  "totalAem"
  ).textContent =

  `AEM : ${aemData.length}`;
}

// =========================
// PENDING
// =========================

function renderPending(){

  if(pendingData.length === 0){

    pendingContainer.innerHTML =

    `<p style="color:#666;">
      Aucun document en attente.
    </p>`;

    return;
  }

  pendingContainer.innerHTML = "";

  for(const item of pendingData){

    const div =
    document.createElement("div");

    div.className =
    "pending-card";

    div.innerHTML = `

      <h3>Document OCR</h3>

      <div class="pending-grid">

        <input
        id="d_${item.id}"
        placeholder="Date"
        value="${item.data.date || ""}">

        <input
        id="e_${item.id}"
        placeholder="Employeur"
        value="${item.data.employeur || ""}">

        <input
        id="h_${item.id}"
        placeholder="Heures"
        value="${item.data.heures || ""}">

        <input
        id="b_${item.id}"
        placeholder="Brut"
        value="${item.data.brut || ""}">

      </div>

      <div class="buttons"
           style="margin-top:12px;">

        <button
        class="success"
        id="v_${item.id}">

        ✅ Valider

        </button>

        <button
        class="danger"
        id="r_${item.id}">

        ❌ Refuser

        </button>

      </div>
    `;

    pendingContainer.appendChild(div);

    // =========================
    // VALIDATION
    // =========================

    document.getElementById(
    `v_${item.id}`
    ).onclick = ()=>{

      const finalData = {

        date:
        document.getElementById(
        `d_${item.id}`
        ).value,

        employeur:
        document.getElementById(
        `e_${item.id}`
        ).value,

        heures:
        document.getElementById(
        `h_${item.id}`
        ).value,

        brut:
        document.getElementById(
        `b_${item.id}`
        ).value
      };

      aemData.push(finalData);

      pendingData =
      pendingData.filter(
      p=>p.id!==item.id
      );

      saveData();

      renderPending();

      renderTable();

      addLog(
      "✅ AEM validée"
      );
    };

    // =========================
    // REFUS
    // =========================

    document.getElementById(
    `r_${item.id}`
    ).onclick = ()=>{

      pendingData =
      pendingData.filter(
      p=>p.id!==item.id
      );

      renderPending();

      addLog(
      "❌ Document refusé"
      );
    };
  }
}

// =========================
// PROCESS FILE
// =========================

async function processFile(file){

  addLog(`📄 ${file.name}`);

  const result =
  await extractTextOCR(file);

  if(!result){

    addLog("❌ OCR impossible");

    return;
  }

  const parsed =
  parseAEM(result.text);

  if(!parsed){

    addLog(
    "❌ Pas une AEM"
    );

    return;
  }

  pendingData.push({

    id:Date.now()+Math.random(),

    data:parsed
  });

  renderPending();

  addLog(
  "📌 Document ajouté à vérifier"
  );
}

// =========================
// SCAN
// =========================

scanBtn.onclick = async ()=>{

  const files =
  Array.from(fileInput.files);

  if(files.length===0){

    addLog(
    "❌ Aucun fichier"
    );

    return;
  }

  for(const file of files){

    await processFile(file);
  }

  addLog(
  "✅ Analyse terminée"
  );
};

// =========================
// AJOUT MANUEL
// =========================

addManualBtn.onclick = ()=>{

  pendingData.push({

    id:Date.now(),

    data:{
      date:"",
      employeur:"",
      heures:"",
      brut:""
    }
  });

  renderPending();
};

// =========================
// EXPORT JSON
// =========================

exportJsonBtn.onclick = ()=>{

  const blob =
  new Blob(

    [
      JSON.stringify(
      aemData,
      null,
      2
      )
    ],

    {
      type:"application/json"
    }
  );

  const a =
  document.createElement("a");

  a.href =
  URL.createObjectURL(blob);

  a.download =
  "aem_export.json";

  a.click();

  addLog(
  "💾 Export JSON"
  );
};

// =========================
// PDF
// =========================

printBtn.onclick = ()=>{

  window.print();
};

// =========================
// CLEAR
// =========================

clearBtn.onclick = ()=>{

  if(confirm(
  "Tout effacer ?"
  )){

    aemData = [];

    pendingData = [];

    saveData();

    renderPending();

    renderTable();

    addLog(
    "🗑️ Données effacées"
    );
  }
};

// =========================
// START
// =========================

loadData();

renderPending();

renderTable();

addLog(
"Application prête."
);