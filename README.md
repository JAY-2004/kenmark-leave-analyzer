# Leave & Productivity Analyzer

A full-stack web application that analyzes employee attendance, leave usage, and productivity based on an uploaded Excel attendance sheet.  
The system follows predefined business rules for working hours, leave policy, and productivity calculation.

---

## Features

### Excel Attendance Upload
- Upload `.xlsx` files containing:
  - Employee Name
  - Date
  - In-Time
  - Out-Time
- Supports multiple employees and multiple months in a single file.

### Attendance & Leave Processing
- Calculates daily worked hours.
- Identifies leave days when in-time or out-time is missing.
- Applies business rules:
  - Monday–Friday: 8.5 hours
  - Saturday: 4 hours (half day)
  - Sunday: Off
  - 2 leaves allowed per employee per month.

### Productivity Calculation
- Productivity = (Actual Worked Hours / Expected Working Hours) × 100
- Worked hours are capped to expected hours to avoid inflated productivity.

### Dashboard & Monthly Analysis
- Overall summary per employee:
  - Total expected hours
  - Total worked hours
  - Leaves used
  - Productivity percentage
- Month-wise analysis using a dynamic month selector.
- Handles edge cases like months with no data.

---

## Tech Stack

### Frontend
- **Next.js (App Router)**
- **TypeScript**
- **Tailwind CSS**

### Backend
- **Next.js API Routes**
- **xlsx** library for Excel parsing

### Database
- **Prisma ORM**
- **MySQL**

> Note: For demo stability, attendance analytics are computed in-memory.  
> Database schema and persistence logic are implemented using Prisma ORM.

---

## 📂 Project Structure
kenmark-leave-analyzer/
├─ app/
│ ├─ page.tsx
│ └─ api/
│ └─ upload/
│ └─ route.ts
├─ prisma/
│ └─ schema.prisma
├─ sample-data/
│ └─ attendance.xlsx
├─ package.json
└─ README.md


---

## Business Rules Implemented

- Working Hours:
  - Monday to Friday: 10:00 AM – 6:30 PM (8.5 hours)
  - Saturday: 10:00 AM – 2:00 PM (4 hours)
  - Sunday: No working hours

- Leave Policy:
  - Missing attendance on a working day is treated as a leave
  - Each employee is allowed 2 leaves per month

- Productivity:
  - Calculated monthly and overall
  - Maximum productivity capped at 100%

---

## Sample Data

A sample Excel file is provided for testing:

The sample file includes:
- Three employees
- Multiple months (January and February 2024)
- Weekdays, Saturdays, Sundays, and leave scenarios

---

## Running the Project Locally

1. Install dependencies: npm install

2. Start the development server: npm run dev

3. Open the application: http://localhost:3000


---

## Deployment

The application is deployed using Vercel.

The live demo link will be provided in the submission form.

---

## Author

Jay Kanani  
NMIMS  
Intern Technical Assignment – Kenmark ITan Solutions


