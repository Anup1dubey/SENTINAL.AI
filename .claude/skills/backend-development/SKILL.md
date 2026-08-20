---
name: backend-development
description: Build, modify, review, and test secure, modular Node.js and Express.js backends using MongoDB, Mongoose, JWT, bcrypt, and REST APIs. Use this skill for backend architecture, API development, authentication, database work, validation, security, testing, and backend integration.
---
\# Backend Development Skill — Hackathon MERN Backend



\## 1. ROLE



Act as a senior backend engineer responsible for building and maintaining a

production-quality hackathon backend.



Primary stack:



\- Node.js

\- Express.js

\- MongoDB

\- Mongoose

\- JWT

\- bcrypt

\- REST APIs



The backend must be:



\- Modular

\- Secure

\- Maintainable

\- Scalable enough for a hackathon project

\- Easy for another developer to understand

\- Easy for a React frontend to consume



Do not over-engineer the project.



\---



\# 2. CORE PRINCIPLE



Before writing code:



1\. Understand the requirement.

2\. Inspect the existing project structure.

3\. Inspect related models, routes, controllers, services and middleware.

4\. Determine how the requested feature fits into the existing architecture.

5\. Identify dependencies and possible side effects.

6\. Then implement the smallest clean solution.



Never blindly generate large amounts of code.



Never rewrite working code unnecessarily.



Never modify unrelated files.



\---



\# 3. ARCHITECTURE



Use a modular MVC + Service Layer architecture.



Recommended structure:



backend/

├── src/

│   ├── config/

│   │   └── db.js

│   │

│   ├── models/

│   │   ├── User.js

│   │   └── ...

│   │

│   ├── controllers/

│   │   ├── authController.js

│   │   └── ...

│   │

│   ├── services/

│   │   ├── authService.js

│   │   └── ...

│   │

│   ├── routes/

│   │   ├── authRoutes.js

│   │   └── ...

│   │

│   ├── middleware/

│   │   ├── authMiddleware.js

│   │   ├── errorMiddleware.js

│   │   └── ...

│   │

│   ├── utils/

│   │   └── ...

│   │

│   ├── validators/

│   │   └── ...

│   │

│   ├── app.js

│   └── server.js

│

├── tests/

├── .env

├── .env.example

├── package.json

└── README.md



Follow the existing project structure if it differs, unless there is a strong

technical reason to change it.



\---



\# 4. RESPONSIBILITY OF EACH LAYER



\## Routes



Routes should:



\- Define HTTP endpoints.

\- Connect endpoints to middleware and controllers.

\- Remain thin.

\- Never contain business logic.



Example:



POST /api/auth/login



should route to the appropriate controller.



\---



\## Controllers



Controllers should:



\- Receive HTTP requests.

\- Extract request data.

\- Call services.

\- Return HTTP responses.



Controllers should NOT contain complex business logic.



Avoid putting database queries and large business rules directly inside

controllers.



\---



\## Services



Services contain business logic.



Examples:



\- Creating users

\- Processing requests

\- Assigning resources

\- Calculating priorities

\- Checking permissions

\- Calling external services



Keep business logic inside services whenever practical.



\---



\## Models



Mongoose models should:



\- Define database schemas.

\- Define validation rules where appropriate.

\- Define indexes where useful.

\- Define relationships/references when necessary.



Do not put unrelated business logic inside models.



\---



\## Middleware



Middleware should handle cross-cutting concerns such as:



\- Authentication

\- Authorization

\- Error handling

\- Request validation

\- Logging

\- Rate limiting where appropriate



\---



\# 5. API DESIGN



Use RESTful API conventions.



Use appropriate HTTP methods:



GET

POST

PUT

PATCH

DELETE



Use meaningful endpoint names.



Prefer:



GET /api/users/:id



instead of:



GET /api/getUser



Prefer:



POST /api/requests



instead of:



POST /api/createRequest



Use plural resource names where appropriate.



Group APIs using prefixes:



/api/auth

/api/users

/api/requests

/api/ngos

/api/admin



\---



\# 6. HTTP STATUS CODES



Use correct HTTP status codes.



200 — Successful request



201 — Resource successfully created



204 — Successful request with no response body



400 — Bad request



401 — Authentication required / invalid authentication



403 — Authenticated but not authorized



404 — Resource not found



409 — Conflict



422 — Validation error when appropriate



429 — Too many requests



500 — Internal server error



Do not return 200 for every situation.



\---



\# 7. RESPONSE FORMAT



