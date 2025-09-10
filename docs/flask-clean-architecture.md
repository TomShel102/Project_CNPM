# Mentor Booking System - Clean Architecture

```bash
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
```