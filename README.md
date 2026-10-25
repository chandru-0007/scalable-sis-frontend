# Scalable Student Information System (SIS) - Frontend Web Application

Modern, responsive web application for the **Scalable Student Information System (SIS)** built with **React**, **Vite**, and **Tailwind-free Vanilla CSS**. Designed with rich Figma aesthetics, dark glassmorphism styling, and real-time Server-Sent Events (SSE) telemetry.

---

## ✨ Features & Architecture

- **Multi-Role Portal:** Instant persona switching between **Student**, **Faculty**, **Admin/Registrar**, and **Parent/Guardian**.
- **Live Shard Distribution & Monitoring:** Visual Consistent Hash Ring inspector, physical shard database distribution (MongoDB Atlas), and cluster rebalancing.
- **Engineering Internships Web Crawler Feed:** Live engineering opportunities filtered by department (`CSE`, `ECE`, `EEE`, `MECH`) with real career portal links and deadline countdowns.
- **Course Registration & Catalog:** Real-time seat filling, course search, and enrollment.
- **Attendance & Examination Eligibility:** Real-time 75% attendance health monitoring and hall ticket compliance.
- **Live SSE Telemetry:** Server-Sent Events showing cluster QPS, database status, and real-time broadcast alerts.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js 18+** installed (`node -v`)
- **npm** or **yarn**

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

The frontend will run on **`http://localhost:5173`** and proxy API requests to the backend on `http://localhost:8085`.

### 4. Build for Production
```bash
npm run build
```

---

## 📁 Project Structure

```text
sis-frontend/
├── src/
│   ├── components/        # Topbar, Sidebar, UI Badges & Navigation
│   ├── context/           # AuthContext (Role & session management), RealtimeContext (SSE)
│   ├── views/             # Core Pages:
│   │   ├── DashboardView.jsx        # Student metrics & quick actions
│   │   ├── NoticesView.jsx          # Engineering internships crawler & circulars
│   │   ├── ParentPortalView.jsx     # Ward academic monitoring & compliance
│   │   ├── AttendanceView.jsx       # Real-time attendance health tracker
│   │   ├── CourseSearchView.jsx     # Course catalog & registration
│   │   ├── TimetableWeeklyView.jsx  # Weekly schedule
│   │   ├── FacultyPortalView.jsx    # Instructor grading & attendance submission
│   │   ├── AdminPortalView.jsx      # Registrar management & course scheduling
│   │   └── SystemMonitorView.jsx    # Consistent hash ring & physical shards monitor
│   ├── api.js             # Unified REST client
│   ├── App.jsx            # Main app router & layout
│   └── index.css          # Design system & tokens
├── package.json
└── vite.config.js
```

---

## 📜 License
Developed for educational and academic mini-project demonstration purposes.

