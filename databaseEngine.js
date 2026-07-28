// =========================================
// MEDI-CORE AI DATABASE ENGINE v2.0
// =========================================

let diseases = [];
let databaseLoaded = false;

// -----------------------------------------
// Load Disease Database
// -----------------------------------------

async function loadDatabase() {

    try {

        console.log("Loading disease database...");

        const response = await fetch("disease.json");

        if (!response.ok) {
            throw new Error("Unable to load disease.json");
        }

        diseases = await response.json();

        databaseLoaded = true;

        console.log("================================");
        console.log("MEDI-CORE Database Loaded");
        console.log("Diseases :", diseases.length);
        console.log("================================");

    }

    catch (error) {

        databaseLoaded = false;

        console.error("DATABASE ERROR");
        console.error(error);

        alert(
            "MEDI-CORE could not load disease.json.\n\nCheck the browser console (F12)."
        );

    }

}

// Load automatically
window.addEventListener("load", loadDatabase);

// -----------------------------------------
// Check Database
// -----------------------------------------

function isDatabaseReady() {

    if (!databaseLoaded || diseases.length === 0) {

        alert(
            "Disease database is still loading.\nPlease wait a few seconds and try again."
        );

        return false;

    }

    return true;

}

// -----------------------------------------
// Analyze Symptoms
// -----------------------------------------

function analyzeSymptoms(selectedSymptoms) {

    if (!isDatabaseReady()) {

        return [];

    }

    let results = [];

    diseases.forEach(disease => {

        if (!disease.symptoms) return;

        let matched = 0;

        disease.symptoms.forEach(symptom => {

            if (selectedSymptoms.includes(symptom)) {

                matched++;

            }

        });

let confidence = 55;

confidence += matched * 10;

if (matched >= disease.symptoms.length * 0.75)
    confidence += 10;

if (matched === disease.symptoms.length)
    confidence = 98;

confidence = Math.min(confidence, 98);
       

        results.push({

            id: disease.id || "",

            name: disease.name || "Unknown",

            confidence: confidence,

            matched: matched,

            total: disease.symptoms.length,

            treatment: disease.treatment || ["Consult a doctor"],

            specialist: disease.specialist || "General Physician",

            emergency: disease.emergencyLevel || "Low",

            followUp: disease.followUp || [],

            description: disease.description || ""

        });

    });

    results.sort((a, b) => {

        if (b.confidence !== a.confidence)
            return b.confidence - a.confidence;

        return b.matched - a.matched;

    });

    return results;

}

// -----------------------------------------
// Follow-up Required?
// -----------------------------------------

function needsFollowUp(result) {

    if (!result) return false;

    return result.confidence < 90;

}

// -----------------------------------------
// Get Follow-up Questions
// -----------------------------------------

function getFollowUpQuestions(result) {

    if (!result) return [];

    if (!result.followUp) return [];

    return result.followUp.slice(0, 2);

}

// -----------------------------------------
// Improve Confidence
// -----------------------------------------

function improveConfidence(result, bonus) {

    if (!result) return result;

    result.confidence += bonus;

    if (result.confidence > 99)
        result.confidence = 99;

    return result;

}

// -----------------------------------------
// Generate Final Result
// -----------------------------------------

function generateResult(result) {

    if (!result) return null;

    return {

        disease: result.name,

        confidence: result.confidence,

        treatment: result.treatment,

        specialist: result.specialist,

        emergency: result.emergency,

        description: result.description

    };

}

// -----------------------------------------
// Debug Helper
// -----------------------------------------

function printDatabaseStats() {

    console.log("========= DATABASE STATS =========");
    console.log("Loaded :", databaseLoaded);
    console.log("Diseases :", diseases.length);
    console.log("==================================");

}
