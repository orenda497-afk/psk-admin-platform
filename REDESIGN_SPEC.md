# PSK Safaris Admin Platform - Complete UI Redesign Specification

## 1. SIDEBAR — FULL REBUILD

### Logo Area (Top of Sidebar)
- PSK circular logo 42x42px
- Background: `linear-gradient(135deg, #FF9500, #FFD700 45%, #2D5F3F)`
- Text: "PSK SAFARIS" — 7px weight 800 white centered
- Border: 1.5px solid rgba(255,215,0,0.45)
- Box shadow: 0 0 16px rgba(255,215,0,0.18)
- Glow behind logo: position absolute, inset -8px, border-radius 50%
  - background: `radial-gradient(circle, rgba(255,215,0,0.32), rgba(255,149,0,0.12) 50%, transparent 70%)`
  - animation: pulse 3s ease-in-out infinite (scale 1→1.07, opacity 0.65→1)
- Company name: "PSK Safaris" 13px weight 600 rgba(255,255,255,0.9)
- Sub: "Admin Platform" 9px rgba(255,215,0,0.5)

### Branch Selector (Below Logo)
- Background: rgba(255,255,255,0.05)
- Border: 1px solid rgba(255,255,255,0.09)
- Border radius: 8px, padding: 7px 11px
- Gold dot (5px) + "Eldoret branch" text + ⌄ chevron
- Options: Eldoret HQ | Kisumu Branch | All Branches

### Navigation — 6 Collapsible Categories
Only ONE category open at a time. Clicking opens it and closes others. Arrow rotates 90° when open.

**Active Category Style:**
```css
background: linear-gradient(135deg, rgba(255,215,0,0.11), rgba(255,149,0,0.055));
border: 1px solid rgba(255,215,0,0.18);
color: rgba(255,255,255,0.92);
font-weight: 500;
/* Gold left bar */
::before { left:0; top:18%; bottom:18%; width:2.5px; background: linear-gradient(180deg,#FFD700,#FF9500); }
```

**Subcategory Style:**
```css
border-left: 2px solid rgba(255,255,255,0.06);
padding-left: 12px;
/* Active subcat: */
color: rgba(255,215,0,0.85);
background: rgba(255,215,0,0.055);
border-left-color: rgba(255,215,0,0.42);
```

### Categories & Subcategories

🏠 **Home** (no subcategories)

🔧 **Operations** [badge: 8 amber]
- 🚗 Registry board
- 📅 Bookings [badge: 8 red]
- 📋 Rental agreements
- 📷 Handover checklists
- 📄 Quotations [badge: 3 amber]
- 🔔 Reminders [badge: 9 red]

👥 **Clients & Drivers**
- 🏢 Clients
- 🧑‍✈️ Drivers & Staff
- ⭐ Ratings & Feedback

🚗 **Fleet**
- 🔧 Maintenance
- ⛽ Fuel log
- 📅 Compliance calendar

🚙 **Vehicle Owners**
- 👤 Owner profiles
- 💵 Payouts
- 🔗 Owner portal

💰 **Finance** 🔒 (PIN protected)
- 📊 Dashboard
- 📄 Documents
- 📱 M-Pesa recon
- 💸 Expenses
- 📈 P&L by vehicle
- 🏦 Owner payouts (Owner role only)
- ⏰ Receivables
- 📋 Reports

📊 **Intelligence**
- 📊 Analytics
- 📋 Audit log
- ⚙️ Settings

### User Footer (Bottom of Sidebar)
- Avatar initials circle + Name + Role
- Example: "Ken Otieno / Owner · All branches"
- Border top: 1px solid rgba(255,255,255,0.07)

---

## 2. TOP BAR

- Height: 56px
- Background: rgba(255,255,255,0.025)
- Border bottom: 1px solid rgba(255,255,255,0.075)
- backdrop-filter: blur(16px)

### Left
- Page title (15px weight 600) + subtitle (10px muted)

### Right (left to right)
1. **Branch pill:** gold dot + "Eldoret HQ" text
   - background: rgba(255,255,255,0.05)
   - border: 1px solid rgba(255,255,255,0.09)
   - border-radius: 7px, padding: 5px 10px

2. **Date chip:** "Sat 8 Aug 2026"
   - background: rgba(255,255,255,0.04)
   - border: 1px solid rgba(255,255,255,0.07)
   - border-radius: 6px

3. **Bell icon:** 34x34px glass button with red badge (count of unread)

4. **New booking button:**
   - background: `linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,149,0,0.09))`
   - border: 1px solid rgba(255,215,0,0.3)
   - border-radius: 9px
   - color: rgba(255,215,0,0.92)
   - font-weight: 600
   - box-shadow: 0 2px 12px rgba(255,215,0,0.08)

---

## 3. HOME SCREEN CONTENT

### Welcome Message
- "Good morning, Ken 👋" — 21px weight 700 (changes based on time of day)
- "Here's what's happening across both branches today." — 13px muted

### 6 Category Cards (3×2 Grid, Gap 13px)

**Card Style:**
```css
background: rgba(255,255,255,0.045);
border: 1px solid rgba(255,255,255,0.09);
border-radius: 14px;
padding: 18px 18px 16px;
box-shadow: 0 4px 20px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.07);
transition: all 0.2s;
/* hover: */
transform: translateY(-2px);
box-shadow: 0 8px 28px rgba(0,0,0,0.24);
border-color: rgba(255,255,255,0.14);
```

**Card Structure (Top to Bottom):**
- Row 1: [Large emoji 26px] [Arrow button →]
- Row 2: Category title — 13px weight 600 rgba(255,255,255,0.88)
- Row 3: Description — 11px rgba(255,255,255,0.3) line-height 1.5
- Row 4: Footer tags (separated by border-top)

