# Simple Survey Web (`simple-survey-web`)

This is the frontend single-page web application (SPA) for the **Sky Survey Platform**, built using React, Vite, Bootstrap, and styled with a customized, premium brutalist design system using Vanilla CSS.

---

## ✨ Features

1. **📋 Survey Management (Admin)**: Create new surveys, update details, toggle survey statuses (Open/Closed), and delete surveys.
2. **❓ Question Management (Admin)**: Add questions to surveys, edit question contents, delete questions, and manage choices for single-choice and multiple-choice questions.
3. **💬 Dynamic Survey Form (Public)**:
   - Stepped wizard form (one question per step) with dynamic question injection from API.
   - Prev/Next navigation with step indicators and progress indicators.
   - Front-end validation for required questions (including file upload, multiple-choice, single-choice).
   - Stepped review page summarizing all responses before final submission.
   - Dynamic control rendering based on question types:
     - `text` (Short & Long text)
     - `single-choice` (Radio option lists)
     - `multiple-choice` (Checkbox option lists)
     - `certificate-upload` (PDF files only, drag-and-drop or file selector)
4. **📥 Response Management (Admin)**:
   - Browse submitted answers.
   - View pagination results.
   - **Filter by Email Address**: Search responses in real-time by entering a respondent's email. Uses a debounced input to query the API.
   - Displays plain-text email address (and supports backwards-compatibility fallback for pre-existing legacy hashes).
   - Safe download of uploaded certificate files.

---

## 🛠️ Technologies Used

- **React** (v19)
- **Vite** (Build tool and local dev server)
- **Bootstrap 5** (Layout grid utilities and form inputs overrides)
- **Vanilla CSS** (Custom theme system featuring high-contrast off-white, charcoal, and terracotta color tokens)

---

## 📋 Prerequisites

To run this application locally, you need:

1. **Node.js** (v18 or higher recommended)
2. **npm** (packaged with Node.js)
3. Running **Simple Survey API** server on `http://localhost:8080`.

---

## 🚀 Installation & Setup

1. **Install Dependencies**:
   Navigate to the frontend directory and run:
   ```bash
   npm install
   ```

---

## 🏃 Running Locally

To start the Vite development server:

```bash
npm run dev
```

Once started, open the local URL in your browser (typically `http://localhost:5173`).

---

## 📌 Assumptions Made

1. **Backend Integration**: The application assumes that the API server is reachable at `http://localhost:8080` (CORS is enabled on the server to permit requests).
2. **JWT Local Storage**: Admin users persist authentication JWT tokens in the browser's local storage upon logging in.
3. **Anonymity vs Plaintext Display**: The respondent's email is stored and displayed in plain text, making it visible to administrators to support searches, as requested by the client parameters.
4. **Stepped Questionnaire Flow**: The user interface hides the "Previous" button on the first step (the Email identification step) and validates each question before letting the user progress to the next step.
