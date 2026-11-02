
# Hotel Management System

## Project Overview
The Hotel Management System is a web-based application developed for DBMS 1 and Systems Integration and Architecture (SIA). It manages hotel information such as guests, rooms, reservations, employees, services, and service orders.

## Technologies Used
- **Backend:** Node.js and Express.js
- **Database:** MySQL
- **API:** REST API
- **Version Control:** Git and GitHub
- **Frontend:** To be documented as implemented

## Features
- Guest Management
- Room Management
- Reservation Management
- Employee Management
- Hotel Service # Lumière Grand Hotel Management System

*Shining standard of elegance*

## Project Overview
The Lumière Grand Hotel Management System is a web-based application developed for **Database Management Systems 1 (DBMS 1)** and **Systems Integration and Architecture (SIA)**. It manages hotel operations such as guests, rooms, reservations, employees, hotel services, service orders, inventory, and billing.

The system connects a MySQL database to a Node.js and Express.js REST API (MVC structure), which is consumed by an HTML, CSS, and JavaScript frontend.

## Major Feature: Automatic Room Assignment and Availability Checking
When a reservation is made, the system checks room availability based on the selected room type, guest capacity, and reservation dates. It then automatically assigns an available room that meets the booking requirements. This prevents overlapping reservations and makes booking faster and more reliable.

## Technologies Used
| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js (MVC) |
| Database | MySQL |
| API | REST API (JSON) |
| Version Control | Git and GitHub |

## Features
- Guest Management and Reviews
- Room, Housekeeping, and Maintenance Management
- Reservation Management with Automatic Room Assignment
- Employee and Position Management
- Hotel Service and Service Order Management
- Inventory Management
- Billing and Payment Records
- SQL JOIN Reports

## Database Design
The system uses a relational MySQL database of **16 tables** with primary keys, foreign keys, and field validation.

### Entity Relationship Diagram
![ER Diagram](docs/erd.png)

### Database Script
The schema and sample data are in [`database/hotel_management.sql`](database/hotel_management.sql).

## Installation and Setup

### Requirements
- Node.js and npm
- MySQL Server
- Git

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/ortizrattanuel0601-coder/hotel-management-system-DBMS-final-project---group-5-section-D.git
   ```
2. Open the project folder in VS Code or a terminal.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the project root using the required environment variable names from the project configuration. Do not commit actual passwords or credentials.
5. Create the database and import the SQL script:
   ```bash
   mysql -u root -p -e "CREATE DATABASE hotel_management;"
   mysql -u root -p hotel_management < database/hotel_management.sql
   ```
6. Start the application:
   ```bash
   npm start
   ```
7. Open `http://localhost:1234` in your browser.

## API Endpoints

Main resources (each supports `GET`, `POST`, `PUT`/`PATCH`, and `DELETE`):

| Resource | Endpoint |
|---|---|
| Guests | `/api/guests` |
| Rooms | `/api/rooms` |
| Reservations | `/api/reservations` |
| Employees | `/api/employees` |
| Services | `/api/services` |
| Service Orders | `/api/service-orders` |

JOIN report endpoints (`GET`):

| Report | Endpoint | JOIN Type |
|---|---|---|
| Guest Reviews | `/api/reports/guest-reviews` | LEFT JOIN |
| Room Operations | `/api/reports/room-operations` | INNER + LEFT JOIN |
| Reservation Details | `/api/reports/reservation-details` | LEFT JOIN |
| Employee Positions | `/api/reports/employee-positions` | INNER JOIN |
| Service Orders | `/api/reports/service-orders` | INNER + LEFT JOIN |
| Invoice Payments | `/api/reports/invoice-payments` | LEFT JOIN |

## Team Members and Responsibilities

