# Campus Placement Management Platform

A web-based placement management system designed to centralize campus recruitment workflows for students and placement administrators.

The platform provides student and administrative interfaces for managing placement profiles, browsing job opportunities, evaluating eligibility, tracking applications, and monitoring placement activity. The project combines a JavaScript frontend with a Node.js and Express backend and MongoDB for data persistence.

## Overview

Campus placement processes often rely on disconnected spreadsheets, forms, emails, and manual updates. These workflows make it difficult to maintain consistent student records, communicate placement opportunities, and track application progress.

The Campus Placement Management Platform aims to bring these activities into a single application with dedicated interfaces for students and administrators.

### Student Portal

The student portal supports the following workflows:

- Student registration and login
- Profile creation and management
- Academic information and skills management
- Browsing available job opportunities
- Checking eligibility based on branch and minimum CGPA
- Viewing job skill-match percentages
- Applying for eligible opportunities
- Tracking submitted applications and their statuses
- Viewing application summaries and upcoming deadlines

### Admin Portal

The admin portal provides administrative functionality for:

- Viewing placement dashboard statistics
- Monitoring registered students
- Viewing job and company counts
- Monitoring application counts
- Viewing branch-wise student distribution
- Managing student account access through blocking and unblocking

Availability of individual features depends on the corresponding frontend and backend implementation.

## Core Features

### Authentication and Access Control

- Student and administrator login interfaces
- Student registration
- JWT-based authentication support in the backend
- Authentication middleware for protected API operations
- Student account access management
- Logout functionality

Authentication verifies a user's identity, while authorization determines which operations that user is permitted to perform. Protected routes must enforce the appropriate access-control rules.

### Job Management

- Job listing and job information display
- Company, role, location, and compensation details
- Minimum CGPA and eligible branch requirements
- Required skills and skill-match calculations
- Eligibility evaluation
- Application submission for eligible jobs

### Student Profile Management

- Personal and academic information
- Branch and CGPA management
- Skills management
- Profile viewing and editing

### Application Tracking

- Viewing submitted applications
- Displaying company and job information
- Tracking application dates and statuses
- Summarizing application progress

### Administrative Dashboard

- Student, job, company, and application statistics
- Branch-wise student distribution
- Student account status monitoring
- Student blocking and unblocking operations

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Database ODM | Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| Configuration | dotenv |
| Middleware | Express middleware, CORS |
| Development tools | Git, GitHub, VS Code, Live Server, Nodemon |

## System Architecture

The application follows a modular client-server architecture.

```text
Frontend
  │
  │ HTTP requests / JSON
  ▼
Express API Server
  │
  ▼
Route Handlers
  │
  ▼
Authentication Middleware
  │
  ▼
Controllers
  │
  ▼
Mongoose Models
  │
  ▼
MongoDB
```

![System Architecture](C:/Users/tarun/Downloads/diagram%20(1).png)

### Architectural Responsibilities

- **Frontend:** Renders the user interface and sends API requests.
- **Express server:** Initializes the application, registers middleware, and mounts API routes.
- **Routes:** Map HTTP methods and paths to request handlers.
- **Authentication middleware:** Verifies JWTs for protected operations.
- **Controllers:** Handle request processing and business logic.
- **Models:** Define data structures and provide database access through Mongoose.
- **MongoDB:** Stores application data persistently.

The backend separates routing, business logic, and data access to improve maintainability and make individual components easier to extend.

## Repository Structure

```text
Campus-Placement-Management-Platform/
├── Backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── Middleware/
│   ├── models/
│   ├── Routes/
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   └── README.md
│
├── Frontend/
│   ├── admin/
│   ├── student/
│   ├── css/
│   ├── js/
│   ├── index.html
│   ├── login.html
│   └── register.html
│
└── README.md
```

The `Backend/README.md` file contains backend-specific architecture, configuration, and setup documentation.

## Getting Started

### Prerequisites

- Node.js and npm
- A MongoDB database, either local or hosted
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Tarun-Verma01/Campus-Placement-Management-Platform.git
cd Campus-Placement-Management-Platform
```

### 2. Configure the backend

```bash
cd Backend
npm install
```

Create a local `.env` file using the variable names expected by the backend source code. Typical configuration includes a MongoDB connection URI, a JWT signing secret, and a server port.

Do not commit `.env` or expose credentials in frontend code.

### 3. Start the backend

Use the npm script defined in `Backend/package.json`. For example, if configured:

```bash
npm run dev
```

The backend uses port `5000` by default in its current server configuration, unless overridden by the `PORT` environment variable.

### 4. Verify the API

When the server is running, open:

```text
http://localhost:5000/api/health
```

A successful response confirms that the health-check endpoint is responding.

### 5. Run the frontend

Open the frontend through a local development server, such as VS Code Live Server, and ensure its API requests point to the running backend.

The exact frontend startup procedure and API base URL depend on the current frontend configuration.

## API Overview

The backend registers the following route prefixes:

| Prefix | Purpose |
|---|---|
| `/api/jobs` | Job-related operations |
| `/api/students` | Student-related operations |
| `/api/applications` | Application-related operations |
| `/api/admin` | Administrative operations |
| `/api/health` | API health check |

Refer to the backend route files and controllers for the specific endpoints, supported HTTP methods, request formats, and authentication requirements.

## Security and Configuration

- Keep `.env` and secret keys out of version control.
- Validate request data before processing it.
- Protect restricted operations with authentication and appropriate authorization checks.
- Avoid returning sensitive information in API responses.
- Configure CORS according to the application's deployment environment.
- Use HTTPS and secure deployment settings in production.

## Development Workflow

The project uses Git and GitHub for version control and collaboration.

A typical contribution workflow is:

1. Update the local `main` branch.
2. Create a feature branch.
3. Implement and test the change.
4. Commit the relevant files.
5. Push the branch to GitHub.
6. Open a pull request against `main`.
7. Review and merge the pull request.

Keep changes focused and avoid committing generated dependencies, local configuration files, or secrets.

## Project Status

The project is being developed incrementally, with frontend functionality and backend API integration brought together in the shared repository.

The backend includes modular API routes, controllers, Mongoose models, database connectivity, and JWT authentication middleware. End-to-end behavior, route-level authorization, and deployment readiness should be confirmed through testing before the application is described as production-ready.

## Future Improvements

Potential areas for further development include:

- Automated API and integration tests
- Consistent request validation and error handling
- Comprehensive role-based authorization
- API documentation with endpoint schemas
- Centralized logging and monitoring
- Production deployment and environment-specific configuration

## License

Add a license if and when the project is distributed under a specific open-source or proprietary license.