Use consistent JSON responses.



Success example:



{

&#x20; "success": true,

&#x20; "message": "Request created successfully",

&#x20; "data": {}

}



Error example:



{

&#x20; "success": false,

&#x20; "message": "Invalid request",

&#x20; "error": "REQUEST\_VALIDATION\_FAILED"

}



Keep response structures consistent across the API.



Do not expose unnecessary internal implementation details.



\---



\# 8. DATABASE — MONGODB



Use MongoDB with Mongoose.



Before creating a new collection:



1\. Understand the entity.

2\. Determine relationships.

3\. Determine required fields.

4\. Determine optional fields.

5\. Determine indexes.

6\. Consider how the frontend will query the data.



Use appropriate Mongoose types.



Use:



\- required

\- enum

\- default

\- minlength

\- maxlength

\- min

\- max

\- unique where appropriate



Do not blindly use `unique: true` as a replacement for proper validation.



Use indexes when they provide meaningful query performance benefits.



Avoid unnecessary indexes.



\---



\# 9. DATABASE DESIGN PRINCIPLES



Prefer normalized and understandable schemas.



Use references when entities are naturally separate.



Example:



User

Request

NGO

Organization



Do not duplicate large amounts of data unnecessarily.



However, do not over-normalize simple hackathon data.



Choose the simplest design that satisfies the requirements.



\---



\# 10. AUTHENTICATION



Use:



\- bcrypt for password hashing

\- JWT for authentication



Never store plaintext passwords.



Never return passwords in API responses.



Never hardcode:



\- JWT secrets

\- database credentials

\- API keys

\- private credentials



Use environment variables.



Example:



JWT\_SECRET=...

MONGO\_URI=...



Use `.env.example` to document required variables without exposing secrets.



\---



\# 11. JWT



JWT authentication should follow this general flow:



Registration:



User

↓

Validate input

↓

Hash password

↓

Save user

↓

Return appropriate response



Login:



Credentials

↓

Validate input

↓

Find user

↓

Compare password

↓

Generate JWT

↓

Return token



Protected request:



Client

↓

Authorization header

↓

JWT middleware

↓

Verify token

↓

Identify user

↓

Controller

↓

Service

↓

Database



Use:



Authorization: Bearer <token>



Do not trust user IDs sent by the client when the authenticated identity

already exists in the JWT.



\---



\# 12. AUTHORIZATION



Authentication answers:



"Who are you?"



Authorization answers:



"What are you allowed to do?"



Implement role-based authorization when the project requires different

permissions.



Example roles:



\- user

\- ngo

\- admin



Do not rely only on frontend restrictions.



Important permissions must be enforced on the backend.



\---



\# 13. INPUT VALIDATION



Never blindly trust client input.



Validate:



\- required fields

\- types

\- string lengths

\- enums

\- IDs

\- email format

\- numeric ranges

\- allowed values



Validation should happen before performing important business operations.



Reject malformed input early.



\---



\# 14. ERROR HANDLING



Use centralized error handling.



Do not duplicate large try/catch blocks unnecessarily.



Errors should:



\- Have meaningful messages.

\- Use appropriate status codes.

\- Avoid exposing secrets.

\- Avoid exposing stack traces in production.

\- Be predictable for the frontend.



Example architecture:



Route

↓

Controller

↓

Service

↓

Error

↓

Central error middleware

↓

JSON response



\---



\# 15. SECURITY



Always consider:



\- Password hashing

\- JWT security

\- Environment variables

\- Input validation

\- Authorization

\- NoSQL injection

\- Rate limiting where appropriate

\- CORS configuration

\- Secure HTTP headers

\- Sensitive data exposure

\- File upload validation if applicable



Never:



\- Commit `.env`

\- Hardcode secrets

\- Return password hashes

\- Trust client-provided roles

\- Allow users to modify resources they do not own

\- Expose database errors directly to users



Use security middleware such as Helmet where appropriate.



\---



\# 16. CORS



Configure CORS intentionally.



During development, allow the known frontend origin.



Do not blindly use:



origin: "\*"



for authenticated production APIs.



If credentials/cookies are used, configure CORS accordingly.



\---



\# 17. ENVIRONMENT VARIABLES



Use environment variables for configuration.



Examples:



PORT

MONGO\_URI

JWT\_SECRET

CLIENT\_URL

API\_KEY



Never hardcode secrets.



Maintain:



.env



and:



.env.example



The `.env.example` file must contain variable names but no real secrets.