| Member | GitHub Username | Assigned Tables | Resource / Feature | JOIN Report (Endpoint) and Type | Feature Role |
|---|---|---|---|---|---|
| Palo Palo | [@crystalduenn](https://github.com/crystalduenn) | `guests`, `reviews` | Guest Management | Guest Review Report, `GET /api/reports/guest-reviews` (LEFT JOIN) | |
| Partosa | [@dwenwho](https://github.com/dwenwho) | `room`, `room_types`, `housekeeping_tasks`, `maintenance_requests` | Room & Housekeeping | Room Operations Report, `GET /api/reports/room-operations` (INNER + LEFT JOIN) | |
| Ricaplaza | [@aberyu67](https://github.com/aberyu67) | `reservations`, `reservation_rooms` | Reservation Management | Reservation Details Report, `GET /api/reports/reservation-details` (LEFT JOIN) | |
| Pontunila (DBMS 1) / Palmis (SIA) | [@jiyownn](https://github.com/jiyownn) (DBMS 1) / [@palmismarkjohnpaulm](https://github.com/palmismarkjohnpaulm) (SIA) | `employees`, `position` | Employee Management | Employee Position Report, `GET /api/reports/employee-positions` (INNER JOIN) | |
| Voluntad | [@elroyrabadon](https://github.com/elroyrabadon) | `services`, `service_orders`, `inventory_items`, `inventory_transactions` | Services & Inventory | Service Order Report, `GET /api/reports/service-orders` (INNER + LEFT JOIN) | |
| Ortiz | [@ortizrattanuel0601](https://github.com/ortizrattanuel0601) | `invoices`, `payments` | Billing & Payments | Invoice & Payment Report, `GET /api/reports/invoice-payments` (LEFT JOIN) | |

*Note: Pontunila (DBMS 1 only) and Palmis (SIA only) share the Employee Management slice, so the group has 6 working slots across the two courses.*

## Git Collaboration Rules
- Work on your own feature branch (e.g., `feature/name-purpose`).
- Commit from your own machine with clear messages (`feat:`, `fix:`, `docs:`, `refactor:`).
- Open a Pull Request to merge into `main`; nobody pushes directly to `main`.
- Have a teammate review each PR.
- Merge using **"Create a merge commit"** (no squash).
- Do not commit `.env`, database passwords, or `node_modules`.

## Project Status
Completed and ready for final submission.
- Service Order Management
- Reports using SQL JOIN queries

## Installation and Setup

### Requirements
- Node.js and npm
- MySQL Server
- Git

### Steps
1. Clone this repository.
2. Open the project folder in a terminal.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file using the required environment variable names from the project configuration. Do not commit database passwords or other secrets.
5. Create the project database in MySQL and import the provided database schema.
6. Start the application using the start command configured in `package.json`.
7. Open the API at `http://localhost:1234`.

## API Endpoints

| Resource | Endpoint |
|---|---|
| Guests | `/api/guests` |
| Rooms | `/api/rooms` |
| Reservations | `/api/reservations` |
| Employees | `/api/employees` |
| Services | `/api/services` |
| Service Orders | `/api/service-orders` |

## Team Members and Responsibilities

| Member | GitHub Username | Assigned Tables | Resource / Feature | JOIN Report |
|---|---|---|---|---|
| Member 1 | To be filled | `guests`, `reviews` | Guest Management | Guest Review Report |
| Member 2 | To be filled | `room`, `room_types`, `housekeeping_tasks`, `maintenance_requests` | Room & Housekeeping | Room Operations Report |
| Member 3 | To be filled | `reservations`, `reservation_rooms` | Reservation Management | Reservation Details Report |
| Member 4 | To be filled | `employees`, `position` | Employee Management | Employee Position Report |
| Member 5 | To be filled | `services`, `service_orders`, `inventory_items`, `inventory_transactions` | Services & Inventory | Service Order Report |
| Member 6 | To be filled | `invoices`, `payments` | Billing & Payments | Invoice & Payment Report |

## ER Diagram
<p align="center">
  <img src="er_diagram.png" alt="Hotel Management System ER Diagram" width="850">
</p>


## Git Collaboration Rules
- Work on your assigned feature branch.
- Make meaningful commits using clear commit messages.
- Push your feature branch to GitHub.
- Open a Pull Request to merge your changes into `main`.
- Do not commit `.env`, database passwords, or `node_modules`.

## Project Status
Backend API development and initial GitHub setup are in progress.
