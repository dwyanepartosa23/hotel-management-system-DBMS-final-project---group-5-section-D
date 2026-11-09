# Lumière Grand Hotel Management System

*Shining standard of elegance*

## Project Overview
The Lumière Grand Hotel Management System is a web-based application developed for **Database Management Systems 1 (DBMS 1)** and **Systems Integration and Architecture (SIA)**. It manages hotel operations such as guests, rooms, housekeeping, reservations, employees, hotel services, service orders, reviews, invoices, and billing.

The system connects a MySQL database to a Node.js and Express.js REST API (MVC structure), which is consumed by an HTML, CSS, and JavaScript frontend.

## Major Feature: Automatic Room Assignment and Availability Checking
When a reservation is made, the system checks room availability based on the selected room type, guest capacity, and reservation dates. It then automatically assigns an available room that meets the booking requirements. The guest, the reservation, and the assigned room are saved together in one database transaction, so a failed booking never leaves partial data. This prevents overlapping reservations and makes booking faster and more reliable.

## Management Feature: Room Records
A staff page (`/room-records.html`) shows every room as **Available** or **Occupied**. A room counts as occupied only while a guest is staying (today falls within the stay dates and the reservation is Confirmed or Checked-in). Staff can click a room to see the guest, the stay dates, and the service orders for that stay. An open order can be marked completed, or declined with a required comment, and the comment is stored with the order. The page reads from the existing tables (`rooms`, `reservations`, `reservation_rooms`, `guests`, `service_orders`), so occupancy is calculated on every request and never stored.

## Project Requirements and Current Status

**Requirements.** Under the course guidelines, each member must own at least two tables, one complete resource (GET, POST, PUT/PATCH and DELETE through a model, controller and route), one join report, and one frontend screen that uses their own endpoints. A group of six needs at least 16 tables, and the group's join reports must include INNER, LEFT/RIGHT and FULL OUTER joins (in MySQL, FULL OUTER is a LEFT JOIN combined with a RIGHT JOIN using UNION). The system also needs one unique major feature that goes beyond basic CRUD. Every member must have commits of their own, made from their own GitHub account and merged through pull requests, because the individual grade rests on the Git history and on explaining one's own code at the defense. The repository must also contain this README with the ownership matrix, the SQL script, the ER diagram, an endpoint list, and a `.env.example` file.

**Current status.** The database has 16 tables and 1 view with primary and foreign keys. The Node.js and Express backend follows the MVC structure, with models, controllers and routes for guests, rooms, housekeeping, reservations, employees, services, service orders, invoices, reviews, reports, and room records. The frontend has pages for the home page, rooms, reservations, services, employees, housekeeping, invoices, room records, about us, and contact. The major feature (automatic room assignment) and the Room Records management page are implemented. Work still in progress: the maintenance requests resource, the FULL OUTER join report, the ER diagram image in `docs/`, the `.env.example` file, and a frontend screen for each member's own endpoints where one is still missing.

## Technologies Used
| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js (MVC) |
| Database | MySQL |
| API | REST API (JSON) |
| Version Control | Git and GitHub |

## Features
- Guest and Review Management
- Room, Housekeeping, and Maintenance Management
- Reservation Management with Automatic Room Assignment
- Employee Management
- Hotel Service and Service Order Management
- Invoice Generation from Reservation Data (stay dates, room rates, and services)
- Room Records for staff (occupancy, service orders, declines)
- SQL JOIN Reports

## Database Design
The system uses a relational MySQL database of **16 tables and 1 view** (`unpaid_invoices`), with primary keys, foreign keys, and field validation. The `service_orders` table includes `decline_comment` and `declined_at` columns, used by the Room Records page.

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
4. Create a `.env` file in the project root with these settings. Use your own MySQL login, and never commit this file:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=mydb
   PORT=1234
   ```
   `DB_PORT` is the MySQL port (usually 3306). `PORT` is the website's port.
5. Create the database and import the SQL script:
   ```bash
   mysql -u root -p -e "CREATE DATABASE mydb;"
   mysql -u root -p mydb < database/hotel_management.sql
   ```
6. Start the application:
   ```bash
   npm start
   ```
7. Open `http://localhost:1234` in your browser.

## Pages
| Page | Address |
|---|---|
| Home | `/index.html` |
| Rooms & Suites | `/rooms.html` |
| Reservations | `/reservations.html` |
| Services | `/services.html` |
| Employees | `/employees.html` |
| Housekeeping | `/housekeeping.html` |
| Invoices | `/invoices.html` |
| Room Records (staff) | `/room-records.html` |
| About Us | `/about.html` |
| Contact | `/contact.html` |

