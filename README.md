# Digital Peer Code Review System

Students submit Java code, a classmate is assigned to review it line by line, and teachers monitor progress.

| Layer    | Technology                                   |
| -------- | -------------------------------------------- |
| Frontend | React 18, Vite, Tailwind CSS, React Router   |
| Backend  | Java 25, Spring Boot 3, Spring Security, JPA |
| Database | MySQL 8                                      |

## Folder structure

```
digital-peer-code-review/
├── frontend/            React app (pages, components, services, context)
├── backend/             Spring Boot app (model, repository, service, controller, dto, config)
└── database/schema.sql  Reference SQL schema
```

## Run it

You need Node.js 18+ and JDK 25+. The backend Maven Wrapper downloads Maven 3.9.15 automatically.

**1. Backend** (port 8080)
```powershell
# Option A: Quick start with persistent H2 (from the workspace root)
cd backend
.\mvnw spring-boot:run
```

To use an already-running local MySQL server, stop the H2 backend and run this from the workspace root:
```powershell
.\scripts\start-existing-mysql.ps1
```
Enter the MySQL username and password at the local PowerShell prompts. The script does not save the password; it migrates the existing H2 rows into an empty `peer_review_db`, then starts the backend with MySQL.

For a project-managed MySQL server in Docker, run these from the workspace root in a separate terminal:
```powershell
.\scripts\setup-mysql.ps1
.\scripts\migrate-h2-to-mysql.ps1
.\scripts\start-backend-mysql.ps1
```
Docker Desktop requires hardware virtualization and the Windows Subsystem for Linux 2 (WSL 2) backend on Windows.
The default H2 database stores data in `backend/data/peer_review_db` so student and instructor accounts, submissions, reviews, comments, and notifications survive page refreshes and backend restarts. The database directory is ignored by Git. To use a different H2 file location, set `H2_DATABASE_URL` before starting the backend.

The MySQL setup creates random local credentials in the Git-ignored `.env` file and runs MySQL on port `3307`, avoiding conflicts with a locally installed MySQL service. Keep `.env` private. The migration command copies existing H2 records into an empty MySQL database and refuses to overwrite destination tables that contain data. Stop the H2 backend before migrating. After migration, use `scripts\start-backend-mysql.ps1` to start the API against MySQL.

For a public frontend, set `CORS_ORIGIN` to its exact origin. Multiple trusted origins can be comma-separated; do not use a wildcard for authenticated APIs.

H2 Web Console is available at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/peer_review_db`, User: `sa`, Password: *empty*; run the backend from its directory).
When using MySQL, the database `peer_review_db` and its tables are created automatically on first start.

**2. Frontend** (port 5173)
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. Vite forwards `/api` requests to port 8080.

## Deploy on Vercel

The repository is configured to deploy the React frontend and Spring Boot API as separate Vercel Container Runtime services in one Vercel project. The Container Runtime is currently in beta. MySQL must still run with a managed database provider; Vercel Marketplace can connect a provider to your project, but the database is not stored inside these containers.

### 1. Create the MySQL database

1. Create a Vercel account and import this GitHub repository as a project, using the repository root as the project root.
2. In the Vercel Marketplace, choose a managed MySQL provider and provision a database. Check the provider's current pricing and ensure Vercel workloads can connect to it without a fixed outbound IP allowlist.
3. Keep the database host, name, username, and password private. Do not put database credentials in frontend variables or commit them to Git.

### 2. Configure and deploy the app

1. Keep the project root at the repository root so Vercel can read `vercel.json` and build both services.
2. Set these project environment variables for the backend service:

   | Variable | Value |
   | --- | --- |
   | `SPRING_PROFILES_ACTIVE` | `prod,mysql` |
   | `DB_URL` | JDBC URL from your MySQL provider, such as `jdbc:mysql://HOST:PORT/DATABASE` |
   | `DB_USER` | Database username from the provider |
   | `DB_PASSWORD` | Database password from the provider |
   | `TEACHER_CODE` | A new private invite code of your choice |
   | `CORS_ORIGIN` | The Vercel production origin, for example `https://your-project.vercel.app` |

