# Campus Placement Management Platform — Backend

## 1. Overview

The backend of the Campus Placement Management Platform provides the API layer responsible for managing placement-related data and handling communication between the frontend and the database.

It is built using **Node.js, Express.js, and MongoDB**, with Mongoose for database interaction and JWT-based authentication middleware for securing protected operations.

The backend follows a modular architecture that separates routing, business logic, database models, authentication, and database connectivity. This separation makes the application easier to maintain, debug, and extend.

### Key responsibilities

- Manage placement opportunities and job listings.
- Handle student-related operations.
- Manage job applications.
- Provide administrative API functionality.
- Connect to MongoDB and perform database operations.
- Support JWT-based authentication for protected routes.
- Expose REST API endpoints for the frontend.

## 2. Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime for the backend |
| Express.js | HTTP server and API routing |
| MongoDB | NoSQL database |
| Mongoose | Database schemas, models, and queries |
| JSON Web Tokens (JWT) | Authentication for protected operations |
| dotenv | Load environment variables |
| CORS | Allow requests from permitted frontend origins |
| Nodemon | Restart the server automatically during development |

## 3. Project Structure

```text
Backend/
├── config/
│   └── db.js
├── controllers/
│   ├── adminController.js
│   ├── applicationController.js
│   ├── jobController.js
│   └── studentController.js
├── Middleware/
│   └── authMiddleware.js
├── models/
│   ├── Application.js
│   ├── Job.js
│   └── Student.js
├── Routes/
│   ├── admin.routes.js
│   ├── applications.routes.js
│   ├── jobs.routes.js
│   └── students.routes.js
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
└── README.md
```

### Directory and file responsibilities

**`server.js`**

The application entry point. It loads environment variables, initializes Express, enables JSON request parsing and CORS, registers API routes, defines the health-check endpoint, connects to the database, and starts the HTTP server.

**`config/db.js`**

Contains the MongoDB connection logic. Database connectivity is handled separately from the server configuration so the application can establish its database connection before accepting requests.

**`models/`**

Defines the Mongoose models used to represent application data:

- `Student.js`: student data.
- `Job.js`: job listing data.
- `Application.js`: job application data.

Models define the data structures and provide the interface used to interact with MongoDB.

**`controllers/`**

Contains the request-handling and business-logic functions:

- `jobController.js`: job-related operations.
- `studentController.js`: student-related operations.
- `applicationController.js`: application-related operations.
- `adminController.js`: administrative operations.

Controllers receive requests from routes, execute the relevant logic, interact with models when required, and return HTTP responses.

**`Routes/`**

Defines the API endpoints and connects them to the appropriate controllers:

- `jobs.routes.js`
- `students.routes.js`
- `applications.routes.js`
- `admin.routes.js`

Keeping routes separate from controllers avoids placing the entire application logic inside `server.js`.

**`Middleware/authMiddleware.js`**

Contains JWT authentication middleware used to verify authentication tokens on protected routes. It provides a reusable mechanism for checking authentication before allowing a request to proceed.

**`.gitignore`**

Excludes files and directories that should not be committed, including `.env` and `node_modules/`.

**`package.json` and `package-lock.json`**

Define the project's dependencies, npm scripts, and dependency versions.

## 4. Architecture

The backend follows a layered, modular architecture.

```text
┌──────────────────────────┐
│     Frontend Client      │
│ HTML, CSS and JavaScript │
└────────────┬─────────────┘
             │ HTTP / JSON
             ▼
┌──────────────────────────┐
│      Express Server      │
│        server.js         │
└────────────┬─────────────┘
             ▼
┌──────────────────────────┐
│       API Routes         │
│ Jobs, Students,          │
│ Applications, Admin      │
└────────────┬─────────────┘
             ▼
┌──────────────────────────┐
│ Authentication Middleware│
│ JWT verification where   │
│ required                 │
└────────────┬─────────────┘
             ▼
┌──────────────────────────┐
│       Controllers        │
│ Request handling and     │
│ business logic           │
└────────────┬─────────────┘
             ▼
┌──────────────────────────┐
│     Mongoose Models      │
│ Student, Job, Application│
└────────────┬─────────────┘
             ▼
┌──────────────────────────┐
│        MongoDB           │
│       Data Storage       │
└──────────────────────────┘
```

*Note: Authentication middleware is applied to routes that require it. Public routes may follow a shorter request path.*

### Why this architecture?

- **Separation of concerns:** each layer has a specific responsibility.
- **Maintainability:** changes to business logic do not require putting more code into the server entry point.
- **Reusability:** controllers and middleware can be reused across relevant routes.
- **Scalability:** additional modules and endpoints can be introduced without redesigning the entire application.
- **Testability:** individual controllers and route handlers can be tested separately.

## 5. Request and Response Workflow

A typical API request follows these steps:

