# ResumeRanker Pro — Project Report

---

> **Project Title:**# ResumeRanker Pro — Comprehensive Academic Project Report
**AI-Powered Resume Ranking System with Gemini Multi-Key Pool & MongoDB Database Architecture**

* **Department**: Department of Computer Science & Engineering
* **Academic Year**: 2025 – 2026
* **Generated Document**: `PROJECT_REPORT.pdf` (49 Pages, Strict Double-Border Academic Format)
* **Tech Stack**: React 18.3, TypeScript 5.5, Tailwind CSS, Google Gemini 2.5 Flash, MongoDB 6.0+, Mongoose ODM, Mozilla PDF.js, Mammoth.js

---

## Index

| Sr. No. | Topic |
|---------|-------|
| 1 | Title of Project |
| 2 | Acknowledgement |
| 3 | Abstract |
| 4 | Introduction |
| 5 | Objectives |
| 6 | System Analysis |
| 7 | System Design & MongoDB Architecture |
| 8 | Screenshots / UI Placeholders |
| 9 | Coding (Core Project Modules & MongoDB Implementation) |
| 10 | Testing |
| 11 | Future Scope |
| 12 | Conclusion |
| 13 | Bibliography & References |

---

## 2. Acknowledgement

The project **"ResumeRanker Pro — AI-Powered Resume Ranking System"** is a full-stack web application developed using React, TypeScript, Node.js, Express, MongoDB with Mongoose ODM, and the Google Gemini 2.5 Flash API.

We extend our sincere gratitude to our project guide and faculty members for providing invaluable guidance and technical insights throughout the design and development phases.

We also express our appreciation to the open-source community behind the React, MongoDB, and Node.js ecosystems, as well as Google AI Studio for providing API access to Google Gemini models.

---

## 3. Abstract

ResumeRanker Pro is an automated, AI-driven resume screening and candidate evaluation web application. In traditional hiring, reviewing hundreds of applicant resumes against lengthy job descriptions is labor-intensive, slow, and prone to human cognitive bias. 

ResumeRanker Pro automates this pipeline by accepting multi-format candidate resumes (PDF, DOCX, TXT) and a target job description. The system parses document text in the browser using Mozilla PDF.js and Mammoth.js, and transmits the structured payload to Google Gemini 2.5 Flash via a specialized evaluation prompt. The AI evaluates technical skills (40% weight), professional experience (30% weight), soft skills (20% weight), and education/certifications (10% weight), returning a strict JSON object with match scores (0–100), matched/missing skills, strengths, weaknesses, and custom interview questions.

All job descriptions, candidate assessments, and analytical sessions are persistently stored in a MongoDB NoSQL database using Mongoose models. The client interface is implemented with React 18 and TypeScript, delivering instant candidate filtering, CSV/JSON export, and real-time score visualization.

---

## 4. Introduction

### 4.1 Background

Recruitment operations in modern enterprises receive large volumes of resumes for every job opening. Traditional keyword-based Applicant Tracking Systems (ATS) rely on simple string matching, which frequently overlooks qualified candidates with equivalent or transferable skills while rewarding keyword-stuffed resumes.

Generative Artificial Intelligence and Large Language Models (LLMs) provide contextual semantic comprehension. By submitting candidate resumes alongside full job specifications, LLMs can perform holistic evaluations that assess technical depth, career trajectory, and contextual skill application.

### 4.2 Problem Statement

1. **Manual Inefficiency:** Reviewing hundreds of multi-page resumes consumes excessive recruiter hours.
2. **Keyword Matcher Limitations:** Legacy ATS systems fail when candidates use alternative terminology or phrasing.
3. **Lack of Explainability:** Traditional tools provide opaque pass/fail outcomes without actionable feedback or interview questions.
4. **Data Isolation:** Absence of a centralized database to track past applicant evaluations across job postings.

### 4.3 Proposed Solution

ResumeRanker Pro delivers:
- Client-side multi-format resume parsing (PDF, DOCX, TXT).
- Google Gemini 2.5 Flash integration with structured 4-pillar weighting.
- MongoDB document store for flexible storage of unstructured resume metadata and nested candidate scores.
- Interactive candidate leaderboard with skill breakdown, interview question generation, and export capabilities.

