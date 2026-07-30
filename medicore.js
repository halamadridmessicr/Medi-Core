/*====================================
MEDI-CORE AI V4
====================================*/

let selectedSymptoms = [];

let symptomDatabase = [];

let diseaseDatabase = [];

let currentDiagnosis = null;

let diagnosisResults = [];

let pendingQuestions = [];
async function loadDiseaseDatabase(){

    try{

        const response =
        await fetch("disease.json");

        diseaseDatabase =
        await response.json();

        buildSymptomDatabase();

        console.log(
            "Disease Database Loaded:",
            diseaseDatabase.length
        );

    }

    catch(error){

        console.error(
            "Disease Database Error",
            error
        );

        alert(
            "Could not load disease.json"
        );

    }

}
function buildSymptomDatabase(){

    const allSymptoms =
    new Set();

    diseaseDatabase.forEach(disease=>{

        if(
            disease.requiredSymptoms
        ){

            disease.requiredSymptoms
            .forEach(
                symptom=>
                allSymptoms.add(
                    symptom
                )
            );

        }

        if(
            disease.coreSymptoms
        ){

            disease.coreSymptoms
            .forEach(
                symptom=>
                allSymptoms.add(
                    symptom.name
                )
            );

        }

        if(
            disease.secondarySymptoms
        ){

            disease.secondarySymptoms
            .forEach(
                symptom=>
                allSymptoms.add(
                    symptom.name
                )
            );

        }

    });

    symptomDatabase =
    [...allSymptoms]
    .sort();

}
window.onload = async ()=>{

    await loadDiseaseDatabase();

    showHome();

};
function showHome(){

    const workspace =
    document.getElementById(
        "workspace"
    );

    workspace.innerHTML = `

    <div class="moduleCard">

        <h1>

        🩺 MEDI-CORE AI

        </h1>

        <p>

        Symptom Analysis System Ready

        </p>

        <button
        onclick="openSymptoms()"
        >

        Start Diagnosis

        </button>

    </div>

    `;

}
function openSymptoms(){

    selectedSymptoms = [];

    currentDiagnosis = null;

    diagnosisResults = [];

    const workspace =
    document.getElementById(
        "workspace"
    );

    workspace.innerHTML = `

    <div class="moduleCard">

        <h2>
        Symptom Analysis
        </h2>

        <input

        id="symptomSearch"

        type="text"

        placeholder="Search symptom..."

        onkeyup="searchSymptoms()"

        >

        <br><br>

        <div

        id="selectedSymptomsBox"

        >

        No symptoms selected

        </div>

        <br>

        <div

        id="symptomGrid"

        class="symptomGrid"

        >

        </div>

        <br>

        <button

        onclick="analyzeSymptoms()"

        >

        Analyze Symptoms

        </button>

    </div>

    `;

    loadSymptoms();

}

function loadSymptoms(){

    const grid =
    document.getElementById(
        "symptomGrid"
    );

    if(!grid){

        console.error(
            "symptomGrid not found"
        );

        return;

    }

    grid.innerHTML = "";

    symptomDatabase.forEach(symptom=>{

        grid.innerHTML += `

        <div

        class="symptomCard"

        onclick="toggleSymptom(
        this,
        '${symptom.toLowerCase()}'
        )"

        >

        ${symptom}

        </div>

        `;

    });

}

function toggleSymptom(
element,
symptom
){

    symptom =
    symptom.toLowerCase().trim();

    if(
        selectedSymptoms.includes(
            symptom
        )
    ){

        selectedSymptoms =
        selectedSymptoms.filter(
            s=>s!==symptom
        );

        element.classList.remove(
            "active"
        );

    }

    else{

        selectedSymptoms.push(
            symptom
        );

        element.classList.add(
            "active"
        );

    }

    updateSelectedSymptoms();

}

function updateSelectedSymptoms(){

    const box =
    document.getElementById(
        "selectedSymptomsBox"
    );

    if(!box) return;

    if(
        selectedSymptoms.length===0
    ){

        box.innerHTML =
        "No symptoms selected";

        return;

    }

    box.innerHTML =
    selectedSymptoms.join(", ");

}

function searchSymptoms(){

    const query =
    document
    .getElementById(
        "symptomSearch"
    )
    .value
    .toLowerCase();

    document
    .querySelectorAll(
        ".symptomCard"
    )
    .forEach(card=>{

        card.style.display =

        card.innerText
        .toLowerCase()
        .includes(query)

        ? "block"

        : "none";

    });

}
