import test from "node:test";
import assert from "node:assert/strict";
import {
  HOSPITALS,
  PAN_INDIA_HOSPITALS,
  INDIAN_STATES,
  COUNTERFACTUAL_METRICS,
  hospitalsForDepartment,
  panIndiaHospitalsForDepartment,
  hospitalsByState,
} from "./hospital-data.js";

test("the demo has three verified hospitals for Cardiology", () => {
  const hospitals = hospitalsForDepartment("Cardiology");
  assert.equal(hospitals.length, 3);
  assert.ok(hospitals.every((hospital) => hospital.departments.includes("Cardiology")));
  assert.ok(hospitals.every((hospital) => hospital.sourceUrl.startsWith("https://")));
  assert.ok(hospitals.every((hospital) => hospital.name && hospital.address));
  assert.ok(hospitals.every((hospital) => hospital.transit && hospital.transit.includes("Metro:")));
});

test("hospitals are sorted by seen time, then travel time, then name", () => {
  const hospitals = hospitalsForDepartment("Cardiology", "central-delhi");
  assert.deepEqual(hospitals.map((hospital) => hospital.id), [
    "aiims-new-delhi",
    "safdarjung-new-delhi",
    "rml-new-delhi",
  ]);
  assert.deepEqual(hospitals.map((hospital) => hospital.availability.seenAt), ["12:15", "12:30", "12:40"]);
});

test("all simulated waits are at least two hours", () => {
  for (const hospital of HOSPITALS) {
    const availability = hospitalsForDepartment("Cardiology").find((entry) => entry.id === hospital.id).availability;
    assert.ok(availability.waitMinutes >= 120);
  }
});

test("seen-time sorting is deterministic across repeated reads and localities", () => {
  for (const locality of ["central-delhi", "south-delhi", "north-delhi"]) {
    const first = hospitalsForDepartment("Neurology", locality);
    const second = hospitalsForDepartment("Neurology", locality);
    assert.deepEqual(first.map((hospital) => [hospital.id, hospital.availability.seenAt]), second.map((hospital) => [hospital.id, hospital.availability.seenAt]));
    assert.ok(first.every((hospital) => hospital.availability.tokenRange === "1–12"));
  }
});

test("pan-India directory covers 50+ premier institutions across 20+ states with verified links", () => {
  assert.ok(PAN_INDIA_HOSPITALS.length >= 50, `Found ${PAN_INDIA_HOSPITALS.length} hospitals, expected at least 50`);
  assert.ok(INDIAN_STATES.length >= 20, `Found ${INDIAN_STATES.length} states, expected at least 20`);
  assert.ok(PAN_INDIA_HOSPITALS.every((h) => h.name && h.city && h.state && h.transit));
  assert.ok(PAN_INDIA_HOSPITALS.every((h) => h.sourceUrl.startsWith("http")));
  assert.ok(PAN_INDIA_HOSPITALS.every((h) => h.departments && h.departments.length > 0));
  
  // Verify state filtering
  const karnatakaHospitals = hospitalsByState("Karnataka");
  assert.ok(karnatakaHospitals.length >= 4);
  assert.ok(karnatakaHospitals.some((h) => h.id === "nimhans-bengaluru"));

  // Verify pan-India department search
  const allCardio = panIndiaHospitalsForDepartment("Cardiology");
  assert.ok(allCardio.length >= 40);
  assert.ok(allCardio.every((h) => h.availability && h.availability.waitMinutes >= 120));

  // Verify counterfactual metrics
  assert.ok(COUNTERFACTUAL_METRICS.avgOrsWaitHours > 4);
  assert.ok(COUNTERFACTUAL_METRICS.wrongQueueReductionPct > 80);
});