---

## 5. Objectives

The primary objectives of this project are:

1. To construct a web application for automated resume screening and candidate ranking.
2. To integrate Google Gemini 2.5 Flash API with a weighted evaluation framework (Technical 40%, Experience 30%, Soft Skills 20%, Education 10%).
3. To extract text client-side from multiple document formats: PDF (via PDF.js), DOCX (via Mammoth.js), and TXT (via FileReader).
4. To design and implement a persistent MongoDB database schema using Mongoose to store job descriptions, candidate evaluations, and session analytics.
5. To generate structured candidate outputs including match scores (0–100), matched skills, missing skills, strengths, weaknesses, and custom interview questions.
6. To implement real-time candidate search, score sorting, and CSV/JSON export services.
7. To provide an intuitive, responsive user interface developed with React 18, TypeScript, and Tailwind CSS.

---

## 6. System Analysis

### 3.1 Problem Definition

Manual resume screening suffers from subjective evaluation, inconsistency, and significant delays. ResumeRanker Pro replaces this manual process with an automated, explainable AI evaluation pipeline connected to a scalable MongoDB database.

### 3.2 Preliminary Investigation

**Feasibility Analysis:**

- **Technical Feasibility:** React 18 + TypeScript on the client, Node.js + Express backend, MongoDB for NoSQL document persistence, and Google Gemini API for NLP reasoning.
- **Economic Feasibility:** Uses open-source libraries and scalable cloud database/API tiers, minimizing infrastructure overhead.
- **Operational Feasibility:** Browser-based SPA requires no specialized software on the recruiter's workstation.
- **Schedule Feasibility:** Modular component-driven development ensures independent testing of file processing, AI prompts, and database queries.

### 3.3 Software & Hardware Requirements

#### Software Requirements:
- **Operating System:** Windows 10/11, Linux, or macOS
- **Frontend:** React 18.3, TypeScript 5.5, Vite 5.4, Tailwind CSS 3.4
- **Backend / Database:** Node.js, Express.js, MongoDB 6.0+, Mongoose ODM 8.0+
- **AI Service:** Google Gemini 2.5 Flash (`@google/generative-ai`)
- **Document Parsers:** `pdfjs-dist` (v5.4), `mammoth` (v1.10)
- **Browser:** Google Chrome 90+, Mozilla Firefox 88+, Microsoft Edge 90+

#### Hardware Requirements:
- **Processor:** Intel Core i3 / AMD Ryzen 3 or higher
- **RAM:** 4 GB minimum (8 GB recommended)
- **Storage:** 500 MB free disk space for application files
- **Network:** Active internet connection for Gemini API and MongoDB Atlas

### 3.4 Functional Requirements

#### 1. User & Recruiter Module
- Input job title, description, required skills, and experience level.
- Upload multiple resume files simultaneously via drag-and-drop.
- View extraction status and error alerts for corrupt files.
- Trigger AI batch analysis and view ranked candidate cards.
- Search candidates by keyword and filter by match score or experience.
- Export candidate leaderboards to CSV and JSON formats.

#### 2. AI Analysis Module
- Clean and normalize extracted text from PDF/DOCX/TXT files.
- Construct structured prompts enforcing JSON schema output from Gemini.
- Parse and validate AI responses into TypeScript candidate objects.
- Compute aggregate metrics: Average Score, Relevant Candidates, Top Matches.

#### 3. Database & Persistence Module (MongoDB)
- Connect securely to MongoDB via Mongoose connection pooling.
- Store Job Descriptions in the `jobdescriptions` collection.
- Store Analysis Sessions and nested candidate records in the `analysisresults` collection.
- Execute aggregation pipelines to compute recruiting analytics.

### 3.5 Data Flow Diagrams (DFD)

#### Level 0 — Context Diagram (Zero Level DFD)

```
[IMAGE PLACEHOLDER — LEVEL 0 CONTEXT DFD]
Diagram Description: Shows external entities (Recruiter, Resume Files, Job Description)
interacting with the central ResumeRanker Pro System, communicating with Google Gemini API
and persisting structured records into the MongoDB Database.
```

