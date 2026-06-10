# KOG Logistics — Build Tracker

Keystone Operations Group is a logistics leg of the broader Keystone body.
This tracker documents what has been completed and what remains to be built.

---

## ✅ Completed

### Marketing Site — `shawnproc.github.io/KOG_Logistics`
- [x] Full cinematic single-page site built (HTML/CSS/JS)
- [x] KOG brand color scheme applied — teal/navy palette from logo
- [x] Repositioned as **hotshot trucking dispatch** service
- [x] Hero section — Ram 3500 + flatbed gooseneck, golden hour
- [x] Scroll-driven 3-scene crossfade (load coordination / driver network / 24/7 coverage)
- [x] Capabilities section — Load Matching, 24/7 Dispatch, Route & Compliance, Driver Coordination
- [x] Dispatch Desk section — copy and imagery
- [x] Stats section — 15+ years, 100% completion rate, 500+ carriers, 24/7
- [x] Contact / load request form
- [x] Custom hotshot truck imagery committed to repo (`images/`)
- [x] Typography and layout sizing fixed

---

## 🔲 To Build

### Compliance Tracker — Carrier Portal Feature
A built-in tool for dispatchers and owner-operators to stay ahead of regulatory requirements.

#### CDL Renewals
- [ ] Driver profile (name, CDL number, class A/B/C, state)
- [ ] CDL expiry date tracking
- [ ] Medical examiner certificate expiry tracking
- [ ] Automated email alerts at 90 / 60 / 30 days out
- [ ] Driver self-service portal to update their own records

#### DOT Inspections
- [ ] Log roadside inspections (Level I–VI)
- [ ] Record violations and out-of-service flags
- [ ] Per-vehicle inspection history
- [ ] Next inspection due date tracking
- [ ] Inspection score trend over time

#### HOS Logging (Hours of Service)
- [ ] Manual daily log entry per driver
- [ ] 11-hour driving window enforcement
- [ ] 14-hour on-duty window enforcement
- [ ] 34-hour restart tracking
- [ ] Weekly hours summary
- [ ] HOS violation flagging

#### Platform / Infrastructure (when ready to build)
- [ ] Auth — dispatcher login + driver login (separate roles)
- [ ] Database — driver profiles, vehicles, logs
- [ ] Email notification system (Resend or Sendgrid)
- [ ] Dashboard — shows what's expired or due in next 30 days
- [ ] Mobile-friendly UI for drivers logging on the road

---

## 🗂 Scope Notes

- **ELD integration** (pulling HOS automatically from truck hardware) is **v2** — not in initial build
- **IFTA filings** (fuel tax by state) are **not in scope** for this phase
- Compliance tracker lives as a **separate app** or **carrier portal**, not on the marketing site
- Marketing site will link to the portal once built