1. **Frontend request:** The frontend sends an HTTP request to an API endpoint, optionally including a JSON request body and an authorization token.
2. **Express receives the request:** The server processes the request using its registered middleware.
3. **Route matching:** Express matches the URL and HTTP method to the appropriate route.
4. **Authentication:** If the endpoint is protected, JWT middleware verifies the supplied token before allowing the request to continue.
5. **Controller execution:** The corresponding controller validates or processes the request and performs the required business logic.
6. **Database interaction:** The controller uses a Mongoose model to read or modify MongoDB data when necessary.
7. **HTTP response:** The server returns a response to the frontend, typically containing JSON data or an error message.
8. **Frontend update:** The frontend processes the response and updates the user interface.

This flow keeps HTTP routing, authentication, business logic, and database operations organized into separate components.

## 6. API Route Organization

The following route prefixes are registered in `server.js`.

| Route prefix | Responsibility |
|---|---|
| `/api/jobs` | Job listing operations |
| `/api/students` | Student-related operations |
| `/api/applications` | Job application operations |
| `/api/admin` | Administrative operations |
| `/api/health` | Server health check |

The exact HTTP methods, endpoint paths, request fields, authentication requirements, and response formats are defined in the corresponding route files and controllers.

### Health Check

**Endpoint:** `GET /api/health`

**Purpose:** Confirms that the API server is responding.

Example response:

```json
{
  "success": true,
  "message": "PlacementHub API is running"
}
```

This endpoint checks server availability. It should not be treated as a complete verification that every database operation or protected endpoint is working correctly.

## 7. Authentication and Authorization

The backend includes JWT authentication middleware.

### Authentication workflow

1. A user authenticates through the relevant application endpoint.
2. A JWT is issued by the authentication flow.
3. The client sends the token in subsequent requests that require authentication.
4. Authentication middleware verifies the token.
5. If verification succeeds, the request proceeds to the next middleware or controller. Otherwise, the request is rejected.

A typical authorization header is:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Authentication vs. authorization

- **Authentication** verifies who is making the request.
- **Authorization** determines what that user is allowed to do.

JWT verification alone does not guarantee role-based authorization. Administrative and student-specific permissions must also be enforced by the relevant backend routes or controllers.

The actual protection applied to each endpoint should be verified in the route definitions.

## 8. Database Design

The application uses MongoDB for persistence and Mongoose to define and interact with its data models.

### Main models

**Student**

Represents student-related information used by the placement platform.

**Job**

Represents job opportunities published through the platform.

**Application**

Represents a student's application to a job opportunity.

These models form the core data entities of the placement workflow. Their schema definitions, validation rules, references, and other field-level details are maintained in the respective model files.

## 9. Installation and Setup

### Prerequisites

Install the following before running the backend:

- Node.js and npm.
- A MongoDB database, either local or hosted.
- Git, if cloning the repository.

### Step 1: Navigate to the backend

From the project root:

```bash
cd Backend
```

### Step 2: Install dependencies

```bash
npm install
```

This installs the dependencies specified in `package.json` and resolved by `package-lock.json`.

### Step 3: Configure environment variables

Create a local `.env` file inside the `Backend/` directory.

Add the environment variables expected by the database connection, authentication middleware, and server configuration.

For example, depending on the names used in the source code:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key
PORT=5000
```

**Important:** The variable names above must match those read by `config/db.js`, `Middleware/authMiddleware.js`, and `server.js`. Do not commit real credentials or secret keys to Git.

### Step 4: Start the server

Use the development or production command defined in `package.json`. For example, if the corresponding scripts are configured:

```bash
npm run dev
```

For a production-style start script, if configured:

```bash
npm start
```

The server is configured to use port `5000` by default unless the `PORT` environment variable overrides it.

### Step 5: Verify the server

Open the following endpoint in a browser or API client:

```text
http://localhost:5000/api/health
```

A successful response confirms that the health-check endpoint is responding.

## 10. Development Guidelines

When extending the backend, follow the existing architecture.

1. Define or update the relevant Mongoose model when the data structure changes.
2. Implement the required business logic in the appropriate controller.
3. Register the endpoint in the relevant route file.
4. Apply authentication middleware to endpoints that require it.
5. Enforce authorization and validate request data where required.
6. Return consistent HTTP status codes and JSON responses.
7. Test both successful requests and failure cases.
8. Update this README when API behavior, setup requirements, or architecture changes.

Avoid placing all route handlers and business logic directly in `server.js`.

## 11. Security Considerations

- Keep `.env` out of version control.
- Never expose database credentials or JWT secrets in frontend code.
- Validate and sanitize incoming request data where appropriate.
- Protect sensitive endpoints with authentication and authorization checks.
- Avoid returning passwords, secret values, or other sensitive information in API responses.
- Use appropriate CORS settings for the intended deployment environment.
- Handle database errors and failed requests without exposing internal implementation details.
- Use HTTPS when deploying the application in production.

## 12. Current Scope

This README documents the backend structure, technology stack, registered API route groups, request lifecycle, authentication concepts, and setup process.

The precise endpoint catalogue, individual request and response schemas, role permissions, and model field definitions should be documented from the actual route, controller, middleware, and model implementations. They should not be inferred solely from the folder structure.

---

**Campus Placement Management Platform**  
Backend documentation maintained alongside the backend source code.
