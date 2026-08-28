// Public facts and generated availability for the result journey.
// Hospital names, locations and department lists are verified public facts.
// Slots, waits, travel, identifiers and fees are deliberately simulated.

export const HOSPITAL_FACT_CHECKED_ON = "27 Aug 2026";

const COMMON_DEPARTMENTS = [
  "General Medicine",
  "Cardiology",
  "Orthopaedics",
  "Paediatrics",
  "Dermatology",
  "ENT",
  "Ophthalmology",
  "Gynaecology",
  "Neurology",
  "Gastroenterology",
  "Psychiatry",
  "Dental",
  "General Surgery",
  "Emergency",
];

export const HOSPITALS = Object.freeze([
  {
    id: "aiims-new-delhi",
    name: "All India Institute of Medical Sciences (AIIMS), New Delhi",
    shortName: "AIIMS New Delhi",
    address: "Ansari Nagar, New Delhi, Delhi 110029",
    city: "New Delhi",
    state: "Delhi",
    locality: "South Delhi",
    departments: COMMON_DEPARTMENTS,
    sourceUrl: "https://www.aiims.edu/index.php/en/departments-and-centers/departments",
    sourceLabel: "AIIMS departments list",
    hasEmergency: true,
  },
  {
    id: "safdarjung-new-delhi",
    name: "VMMC & Safdarjung Hospital, New Delhi",
    shortName: "VMMC & Safdarjung Hospital",
    address: "Ansari Nagar West, New Delhi, Delhi 110029",
    city: "New Delhi",
    state: "Delhi",
    locality: "South Delhi",
    departments: COMMON_DEPARTMENTS,
    sourceUrl: "https://www.vmmc-sjh.mohfw.gov.in/medical-departments",
    sourceLabel: "Safdarjung medical departments",
    hasEmergency: true,
  },
  {
    id: "rml-new-delhi",
    name: "ABVIMS & Dr Ram Manohar Lohia Hospital, New Delhi",
    shortName: "ABVIMS & Dr RML Hospital",
    address: "Baba Kharak Singh Marg, New Delhi, Delhi 110001",
    city: "New Delhi",
    state: "Delhi",
    locality: "Central Delhi",
    departments: COMMON_DEPARTMENTS,
    sourceUrl: "https://rmlh.nic.in/",
    sourceLabel: "RML Hospital public department map",
    hasEmergency: true,
  },
]);

// A citizen chooses a locality. We never read device location. These figures are mock travel
// estimates from the chosen locality, not live routing or traffic data.
export const LOCALITIES = Object.freeze([
  { id: "central-delhi", label: "Central Delhi · New Delhi" },
  { id: "south-delhi", label: "South Delhi · New Delhi" },
  { id: "north-delhi", label: "North Delhi · New Delhi" },
]);

const AVAILABILITY = Object.freeze({
  "aiims-new-delhi": {
    slot: "09:30",
    waitMinutes: 165,
    travel: {
      "central-delhi": { minutes: 35, distanceKm: 9.2 },
      "south-delhi": { minutes: 18, distanceKm: 4.8 },
      "north-delhi": { minutes: 48, distanceKm: 13.4 },
    },
  },
  "safdarjung-new-delhi": {
    slot: "10:00",
    waitMinutes: 150,
    travel: {
      "central-delhi": { minutes: 30, distanceKm: 7.4 },
      "south-delhi": { minutes: 14, distanceKm: 3.7 },
      "north-delhi": { minutes: 44, distanceKm: 12.1 },
    },
  },
  "rml-new-delhi": {
    slot: "10:30",
    waitMinutes: 130,
    travel: {
      "central-delhi": { minutes: 16, distanceKm: 4.1 },
      "south-delhi": { minutes: 32, distanceKm: 8.5 },
      "north-delhi": { minutes: 36, distanceKm: 9.8 },
    },
  },
});

const departmentAdjustments = Object.freeze({
  Cardiology: 0,
  "General Medicine": 10,
  Paediatrics: -5,
  Neurology: 15,
  Gastroenterology: 5,
  Orthopaedics: 0,
  Dermatology: 5,
  Dental: 0,
});

function minutesFromTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours * 60) + minutes;
}

function timeFromMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function hospitalsForDepartment(department, localityId = "central-delhi") {
  const adjustment = departmentAdjustments[department] || 0;
  return HOSPITALS
    .filter((hospital) => hospital.departments.includes(department))
    .map((hospital) => {
      const base = AVAILABILITY[hospital.id];
      const travel = base.travel[localityId] || base.travel["central-delhi"];
      const waitMinutes = base.waitMinutes + adjustment;
      const slotMinutes = minutesFromTime(base.slot);
      const seenAt = timeFromMinutes(slotMinutes + waitMinutes);
      return {
        ...hospital,
        availability: {
          slot: base.slot,
          waitMinutes,
          seenAt,
          tokenRange: "1–12",
          travelMinutes: travel.minutes,
          distanceKm: travel.distanceKm,
          calendarOpens: "Slots for next week open Monday, 07:00.",
        },
      };
    })
    .sort((a, b) => (
      minutesFromTime(a.availability.seenAt) - minutesFromTime(b.availability.seenAt)
      || a.availability.travelMinutes - b.availability.travelMinutes
      || a.name.localeCompare(b.name)
    ));
}

export function formatWait(waitMinutes) {
  const hours = Math.floor(waitMinutes / 60);
  const minutes = waitMinutes % 60;
  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}