*Figure 3.1: Level 0 DFD — Context Diagram*

#### Level 1 — System Data Flow Diagram

```
[IMAGE PLACEHOLDER — LEVEL 1 SYSTEM DFD]
Diagram Description: Illustrates data flow from Document Parsing (Process 1.0) ->
Text Normalization (Process 2.0) -> Gemini AI Assessment (Process 3.0) ->
MongoDB Persistence (Process 4.0) -> Leaderboard Display & Export (Process 5.0).
```

*Figure 3.2: Level 1 DFD — System Workflow*

#### Level 2 — Database & AI Evaluation Flow

```
[IMAGE PLACEHOLDER — LEVEL 2 DATABASE & AI DFD]
Diagram Description: Detailed flow of Mongoose model validation, Gemini prompt construction,
JSON response parsing, insertion into MongoDB collections, and aggregation query execution.
```

*Figure 3.3: Level 2 DFD — AI & MongoDB Pipeline*

### 3.6 Entity Relationship (ER) / MongoDB Schema Diagram

```
[IMAGE PLACEHOLDER — MONGODB SCHEMA / ER DIAGRAM]
Diagram Description: Document relationship between User collection, JobDescription collection,
and AnalysisResult collection containing embedded Candidate sub-documents.

Collections & Relationships:
- users (1) --------< (N) jobdescriptions
- jobdescriptions (1) --------< (N) analysisresults
- analysisresults [contains embedded array of Candidate documents]
```

*Figure 3.4: MongoDB Document Schema Architecture*

---

## 7. System Design & MongoDB Architecture

### 4.1 Client-Server Architecture

```
+-------------------------------------------------------------------+
|                        CLIENT (React 18 + TS)                     |
|  - FileDropzone (PDF.js / Mammoth)                                |
|  - JobDescriptionForm                                             |
|  - CandidateCard & Leaderboard                                    |
|  - Analytics & ExportService                                      |
+---------------------------------+---------------------------------+
                                  | HTTP / REST API
+---------------------------------v---------------------------------+
|                    BACKEND (Node.js + Express)                    |
|  - GeminiService (Prompt Engine & API Client)                     |
|  - MongoDB Controller (CRUD & Aggregation)                        |
+-------------------+-------------------------------+---------------+
                    |                               |
+-------------------v---------------+   +-----------v---------------+
|        Google Gemini 2.5          |   |          MongoDB          |
|    Generative AI REST API         |   |    Database (Mongoose)    |
+-----------------------------------+   +---------------------------+
```

### 4.2 MongoDB Collections & Mongoose Data Models

#### 1. `JobDescription` Schema (`jobdescriptions` Collection)

| Field | BSON Type | Required | Description |
|-------|-----------|----------|-------------|
| `_id` | ObjectId | Yes | Unique Document Identifier |
| `title` | String | Yes | Target Job Title |
| `description` | String | Yes | Full Job Description Text |
| `required_skills` | Array [String] | Yes | List of mandatory technical skills |
| `experience_level`| String | Yes | 'Junior', 'Mid', 'Senior', 'Lead' |
| `salary_range` | String | No | Budgeted compensation range |
| `createdAt` | Date | Auto | Document creation timestamp |
| `updatedAt` | Date | Auto | Document update timestamp |

#### 2. `AnalysisResult` Schema (`analysisresults` Collection)

| Field | BSON Type | Required | Description |
|-------|-----------|----------|-------------|
| `_id` | ObjectId | Yes | Unique Session Identifier |
| `job_description_id` | ObjectId (Ref) | Yes | Foreign Reference to `JobDescription` |
| `candidates` | Array [Sub-Doc]| Yes | Embedded candidate evaluation objects |
| `total_candidates` | Number | Yes | Total resumes processed |
| `relevant_candidates`| Number | Yes | Candidates with `is_relevant: true` |
| `average_score` | Number | Yes | Mean match score (0–100) |
| `top_candidates` | Number | Yes | Candidates scoring >= 80 |
| `processing_time` | Number | Yes | Duration in milliseconds |
| `analysis_date` | Date | Auto | Timestamp of analysis session |