## API Endpoints

Main resources:

| Resource | Endpoint |
|---|---|
| Guests | `/api/guests` |
| Rooms | `/api/rooms` |
| Housekeeping | `/api/housekeeping` |
| Reservations | `/api/reservations` |
| Employees | `/api/employees` |
| Services | `/api/services` |
| Service Orders | `/api/service-orders` |
| Invoices | `/api/invoices` |
| Reviews | `/api/reviews` |
| Room Records | `/api/room-records` |
| Maintenance Requests | `[/api/maintenance (add when built)]` |

Additional endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/invoices/guests` | Guests that have reservations |
| GET | `/api/invoices/guests/:id/reservations` | Reservations of one guest |
| POST | `/api/invoices/calculate` | Calculate a bill from a reservation (nothing saved) |
| GET | `/api/room-records` | Every room with its occupancy and current or next guest |
| GET | `/api/room-records/:roomId/orders` | Service orders for the room's current or next stay |
| PATCH | `/api/room-records/order/:orderId/served` | Mark an open order as completed |
| PATCH | `/api/room-records/order/:orderId/decline` | Decline an open order (body: `reason`, required) |

JOIN report endpoints (`GET`):

| Report | Endpoint | JOIN Type |
|---|---|---|
| Guest Reviews | `/api/reports/guest-reviews` | LEFT JOIN |
| Room Operations | `/api/reports/room-operations` | INNER + LEFT JOIN |
| Reservation Details | `/api/reports/reservation-details` | LEFT JOIN |
| Employee Positions | `/api/reports/employee-positions` | INNER JOIN |
| Service Orders | `/api/reports/service-orders` | INNER + LEFT JOIN |
| Invoice Payments | `/api/reports/invoice-payments` | LEFT JOIN |
| Room Records | `/api/room-records` | LEFT JOINs |
| Full list of guests and reviews | `[/api/reports/... (add when built)]` | FULL OUTER (LEFT JOIN UNION RIGHT JOIN) |

## Team Members and Responsibilities

| Member | GitHub Username | Assigned Tables | Resource / Feature | JOIN Report (Endpoint) and Type | Feature Role |
|---|---|---|---|---|---|
| Palo Palo | [@crystalduenn](https://github.com/crystalduenn) | `guests`, `reviews` | Reviews | Guest Review Report, `GET /api/reports/guest-reviews` (LEFT JOIN) | |
| Partosa | [@dwyanepartosa23](https://github.com/dwyanepartosa23) | `rooms`, `room_types`, `housekeeping_tasks` | Rooms and Housekeeping | Room Operations Report, `GET /api/reports/room-operations` (INNER + LEFT JOIN) | Availability check (`findAvailableRoom`) |
| Ricaplaza | [@aberyu67](https://github.com/aberyu67) | `reservations`, `reservation_rooms` | Reservations | Reservation Details Report, `GET /api/reports/reservation-details` (LEFT JOIN) | Booking workflow and automatic room assignment |
| Pontunila | [@jiyownn](https://github.com/jiyownn) | `employees`, `position` | Employees, About Us | Employee Position Report, `GET /api/reports/employee-positions` (INNER JOIN) | |
| Elroy | [@elroyrabadon](https://github.com/elroyrabadon) | `services`, `service_orders`, `inventory_transactions` | Services and Service Orders | Service Order Report, `GET /api/reports/service-orders` (INNER + LEFT JOIN) | |
| Palmis | [@palmismarkjohnpaulm](https://github.com/palmismarkjohnpaulm) | `invoices`, `payments` | Invoices | Invoice and Payment Report, `GET /api/reports/invoice-payments` (LEFT JOIN) | |
| Ortiz | [@ortizrattanuel0601](https://github.com/ortizrattanuel0601) | `maintenance_requests`, `inventory_items` | Room Records (staff management) and Maintenance Requests | Room Records query, `GET /api/room-records` (LEFT JOINs) | Room occupancy rule and service-order decline |

*Development note: this project was built together on one shared laptop. As agreed with our instructor, each member then committed their own parts from their own GitHub account. Pontunila is on the DBMS 1 roster and Palmis on the SIA roster.*

## Git Collaboration Rules
- Work on your own feature branch (e.g., `feature/name-purpose`).
- Commit from your own laptop with clear messages (`feat:`, `fix:`, `docs:`, `refactor:`).
- Open a Pull Request to merge into `main`; nobody pushes directly to `main`.
- Have a teammate review each PR.
- Merge using **"Create a merge commit"** (no squash).
- Do not commit `.env`, database passwords, or `node_modules`.

## Project Status
In final testing. Final submission pending.