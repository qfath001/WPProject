# Course Advising Portal

A full-stack web application designed to streamline the course advising process for students and administrators.  
The portal provides **secure authentication**, **role-based dashboards**, **dynamic advising forms**, and **admin approval workflows**, making advising more efficient, reliable, and user-friendly.

---

##  Features
- **User Authentication & Security**
  - OTP-based registration and two-factor login verification
  - Password encryption and strong password rules
  - reCAPTCHA integration and clickjacking protection

- **Student Portal**
  - Dashboard with advising history and status tracking
  - Create and edit advising forms with prerequisites & course planning
  - Dynamic form validation to prevent duplicate or invalid course selections

- **Admin Portal**
  - Dashboard to view advising sheets by student, term, and status
  - Approve/reject advising forms with feedback
  - Automatic email notifications to students on status updates

- **System Enhancements**
  - Role-based access control (student vs admin)
  - Session-based authentication
  - Deployment on **Firebase (frontend)** and **Render (backend)**
  - Comprehensive testing using Mocha, Chai, and Supertest

---

##  Tech Stack
- **Frontend:** React.js, Material-UI  
- **Backend:** Node.js, Express.js  
- **Database:** MySQL  
- **Authentication & Email:** bcrypt, Nodemailer, Session-based auth  
- **Deployment:** Firebase Hosting (frontend), Render (backend)  
- **Testing:** Mocha, Chai, Supertest  

---

##  Project Structure
```
course-advising-portal/
 ├── frontend/        # React.js client
 ├── backend/         # Express.js server
 ├── database/        # MySQL schema & scripts
 ├── docs/            # Project reports
 └── README.md
```

---

##  Reports & Documentation
Detailed UI screenshots are available in the milestone reports:  

- [Milestone 1 Report](docs/Milestone1_Report_Fathima.pdf) – User authentication, OTP verification, 2FA, admin setup  
- [Milestone 2 Report](docs/Milestone_2_Report_Fatima.pdf) – Advising history, prerequisite management, dynamic forms, deployment  
- [Milestone 3 Report](docs/Milestone3_Report_Fathima.pdf) – Admin approvals, email notifications, security enhancements, testing  

---

##  Getting Started

### Prerequisites
- Node.js (v16+)  
- MySQL Database  
- Firebase account (for hosting frontend)  

### Setup Instructions
1. Clone the repository  
   ```bash
   git clone https://github.com/yourusername/course-advising-portal.git
   cd course-advising-portal
   ```

2. Install dependencies for backend & frontend  
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. Configure `.env` files for:
   - Database credentials
   - Firebase keys
   - Email service (Nodemailer)

4. Run backend  
   ```bash
   cd backend && npm start
   ```

5. Run frontend  
   ```bash
   cd frontend && npm start
   ```

---

## Author
**Quhura Fathima**  
[LinkedIn](https://www.linkedin.com/in/quhurafathima/) | [GitHub](https://github.com/qfath001)