#### 3. Embedded `Candidate` Sub-Document Schema

| Field | BSON Type | Description |
|-------|-----------|-------------|
| `candidate_name` | String | Extracted candidate full name |
| `contact_info.email`| String | Extracted email address |
| `contact_info.phone`| String | Extracted phone number |
| `skills` | Array [String] | Extracted technical and domain skills |
| `experience_years` | Number | Total relevant work experience |
| `education` | String | Highest degree and discipline |
| `certifications` | Array [String] | Professional certificates |
| `notable_companies`| Array [String] | Recognized past employers |
| `summary` | String | 2-3 sentence AI candidate profile summary |
| `matched_skills` | Array [String] | Skills satisfying job requirements |
| `missing_skills` | Array [String] | Job skills absent in candidate resume |
| `match_score` | Number | Computed composite score (0–100) |
| `recommendation` | String | AI qualitative hiring recommendation |
| `is_relevant` | Boolean | True if candidate meets baseline criteria |
| `issues_detected` | Array [String] | Resume red flags (gaps, missing details) |
| `strengths` | Array [String] | Top 3-5 candidate strengths |
| `weaknesses` | Array [String] | Identified skill gaps or limitations |
| `interview_questions`| Array [String] | Targeted questions based on resume gaps |
| `salary_range` | String | AI predicted market salary expectation |
| `hire_probability` | Number | Statistical hire probability (0.00–1.00) |

---

## 8. Screenshots / UI Placeholders

### 8.1 Application Home & Hero Section

```
[IMAGE PLACEHOLDER]
Insert Application Home & Navigation Screenshot here.
Description: Clean monochrome interface showing project header, navigation tabs,
and system overview.
```

*Figure 8.1: Home & Overview Interface*

---

### 8.2 Resume Upload & Job Description Form

```
[IMAGE PLACEHOLDER]
Insert Resume Upload & Job Description Form Screenshot here.
Description: Drag-and-drop file upload zone, loaded file list with parse indicators,
and job description input area.
```

*Figure 8.2: Resume Upload and Job Specification Interface*

---

### 8.3 Ranked Candidate Leaderboard

```
[IMAGE PLACEHOLDER]
Insert Candidate Leaderboard Screenshot here.
Description: Ranked candidate list sorted by match score, showing candidate name,
matched skills, recommendation badge, and score indicator.
```

*Figure 8.3: Candidate Ranking Leaderboard*

---

### 8.4 Candidate Detailed Evaluation Modal

```
[IMAGE PLACEHOLDER]
Insert Candidate Detail Modal Screenshot here.
Description: Detailed breakdown displaying strengths, weaknesses, missing skills,
experience timeline, and AI-generated interview questions.
```

*Figure 8.4: Detailed Candidate Assessment View*

---

### 8.5 Analytics & Session Summary

```
[IMAGE PLACEHOLDER]
Insert Analytics & Batch Summary Screenshot here.
Description: Aggregate metrics showing total candidates, average score,
top matches count, and export triggers (CSV / JSON).
```

*Figure 8.5: Batch Analytics & Export View*

---

## 9. Coding (Core Project Modules & MongoDB Implementation)

### 9.1 MongoDB Models & Mongoose Schemas (`models/index.ts`)