**Card Content:**

🔧 **Operations**
- "Registry board, bookings, rental agreements, handover checklists and reminders."
- Tags: [2 overdue RED] [8 bookings AMBER] [9 reminders AMBER]

👥 **Clients & Drivers**
- "Manage your clients, drivers, staff performance and ratings across both branches."
- Tags: [24 clients] [8 drivers]

🚗 **Fleet**
- "Vehicle maintenance, fuel consumption tracking and compliance calendar."
- Tags: [20 vehicles GREEN] [2 in service AMBER]

🚙 **Vehicle Owners**
- "Owner profiles, monthly payouts and the owner self-service portal."
- Tags: [6 owners] [2 payouts pending AMBER]

💰 **Finance** ← gold border rgba(255,215,0,0.15), arrow shows 🔒
- "P&L, invoices, M-Pesa reconciliation, expenses, owner payouts and reports."
- Tags: [PIN protected GOLD] [3 overdue invoices RED] [🔒 Tap to unlock right-aligned]

📊 **Intelligence**
- "Analytics, audit logs, system settings and access control."
- Tags: [Analytics] [Audit log] [Settings]

**Tag Styles:**
```css
/* Default */
background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.38);
/* Red */
background: rgba(231,76,60,0.1); border-color: rgba(231,76,60,0.18); color: rgba(239,154,154,0.75);
/* Amber */
background: rgba(255,149,0,0.1); border-color: rgba(255,149,0,0.16); color: rgba(255,183,77,0.8);
/* Gold */
background: rgba(255,215,0,0.08); border-color: rgba(255,215,0,0.16); color: rgba(255,215,0,0.65);
/* Green */
background: rgba(45,95,63,0.2); border-color: rgba(76,175,114,0.2); color: rgba(129,199,132,0.75);
```

### Quick Stats Strip (Below Cards, 5 Items)

```css
background: rgba(255,255,255,0.04);
border: 1px solid rgba(255,255,255,0.08);
border-radius: 11px;
padding: 12px 14px;
display: flex; align-items: center; gap: 11px;
```

- 🚗 12 Available now — color rgba(129,199,132,0.9)
- 📅 6 Out on hire — color rgba(100,181,246,0.9)
- ⚠️ 2 Overdue returns — color rgba(239,154,154,0.9)
- 📱 5 Unmatched M-Pesa — color rgba(255,183,77,0.9)
- 💰 KES 425k Revenue (Aug) — color rgba(255,215,0,0.9)

---

## 4. FINANCE PIN LOCK

When Finance category or Finance card is clicked and not yet unlocked:

**Full Screen Overlay:**
```css
position: fixed; inset: 0; z-index: 100;
background: rgba(5,15,24,0.92);
backdrop-filter: blur(18px);
display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px;
```

**Contents (Top to Bottom):**
1. PSK logo with gold glow animation (same as sidebar)
2. "Finance is protected" — 17px weight 700
3. "Enter your 4-digit PIN to continue" — 11px muted
4. 4 dot indicators (fill gold as digits entered, turn red on wrong PIN)
5. Error message area (red text, min-height 14px)
6. Number pad: 3×3 grid + 0 centered + ⌫ delete
7. "Cancel" link below

**Number Pad Button Style:**
```css
padding: 15px;
background: rgba(255,255,255,0.055);
border: 1px solid rgba(255,255,255,0.09);
border-radius: 11px;
font-size: 18px; font-weight: 600;
color: rgba(255,255,255,0.82);
```

**PIN Behavior:**
- Auto-submits when 4 digits entered
- Wrong PIN: dots turn red + shake animation + clear after 900ms
- Correct PIN: overlay closes, Finance opens
- 3 wrong attempts: lockout screen with 10 min countdown
- Finance stays unlocked for the session once correct PIN entered
- Owner Payouts subcategory hidden from non-owner roles

---

## 5. CATEGORY OVERVIEW PAGES

When a main category is clicked, the content area shows that category's overview with:
- Large emoji centered top
- Category title (20px weight 700)
- One line description
- Grid of quick-access buttons (one per subcategory)

---

## 6. APP BACKGROUND

```css
body {
  background:
    radial-gradient(ellipse 65% 55% at 80% 8%, rgba(42,122,140,0.4) 0%, transparent 55%),
    radial-gradient(ellipse 50% 55% at 12% 88%, rgba(45,95,63,0.32) 0%, transparent 55%),
    radial-gradient(ellipse 40% 40% at 48% 48%, rgba(255,149,0,0.05) 0%, transparent 55%),
    linear-gradient(148deg, #091c28 0%, #0c2133 40%, #091d22 75%, #0a1f2e 100%);
}
```

---

## 7. ROUTES

- Home → /
- Operations/Registry → /registry
- Operations/Bookings → /bookings
- Operations/Agreements → /agreements
- Operations/Handover → /handover
- Operations/Quotations → /quotations
- Operations/Reminders → /reminders
- Clients/Clients → /clients
- Clients/Drivers → /drivers
- Clients/Ratings → /ratings
- Fleet/Maintenance → /maintenance
- Fleet/Fuel → /fuel
- Fleet/Compliance → /compliance
- Owners/Profiles → /owners
- Owners/Payouts → /owner-payouts
- Owners/Portal → /owner-portal
- Finance/Dashboard → /finance
- Finance/Documents → /finance/documents
- Finance/Mpesa → /finance/mpesa
- Finance/Expenses → /finance/expenses
- Finance/PL → /finance/pl
- Finance/OwnerPayouts → /finance/payouts
- Finance/Receivables → /finance/receivables
- Finance/Reports → /finance/reports
- Intelligence/Analytics → /analytics
- Intelligence/Audit → /audit
- Intelligence/Settings → /settings
