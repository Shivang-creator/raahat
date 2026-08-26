# RESEARCH — what ORS actually does to a citizen

Sources, read 26 Aug 2026:
- **S1** ORS Patient Portal — `https://ors.gov.in/` (NIC, links government hospitals incl. the AIIMS network)
- **S2** ORS FAQ — `https://ors.gov.in/faq.html`
- **S3** RTI Wiki citizen guide, *Book a Govt Hospital Appointment (ORS) 2026*, reviewed 2026-06-20 by
  Dr. Shrawan Kumar Pathak — `https://righttoinformation.wiki/digital/ors-hospital-appointment`
- **S4** ABDM / ABHA — `https://abdm.gov.in/abha`

No live government system was touched, no account created, no personal data read. These are published
citizen guides and the portal's own FAQ.

## The journey ORS asks you to complete

`ors.gov.in` → **Book Appointment** → pick **state** → pick **hospital** → pick **department** →
verify (Aadhaar *or* mobile *or* ABHA, + captcha, + OTP) → pick a free slot → download the OPD slip. [S3]

## Failure 1 — the first question is one the patient cannot answer

The portal narrows **state → hospital → department**, and department comes *before* anything else
useful. [S3] A person with chest pain does not know whether that is Cardiology, General Medicine or
Emergency. A parent with a feverish child does not know Paediatrics from Paediatric Surgery. The
portal assumes clinical triage knowledge as its *entry condition*.

> This is veTriage's founding insight, which took 1st place at OpenAI Build Week:
> *"We cannot expect them to do what a veterinarian can do."*
> Here the receptionist is the patient, and there is nobody at all.

## Failure 2 — the online booking does not save you the wait

> *"Online booking secures your registration, but the doctor still sees patients in order. Your slip
> and token decide your turn at the window."* [S3]

So the thing the portal is sold on — *"No more 5am queue outside the OPD window"* [S3] — is not what it
delivers. You get a registration, not a time. Nobody tells you this before you plan your travel.

## Failure 3 — the slots you need are the ones that vanish

> *"Popular departments such as neurology, cardiology and orthopaedics fill first, often within
> minutes of the day opening… each hospital sets its own limit."* [S3]

The booking window differs per hospital and is not shown anywhere central. To succeed you must
already know which morning, and which minute, your hospital's calendar opens.

## Failure 4 — you can hold a valid booking and still be turned away

The citizen guide carries this as a standing FAQ:
> *"I booked but the hospital turned me away. What now?"* → keep the slip, raise a grievance at
> `pgportal.gov.in`, or **file an RTI asking why a valid online appointment was not honoured.** [S3]

A public service whose documented remedy is a Right to Information request has a design problem.

## Failure 5 — the small stalls, all mid-flow

> *"Three things go wrong most: the OTP never arrives, no slots show, or the slip will not
> download."* [S3]
Plus: new patient vs follow-up (UHID) is a fork you must get right, and the OTP can time out while
you hunt for the number. [S3]

## What ORS already does well — do not claim to invent these
Lab reports and blood availability sit behind the same login. [S1][S3] Cancellation by Appointment ID,
UHID or mobile exists and frees the slot. [S3] ABHA gives faster registration and is free. [S4]
**There is an official mobile app (Nextgen ORS).** Booking itself is genuinely a few minutes *if* you
already know your department, your hospital and your ID route.

## What does not exist anywhere
Nothing maps **what is wrong with you** to **which department, at which reachable hospital, with a
slot that is actually open**. Nothing tells you the honest wait behind a slot time. Nothing tells you
what to carry. That is the gap.

---

# Part 2 — deep research, 27 Aug

## What ORS says it is, in its own words

From `ors.gov.in` (verbatim):
> *"Online Registration System (ORS) is a Digital India initiative aims to provide online access to
> hospital services for patient, integrated with Ayushman Bharat Health Account."*

> *"ORS is a framework to link various hospitals across the country for online appointment system for
> getting consultation where **counter based OPD registration and appointment system through Hospital
> Management Information System (HMIS) has been digitalized**."*

**Why it was made:** to move the 5am physical queue at the OPD registration counter online. NIC built
it, hosted on NIC cloud, copyright 2015. It is a *digitised counter*, not a redesigned journey — and
that is precisely the limitation. It automated the desk, not the decision.

NIC's own promotional line adds the claim that matters most:
> *"Simplifying OPD appointment, **reducing waiting time**, and providing easy access to healthcare
> services anytime"* (NIC India, official post)

## The official flow, from the official FAQ

> *"Follow the simple steps below and get your appointment fixed online!*
> *1. Verify yourself using Aadhaar Number*
> ***2. Choose Hospital / Department***
> *3. Select date of appointment*
> *4. Get confirmation sms"*

**Choosing the department is step 2 of 4, in the government's own documentation.** Before a date,
before anything. The portal's homepage repeats it: *"All you have to do is verify yourself using
ABHA, **Select Hospital and Department**, Select date of Appointment."*

## The gap between the claim and the reality

| ORS claims | What actually happens |
|---|---|
| *"reducing waiting time"* | *"Online booking secures your registration, but the doctor still sees patients in order. Your slip and token decide your turn at the window."* [S3] |
| *"Simple Appointment Process"* | Step 2 asks a sick person to perform clinical triage on themselves |
| *"easy access… anytime"* | Popular departments fill *"within minutes of the day opening"*, and each hospital sets its own window [S3] |

## What citizens actually say

**The official app, `in.nic.nextgenors`, is rated 1.7 on Google Play** across a listing with
1M+ ratings — against its own description promising *"a user-friendly digital platform… real-time
appointment status."*

Recurring complaints in those reviews: OTP never arrives · slots unavailable · crashes during booking
· **confusion about which department to visit** · turned away at the hospital despite an appointment ·
cannot reschedule · freezes on appointment status · login errors · teleconsultation broken.

Citizen posts, quoted from public threads:
> *"after completing the registration, all the slots up to next three months are showing not
> available. busy or there's some error in the website."* — r/delhi

> *"There seems to be glitch while booking with my UHID where while booking for new appointment, It
> directs me back to OTP page."* — r/NIMHANS

> *"the ORS portal is a complete 'NA' (Not Available)"* — r/delhi, on AIIMS Delhi Dermatology

## Bugs and barriers we verified ourselves, 27 Aug

Loaded `ors.gov.in/orsportal/login` on a 390px phone (screenshot: `assets/ors-today/02-login-phone.png`):

1. **A distorted image captcha stands between a sick person and the login screen.** Six characters,
   low contrast, on a phone. There is an audio captcha alternative, which is the accessibility
   fallback, not a fix.
2. **The login tab strip overflows** — "Using ABHA (Health ID)" is visible, "Using M…" is cut off
   behind an arrow. The three login routes are partly hidden on the device most people use.
3. **The first field asks for "ABHA / ABHA Address"** with no explanation of either, above a link
   reading *"Dont have ABHA (Health ID Card)? Create Here"* (typo in the original).
4. **The site's own footer says: *"Best viewed in modern browsers (Chrome, Edge, Firefox, Safari) at
   1920×1080 resolution."*** A national health portal, in a phone-first country, telling you it is
   best viewed on a desktop monitor. This line is on the login page.
5. Footer copyright on the FAQ page reads **2015**.

