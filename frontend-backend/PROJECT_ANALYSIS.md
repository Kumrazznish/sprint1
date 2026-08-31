# ResumeRanker Pro — Comprehensive Deep-Dive Project Analysis

> **Project Name:** ResumeRanker Pro (AI-Powered Resume Ranking System)  
> **Application Type:** Single Page Application (SPA) with Cloud AI & BaaS Integration  
> **Primary Technology Stack:** React 18, TypeScript, Vite, Tailwind CSS, Google Gemini 2.5/Flash AI, Supabase, PDF.js, Mammoth.js, Chart.js  
> **Analysis Date:** August 2026  

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Technology Stack & Dependencies](#3-technology-stack--dependencies)
4. [File & Directory Structure](#4-file--directory-structure)
5. [Data Models & Type Definitions](#5-data-models--type-definitions)
6. [End-to-End System Workflows & Data Pipelines](#6-end-to-end-system-workflows--data-pipelines)
   - [6.1 Document Ingestion & Multi-Tier Parsing](#61-document-ingestion--multi-tier-parsing)
   - [6.2 AI Evaluation & Prompt Engineering](#62-ai-evaluation--prompt-engineering)
   - [6.3 Response Sanitization & Validation Pipeline](#63-response-sanitization--validation-pipeline)
   - [6.4 State Management & Database Persistence](#64-state-management--database-persistence)
   - [6.5 Analytics & Competitive Intelligence Calculation](#65-analytics--competitive-intelligence-calculation)
   - [6.6 AI Email & Interview Schedule Generation](#66-ai-email--interview-schedule-generation)
   - [6.7 Multi-Format Export Engine](#67-multi-format-export-engine)
7. [Services Deep-Dive](#7-services-deep-dive)
8. [UI Components & Pages Deep-Dive](#8-ui-components--pages-deep-dive)
9. [Styling, Theming & Design System](#9-styling-theming--design-system)
10. [Configuration & Environment Setup](#10-configuration--environment-setup)
11. [Strengths, Bottlenecks & Future Roadmap](#11-strengths-bottlenecks--future-roadmap)

---

## 1. Executive Summary

**ResumeRanker Pro** is a modern, full-featured web application designed to automate and augment the hiring workflow for recruiters and hiring managers. It accepts comprehensive Job Descriptions alongside batches of candidate resumes (in PDF, DOCX/DOC, and TXT formats), extracts raw text via a multi-strategy parsing engine, and executes structured AI evaluations using **Google Gemini 2.5 Flash**.

### Core Capabilities:
- **Intelligent Resume Screening:** Multi-criteria weighted scoring (Technical Skills 40%, Experience 30%, Cultural/Soft Skills 20%, Education 10%).
- **Multi-Tier File Ingestion:** Extracts text from PDFs via PDF.js worker, binary stream decoding fallbacks, and canvas rendering; parses Word documents with Mammoth.js.
- **Deep Candidate Profiles:** Extracts and calculates match scores, missing/matched skills, strengths, weaknesses, tailored interview questions, hire probabilities, skill diversity indexes, and company prestige metrics.
- **Interactive Visualizations & Analytics:** Real-time distribution charts, skill gap analyses, experience breakdowns, and talent pool market competitiveness scores.
- **Automated Interview Workflow:** Generates personalized interview invitation emails with tone adjustment based on match tiers, plus exports an HR-ready interview scheduling CSV template.
- **Enterprise Reporting:** Exports to styled Printable PDF, Excel/CSV (Candidate Data + Interview Schedule), and structured JSON.
- **Modern Glassmorphic UI:** Full light/dark mode support with fluid animations, micro-interactions, and responsive layouts.

---

## 2. High-Level Architecture

```
                                  +-----------------------------+
                                  |         User Browser        |
                                  |   (React 18 + TypeScript)   |
                                  +--------------+--------------+
                                                 |
         +---------------------------------------+---------------------------------------+
         |                                       |                                       |
+--------v--------+                     +--------v--------+                     +--------v--------+
| Local File      |                     | Google Gemini   |                     | Supabase Cloud  |
| Parsers         |                     | 2.5 Flash API   |                     | PostgreSQL DB   |
+-----------------+                     +-----------------+                     +-----------------+
| - PDF.js (CDN/  |                     | - Direct REST   |                     | - Job Descs     |
|   Worker)       |                     |   API endpoint  |                     | - Candidates    |
| - Mammoth.js    |                     | - Weighted      |                     | - Analysis      |
|   (DOCX)        |                     |   Rubric Prompt |                     |   Results       |
| - FileReader    |                     | - Structured    |                     | - Supabase JS   |
|   (Streams/TXT) |                     |   JSON Output   |                     |   Client        |
+-----------------+                     +-----------------+                     +-----------------+
         |                                       |                                       |
         +---------------------------------------+---------------------------------------+
                                                 |
                                  +--------------v--------------+
                                  | State / Analytics / UI      |
                                  | - Candidate Cards & Modals  |
                                  | - AI Email Generator        |
                                  | - PDF / CSV / JSON Exporters|
                                  | - Chart.js & Metrics        |
                                  +-----------------------------+
```

---

## 3. Technology Stack & Dependencies

### Core Framework & Build:
- **React 18 (`18.3.1`) & React DOM:** Modern React utilizing hooks (`useState`, `useEffect`, `useRef`, `useContext`) and Strict Mode.
- **TypeScript (`5.5.3`):** Strict type safety across candidate profiles, database schemas, and service interfaces.
- **Vite (`5.4.2`):** Fast modern frontend bundler configured with `@vitejs/plugin-react`.
- **React Router DOM (`7.8.2`):** Client-side navigation across Home, Upload, Results, and Analytics routes.

### Styling & UX:
- **Tailwind CSS (`3.4.1`):** Utility-first CSS framework with class-based dark mode (`darkMode: 'class'`), custom animations, and glassmorphism utilities.
- **PostCSS (`8.4.35`) & Autoprefixer (`10.4.18`):** CSS transformation and cross-browser vendor prefixing.
- **Lucide React (`0.344.0`):** Iconography library providing icons across navigation, metrics, buttons, and status indicators.

### AI & Cloud Backend:
- **Google Generative AI REST API / `@google/generative-ai` (`0.24.1`):** Calls `gemini-2.5-flash:generateContent` using a custom-engineered evaluation prompt with JSON schema enforcement.
- **Supabase JS (`@supabase/supabase-js` `2.56.0`):** Client SDK for storing job descriptions, candidate assessments, and aggregated results in PostgreSQL.

### Parsing & Export:
- **`pdfjs-dist` (`5.4.54`) & `react-pdf` (`10.1.0`):** PDF text stream extraction with dynamically loaded worker and CMAP/Standard Font URLs.
- **`mammoth` (`1.10.0`):** Client-side `.docx` to raw text converter.
- **`pdf-parse` (`1.1.1`):** PDF parsing utilities.
- **`chart.js` (`4.5.0`) & `react-chartjs-2` (`5.3.0`):** Data visualization engines for charts and distributions.

---

## 4. File & Directory Structure

```
project/
├── .env                          # Environment variables (Supabase & Gemini API keys)
├── .gitignore                    # Git ignore configurations
├── eslint.config.js              # ESLint configuration with react-hooks & react-refresh
├── index.html                    # Single HTML template (font imports, viewport, root mounting)
├── package.json                  # Dependencies, scripts (dev, build, lint, preview)
├── postcss.config.js             # PostCSS plugins config (tailwindcss, autoprefixer)
├── tailwind.config.js            # Tailwind configuration (animations, dark mode, content globs)
├── tsconfig.json                 # Base TypeScript configuration referencing app & node configs
├── tsconfig.app.json             # App TypeScript configuration
├── tsconfig.node.json            # Node/Vite build TypeScript configuration
├── vite.config.ts                # Vite build config with React plugin & optimization exclusions
└── src/
    ├── App.tsx                   # Root component with master state, routing, and AI execution logic
    ├── main.tsx                  # Application entry point with BrowserRouter & ThemeProvider
    ├── index.css                 # Master Tailwind definitions, base typography, and component classes
    ├── vite-env.d.ts             # Vite client types declaration
    ├── components/               # Reusable presentation & feature components
    │   ├── AnalyticsCharts.tsx   # Score distribution bars, experience breakdown, skills analysis
    │   ├── AnalyticsInsights.tsx # AI insights cards, hiring recommendations, market competitiveness
    │   ├── CandidateCard.tsx     # Individual candidate card with match badges and quick actions
    │   ├── CandidateModal.tsx    # 4-tab detailed modal (Overview, Skills, Experience, AI Insights)
    │   ├── EmailModal.tsx        # AI personalized email generator, live preview, mailto & copy actions
    │   ├── FileUpload.tsx        # Drag-and-drop file uploader with status badges and progress simulation
    │   ├── Header.tsx            # Sticky glassmorphic navbar with active route links and ThemeToggle
    │   ├── HeroSection.tsx       # Landing page hero component
    │   ├── JobDescriptionInput.tsx# Job description textarea with sample loader and recent saved loader
    │   ├── LoadingOverlay.tsx    # Multi-step progress animation overlay during AI analysis
    │   ├── ResultsSection.tsx    # Auxiliary results component for embedded layouts
    │   ├── ThemeToggle.tsx       # Light / Dark mode toggle switch
    │   └── UploadSection.tsx     # Combined upload form with validation messages and analyze trigger
    ├── contexts/
    │   └── ThemeContext.tsx      # React context managing dark mode state via localStorage and html class
    ├── lib/
    │   └── supabase.ts           # Supabase client instantiation and database table TypeScript types
    ├── pages/
    │   ├── AnalyticsPage.tsx     # Analytics dashboard with metrics, charts, and recommendations
    │   ├── HomePage.tsx          # Landing page with feature highlights, 3-step process, and stats
    │   ├── ResultsPage.tsx       # Full results page with search, filters (sort, relevance, exp), and exports
    │   └── UploadPage.tsx        # Dedicated upload and configuration page
    ├── services/
    │   ├── database.ts           # Supabase CRUD service for job descriptions, candidates, analysis results
    │   ├── emailService.ts       # AI email drafting engine, mailto builder, and clipboard helpers
    │   ├── exportService.ts      # Exporter for Printable HTML/PDF, CSV candidate data, CSV schedule, JSON
    │   ├── fileProcessor.ts      # Multi-format dispatcher (PDF, DOCX via Mammoth, TXT) and validation
    │   ├── gemini.ts             # Gemini API caller and prompt generation
    │   └── pdfProcessor.ts       # 3-tier fallback PDF text extractor using PDF.js, FileReader, and Canvas
    ├── styles/
    │   └── animations.css        # Keyframes and CSS utility classes for smooth animations
    └── types/
        └── index.ts              # TypeScript interfaces for Candidate, JobDescription, AnalysisResult, etc.
```

---

## 5. Data Models & Type Definitions

### 5.1 `Candidate`
Represents the comprehensive evaluation of a candidate:
```typescript
export interface Candidate {
  id: string;
  candidate_name: string;
  contact_info: {
    email: string;
    phone: string;
  };
  skills: string[];
  experience_years: number;
  education: string;
  certifications: string[];
  notable_companies: string[];
  summary: string;
  matched_skills: string[];
  missing_skills: string[];
  match_score: number;              // 0 to 100
  recommendation: string;
  is_relevant: boolean;
  issues_detected: string[];
  strengths: string[];
  weaknesses: string[];
  interview_questions: string[];
  salary_range: string;
  hire_probability: number;          // 0.0 to 1.0
  experience_level: string;         // 'Entry Level' | 'Mid Level' | 'Senior Level'
  skill_diversity: number;          // 0.0 to 1.0 (calculated across 8 technology categories)
  company_prestige: number;         // 0.0 to 1.0 (calculated against top-tier tech firms)
  created_at?: string;
  updated_at?: string;
}
```

### 5.2 `JobDescription`
Represents the target job requirement:
```typescript
export interface JobDescription {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  experience_level: string;
  salary_range: string;
  created_at: string;
  updated_at: string;
}
```

### 5.3 `AnalysisResult`
Encapsulates a batch evaluation run:
```typescript
export interface AnalysisResult {
  id: string;
  job_description_id: string;
  candidates: Candidate[];
  total_candidates: number;
  relevant_candidates: number;
  average_score: number;
  top_candidates: number;
  analysis_date: string;
  processing_time: number;
}
```

### 5.4 `UploadedFile`
Represents the in-flight file ingestion state:
```typescript
export interface UploadedFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  text: string | null;
  error: string | null;
  uploadTime: Date;
}
```

### 5.5 Supabase Database Schema
The database tables mirrored in `src/lib/supabase.ts` are:
1. `job_descriptions` (`id`, `title`, `description`, `required_skills`, `experience_level`, `salary_range`, `created_at`, `updated_at`)
2. `candidates` (`id`, `candidate_name`, `contact_info` JSON, `skills`, `experience_years`, `education`, `certifications`, `notable_companies`, `summary`, `matched_skills`, `missing_skills`, `match_score`, `recommendation`, `is_relevant`, `issues_detected`, `strengths`, `weaknesses`, `interview_questions`, `salary_range`, `hire_probability`, `experience_level`, `skill_diversity`, `company_prestige`, `created_at`, `updated_at`)
3. `analysis_results` (`id`, `job_description_id`, `candidate_ids` string[], `total_candidates`, `relevant_candidates`, `average_score`, `top_candidates`, `analysis_date`, `processing_time`, `created_at`, `updated_at`)

---

## 6. End-to-End System Workflows & Data Pipelines

### 6.1 Document Ingestion & Multi-Tier Parsing
When the user drags or selects resume files:
1. **File Validation (`FileProcessor.validateFile`):**
   - Supports: `.pdf`, `.doc`, `.docx`, `.txt`.
   - Max size limit: 15MB. Min size limit: 100 bytes.
   - Duplicate detection prevents re-uploading identical files.
2. **Text Extraction Dispatcher (`FileProcessor.processFile`):**
   - **PDF Processing (`pdfProcessor.ts`):**
     - *Method 1 (PDF.js):* Dynamically loads PDF.js and standard fonts/cmaps from CDN, parses text items across all pages.
     - *Method 2 (FileReader Stream Pattern Fallback):* Binary string regex matching `(text)` and `stream ... endstream` tokens.
     - *Method 3 (HTML5 Canvas Fallback):* Renders PDF pages to an off-screen canvas.
   - **Word Document (`.docx`):** Dynamically imports `mammoth` and runs `extractRawText({ arrayBuffer })`.
   - **Plain Text (`.txt`):** Reads UTF-8 text via `FileReader.readAsText`.
3. **Text Sanitization (`cleanExtractedText`):**
   - Cleans non-printable ASCII/control characters `[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]`.
   - Removes PDF artifacts like `(cid:*)`, `<<...>>`.
   - Normalizes quotes, whitespace, and consecutive linebreaks.
   - Checks that extracted text exceeds 50 characters before marking status as `completed`.

```
[ User Files (PDF / DOCX / TXT) ]
                │
                ▼
      [ Validation Gate ]
     (Type, Size, Duplicate)
                │
        ┌───────┴───────────────────────┐
        ▼                               ▼
 [ PDF Engine ]                 [ Mammoth / TXT ]
  1. PDF.js (Worker)             1. Mammoth (Docx)
  2. Binary Stream Regex         2. FileReader (Txt)
  3. Canvas Render
        │                               │
        └───────────────┬───────────────┘
                        ▼
            [ Text Sanitization ]
          (Normalize & Clean ASCII)
                        ▼
         [ Ready UploadedFile Object ]
```

---

### 6.2 AI Evaluation & Prompt Engineering
When the user clicks **"Analyze with AI"**:
1. All completed file texts are packaged into a structured prompt with clear candidate demarcations (`RESUME 1: file.pdf`, `RESUME 2: file2.docx`, etc.).
2. `GeminiService.analyzeResumes` is invoked with `gemini-2.5-flash:generateContent`:
   - `temperature: 0.3` (for deterministic, structured assessment)
   - `topK: 40`, `topP: 0.95`, `maxOutputTokens: 8192`
3. **Evaluation Framework Weights in Prompt:**
   - **40% Technical Skills:** Depth, recency, transferable skills, exact matches.
   - **30% Experience:** Quality of past companies, leadership progression, industry alignment.
   - **20% Cultural & Soft Skills:** Communication clarity, collaboration indicators, problem-solving approach.
   - **10% Education & Certifications:** Degree relevance, credentials, continuous learning.
4. **Scoring Tiers:**
   - `90-100`: Exceptional match
   - `80-89`: Strong match (Interview priority)
   - `70-79`: Good candidate
   - `60-69`: Moderate fit
   - `50-59`: Weak match
   - `0-49`: Poor fit / Reject

---

### 6.3 Response Sanitization & Validation Pipeline
The raw AI output is parsed and sanitized in `App.tsx` (`parseAIResponse`):
1. Strips markdown backticks (````json ... ````).
2. Slices between the outermost `[` and `]` brackets to extract valid JSON even if surrounded by conversational text.
3. Parses JSON array and iterates over each candidate record.
4. Applies fallback sanitizers:
   - `validateString` / `validateStringArray` ensuring valid strings and non-empty arrays.
   - `validateNumber` enforcing min/max boundaries (e.g., scores clamped `0..100`, hire probability `0..1`).
   - `getExperienceLevel(years)` computes `Entry Level` (≤2 yrs), `Mid Level` (3–7 yrs), or `Senior Level` (8+ yrs).
   - `calculateSkillDiversity(skills)` categorizes skills across 8 domains (programming, frontend, backend, database, cloud, mobile, data, tools) and produces a 0–1 ratio.
   - `assessCompanyPrestige(companies)` scans company names against tier-1 tech enterprises (Google, Meta, Apple, Microsoft, Amazon, Netflix, Stripe, etc.) to yield a prestige factor.

---

### 6.4 State Management & Database Persistence
- Analysis results are stored in local React state (`candidates`, `stats`, `showResults`).
- Results are saved to Supabase via `DatabaseService.createCandidates(analysisResults)`. If the Supabase connection fails or is unconfigured, the system gracefully logs a warning and proceeds seamlessly with local state so user flow is uninterrupted.
- Automatic routing transitions the user to `/results`.

---

### 6.5 Analytics & Competitive Intelligence Calculation
The `AnalyticsPage.tsx` computes aggregate analytics over the candidate dataset:
- **Score Distribution:** Groups candidates into 6 score tiers (90-100%, 80-89%, 70-79%, 60-69%, 50-59%, 0-49%).
- **Experience Breakdown:** Counts entry, mid, and senior levels.
- **Skills Demand & Match Rate:** Computes frequency of top skills across resumes and calculates individual skill match percentages.
- **Hiring Recommendations:** Divides pool into Immediate Hire (90%+), Shortlist (80-89%), and Consider (70-79%).
- **Market Competitiveness Score:** Weighted composite of average hire probability, skill diversity, and company prestige.

---

### 6.6 AI Email & Interview Schedule Generation
- **Email Service (`emailService.ts`):** Generates personalized interview invitation emails.
  - Dynamically customizes subject lines (e.g., `🌟 Exceptional Match - Interview Invitation...` for 90%+ candidates).
  - References the candidate's exact match score, years of experience, and top 3 matched skills.
  - Injects candidate strengths and notable companies into the email body.
  - Generates actionable interview agenda items, compensation package notes, and scheduling details.
  - Provides a single-click `mailto:` launcher and clipboard copy helper.
- **Interview Schedule Generation (`exportService.ts`):**
  - Selects top candidates (score ≥ 80%) and generates structured interview records with IDs (`INT-001`, `INT-002`), default time slots, video meeting links, and skill-focused preparation notes.

---

### 6.7 Multi-Format Export Engine
`ExportService.ts` provides comprehensive data export capabilities:
1. **PDF Export:** Opens a new print window with custom CSS styling, metric cards, score badges, matched/missing skill chips, and print-media formatting (`@media print`).
2. **Excel/CSV Export:** Downloads two separate CSV files:
   - `interview-schedule-template.csv`: Pre-filled interview schedule with candidate info, interviewer details, Google Meet link placeholders, and preparation notes.
   - `candidate-analysis-data.csv`: Complete table of candidate rankings, scores, contact details, strengths, weaknesses, interview questions, and diversity metrics.
3. **JSON Export:** Downloads `resume-analysis-complete.json` containing metadata, sorted candidate list, and structured interview schedules.

---

## 7. Services Deep-Dive

| Service File | Primary Role | Key Methods / Functions |
|---|---|---|
| [`gemini.ts`](file:///d:/Download/resume-ranking/project-bolt-sb1-trlvopmi%20%281%29/project/src/services/gemini.ts) | LLM evaluation integration | `analyzeResumes()`, `createAnalysisPrompt()` |
| [`pdfProcessor.ts`](file:///d:/Download/resume-ranking/project-bolt-sb1-trlvopmi%20%281%29/project/src/services/pdfProcessor.ts) | Resilient PDF text extraction | `extractTextFromPDF()`, `extractWithPDFJS()`, `extractWithFileReader()`, `extractWithCanvas()`, `loadPDFJS()`, `validatePDFFile()` |
| [`fileProcessor.ts`](file:///d:/Download/resume-ranking/project-bolt-sb1-trlvopmi%20%281%29/project/src/services/fileProcessor.ts) | Multi-format dispatcher | `processFile()`, `extractTextFromWord()`, `extractTextFromPlainText()`, `validateFile()`, `getFileIcon()`, `getFileTypeLabel()` |
| [`database.ts`](file:///d:/Download/resume-ranking/project-bolt-sb1-trlvopmi%20%281%29/project/src/services/database.ts) | Supabase PostgreSQL interface | `createJobDescription()`, `getJobDescriptions()`, `createCandidates()`, `getCandidates()`, `searchCandidates()`, `createAnalysisResult()`, `getCandidateStats()` |
| [`emailService.ts`](file:///d:/Download/resume-ranking/project-bolt-sb1-trlvopmi%20%281%29/project/src/services/emailService.ts) | Interview email generation | `generateInterviewEmail()`, `sendInterviewEmail()`, `copyEmailToClipboard()`, `validateEmailAddress()` |
| [`exportService.ts`](file:///d:/Download/resume-ranking/project-bolt-sb1-trlvopmi%20%281%29/project/src/services/exportService.ts) | Multi-format reporting | `exportCandidates()`, `exportToPDF()`, `exportToExcel()`, `exportInterviewScheduleTemplate()`, `exportCandidateData()`, `exportToJSON()` |

---

## 8. UI Components & Pages Deep-Dive

### 8.1 Pages
- **[`HomePage.tsx`](file:///d:/Download/resume-ranking/project-bolt-sb1-trlvopmi%20%281%29/project/src/pages/HomePage.tsx):** High-converting landing page with animated gradients, feature badges, 3-step workflow, HR trust metrics, and CTA buttons linking to `/upload`.
- **[`UploadPage.tsx`](file:///d:/Download/resume-ranking/project-bolt-sb1-trlvopmi%20%281%29/project/src/pages/UploadPage.tsx):** Host page orchestrating job description input and batch resume uploading.
- **[`ResultsPage.tsx`](file:///d:/Download/resume-ranking/project-bolt-sb1-trlvopmi%20%281%29/project/src/pages/ResultsPage.tsx):** Comprehensive candidate review dashboard featuring:
  - Top statistics bar (Total Analyzed, Average Score, Top Matches, Relevant Matches).
  - Search input with real-time text matching across names, skills, and summaries.
  - Multi-criteria filters: Sorting (Score Asc/Desc, Name A-Z, Experience), Relevance (All, Relevant, Excellent, Strong, Moderate), Experience (Entry, Mid, Senior).
  - Toggle between Grid view and List view.
  - Dropdown export triggers for PDF, Excel/CSV, and JSON.
- **[`AnalyticsPage.tsx`](file:///d:/Download/resume-ranking/project-bolt-sb1-trlvopmi%20%281%29/project/src/pages/AnalyticsPage.tsx):** Deep reporting dashboard with competitive market analysis and hiring recommendations.

### 8.2 Key Components
- **[`CandidateCard.tsx`](file:///d:/Download/resume-ranking/project-bolt-sb1-trlvopmi%20%281%29/project/src/components/CandidateCard.tsx):** Interactive card displaying match score badge, candidate initials avatar, contact details, experience level, matched/missing skill pills, expected salary, and issue warnings.
- **[`CandidateModal.tsx`](file:///d:/Download/resume-ranking/project-bolt-sb1-trlvopmi%20%281%29/project/src/components/CandidateModal.tsx):** 4-tab modal:
  1. *Overview:* Contact info, scoring metrics, summary, company list, certifications.
  2. *Skills Analysis:* Matched vs. missing breakdown, full skill portfolio, skill diversity index.
  3. *Experience:* Experience assessment by years, company history.
  4. *AI Insights:* Recommendation text, relevance badge, strengths, weaknesses, suggested interview questions, and detected issues.
- **[`EmailModal.tsx`](file:///d:/Download/resume-ranking/project-bolt-sb1-trlvopmi%20%281%29/project/src/components/EmailModal.tsx):** Generates AI interview email templates with live preview, email client launching (`mailto:`), and clipboard copying.
- **[`JobDescriptionInput.tsx`](file:///d:/Download/resume-ranking/project-bolt-sb1-trlvopmi%20%281%29/project/src/components/JobDescriptionInput.tsx):** Text area with word/character counts, read time estimation, a "Load Sample" button (pre-filled Senior Full Stack Developer role), and a "Recent" selector fetching past job descriptions from Supabase.
- **[`FileUpload.tsx`](file:///d:/Download/resume-ranking/project-bolt-sb1-trlvopmi%20%281%29/project/src/components/FileUpload.tsx):** Drag-and-drop container with animated dropzone, file validation feedback, simulated progress bars, and status pills (Ready, Processing, Error).
- **[`Header.tsx`](file:///d:/Download/resume-ranking/project-bolt-sb1-trlvopmi%20%281%29/project/src/components/Header.tsx) & [`ThemeToggle.tsx`](file:///d:/Download/resume-ranking/project-bolt-sb1-trlvopmi%20%281%29/project/src/components/ThemeToggle.tsx):** Responsive navigation with active route highlights, mobile hamburger menu, and dark/light mode toggle.
- **[`LoadingOverlay.tsx`](file:///d:/Download/resume-ranking/project-bolt-sb1-trlvopmi%20%281%29/project/src/components/LoadingOverlay.tsx):** Fullscreen animated modal showing current AI analysis phase and progress percentage.

---

## 9. Styling, Theming & Design System

### Design System Characteristics:
- **Palette:** 
  - *Light Mode:* Slate-50, Blue-50, Indigo-100 backgrounds with Blue-600, Purple-600, and Pink-600 gradients.
  - *Dark Mode:* Gray-900, Emerald-900, Teal-900 backgrounds with Emerald-500, Teal-500, and Cyan-500 accents.
- **Glassmorphism:** `.glass-card` and `.glass-card-strong` classes combining `backdrop-blur-xl`, semi-transparent backgrounds (`rgba(255, 255, 255, 0.1)`), and border highlights.
- **Keyframe Animations:** Custom animations defined in `src/styles/animations.css` and `tailwind.config.js`:
  - `float`: Continuous 6s floating background elements.
  - `pulse-glow`: Pulsing box-shadows on CTA buttons.
  - `shimmer` & `progressShimmer`: Shimmering light reflections across cards and progress bars.
  - `slide-in-up`, `slide-in-left`, `slide-in-right`, `scale-in`, `bounce-in`.
  - `stagger-children`: Cascading animation delays for grid items.

---

## 10. Configuration & Environment Setup

### Environment Variables (`.env`)
```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_GEMINI_API_KEY=AIzaSy...
```

### Build & Execution Scripts:
- `npm run dev`: Starts the Vite development server on `http://localhost:5173`.
- `npm run build`: Typechecks with TypeScript compiler (`tsc -b`) and generates production bundle in `dist/`.
- `npm run preview`: Previews the production build locally.
- `npm run lint`: Runs ESLint across all TypeScript and React files.

---

## 11. Strengths, Bottlenecks & Future Roadmap

### Notable Strengths:
1. **End-to-End In-Browser Ingestion:** Capable of parsing PDFs, DOCX, and TXT entirely client-side without relying on heavy external backend microservices.
2. **Deterministic & Structured LLM Outputs:** Well-crafted prompt enforcing a strict JSON schema, resulting in consistent extraction of skills, questions, and scores.
3. **Resilient Architecture:** Multi-tier fallback mechanisms across PDF parsing and graceful degradation when the database is offline.
4. **Comprehensive HR Utility:** Goes beyond raw scoring by generating actionable interview schedules, custom email drafts, and deep skill gap analytics.
5. **Modern Aesthetics:** Glassmorphic UI with dark/light themes, micro-animations, and responsive layouts.

### Identified Bottlenecks & Considerations:
1. **Client-Side API Key Exposure:** `VITE_GEMINI_API_KEY` and `VITE_SUPABASE_ANON_KEY` are bundled into the client build. For production deployment with public users, LLM calls should be proxied through a lightweight backend (e.g. Supabase Edge Functions or Node.js API) to prevent key scraping.
2. **Context Window on Very Large Batches:** If analyzing 50+ large resumes simultaneously, the concatenated prompt could approach token or timeout thresholds. Implementing batch chunking (e.g. evaluating 5–10 resumes per LLM call) would further enhance scalability.
3. **OCR for Scanned Image PDFs:** The current Canvas fallback extracts basic text; integrating Tesseract.js would allow full text extraction from purely scanned image-only PDFs.

### Recommended Future Enhancements:
- [ ] **Batch Processing Queue:** Add batch chunking for analyzing 100+ resumes concurrently.
- [ ] **Supabase Edge Function Proxy:** Move Gemini API calls to secure serverless edge functions.
- [ ] **Resume Comparison Matrix:** Side-by-side comparison view for the top 3 finalists.
- [ ] **Direct Calendar Integration:** Export interview slots directly to `.ics` or Google Calendar.
- [ ] **Custom Scoring Rubrics:** Allow HR managers to customize rubric weights (e.g., adjust technical skills weight from 40% to 60%).

---

*Analysis generated automatically by Antigravity IDE.*
