let selectedSymptoms = [];
let symptomDatabase = [];
let currentDiagnosis = null;
let diagnosisResults = [];
let pendingQuestions = [];
function buildSymptomDatabase(){

    const allSymptoms = new Set();

    diseaseDatabase.forEach(disease=>{

        if(disease.coreSymptoms){

            disease.coreSymptoms.forEach(symptom=>{

                allSymptoms.add(
                    symptom.name.toLowerCase().trim()
                );

            });

        }

        if(disease.secondarySymptoms){

            disease.secondarySymptoms.forEach(symptom=>{

                allSymptoms.add(
                    symptom.name.toLowerCase().trim()
                );

            });

        }

    });

    symptomDatabase =
    [...allSymptoms].sort();

    console.log(
        "Symptoms Loaded:",
        symptomDatabase.length
    );

}
function openSymptoms(){

    selectedSymptoms = [];
    currentDiagnosis = null;
    diagnosisResults = [];
    pendingQuestions = [];

    const workspace =
    document.getElementById("workspace");

    workspace.innerHTML = `

    <div class="moduleCard">

        <h1>🩺 MEDI-CORE AI</h1>

        <h2>Symptom Analysis</h2>

        <input
        id="symptomSearch"
        type="text"
        placeholder="Search symptom..."
        onkeyup="searchSymptoms()">

        <br><br>

        <div id="selectedSymptomsBox">

        No symptoms selected

        </div>

        <br>

        <div
        id="symptomGrid"
        class="symptomGrid">

        </div>

        <br>

        <button
        class="primaryBtn"
        onclick="analyzeSymptoms()">

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

    if(!grid) return;

    grid.innerHTML = "";

    symptomDatabase.forEach(symptom=>{

        grid.innerHTML += `

        <div

        class="symptomCard"

        onclick="toggleSymptom(
        this,
        '${symptom}'
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

function analyzeSymptoms(){

    if(selectedSymptoms.length===0){

        alert(
            "Please select symptoms first."
        );

        return;

    }


    diagnosisResults=[];


    diseaseDatabase.forEach(disease=>{


        let score=0;

        let maxScore=0;

        let matchedSymptoms=[];


        //-----------------------------------
        // CORE SYMPTOMS
        //-----------------------------------

        if(disease.coreSymptoms){

            disease.coreSymptoms.forEach(symptom=>{


                maxScore += symptom.weight;


                const name =
                symptom.name
                .toLowerCase()
                .trim();



                if(
                    selectedSymptoms.includes(name)
                ){

                    score += symptom.weight;


                    matchedSymptoms.push(
                        symptom.name
                    );

                }


            });


        }



        //-----------------------------------
        // SECONDARY SYMPTOMS
        //-----------------------------------

        if(disease.secondarySymptoms){


            disease.secondarySymptoms.forEach(symptom=>{


                maxScore +=
                symptom.weight * 0.5;



                const name =
                symptom.name
                .toLowerCase()
                .trim();



                if(
                    selectedSymptoms.includes(name)
                ){

                    score +=
                    symptom.weight * 0.5;


                    matchedSymptoms.push(
                        symptom.name
                    );

                }


            });


        }




        //-----------------------------------
        // NEGATIVE SYMPTOMS
        //-----------------------------------

        if(disease.negativeSymptoms){


            disease.negativeSymptoms.forEach(symptom=>{


                if(
                    selectedSymptoms.includes(
                        symptom
                        .toLowerCase()
                        .trim()
                    )
                ){

                    score -= 5;

                }


            });


        }



        //-----------------------------------
        // Ignore zero matches
        //-----------------------------------

        if(score<=0)
        return;



        //-----------------------------------
        // Confidence Calculation
        //-----------------------------------

        let confidence = 0;


        if(maxScore>0){

            confidence =
            Math.round(
                (score/maxScore)*100
            );

        }



        diagnosisResults.push({


            disease:disease,


            score:score,


            confidence:
            Math.max(
                1,
                Math.min(
                    99,
                    confidence
                )
            ),


            matchedSymptoms:
            matchedSymptoms,


            followUpBonus:0


        });


    });



    //-----------------------------------
    // Sort highest probability
    //-----------------------------------

    diagnosisResults.sort(

        (a,b)=>

        b.score-a.score

    );



    if(
        diagnosisResults.length===0
    ){

        currentDiagnosis=null;


        alert(
        "MEDI-CORE AI could not find a matching condition."
        );


        return;

    }



    currentDiagnosis =
    diagnosisResults[0];



    //-----------------------------------
    // Follow-up check
    //-----------------------------------

    if(

        currentDiagnosis.confidence < 85

        &&

        currentDiagnosis.disease.followUpQuestions

        &&

        currentDiagnosis.disease.followUpQuestions.length>0

    ){

        pendingQuestions =

        [
            ...currentDiagnosis
            .disease
            .followUpQuestions
        ];


        showFollowUpQuestions();


    }

    else{


        showFinalDiagnosis();


    }


}
function showFollowUpQuestions(){


    if(
        pendingQuestions.length===0
    ){

        showFinalDiagnosis();

        return;

    }



    const question =
    pendingQuestions[0];



    const workspace =
    document.getElementById(
        "workspace"
    );



    workspace.innerHTML = `


    <div class="moduleCard">


    <h1>
    🧠 MEDI-CORE AI
    </h1>


    <h2>
    Additional Question
    </h2>



    <p>

    ${question.question}

    </p>



    <button

    class="primaryBtn"

    onclick="answerFollowUp(true)"

    >

    Yes

    </button>



    <button

    class="secondaryBtn"

    onclick="answerFollowUp(false)"

    >

    No

    </button>


    </div>


    `;


}
function answerFollowUp(answer){


    const question =
    pendingQuestions.shift();



    if(answer){

        currentDiagnosis.score +=
        question.yesScore;


        currentDiagnosis.followUpBonus +=
        question.yesScore;


    }

    else{


        currentDiagnosis.score +=
        question.noScore;


        currentDiagnosis.followUpBonus +=
        question.noScore;


    }



    if(
        pendingQuestions.length>0
    ){

        showFollowUpQuestions();

    }

    else{


        currentDiagnosis.confidence =

        Math.min(

            99,

            currentDiagnosis.confidence +

            Math.round(
                currentDiagnosis.followUpBonus
            )

        );


        showFinalDiagnosis();


    }


}
function showFinalDiagnosis(){

    if(!currentDiagnosis){

        alert(
        "No diagnosis available."
        );

        return;

    }


    const result =
    currentDiagnosis;


    const disease =
    result.disease || {};



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
        Final Diagnosis Report
        </h2>


        <hr>



        <h2>
        🦠 ${disease.name || "Unknown"}
        </h2>



        <br>



        <div class="confidenceBox">

            <h3>
            AI Confidence
            </h3>

            <h1>
            ${result.confidence || 0}%
            </h1>

        </div>



        <div class="confidenceBar">

            <div

            class="confidenceFill"

            style="
            width:${result.confidence || 0}%
            "

            >

            </div>

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
        background:${severityColor};
        color:white;
        padding:6px 14px;
        border-radius:10px;
        font-weight:bold;
        "

        >

        ${disease.severity || "Unknown"}

        </span>


        </p>



        <br>



        <h3>
        ✅ Matched Symptoms
        </h3>



        <ul>

        ${
            result.matchedSymptoms &&

            result.matchedSymptoms.length > 0

            ?

            result.matchedSymptoms

            .map(

                symptom =>
                `<li>${symptom}</li>`

            )

            .join("")


            :

            "<li>No matched symptoms</li>"
        }


        </ul>




        <br>




        <h3>
        👨‍⚕️ Doctor Advice
        </h3>



        <div class="doctorBox">

        ${
            disease.doctorAdvice ||

            "Consult a healthcare professional."
        }

        </div>




        <br>




        <div class="recommendCard">


        <h3>
        ⚠ Medical Disclaimer
        </h3>


        <p>

        MEDI-CORE AI provides educational
        symptom analysis assistance.

        It does not replace professional
        medical diagnosis or consultation.

        </p>


        </div>




        <br>



        <button

        class="primaryBtn"

        onclick="window.print()"

        >

        🖨 Print Report

        </button>




        <button

        class="secondaryBtn"

        onclick="openSymptoms()"

        >

        🔄 New Analysis

        </button>



    </div>


    `;


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

    selectedSymptoms

    .map(symptom=>

        `<span class="selectedChip">

        ${symptom}

        </span>`

    )

    .join(" ");

}
function searchSymptoms(){

    const query =

    document

    .getElementById(
        "symptomSearch"
    )

    .value

    .toLowerCase()

    .trim();

    document

    .querySelectorAll(
        ".symptomCard"
    )

    .forEach(card=>{

        const symptom =

        card.innerText

        .toLowerCase();

        card.style.display =

        symptom.includes(query)

        ? "block"

        : "none";

    });

}

//======================================================
// MEDICINE AI MODULE
//======================================================


function openMedicineSearch(){

currentMode="medicine";

resultSection.classList.add("hidden");


workspace.innerHTML=`

<div class="moduleCard">


<h2>

💊 MEDI-CORE Medicine AI

</h2>


<p>

Search medicine information.

</p>


<input

id="medicineSearch"

placeholder="Enter medicine name..."

>


<br><br>


<button

class="primaryBtn"

onclick="searchMedicine()"

>

Search Medicine

</button>


<div id="medicineResult">

</div>


</div>

`;

}


//===========================================
// SEARCH MEDICINES
//===========================================

function searchMedicine(){

    const input = document
    .getElementById("medicineSearch")
    .value
    .toLowerCase();


    const grid = document
    .getElementById("medicineGrid");


    if(!grid) return;


    let cards="";


    medicineDatabase.forEach(medicine=>{


        if(

            medicine.name.toLowerCase().includes(input)

            ||

            medicine.genericName.toLowerCase().includes(input)

            ||

            medicine.category.toLowerCase().includes(input)

        ){

            cards+=`

            <div

            class="medicineCard"

            onclick="showMedicine('${medicine.id}')"

            >

                <h3>
                💊 ${medicine.name}
                </h3>

                <p>
                ${medicine.category}
                </p>

            </div>

            `;

        }

    });


    if(cards===""){

        cards=`

        <div class="moduleCard">

        <h3>
        No Medicine Found
        </h3>

        </div>

        `;

    }


    grid.innerHTML=cards;

}
//======================================================
// SEARCH MEDICINE
//======================================================


function searchMedicine(){


const input=document

.getElementById("medicineSearch")

.value

.toLowerCase()

.trim();



if(input===""){

alert("Enter a medicine name.");

return;

}



if(typeof medicineDatabase==="undefined"){

showMedicineError(

"Medicine database not loaded."

);

return;

}



let medicine=medicineDatabase.find(m=>

m.name.toLowerCase()===input

);



if(!medicine){


medicine=medicineDatabase.find(m=>

m.name.toLowerCase().includes(input)

);


}



if(!medicine){

showMedicineError(

"No medicine found in MEDI-CORE database."

);

return;

}



showMedicineInfo(medicine);


}

//===========================================
// SHOW MEDICINE DETAILS
//===========================================

function showMedicine(id){

    const medicine = medicineDatabase.find(
        m => m.id === id
    );


    if(!medicine){

        workspace.innerHTML=`

        <div class="moduleCard">

        <h2>
        Medicine Not Found
        </h2>

        </div>

        `;

        return;

    }


    workspace.innerHTML=`

    <div class="moduleCard medicineDetails">


        <h1>
        💊 ${medicine.name}
        </h1>


        <h3>
        Generic Name
        </h3>

        <p>
        ${medicine.genericName}
        </p>



        <h3>
        Category
        </h3>

        <p>
        ${medicine.category}
        </p>



        <h3>
        Used For
        </h3>

        <ul>

        ${
            medicine.usedFor
            .map(item=>`<li>${item}</li>`)
            .join("")
        }

        </ul>



        <h3>
        Dosage
        </h3>

        <p>
        ${medicine.dosage}
        </p>



        <h3>
        Side Effects
        </h3>

        <ul>

        ${
            medicine.sideEffects
            .map(item=>`<li>${item}</li>`)
            .join("")
        }

        </ul>



        <h3>
        Contraindications
        </h3>

        <ul>

        ${
            medicine.contraindications
            .map(item=>`<li>${item}</li>`)
            .join("")
        }

        </ul>



        <h3>
        Prescription Required
        </h3>

        <p>

        ${
            medicine.prescription
            ?
            "Yes"
            :
            "No"
        }

        </p>



        <div class="recommendCard">

        <h3>
        ⚠ Disclaimer
        </h3>

        <p>
        This information is for educational purposes only.
        Consult a qualified healthcare professional before taking any medicine.
        </p>

        </div>


        <br>


        <button

        class="primaryBtn"

        onclick="openMedicineSearch()"

        >

        🔙 Back To Medicines

        </button>


    </div>

    `;

}

//======================================================
// DISPLAY MEDICINE INFORMATION
//======================================================

function showMedicineInfo(medicine){


document.getElementById("medicineResult").innerHTML=`

<div class="medicineCard">


<h2>

💊 ${medicine.name}

</h2>


<h3>

Generic Name

</h3>

<p>

${medicine.genericName || "Not available"}

</p>


<h3>

Drug Category

</h3>

<p>

${medicine.category || "Not available"}

</p>


<h3>

Uses

</h3>

<ul>

${createList(medicine.usedFor)}

</ul>


<h3>

Dosage Information

</h3>

<p>

${medicine.dosage || 
"Use only under medical guidance."}

</p>


<h3>

Possible Side Effects

</h3>

<ul>

${createList(medicine.sideEffects)}

</ul>


<h3>

Contraindications

</h3>

<ul>

${createList(medicine.contraindications)}

</ul>


<h3>

Prescription Status

</h3>

<p>

${
medicine.prescription

?

"Prescription Required"

:

"Over-the-counter"

}

</p>


<div class="warningBox">

⚠ MEDI-CORE AI provides educational information only. Always consult a healthcare professional before using medicines.

</div>


</div>

`;

}



//======================================================
// CREATE LIST HELPER
//======================================================


function createList(items){

if(!items)

return "<li>No information available</li>";


if(Array.isArray(items)){

return items.map(i=>

`<li>${i}</li>`

).join("");

}


return `<li>${items}</li>`;

}



//======================================================
// MEDICINE ERROR
//======================================================


function showMedicineError(message){


document.getElementById("medicineResult").innerHTML=`

<div class="warningBox">

${message}

</div>

`;

}
//======================================================
// MEDICAL REPORT UPLOAD MODULE
//======================================================


function openReportUpload(){

currentMode="report";

resultSection.classList.add("hidden");


workspace.innerHTML=`

<div class="moduleCard">


<h2>

📄 Medical Report AI

</h2>


<p>

Upload a laboratory report PDF.

</p>


<input

type="file"

id="pdfUpload"

accept="application/pdf"

>


<br><br>


<button

class="primaryBtn"

onclick="readPDFReport()"

>

Analyze Report

</button>


<div id="pdfStatus">

</div>


</div>

`;

}
//======================================================
// PDF TEXT EXTRACTION
//======================================================


function readPDFReport(){


const file=

document.getElementById("pdfUpload").files[0];


if(!file){

alert("Please upload a PDF file.");

return;

}


document.getElementById("pdfStatus").innerHTML=

`

<p>

Reading PDF...

</p>

`;



const reader=new FileReader();


reader.onload=function(){


const typedarray=

new Uint8Array(this.result);



pdfjsLib.getDocument(typedarray)

.promise

.then(async function(pdf){


let fullText="";



for(let i=1;i<=pdf.numPages;i++){


let page=

await pdf.getPage(i);


let content=

await page.getTextContent();



content.items.forEach(item=>{


fullText+=item.str+" ";


});


}



console.log("PDF TEXT:");

console.log(fullText);



document.getElementById("pdfStatus").innerHTML=

`

<p>

PDF Read Successfully.

</p>

`;



detectReportType(fullText);



});


};



reader.readAsArrayBuffer(file);


}
//======================================================
// MULTI REPORT DETECTOR
//======================================================
function detectReportType(text){

    console.log("1. detectReportType()");

    text = text.toLowerCase();

    let reports = [];

    // CBC
    if(
        text.includes("hemoglobin") ||
        text.includes("platelet") ||
        text.includes("wbc") ||
        text.includes("rbc")
    ){
        reports.push("CBC");
    }

    // LFT
    if(
        text.includes("bilirubin") ||
        text.includes("sgpt") ||
        text.includes("alt") ||
        text.includes("sgot") ||
        text.includes("ast")
    ){
        reports.push("LFT");
    }

    // KFT
    if(
        text.includes("creatinine") ||
        text.includes("urea") ||
        text.includes("egfr") ||
        text.includes("bun")
    ){
        reports.push("KFT");
    }

    // Diabetes
    if(
        text.includes("hba1c") ||
        text.includes("fasting glucose") ||
        text.includes("blood glucose")
    ){
        reports.push("Diabetes");
    }

    // Lipid
    if(
        text.includes("cholesterol") ||
        text.includes("hdl") ||
        text.includes("ldl") ||
        text.includes("triglyceride")
    ){
        reports.push("Lipid Profile");
    }

    console.log("Detected Reports:", reports);
console.log("PDF starts with:");
console.log(text.substring(0,500));

console.log("Contains Kidney Function Test:", text.toLowerCase().includes("kidney function test"));
console.log("Contains Liver Function Test:", text.toLowerCase().includes("liver function test"));
console.log("Contains Lipid Profile:", text.toLowerCase().includes("lipid profile"));
console.log("Contains Diabetes:", text.toLowerCase().includes("diabetes"));

    if(reports.length === 0){

        workspace.innerHTML = `
        <div class="moduleCard">
            <h2>Unsupported Report</h2>
            <p>MEDI-CORE AI could not identify this report.</p>
        </div>
        `;

        return;
    }

// Select the correct report from the report heading

let selectedReport = reports[0];

if (/kidney\s+function\s+test/i.test(text)) {
    selectedReport = "KFT";
}
else if (/liver\s+function\s+test/i.test(text)) {
    selectedReport = "LFT";
}
else if (/lipid\s+profile/i.test(text)) {
    selectedReport = "Lipid Profile";
}
else if (/diabetes|hba1c/i.test(text)) {
    selectedReport = "Diabetes";
}
else if (/complete\s+blood\s+count|cbc/i.test(text)) {
    selectedReport = "CBC";
}

console.log("Selected Report:", selectedReport);

generateReportAnalysis(selectedReport, text);

}

//======================================================
// MEDICAL REPORT AI ENGINE
//======================================================


function generateReportAnalysis(type,text){
console.log("generateReportAnalysis started");
console.log("2. generateReportAnalysis()", type);

let analysis={

type:type,

parameters:[],


summary:[]

};



switch(type){


case "CBC":

analysis.parameters=extractCBC(text);

break;



case "LFT":

analysis.parameters=extractLFT(text);

break;



case "KFT":

analysis.parameters=extractKFT(text);

break;



case "Diabetes":

analysis.parameters=extractDiabetes(text);

break;



case "Lipid Profile":

analysis.parameters=extractLipid(text);

break;



default:


document.getElementById("workspace").innerHTML=`

<div class="moduleCard">

<h2>

Unsupported Report

</h2>

<p>

MEDI-CORE AI could not analyze this report type.

</p>

</div>

`;

return;


}



calculateHealthScore(analysis);


showReportResult(analysis);


}
//======================================================
// MULTI REPORT ANALYSIS ENGINE
//======================================================


function generateMultiReportAnalysis(text,reports){


let analysis={

type:reports.join(" + "),

parameters:[],

summary:[]

};



reports.forEach(type=>{


let parameters=[];


switch(type){


case "CBC":

parameters=extractCBC(text);

break;



case "LFT":

parameters=extractLFT(text);

break;



case "KFT":

parameters=extractKFT(text);

break;



case "Diabetes":

parameters=extractDiabetes(text);

break;



case "Lipid":

case "Lipid Profile":

parameters=extractLipid(text);

break;


}



analysis.parameters.push(...parameters);


});



showReportResult(analysis);


}
//======================================================
// HEALTH SCORE CALCULATOR
//======================================================


function calculateHealthScore(data){


let score=100;


data.parameters.forEach(p=>{


if(p.status==="HIGH")

score-=8;


if(p.status==="LOW")

score-=8;


if(p.status==="BORDERLINE")

score-=4;


});


if(score<0)

score=0;


data.healthScore=score;


return score;


}

//======================================================
// PREMIUM AI REPORT DISPLAY
//======================================================

function showReportResult(data){

    console.log("showReportResult started");
    console.log("3. showReportResult()");

    let findings = "";
    let abnormalCount = 0;

    data.parameters.forEach(p=>{

        if(p.status!=="NORMAL"){

            abnormalCount++;

            let color="orange";

            if(p.status==="HIGH" || p.status==="LOW"){
                color="red";
            }

            findings += `

            <div class="findingCard ${color}">

                <h3>
                ${p.status==="HIGH" ? "🔴" : "⚠️"} ${p.name}
                </h3>

                <div class="value">
                ${p.value} ${p.unit}
                </div>

                <p>
                <b>Reference Range:</b>
                ${p.reference || "Standard Range"}
                </p>

                <p>
                ${interpretParameter(p)}
                </p>

            </div>

            `;

        }

    });

    let summary="";

    if(abnormalCount===0){

        summary="All analyzed parameters are within the normal reference range. No significant abnormality was detected.";

    }

    else if(abnormalCount===1){

        summary="One parameter is outside the normal range. This should be interpreted along with symptoms and medical history.";

    }

    else{

        summary="Multiple parameters are outside the normal range. Medical consultation is recommended.";

    }

    workspace.innerHTML=`

    <div class="aiReport">

        <div class="reportHeader">

            <h1>🧪 MEDI-CORE AI</h1>

            <h2>${data.type} Analysis</h2>

        </div>

        <div class="summaryCard">

            <h2>🧠 AI Summary</h2>

            <p>${summary}</p>

        </div>

        <h2>🔎 Key Findings</h2>

        <div>

        ${
            findings ||

            `<div class="normalCard">

                ✅ All analyzed parameters are within the normal range.

            </div>`
        }

        </div>

        <div class="recommendCard">

            <h2>👨‍⚕️ Recommendation</h2>

            <p>

            This AI analysis is intended for educational purposes only.

            Please consult a qualified healthcare professional before making any medical decisions.

            </p>

        </div>

        <div class="reportActions">

            <button onclick="window.print()">
                <i class="fa-solid fa-print"></i>
                Print Report
            </button>

            <button onclick="downloadAnalysis()">
                <i class="fa-solid fa-download"></i>
                Download Analysis
            </button>

            <button onclick="openReportUpload()">
                <i class="fa-solid fa-rotate-right"></i>
                Analyze Another Report
            </button>

        </div>

    </div>

    `;

}//======================================================
// PARAMETER EXPLANATION
//======================================================


function interpretParameter(p){


if(
p.name.includes("Hemoglobin") &&
p.status==="LOW"
)

return "Hemoglobin is lower than the expected range. This may indicate reduced oxygen carrying capacity and can be associated with anemia.";



if(
p.name.includes("PCV") &&
p.status==="HIGH"
)

return "Packed Cell Volume is elevated, meaning the blood contains a higher proportion of red blood cells. Dehydration or other conditions may contribute.";



if(
p.name.includes("Platelet") &&
p.status==="LOW"
)

return "Platelet count is reduced. Severe reduction may increase bleeding risk and should be evaluated.";



if(
p.name.includes("WBC") &&
p.status==="HIGH"
)

return "White blood cells are elevated, which may occur during infection, inflammation, or immune response.";



return `${p.name} is outside the normal reference range and should be reviewed with a healthcare professional.`;
if(
p.name.includes("Bilirubin") &&
p.status==="HIGH"
)

return "Bilirubin is elevated. This may indicate increased breakdown of red blood cells or difficulty processing bile by the liver.";



if(
p.name.includes("ALT") &&
p.status==="HIGH"
)

return "ALT is elevated. This enzyme can increase when liver cells are irritated or damaged.";



if(
p.name.includes("AST") &&
p.status==="HIGH"
)

return "AST is elevated. It may indicate liver or muscle-related changes and should be interpreted with other findings.";



if(
p.name.includes("Albumin") &&
p.status==="LOW"
)

return "Albumin is reduced. This protein level can be affected by liver function, nutrition, or other conditions.";



if(
p.name.includes("Total Protein") &&
p.status==="LOW"
)

return "Total protein is lower than expected and may require evaluation with other clinical information.";
// KFT


if(
p.name.includes("Creatinine") &&
p.status==="HIGH"
)

return "Creatinine is elevated. Higher levels may indicate reduced kidney filtration and should be evaluated with other kidney markers.";



if(
p.name.includes("Blood Urea") &&
p.status==="HIGH"
)

return "Blood urea is elevated. This can occur when waste products are not efficiently removed or during dehydration.";



if(
p.name.includes("BUN") &&
p.status==="HIGH"
)

return "Blood Urea Nitrogen is elevated and may indicate changes in kidney function or hydration status.";



if(
p.name.includes("eGFR") &&
p.status==="LOW"
)

return "eGFR is reduced. Lower values can indicate decreased kidney filtration and require medical interpretation.";



if(
p.name.includes("Uric Acid") &&
p.status==="HIGH"
)

return "Uric acid is elevated. This may increase the risk of uric acid crystal formation and requires correlation with symptoms.";
// LIPID PROFILE



if(
p.name.includes("Total Cholesterol") &&
p.status==="HIGH"
)

return "Total cholesterol is elevated. Higher cholesterol levels may increase cardiovascular risk and should be assessed with overall health factors.";



if(
p.name.includes("LDL") &&
p.status==="HIGH"
)

return "LDL cholesterol is elevated. LDL is often called 'bad cholesterol' because higher levels can contribute to plaque formation in blood vessels.";



if(
p.name.includes("HDL") &&
p.status==="LOW"
)

return "HDL cholesterol is low. HDL helps transport cholesterol away from arteries, and lower levels may be associated with increased cardiovascular risk.";



if(
p.name.includes("Triglycerides") &&
p.status==="HIGH"
)

return "Triglyceride levels are elevated. This may be associated with diet, metabolism, diabetes, or other conditions.";



if(
p.name.includes("VLDL") &&
p.status==="HIGH"
)

return "VLDL cholesterol is elevated and may indicate increased levels of triglyceride-rich particles.";

// DIABETES



if(

p.name.includes("Fasting") &&

p.status==="HIGH"

)

return "Fasting blood glucose is elevated. This may indicate impaired glucose regulation and should be correlated with HbA1c and clinical history.";



if(

p.name.includes("Post Meal") &&

p.status==="HIGH"

)

return "Post-meal glucose is elevated. This may indicate difficulty controlling blood sugar after food intake.";



if(

p.name.includes("Random") &&

p.status==="HIGH"

)

return "Random glucose is elevated. Further evaluation may be needed depending on symptoms and other tests.";



if(

p.name.includes("HbA1c") &&

p.status==="HIGH"

)

return "HbA1c is elevated. This reflects higher average blood glucose levels over the previous few months and may indicate diabetes or poor glucose control.";



if(

p.name.includes("Estimated Average") &&

p.status==="HIGH"

)

return "Estimated average glucose is elevated, suggesting higher long-term blood sugar levels.";


}
//======================================================
// AI SUMMARY GENERATOR
//======================================================


function generateAISummary(parameters){


let abnormal=[];

let normal=0;



parameters.forEach(p=>{


if(p.status==="NORMAL")

normal++;


else

abnormal.push(p);


});



let summary="";



if(abnormal.length===0){


summary=

"All analyzed parameters are within the provided reference ranges. No significant abnormality was detected in this report.";


}


else if(abnormal.length===1){


summary=

"The report shows one abnormal parameter. This finding should be interpreted along with symptoms, medical history, and clinical examination.";


}


else{


summary=

"The report shows multiple abnormal parameters. Some values may require medical attention and should be discussed with a qualified healthcare professional.";

}




// Add important findings


if(abnormal.length>0){


summary+=" ";


abnormal.slice(0,3).forEach(p=>{


summary+=

`${p.name} is ${p.status.toLowerCase()} (${p.value} ${p.unit}). `;


});


}



return summary;


}
//======================================================
// CBC REPORT EXTRACTOR
//======================================================


function extractCBC(text){


const parameters=[];



function addParameter(

name,

regex,

min,

max,

unit

){


const match=text.match(regex);



if(!match)

return;



const value=parseFloat(match[1]);



let status="NORMAL";



let range =
extractReferenceRange(
text,
name
);


if(range){

min=range.min;

max=range.max;

}



if(value<min)

status="LOW";


else if(value>max)

status="HIGH";



parameters.push({

name:name,

value:value,

unit:unit,

status:status,

reference:
range ?
`${range.min} - ${range.max}`
:
"Not available"

});


}



//------------------------------
// CBC PARAMETERS
//------------------------------


addParameter(

"Hemoglobin",

/Hemoglobin\s*\(Hb\).*?(\d+\.?\d*)/i,

13,

17,

"g/dL"

);



addParameter(

"RBC Count",

/Total RBC count.*?(\d+\.?\d*)/i,

4.5,

5.5,

"million/cumm"

);



addParameter(

"WBC Count",

/Total WBC count.*?(\d+)/i,

4000,

11000,

"cumm"

);



addParameter(

"Platelet Count",

/Platelet Count.*?(\d+)/i,

150000,

410000,

"cumm"

);



addParameter(

"PCV",

/Packed Cell Volume \(PCV\).*?(\d+\.?\d*)/i,

40,

50,

"%"

);



addParameter(

"MCV",

/MCV.*?(\d+\.?\d*)/i,

83,

101,

"fL"

);



addParameter(

"MCH",

/MCH\s+(\d+\.?\d*)/i,

27,

32,

"pg"

);



addParameter(

"MCHC",

/MCHC\s+(\d+\.?\d*)/i,

32.5,

34.5,

"g/dL"

);



addParameter(

"RDW",

/RDW.*?(\d+\.?\d*)/i,

11.6,

14,

"%"

);



return parameters;


}
//======================================================
// MEDICAL INTERPRETATION ENGINE
//======================================================


function interpretParameter(parameter){


const explanations={



"Hemoglobin_LOW":

"Hemoglobin is below the reference range. This may indicate reduced oxygen carrying capacity and can be associated with anemia.",



"Hemoglobin_HIGH":

"Hemoglobin is elevated. This can occur due to dehydration, smoking, high altitude exposure, or other conditions.",



"PCV_HIGH":

"Packed Cell Volume is elevated, meaning the proportion of red blood cells in blood is higher than expected. Dehydration or increased red cell concentration can contribute.",



"Platelet_LOW":

"Platelet count is reduced. Low platelets may increase bleeding risk and require medical evaluation depending on severity.",



"Platelet_HIGH":

"Platelet count is elevated. This can occur during inflammation, infection, or other medical conditions.",



"WBC_HIGH":

"White blood cells are elevated. This often indicates the immune system is responding to infection, inflammation, or stress.",



"WBC_LOW":

"White blood cells are low. This may affect the body's ability to fight infections.",



"RBC_HIGH":

"Red blood cell count is higher than normal. This may indicate increased red cell production or reduced plasma volume.",



"RBC_LOW":

"Red blood cell count is low and may contribute to anemia symptoms."

};



let key=

parameter.name+

"_"+

parameter.status;



return explanations[key]

||

parameter.name+

" is outside the reference range and should be reviewed with a healthcare professional.";

}
//======================================================
// LFT REPORT EXTRACTOR
//======================================================

function extractLFT(text){


const parameters=[];


function addParameter(name,regex,min,max,unit){


const match=text.match(regex);


if(!match)
return;


const value=parseFloat(match[1]);


let status="NORMAL";


if(value<min)
status="LOW";

else if(value>max)
status="HIGH";



parameters.push({

name:name,

value:value,

unit:unit,

status:status

});


}



// Bilirubin


addParameter(

"Total Bilirubin",

/(?:SERUM BILIRUBIN \(TOTAL\)|TOTAL BILIRUBIN).*?(\d+\.?\d*)/i,

0.2,

1.2,

"mg/dL"

);



addParameter(

"Direct Bilirubin",

/(?:SERUM BILIRUBIN \(DIRECT\)|DIRECT BILIRUBIN).*?(\d+\.?\d*)/i,

0,

0.3,

"mg/dL"

);



// Liver enzymes


addParameter(

"ALT (SGPT)",

/(?:SGPT|ALT).*?(\d+\.?\d*)/i,

13,

40,

"U/L"

);



addParameter(

"AST (SGOT)",

/(?:SGOT|AST).*?(\d+\.?\d*)/i,

0,

37,

"U/L"

);



addParameter(

"Alkaline Phosphatase",

/(?:ALKALINE PHOSPHATASE|ALP).*?(\d+\.?\d*)/i,

44,

147,

"U/L"

);



// Proteins


addParameter(

"Total Protein",

/(?:SERUM PROTEIN|TOTAL PROTEIN).*?(\d+\.?\d*)/i,

6.4,

8.3,

"g/dL"

);



addParameter(

"Albumin",

/(?:SERUM ALBUMIN|ALBUMIN).*?(\d+\.?\d*)/i,

3.5,

5.2,

"g/dL"

);



addParameter(

"Globulin",

/GLOBULIN.*?(\d+\.?\d*)/i,

1.8,

3.6,

"g/dL"

);



addParameter(

"A/G Ratio",

/A\/G RATIO.*?(\d+\.?\d*)/i,

1.1,

2.1,

"ratio"

);



return parameters;

}

//======================================================
// KFT REPORT EXTRACTOR
//======================================================


function extractKFT(text){


const parameters=[];



function addParameter(

name,

regex,

min,

max,

unit

){


const match=text.match(regex);


if(!match)

return;



const value=parseFloat(match[1]);


let status="NORMAL";



let range =
extractReferenceRange(
text,
name
);


if(range){

min=range.min;

max=range.max;

}



if(value<min)

status="LOW";


else if(value>max)

status="HIGH";



parameters.push({

name:name,

value:value,

unit:unit,

status:status,

reference:
range ?
`${range.min} - ${range.max}`
:
"Not available"

});

}



//------------------------------
// KIDNEY PARAMETERS
//------------------------------



addParameter(

"Serum Creatinine",

/(?:Serum Creatinine|Creatinine).*?(\d+\.?\d*)/i,

0.6,

1.3,

"mg/dL"

);



addParameter(

"Blood Urea",

/(?:Blood Urea|Urea).*?(\d+\.?\d*)/i,

15,

45,

"mg/dL"

);



addParameter(

"BUN",

/BUN.*?(\d+\.?\d*)/i,

7,

20,

"mg/dL"

);



addParameter(

"eGFR",

/eGFR.*?(\d+\.?\d*)/i,

60,

150,

"mL/min/1.73m²"

);



addParameter(

"Uric Acid",

/(?:Uric Acid|Serum Uric Acid).*?(\d+\.?\d*)/i,

3.5,

7.2,

"mg/dL"

);



return parameters;


}
//======================================================
// LIPID PROFILE EXTRACTOR
//======================================================


function extractLipid(text){


const parameters=[];



function addParameter(

name,

regex,

min,

max,

unit

){


const match=text.match(regex);


if(!match)

return;



const value=parseFloat(match[1]);


let status="NORMAL";



let range =
extractReferenceRange(
text,
name
);


if(range){

min=range.min;

max=range.max;

}



if(value<min)

status="LOW";


else if(value>max)

status="HIGH";



parameters.push({

name:name,

value:value,

unit:unit,

status:status,

reference:
range ?
`${range.min} - ${range.max}`
:
"Not available"

});



}



//------------------------------
// LIPID PARAMETERS
//------------------------------



addParameter(

"Total Cholesterol",

/(?:Total Cholesterol|Cholesterol Total).*?(\d+\.?\d*)/i,

0,

200,

"mg/dL"

);



addParameter(

"LDL Cholesterol",

/(?:LDL|LDL Cholesterol).*?(\d+\.?\d*)/i,

0,

100,

"mg/dL"

);



addParameter(

"HDL Cholesterol",

/(?:HDL|HDL Cholesterol).*?(\d+\.?\d*)/i,

40,

100,

"mg/dL"

);



addParameter(

"Triglycerides",

/(?:Triglycerides|Triglyceride).*?(\d+\.?\d*)/i,

0,

150,

"mg/dL"

);



addParameter(

"VLDL",

/(?:VLDL|VLDL Cholesterol).*?(\d+\.?\d*)/i,

5,

40,

"mg/dL"

);



return parameters;


}
//======================================================
// DIABETES REPORT EXTRACTOR
//======================================================


function extractDiabetes(text){


const parameters=[];



function addParameter(

name,

regex,

min,

max,

unit

){


const match=text.match(regex);


if(!match)

return;



const value=parseFloat(match[1]);


let status="NORMAL";



let range =
extractReferenceRange(
text,
name
);


if(range){

min=range.min;

max=range.max;

}



if(value<min)

status="LOW";


else if(value>max)

status="HIGH";



parameters.push({

name:name,

value:value,

unit:unit,

status:status,

reference:
range ?
`${range.min} - ${range.max}`
:
"Not available"

});


}



//------------------------------
// DIABETES PARAMETERS
//------------------------------



addParameter(

"Fasting Blood Glucose",

/(?:Fasting Blood Glucose|Fasting Glucose|FBS).*?(\d+\.?\d*)/i,

70,

99,

"mg/dL"

);



addParameter(

"Post Meal Glucose",

/(?:Post Meal|PP Blood Sugar|PPBS|Post Prandial).*?(\d+\.?\d*)/i,

0,

140,

"mg/dL"

);



addParameter(

"Random Blood Glucose",

/(?:Random Blood Glucose|Random Glucose|RBS).*?(\d+\.?\d*)/i,

70,

140,

"mg/dL"

);



addParameter(

"HbA1c",

/HbA1c.*?(\d+\.?\d*)/i,

4,

5.6,

"%"

);



addParameter(

"Estimated Average Glucose",

/(?:Estimated Average Glucose|eAG).*?(\d+\.?\d*)/i,

70,

117,

"mg/dL"

);



return parameters;


}
//======================================================
// SMART REFERENCE RANGE READER
//======================================================


function extractReferenceRange(text,parameterName){


let pattern;



pattern=new RegExp(

parameterName+

".*?(\\d+\\.?\\d*)\\s*-\\s*(\\d+\\.?\\d*)",

"i"

);



let match=text.match(pattern);



if(!match)

return null;



return {


min:parseFloat(match[1]),

max:parseFloat(match[2])


};


}
//======================================================
// MULTI REPORT ANALYSIS ENGINE
//======================================================


function generateMultiReportAnalysis(text,reports){


let allParameters=[];



reports.forEach(report=>{


let parameters=[];



switch(report){


case "CBC":

parameters=extractCBC(text);

break;



case "LFT":

parameters=extractLFT(text);

break;



case "KFT":

parameters=extractKFT(text);

break;



case "Diabetes":

parameters=extractDiabetes(text);

break;



case "Lipid":

parameters=extractLipid(text);

break;



}



allParameters.push(...parameters);


});



showReportResult({

type:
reports.join(" + "),

parameters:
allParameters

});


}
// ==========================================
// MEDICINE DATABASE
// ==========================================


async function loadMedicineDatabase(){

    try{

        console.log("Loading medicine database...");

        const response = await fetch("medicine.json");

        medicineDatabase = await response.json();

        console.log("Medicine Database Loaded");

        console.log(medicineDatabase);

        console.log("Total Medicines:", medicineDatabase.length);

    }

    catch(error){

        console.error("Medicine Database Error");

        console.error(error);

    }

}

loadMedicineDatabase();

function downloadAnalysis(){

const report = document.getElementById("workspace").innerText;

const blob = new Blob([report],{
type:"text/plain"
});

const link = document.createElement("a");

link.href = URL.createObjectURL(blob);

link.download = "MEDI-CORE_AI_Report.txt";

link.click();

URL.revokeObjectURL(link.href);

}

function newAnalysis(){

showHome();

}