3. Deploy the project and inspect the frontend and backend service build/runtime logs in Vercel. The root `vercel.json` routes `/api/...` requests to Spring Boot and all other paths to the React frontend.
4. Open the Vercel production URL and test demo login, signup, submission, and review. Use the private `TEACHER_CODE` when registering any additional teacher.

The frontend uses same-origin `/api` URLs, so it does not need a public API URL or a `VITE_API_BASE_URL` setting for this deployment. Set `CORS_ORIGIN` to the exact production origin. Vercel preview URLs use different origins; they may need to be added to the comma-separated CORS allowlist if you want to test authenticated API calls on previews.

The production backend seeds the demo accounts when they are missing: `alice@university.edu`, `bob@university.edu`, and `prof@university.edu`, all with password `password123`. They are created only once; existing accounts are not modified. These are public, writable accounts—anyone who knows the credentials can sign in and change application data. Do not enable this on a deployment containing sensitive or real user data.

**3. Try it**
1. Register three students (Register page, role Student).
2. Register one teacher with the `TEACHER_CODE` you set.
3. Log in as student 1 and submit code. Another student is assigned automatically and gets a notification.
4. Log in as that student, open the review, click line numbers to comment, then submit feedback and a score.
5. Student 1 sees the feedback. The teacher sees progress under Reports.

## Java OOPS concepts used (backend `model` package)

| Concept            | Where                                                                    |
| ------------------ | ------------------------------------------------------------------------ |
| Abstraction        | `User` is abstract with `abstract getRole()`                             |
| Inheritance        | `Student` and `Teacher` extend `User` (one table, `role` discriminator)  |
| Polymorphism       | `getRole()` overridden in each subclass                                  |
| Encapsulation      | Private fields, getters only, state changes through methods              |
| Interface          | `Reviewable`, implemented by `Review`                                    |
| Exception handling | `Review.submitReview()` rejects empty feedback; `GlobalExceptionHandler` |

## REST API

| Method | Endpoint                        | Who             | Purpose                                   |
| ------ | ------------------------------- | --------------- | ----------------------------------------- |
| POST   | `/api/auth/register`            | anyone          | Register (teachers need the invite code)  |
| POST   | `/api/auth/login`               | anyone          | Check credentials, return the user        |
| GET    | `/api/submissions`              | logged in       | Own submissions (teacher: all)            |
| POST   | `/api/submissions`              | student         | Submit code and auto-assign a reviewer    |
| GET    | `/api/submissions/{id}`         | author, reviewer, teacher | View one submission             |
| POST   | `/api/submissions/{id}/assign`  | teacher         | Assign a reviewer (`?reviewerId=` optional) |
| GET    | `/api/reviews`                  | logged in       | Reviews assigned to you                   |
| GET    | `/api/reviews/{id}`             | author, reviewer, teacher | Code, comments and feedback     |
| POST   | `/api/reviews/{id}/comments`    | assigned reviewer | Add a line comment                      |
| PATCH  | `/api/reviews/{id}/submit`      | assigned reviewer | Submit feedback and score               |
| GET    | `/api/notifications`            | logged in       | Your notifications                        |
| PATCH  | `/api/notifications/read-all`   | logged in       | Mark all as read                          |
| GET    | `/api/teacher/reports`          | teacher         | Progress report                           |

Differences from the original plan: reviews are created automatically when code is submitted (or when a teacher assigns one), so there is no separate `POST /api/reviews`.

## Security notes

- Passwords are hashed with BCrypt. Roles and ownership are checked on the server.
- Teacher accounts need an invite code, so nobody can make themselves a teacher.
- Submitted code is only stored and displayed. It is never compiled or run.
- Login uses HTTP Basic over a stateless API, and the browser keeps the credentials in `sessionStorage` until log out. This is fine for a college project on localhost. Before deploying, serve over HTTPS and move to JWT or session cookies.
- Keep database passwords in environment variables, never in Git.

## Ideas for next steps

- Swap the code viewer for Monaco Editor.
- Add shadcn/ui components.
- Add unit tests for `Review` and the services.
- Add Flyway migrations instead of `ddl-auto=update`.
