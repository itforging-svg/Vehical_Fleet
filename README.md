# 🚗 Chandan Steel — Vehicle Fleet Management System

A **premium, real-time logistics management portal** built for **Chandan Steel Ltd**. This system digitizes vehicle requests, tracks internal plant movements, enforces audit accountability, and gives administrators a powerful dashboard for complete fleet oversight — all running live with zero-downtime backend updates via Convex.

---

## 🚀 Live Deployment
| | URL |
|---|---|
| 🌐 **Production Frontend** | Cloudflare Pages |
| ⚙️ **Backend (Convex)** | Convex Cloud |

---

## 📐 Architecture Overview

```
┌─────────────────────────────────┐       ┌─────────────────────────────┐
│   Cloudflare Pages (Frontend)   │ ─────▶│  Convex (Backend + Realtime │
│   React 19 + Vite + TypeScript  │       │  DB + Serverless Functions)  │
└─────────────────────────────────┘       └─────────────────────────────┘
         │                                            │
         ▼                                            ▼
  React Router SPA                        Tables: vehicles, drivers,
  Lucide Icons, jsPDF                     trips, requests, fuelRecords,
  Tailwind + Vanilla CSS                  maintenance, auditLogs, admins
```

---

## ✨ Feature Overview

### 🏢 Public Portals
These portals are accessible without login, for employees and contractors submitting requests:

| Feature | Description |
|---|---|
| **Vehicle Request Form** | Employees submit trip requests with pickup/drop location, trip type, vehicle preference, priority, and booking time. A unique request ID is generated for tracking. |
| **Internal Movement Form** | Logs intra-plant vehicle transfers (e.g., from Forging to Seamless). Captures vehicle, driver, destination, purpose, and odometer readings. |

---

### 🛡️ Admin Portal Features

Accessible at `/login` with role-based access:

#### 📊 Dashboard
- Real-time KPI cards: Total Fleet, Active Trips, Pending Requests, Fuel Cost, Maintenance Alerts
- Quick overview of pending vehicle requests awaiting approval
- Live status indicators for vehicles and drivers

#### � Fleet Management (`/vehicles`)
- Add, edit, and decommission vehicles
- Track vehicle status: Available, In Use, Under Maintenance
- View by plant with location-based filtering

#### 👤 Drivers (`/drivers`)
- Full driver profile management with photo, license, and contact details
- Performance history and last trip records
- Active/inactive status control

#### 🗺️ Operational Logs (`/trips`)
- Full log of all trips with start/end odometer, driver, vehicle, and route
- Edit trip details, update status, and close out journeys
- Filter by vehicle, driver, date, and plant

#### 🔄 Internal Movements (`/internal-logs`)
- Track all intra-plant vehicle movements
- Edit, approve, and close movement logs
- View by source and destination plant

#### ⛽ Fuel Management (`/fuel`)
- Log fuel fill-ups with quantity, cost, vendor, and receipt
- Link to specific vehicle and driver
- Track cumulative cost and efficiency trends

#### 🔧 Maintenance (`/maintenance`)
- Schedule and log maintenance work orders
- Track service type, cost, technician, and completion status
- Superadmin-restricted module

#### 📈 Driver Performance (`/driver-performance`)
- Charts and tables showing miles driven, trip count, and efficiency per driver
- Plant-filtered views for plant admins

#### 📋 Reports & Exports (`/reports`)
- Export full operational data to CSV for vehicles, trips, fuel, drivers, and maintenance
- Date-range filtering for precise reporting

#### 🔔 Notifications (`/notifications`)
- System-generated alerts for expiring documents, maintenance due dates, and new requests
- Syncs expiry dates automatically

#### 🔍 Audit Logs (`/audit-logs`)
- Every create/update/delete action recorded with timestamp, actor, and change type
- **Plant admins** see only their plant's logs; **SuperAdmins** see all
- Filterable by action type and date range

---

## 🔐 Security & Access Control

| Role | Access |
|---|---|
| **SuperAdmin** (`cslsuperadmin`, `masteradmin`) | Full access to all plants, all modules, including notifications and maintenance |
| **Plant Admin** (e.g., `admin_forging`) | Restricted to data for their specific plant (vehicles, trips, fuel, drivers, etc.) |