\---



\# 18. DEPENDENCIES



Do not install a package unless it is actually necessary.



Before adding a dependency:



1\. Check whether the existing project already solves the problem.

2\. Consider whether the dependency is necessary.

3\. Prefer stable and widely used packages.

4\. Avoid unnecessary complexity.



Do not introduce a new framework or architectural pattern without reason.



\---



\# 19. API VALIDATION AND TESTING



Every newly created API should be tested.



For each endpoint verify:



\- Success case

\- Missing fields

\- Invalid fields

\- Unauthorized request

\- Forbidden request

\- Resource not found

\- Duplicate/conflict cases where applicable

\- Server/database failure behavior



Use Postman, curl, automated tests, or another suitable method.



\---



\# 20. TESTING MINDSET



Do not assume code works because it compiles.



After implementation:



1\. Start the server.

2\. Check for runtime errors.

3\. Test affected endpoints.

4\. Test authentication if involved.

5\. Test database operations.

6\. Test invalid input.

7\. Test authorization.

8\. Check response format.



If tests already exist, run the relevant tests.



Do not break existing functionality while fixing a new feature.



\---



\# 21. LOGGING



Use useful logs during development.



Logs should help identify:



\- Server startup

\- Database connection

\- Important failures

\- Unexpected errors



Do not log:



\- Passwords

\- JWT secrets

\- API keys

\- Sensitive user information



Avoid excessive console logging in production.



\---



\# 22. FILE UPLOADS



If file uploads are required:



\- Validate file type.

\- Validate file size.

\- Do not trust the extension alone.

\- Store files securely.

\- Avoid storing large files directly in MongoDB unless there is a specific

&#x20; reason.

\- Keep uploaded file handling separate from normal business logic.



\---



\# 23. EXTERNAL APIs / SERVICES



If an external API is required:



1\. Store credentials in environment variables.

2\. Create a dedicated service/module.

3\. Handle timeout/failure cases.

4\. Validate external responses.

5\. Do not expose external API keys to the frontend.

6\. Do not make the entire backend dependent on an external service without

&#x20;  considering failure behavior.



\---



\# 24. ML / AI INTEGRATION



If the hackathon requires an ML/AI model:



Do not unnecessarily put the ML model directly inside the Node.js backend.



Prefer:



React

↓

Node.js API

↓

ML/AI service

↓

Node.js

↓

MongoDB



when the model requires Python or another specialized runtime.



If using a pretrained external AI API:



React

↓

Node.js backend

↓

AI API



The frontend should not directly expose private API keys.



Keep AI/ML integration isolated inside a service.



\---



\# 25. PERFORMANCE



Do not prematurely optimize.



First prioritize:



1\. Correctness

2\. Security

3\. Maintainability

4\. Then performance



Avoid:



\- Unnecessary database queries

\- Fetching huge documents

\- Unbounded API responses

\- Repeated identical database calls



Use pagination for potentially large datasets.



Use `.select()` or projections when appropriate.



Use indexes for important query patterns.



\---



\# 26. CODE QUALITY



Write readable code.



Prefer:



\- Clear variable names

\- Small functions

\- Single responsibility

\- Reusable utilities

\- Consistent formatting

\- Consistent naming conventions



Avoid:



\- Giant controllers

\- Giant functions

\- Deeply nested logic

\- Duplicate code

\- Magic numbers

\- Hardcoded configuration



Do not optimize for fewer lines of code.



Optimize for clarity and correctness.



\---



\# 27. NAMING CONVENTIONS



Use consistent naming.



Examples:



Files:



authController.js

authService.js

authRoutes.js

authMiddleware.js



Functions:



registerUser()

loginUser()

getUserById()



Variables:



user

request

ngo

accessToken



Routes:



/api/auth

/api/users

/api/requests



Follow the existing project's convention if one already exists.



\---



\# 28. GIT SAFETY



Do not:



\- Delete unrelated files

\- Rewrite the entire project unnecessarily

\- Remove working functionality without reason

\- Modify frontend code unless explicitly requested

\- Modify configuration unrelated to the current task



Before making large changes:



Explain:



1\. What will change.

2\. Why it is required.

3\. Which files will be affected.

4\. Any risks.



Prefer small, reviewable changes.



\---



\# 29. WORKING WITH EXISTING CODE



When asked to implement a feature:



First inspect:



\- package.json

\- project structure

\- existing routes

\- existing controllers

\- existing services

\- existing models

\- middleware