```typescript
import mongoose, { Schema, Document } from 'mongoose';

// 1. Candidate Sub-Schema
const CandidateSchema = new Schema({
  candidate_name: { type: String, required: true },
  contact_info: {
    email: { type: String, default: 'Not specified' },
    phone: { type: String, default: 'Not specified' }
  },
  skills: [{ type: String }],
  experience_years: { type: Number, default: 0 },
  education: { type: String, default: 'Not specified' },
  certifications: [{ type: String }],
  notable_companies: [{ type: String }],
  summary: { type: String, required: true },
  matched_skills: [{ type: String }],
  missing_skills: [{ type: String }],
  match_score: { type: Number, required: true, min: 0, max: 100 },
  recommendation: { type: String, required: true },
  is_relevant: { type: Boolean, default: false },
  issues_detected: [{ type: String }],
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  interview_questions: [{ type: String }],
  salary_range: { type: String },
  hire_probability: { type: Number, min: 0, max: 1 }
}, { _id: true });

// 2. Job Description Schema
const JobDescriptionSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  required_skills: [{ type: String }],
  experience_level: { type: String, required: true },
  salary_range: { type: String }
}, { timestamps: true });

// 3. Analysis Result Schema
const AnalysisResultSchema = new Schema({
  job_description_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'JobDescription', 
    required: true 
  },
  candidates: [CandidateSchema],
  total_candidates: { type: Number, required: true },
  relevant_candidates: { type: Number, required: true },
  average_score: { type: Number, required: true },
  top_candidates: { type: Number, required: true },
  processing_time: { type: Number, required: true },
  analysis_date: { type: Date, default: Date.now }
}, { timestamps: true });

export const JobDescriptionModel = mongoose.model('JobDescription', JobDescriptionSchema);
export const AnalysisResultModel = mongoose.model('AnalysisResult', AnalysisResultSchema);
```

### 9.2 MongoDB Database Connection & Query Services (`services/database.ts`)

```typescript
import mongoose from 'mongoose';
import { JobDescriptionModel, AnalysisResultModel } from '../models';
import { JobDescription, AnalysisResult, Candidate } from '../types';

export class MongoDBService {
  // Establish connection to MongoDB
  static async connect(uri: string): Promise<void> {
    try {
      await mongoose.connect(uri);
      console.log('Connected to MongoDB successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  // Save a new Job Description
  static async saveJobDescription(job: Omit<JobDescription, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const doc = new JobDescriptionModel(job);
    const saved = await doc.save();
    return saved._id.toString();
  }

  // Save full Analysis Result session with embedded candidates
  static async saveAnalysisResult(result: Omit<AnalysisResult, 'id'>): Promise<string> {
    const doc = new AnalysisResultModel(result);
    const saved = await doc.save();
    return saved._id.toString();
  }

  // Query analysis session by ID with populated job details
  static async getAnalysisResult(id: string): Promise<AnalysisResult | null> {
    const doc = await AnalysisResultModel.findById(id).populate('job_description_id');
    return doc ? (doc.toObject() as unknown as AnalysisResult) : null;
  }

  // MongoDB Aggregation: Compute Recruiting Analytics across sessions
  static async getRecruitingAnalytics() {
    return await AnalysisResultModel.aggregate([
      {
        $group: {
          _id: null,
          totalEvaluations: { $sum: '$total_candidates' },
          totalRelevant: { $sum: '$relevant_candidates' },
          overallAvgScore: { $avg: '$average_score' },
          topPerformerCount: { $sum: '$top_candidates' }
        }
      }
    ]);
  }
}
```

### 9.3 Gemini AI Prompt Engine (`services/gemini.ts`)

```typescript
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export class GeminiService {
  static async analyzeResumes(jobDescription: string, resumeTexts: string): Promise<string> {
    if (!GEMINI_API_KEY) throw new Error('Gemini API key is not configured');

    const prompt = this.createAnalysisPrompt(jobDescription, resumeTexts);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private static createAnalysisPrompt(jobDescription: string, resumeTexts: string): string {
    return `# AI Resume Evaluation System
## Objective: Evaluate candidate resumes against the job description.

### Job Requirements:
${jobDescription}

### Candidate Resumes:
${resumeTexts}

### Weighting:
1. Technical Skills: 40%
2. Relevant Experience: 30%
3. Soft Skills & Communication: 20%
4. Education & Certifications: 10%

### Output Schema:
Return ONLY a valid JSON array matching this structure:
[
  {
    "candidate_name": "Full Name",
    "contact_info": { "email": "email@domain.com", "phone": "+1-xxx-xxx-xxxx" },
    "skills": ["skill1", "skill2"],
    "experience_years": 5,
    "education": "Degree in Field",
    "certifications": ["cert1"],
    "notable_companies": ["Company1"],
    "summary": "2-3 sentence summary",
    "matched_skills": ["skill1"],
    "missing_skills": ["missing1"],
    "match_score": 85,
    "recommendation": "Strong Hire / Hire / Consider / Reject with reasoning",
    "is_relevant": true,
    "issues_detected": ["issue1"],
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1"],
    "interview_questions": ["question1", "question2"],
    "salary_range": "Salary estimate",
    "hire_probability": 0.85
  }
]`;
  }
}
```