- Passwords are hashed with **bcryptjs** (10 rounds)
- **Session Timeout**: Auto-logout after 10 minutes of inactivity, with a 60-second warning countdown
- All mutations require a `performedBy` field for complete audit trails

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **UI Framework** | React 19 |
| **Build Tool** | Vite 7 |
| **Language** | TypeScript 5.9 |
| **Routing** | React Router v7 |
| **Backend / DB** | Convex (real-time, serverless) |
| **Auth** | Custom bcryptjs-based admin auth |
| **Icons** | Lucide React |
| **Styling** | Tailwind CSS + Vanilla CSS |
| **PDF/CSV Export** | jsPDF, jspdf-autotable, xlsx |
| **Frontend Hosting** | Cloudflare Pages |

---

## 📦 Local Development

### Prerequisites
- **Node.js** v18+
- **npm**
- A Convex account ([convex.dev](https://convex.dev))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/itforging-svg/Vehical_Fleet.git
cd Vehical_FleetB

# 2. Install dependencies
npm install

# 3. Start the Convex dev server (in a separate terminal)
npx convex dev

# 4. Run the frontend dev server
npm run dev
```

### Environment Variables
Create a `.env.local` file in the project root:
```env
# Set automatically by `npx convex dev`
CONVEX_DEPLOYMENT=dev:your-deployment-name
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

For production builds, create `.env.production`:
```env
VITE_CONVEX_URL=https://your-production-deployment.convex.cloud
```

---

## 🚢 Deployment

### Frontend — Cloudflare Pages
```bash
npm run build
npx wrangler pages deploy dist --project-name vehical-fleet
```

### Backend — Convex Production
```bash
npx convex deploy --prod
```

### Seed Admin Accounts
After initial production deployment, seed the database:
```bash
npx convex run --prod seedAdmins:seed
```

---

## 🔑 Admin Accounts

| Role | Admin ID | Plant |
|---|---|---|
| Master Admin | `masteradmin` | SuperAdmin |
| Super Admin | `cslsuperadmin` | SuperAdmin |
| Seamless Admin | `admin_seamless` | Seamless |
| Forging Admin | `admin_forging` | Forging |
| Main Plant Admin | `admin_main` | Main Plant (SMS) |
| Bright Bar Admin | `admin_bright` | Bright Bar |
| Flat Bar Admin | `admin_flat` | Flat Bar |
| Wire Plant Admin | `admin_wire` | Wire Plant |
| Main Plant 2 Admin | `admin_main2` | Main Plant 2 (SMS 2) |
| 40" Mill Admin | `admin_40inch` | 40" Inch Mill |

---

## 📁 Project Structure

```
Vehical_Fleet/
├── convex/                 # Backend (Convex serverless functions)
│   ├── schema.ts           # Database schema
│   ├── auth.ts             # Login & admin management
│   ├── vehicles.ts         # Vehicle CRUD mutations/queries
│   ├── drivers.ts          # Driver CRUD mutations/queries
│   ├── trips.ts            # Trip mutations/queries
│   ├── requests.ts         # Vehicle request mutations/queries
│   ├── fuelRecords.ts      # Fuel management mutations/queries
│   ├── maintenance.ts      # Maintenance mutations/queries
│   ├── audit.ts            # Audit log queries
│   ├── notifications.ts    # Notification mutations/queries
│   └── seedAdmins.ts       # Admin account seeder
└── src/
    ├── components/
    │   └── Layout.tsx       # Main sidebar + header layout
    ├── pages/
    │   ├── Dashboard.tsx
    │   ├── Vehicles.tsx
    │   ├── Drivers.tsx
    │   ├── Trips.tsx
    │   ├── InternalMovementLogs.tsx
    │   ├── FuelManagement.tsx
    │   ├── Maintenance.tsx
    │   ├── Reports.tsx
    │   ├── AuditLogs.tsx
    │   ├── DriverPerformance.tsx
    │   └── Notifications.tsx
    └── App.tsx              # Router + auth guard
```

---

© 2026 **Chandan Steel Ltd.** All rights reserved.