\- environment configuration

\- relevant tests



Do not assume the project is empty.



Reuse existing utilities and patterns.



Do not create duplicate implementations of functionality that already exists.



\---



\# 30. FEATURE IMPLEMENTATION WORKFLOW



For every new feature follow this workflow:



\## Step 1 — Understand



Identify:



\- User story

\- Inputs

\- Outputs

\- Business rules

\- Authentication requirements

\- Authorization requirements

\- Database requirements



\## Step 2 — Inspect



Inspect existing related code.



\## Step 3 — Plan



Determine:



\- Model changes

\- Routes

\- Controllers

\- Services

\- Middleware

\- Validation

\- Tests



\## Step 4 — Implement



Implement the smallest complete solution.



\## Step 5 — Test



Test normal and failure cases.



\## Step 6 — Review



Check:



\- Security

\- Validation

\- Error handling

\- API consistency

\- Database efficiency

\- Code quality



\## Step 7 — Explain



Briefly explain:



\- What changed

\- Which files changed

\- How the feature works

\- How to test it



\---



\# 31. IMPORTANT CLAUDE CODE BEHAVIOR



When a task is ambiguous:



Do not invent major requirements.



Ask for clarification when the ambiguity could significantly affect architecture,

database design, security, or API behavior.



For small implementation details, make a reasonable engineering decision and

state the assumption.



Do not repeatedly ask for permission for trivial changes.



\---



\# 32. DO NOT OVER-ENGINEER



This is a hackathon project.



Do NOT introduce:



\- Microservices

\- Kubernetes

\- Event-driven architecture

\- Redis

\- Kafka

\- GraphQL

\- Complex design patterns

\- Repository abstractions

\- Multiple databases



unless the actual project requirements justify them.



Prefer:



Node.js

\+

Express

\+

MongoDB

\+

Mongoose

\+

JWT

\+

simple modular architecture



A simple working system is better than an unnecessarily complex system.



\---



\# 33. FRONTEND CONTRACT



The backend must expose a clear API contract for the React frontend.



For every API document:



\- Method

\- Endpoint

\- Authentication requirement

\- Request body

\- Query parameters

\- Path parameters

\- Success response

\- Error responses



Example:



POST /api/requests



Authentication:

Required



Request:



{

&#x20; "title": "Example",

&#x20; "description": "Example description"

}



Response:



{

&#x20; "success": true,

&#x20; "message": "Request created successfully",

&#x20; "data": {}

}



Keep frontend-backend contracts stable.



If an existing API needs to change, identify possible frontend impact first.



\---



\# 34. DOCUMENTATION



Maintain a useful README.



The README should eventually contain:



\- Project description

\- Tech stack

\- Installation

\- Environment variables

\- How to run

\- API overview

\- Authentication

\- Project structure

\- Important development commands



Keep documentation synchronized with the actual implementation.



\---



\# 35. WHEN BUILDING THE COMPLETE BACKEND



Do not generate the entire backend blindly in one step.



Use this order unless project requirements dictate otherwise:



1\. Analyze requirements

2\. Architecture

3\. Database design

4\. Project setup

5\. Authentication

6\. Authorization

7\. Core feature APIs

8\. Supporting features

9\. Validation

10\. Error handling

11\. Security

12\. Testing

13\. API documentation

14\. Final backend review



Complete and verify each major stage before moving to the next.



\---



\# 36. FINAL REVIEW CHECKLIST



Before declaring the backend complete, verify:



\- \[ ] Server starts successfully

\- \[ ] MongoDB connection works

\- \[ ] Environment variables are configured

\- \[ ] Authentication works

\- \[ ] Passwords are hashed

\- \[ ] JWT verification works

\- \[ ] Protected routes are protected

\- \[ ] Authorization is enforced

\- \[ ] Input validation exists

\- \[ ] Error handling is centralized

\- \[ ] API responses are consistent

\- \[ ] Database schemas are correct

\- \[ ] Important queries are indexed

\- \[ ] No secrets are committed

\- \[ ] CORS is configured correctly

\- \[ ] Security issues have been reviewed

\- \[ ] Core APIs have been tested

\- \[ ] README is updated

\- \[ ] Frontend API contract is documented

\- \[ ] Existing functionality still works



\---



\# 37. GOLDEN RULE



Build the simplest secure, modular and maintainable backend that satisfies

the actual hackathon requirements.



Do not add complexity just because it is technically possible.



Correctness > Security > Maintainability > Performance > Complexity.

