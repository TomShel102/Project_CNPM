# Mentor Booking System - Clean Architecture

    ├── migrations
    ├── scripts
    │   └── run_postgres.sh
    ├── src
    │   ├── api
    │   │   ├── controllers
    │   │   │   ├── mentor_controller.py      # Mentor management endpoints
    │   │   │   ├── appointment_controller.py # Appointment booking endpoints
    │   │   │   ├── auth_controller.py        # Authentication endpoints
    │   │   │   └── todo_controller.py        # Legacy todo endpoints
    │   │   ├── schemas
    │   │   │   ├── user.py                   # User validation schemas
    │   │   │   └── todo.py                   # Todo validation schemas
    │   │   ├── middleware.py
    │   │   ├── responses.py
    │   │   └── requests.py
    │   ├── infrastructure
    │   │   ├── services
    │   │   │   └── ...  # External services (email, notifications)
    │   │   ├── databases
    │   │   │   ├── base.py                   # SQLAlchemy base
    │   │   │   ├── mssql.py                  # MSSQL configuration
    │   │   │   └── __init__.py               # Database initialization
    │   │   ├── repositories
    │   │   │   ├── mentor_repository.py      # Mentor data access
    │   │   │   ├── appointment_repository.py # Appointment data access
    │   │   │   ├── wallet_repository.py      # Wallet data access
    │   │   │   └── user_repository.py        # User data access
    │   │   └── models
    │   │   │   ├── user_model.py             # User database model
    │   │   │   ├── mentor_model.py           # Mentor database model
    │   │   │   ├── appointment_model.py      # Appointment database model
    │   │   │   ├── project_group_model.py    # Project group database model
    │   │   │   ├── wallet_model.py           # Wallet database model
    │   │   │   └── feedback_model.py         # Feedback database model
    │   ├── domain
    │   │   ├── constants.py
    │   │   ├── exceptions.py
    │   │   ├── models
    │   │   │   ├── user.py                   # User domain model
    │   │   │   ├── mentor.py                 # Mentor domain model
    │   │   │   ├── appointment.py            # Appointment domain model
    │   │   │   ├── project_group.py          # Project group domain model
    │   │   │   ├── wallet.py                 # Wallet domain model
    │   │   │   ├── feedback.py               # Feedback domain model
    │   │   │   ├── imentor_repository.py     # Mentor repository interface
    │   │   │   ├── iappointment_repository.py # Appointment repository interface
    │   │   │   ├── iwallet_repository.py     # Wallet repository interface
    │   │   │   └── ifeedback_repository.py   # Feedback repository interface
    │   ├── services
    │   │   ├── mentor_service.py             # Mentor business logic
    │   │   ├── appointment_service.py        # Appointment business logic
    │   │   ├── wallet_service.py             # Wallet business logic
    │   │   └── feedback_service.py           # Feedback business logic
    │   ├── app.py
    │   ├── config.py
    │   ├── cors.py
    │   ├── create_app.py
    │   ├── dependency_container.py
    │   ├── error_handler.py
    │   └── app_logging.py
# Mentor Booking System

A Flask-based Clean Architecture implementation for a Project Mentor Booking System designed to support research and software development projects in academic environments.

## Overview

The Mentor Booking System is built to facilitate the connection between students working on research projects and mentors with specific expertise areas. Students can book mentoring sessions using a point-based system, allowing for efficient resource allocation and quality mentorship.

## Features

### Core Functionality
- **User Management**: Support for Admin, Student, and Mentor roles
- **Mentor Profiles**: Detailed mentor profiles with expertise areas and hourly rates
- **Project Groups**: Student group management for collaborative projects
- **Appointment Booking**: Point-based booking system with automatic scheduling
- **Wallet System**: Point management for students to book mentors
- **Feedback System**: Bidirectional rating and review system
- **Schedule Management**: Real-time availability checking and slot management

### Key Actors
- **Students**: Register accounts, join project groups, manage wallet points, book mentors
- **Mentors**: Create profiles, set expertise areas, manage availability, conduct sessions
- **Admins**: System management, user oversight, analytics and reporting


## Domain Models

### Core Entities
- **User**: Base user entity with role-based access (Admin/Student/Mentor)
- **Mentor**: Extended user profile with expertise areas and availability
- **ProjectGroup**: Student group management for collaborative projects
- **Appointment**: Booking sessions between students and mentors
- **Wallet**: Point management system for students
- **Feedback**: Rating and review system

### Key Features
- **Point-based Booking**: Students use wallet points to book mentor sessions
- **Expertise Matching**: Find mentors by specific skills and knowledge areas
- **Schedule Management**: Real-time availability checking and conflict resolution
- **Automatic Refunds**: Point refunds for cancelled appointments
- **Rating System**: Bidirectional feedback between mentors and students

## API Endpoints

### Mentors
- `GET /api/mentors/` - Get all mentors with filtering
- `GET /api/mentors/{id}` - Get mentor details
- `POST /api/mentors/` - Create mentor profile
- `PUT /api/mentors/{id}` - Update mentor profile
- `GET /api/mentors/{id}/schedule` - Get mentor schedule
- `PUT /api/mentors/{id}/status` - Update mentor status

### Appointments
- `POST /api/appointments/` - Create new appointment
- `GET /api/appointments/{id}` - Get appointment details
- `GET /api/appointments/student/{id}` - Get student appointments
- `GET /api/appointments/mentor/{id}` - Get mentor appointments
- `PUT /api/appointments/{id}/confirm` - Confirm appointment
- `PUT /api/appointments/{id}/cancel` - Cancel appointment
- `PUT /api/appointments/{id}/complete` - Mark as completed
- `GET /api/appointments/mentor/{id}/available-slots` - Get available slots

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Flask-CleanArchitecture
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r src/requirements.txt
```

4. Run the application:
```bash
cd src
python app.py
```

5. Access the API:
- API Base URL: `http://localhost:6868`
- Swagger Documentation: `http://localhost:6868/docs`

## Database Setup

The system uses SQLite by default. Database tables are automatically created when the application starts.

### Key Tables
- `users` - User accounts and profiles
- `mentors` - Mentor-specific information
- `project_groups` - Student group management
- `appointments` - Booking sessions
- `wallets` - Point management
- `wallet_transactions` - Point transaction history
- `feedbacks` - Rating and reviews

## Usage Examples

### Creating a Mentor Profile
```bash
curl -X POST http://localhost:6868/api/mentors/ \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "bio": "Experienced software engineer with 10+ years in web development",
    "expertise_areas": ["Python", "Flask", "React", "Database Design"],
    "hourly_rate": 50,
    "max_sessions_per_day": 5
  }'
```

### Booking an Appointment
```bash
curl -X POST http://localhost:6868/api/appointments/ \
  -H "Content-Type: application/json" \
  -d '{
    "mentor_id": 1,
    "student_id": 2,
    "title": "Flask Architecture Review",
    "description": "Need help reviewing our Flask project structure",
    "start_time": "2024-01-15T10:00:00",
    "end_time": "2024-01-15T11:00:00",
    "project_group_id": 1
  }'
```

### Getting Available Slots
```bash
curl "http://localhost:6868/api/appointments/mentor/1/available-slots?date=2024-01-15&duration_hours=1.0"
```

## Configuration

Key configuration options in `config.py`:
- Database connection settings
- Application port and host
- Swagger documentation settings
- CORS configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following Clean Architecture principles
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support, please refer to the API documentation at `/docs` or create an issue in the repository. 
