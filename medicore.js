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
function analyzeSymptoms(){

    console.log("ANALYZE STARTED");

    if(selectedSymptoms.length===0){

        alert(
        "Please select at least one symptom."
        );

        return;

    }

    diagnosisResults = [];

    diseaseDatabase.forEach(disease=>{

        let score = 0;

        let matchedSymptoms = [];

        //------------------------------------------------
        // Core Symptoms
        //------------------------------------------------

        if(disease.coreSymptoms){

            disease.coreSymptoms.forEach(symptom=>{

                if(

                    selectedSymptoms.includes(

                        symptom.name.toLowerCase()

                    )

                ){

                    score += symptom.weight;

                    matchedSymptoms.push(
                        symptom.name
                    );

                }

            });

        }

        //------------------------------------------------
        // Secondary Symptoms
        //------------------------------------------------

        if(disease.secondarySymptoms){

            disease.secondarySymptoms.forEach(symptom=>{

                if(

                    selectedSymptoms.includes(

                        symptom.name.toLowerCase()

                    )

                ){

                    score +=
                    symptom.weight * 0.5;

                    matchedSymptoms.push(
                        symptom.name
                    );

                }

            });

        }

        if(score>0){

            diagnosisResults.push({

                disease:disease,

                score:score,

                matchedSymptoms:
                matchedSymptoms

            });

        }

    });

    diagnosisResults.sort(

        (a,b)=>

        b.score-a.score

    );

    if(
        diagnosisResults.length===0
    ){

        alert(
        "No disease match found."
        );

        return;

    }

    currentDiagnosis =
    diagnosisResults[0];

function showFinalDiagnosis(){

    if(!currentDiagnosis){

        alert("No diagnosis available.");

        return;

    }

    const result = currentDiagnosis;

    const disease = result.disease || {};

    const matchedSymptoms =
    result.matchedSymptoms || [];

    const workspace =
    document.getElementById(
        "workspace"
    );

    let severityColor =
    "#2ecc71";

    if(
        disease.severity === "Moderate"
    ){
        severityColor =
        "#f39c12";
    }

    if(
        disease.severity === "High"
    ){
        severityColor =
        "#e74c3c";
    }

    workspace.innerHTML = `

    <div class="moduleCard diagnosisCard">

        <h1>

        🩺 MEDI-CORE AI

        </h1>

        <h2>

        Final Diagnosis

        </h2>

        <hr>

        <h2>

        ${disease.name || "Unknown Disease"}

        </h2>

        <br>

        <div class="confidenceBox">

            <h3>

            Confidence

            </h3>

            <h1>

            ${result.confidence || Math.round(result.score || 0)}%

            </h1>

        </div>

        <br>

        <p>

        <b>Category:</b>
        ${disease.category || "Unknown"}

        </p>

        <p>

        <b>Severity:</b>

        <span
        style="
        color:white;
        background:${severityColor};
        padding:6px 12px;
        border-radius:10px;
        font-weight:bold;
        "
        >

        ${disease.severity || "Unknown"}

        </span>

        </p>

        <br>

        <h3>

        📋 Description

        </h3>

        <p>

        ${disease.description || "No description available."}

        </p>

        <br>

        <h3>

        ✅ Matched Symptoms

        </h3>

        <ul>

        ${
            matchedSymptoms.length > 0

            ?

            matchedSymptoms
            .map(
                symptom =>
                `<li>${symptom}</li>`
            )
            .join("")

            :

            "<li>No matched symptoms recorded.</li>"
        }

        </ul>

        <br>

        <h3>

        👨‍⚕️ Doctor Advice

        </h3>

        <div class="doctorBox">

        ${disease.doctorAdvice ||
        "Consult a healthcare professional."}

        </div>

        <br>

        <h3>

        ⚠ Medical Disclaimer

        </h3>

        <p>

        This diagnosis is generated by MEDI-CORE AI using symptom matching.

        It is intended for educational assistance only and must not replace professional medical consultation.

        Always consult a qualified healthcare professional before taking medication or making medical decisions.

        </p>

        <br>

        <button

        class="primaryBtn"

        onclick="openSymptoms()"

        >

        🔄 New Analysis

        </button>

    </div>

    `;

}