### 9.4 Client File Extraction Service (`services/fileProcessor.ts`)

```typescript
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export class FileProcessorService {
  static async extractText(file: File): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return this.extractFromPDF(file);
      case 'docx':
      case 'doc':
        return this.extractFromDOCX(file);
      case 'txt':
        return this.extractFromTXT(file);
      default:
        throw new Error(`Unsupported file type: .${extension}`);
    }
  }

  private static async extractFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText.trim();
  }

  private static async extractFromDOCX(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  }

  private static async extractFromTXT(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}
```

---

## 10. Testing

### 10.1 Unit Testing
- **File Parsing Unit Tests:** Validated text extraction against clean and multi-column PDF, DOCX, and TXT files.
- **AI Prompt & Response Validation:** Tested JSON sanitization and parsing with Gemini 2.5 Flash output strings.
- **Mongoose Schema Validation:** Verified required field constraints and score boundaries (0 <= `match_score` <= 100).

### 10.2 Integration Testing
- **File Processor -> Gemini Pipeline:** Verified that extracted multi-file resume text is combined and correctly scored.
- **API -> MongoDB Storage:** Verified end-to-end saving of session results and accurate retrieval by session ID.

### 10.3 Test Cases Table

| Test ID | Module | Input / Action | Expected Result | Status |
|---------|--------|----------------|-----------------|--------|
| TC-01 | File Parser | Upload valid PDF/DOCX/TXT | Text successfully extracted | Passed |
| TC-02 | File Parser | Upload corrupt / unsupported format | Error alert shown; non-blocking | Passed |
| TC-03 | AI Engine | Submit JD + 5 Resumes | Strict JSON array received with scores | Passed |
| TC-04 | MongoDB | Save session record via Mongoose | Document inserted with unique ObjectId | Passed |
| TC-05 | Aggregation | Execute analytics pipeline | Accurate totals and averages returned | Passed |
| TC-06 | Export | Click Export to CSV / JSON | Formatted file downloaded to client | Passed |

---

## 11. Future Scope

1. **Automated Candidate Outreach:** Automated email interview invitation dispatch based on candidate ranking.
2. **Multi-Model LLM Ensemble:** Support fallback analysis across Gemini, GPT-4, and Claude.
3. **Audio / Video Screening:** Integration of asynchronous video interview transcription and analysis.
4. **ATS Webhooks:** Bidirectional synchronization with enterprise ATS systems (Greenhouse, Lever, Workday).
5. **MongoDB Change Streams:** Real-time dashboard updates as batch resume ingestion completes in the background.

---

## 12. Conclusion

ResumeRanker Pro provides an end-to-end automated platform that transforms manual resume screening into an objective, AI-assisted process. By combining in-browser document parsing (PDF.js, Mammoth.js), Google Gemini 2.5 Flash semantic analysis, and MongoDB document persistence with Mongoose, the system achieves fast, reliable, and explainable candidate evaluations.

The architecture eliminates keyword-matching deficiencies, provides recruiters with actionable skill gap analysis, and maintains an auditable database of hiring sessions.

---

## 13. Bibliography & References

### Bibliography
1. *MongoDB: The Definitive Guide* by Shannon Bradshaw, Eoin Brazil, Kristina Chodorow (O'Reilly Media).
2. *Learning React: Modern Patterns for Developing React Applications* by Alex Banks and Eve Porcello.
3. *Node.js Design Patterns* by Mario Casciaro and Luciano Mammino.
4. *Google Generative AI Documentation* — Google AI Studio.

### References
- React Documentation: https://react.dev
- MongoDB Manual & Mongoose ODM: https://www.mongodb.com/docs & https://mongoosejs.com
- Google Gemini API Reference: https://ai.google.dev/api
- Mozilla PDF.js Project: https://mozilla.github.io/pdf.js
- TypeScript Documentation: https://www.typescriptlang.org
- Vite Build Tool: https://vitejs.dev

---
*End of Project Report*
