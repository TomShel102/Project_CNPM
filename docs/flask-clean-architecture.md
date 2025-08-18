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

## Domain Layer

### Core Business Models

**User Model** - Quản lý người dùng với role-based access
```python
class User:
    - id: int
    - username: str
    - email: str
    - password: str
    - full_name: str
    - role: UserRole (ADMIN/STUDENT/MENTOR)
    - phone: str
    - avatar_url: str
    - is_active: bool
    - created_at: datetime
    - updated_at: datetime
```

**Mentor Model** - Hồ sơ mentor với chuyên môn và lịch trình
```python
class Mentor:
    - id: int
    - user_id: int
    - bio: str
    - expertise_areas: List[str]
    - hourly_rate: int
    - max_sessions_per_day: int
    - status: MentorStatus (ACTIVE/INACTIVE/BUSY)
    - rating: float
    - total_sessions: int
    - created_at: datetime
    - updated_at: datetime
```

**Appointment Model** - Lịch hẹn giữa sinh viên và mentor
```python
class Appointment:
    - id: int
    - mentor_id: int
    - student_id: int
    - project_group_id: int
    - title: str
    - description: str
    - start_time: datetime
    - end_time: datetime
    - status: AppointmentStatus (PENDING/CONFIRMED/CANCELLED/COMPLETED/NO_SHOW)
    - points_required: int
    - points_used: int
    - meeting_url: str
    - notes: str
    - created_at: datetime
    - updated_at: datetime
```

**Wallet Model** - Quản lý điểm ví của sinh viên
```python
class Wallet:
    - id: int
    - user_id: int
    - balance: int
    - created_at: datetime
    - updated_at: datetime

class WalletTransaction:
    - id: int
    - wallet_id: int
    - amount: int
    - transaction_type: TransactionType (EARNED/SPENT/REFUNDED/BONUS)
    - description: str
    - appointment_id: int
    - created_at: datetime
```

### Repository Interfaces

**IMentorRepository** - Interface cho mentor data access
```python
- create(mentor: Mentor) -> Mentor
- get_by_id(mentor_id: int) -> Optional[Mentor]
- get_by_user_id(user_id: int) -> Optional[Mentor]
- get_all() -> List[Mentor]
- get_by_expertise(expertise: str) -> List[Mentor]
- get_available_mentors() -> List[Mentor]
- update(mentor: Mentor) -> Mentor
- delete(mentor_id: int) -> bool
- update_status(mentor_id: int, status: MentorStatus) -> bool
```

**IAppointmentRepository** - Interface cho appointment data access
```python
- create(appointment: Appointment) -> Appointment
- get_by_id(appointment_id: int) -> Optional[Appointment]
- get_by_mentor_id(mentor_id: int) -> List[Appointment]
- get_by_student_id(student_id: int) -> List[Appointment]
- get_by_project_group_id(group_id: int) -> List[Appointment]
- get_by_status(status: AppointmentStatus) -> List[Appointment]
- get_by_date_range(start_date: datetime, end_date: datetime) -> List[Appointment]
- get_conflicting_appointments(mentor_id: int, start_time: datetime, end_time: datetime) -> List[Appointment]
- update(appointment: Appointment) -> Appointment
- delete(appointment_id: int) -> bool
- update_status(appointment_id: int, status: AppointmentStatus) -> bool
```

## Services Layer

### MentorService - Business logic cho mentor management
```python
class MentorService:
    - create_mentor(user_id, bio, expertise_areas, hourly_rate, max_sessions_per_day)
    - get_mentor_by_id(mentor_id)
    - get_mentors_by_expertise(expertise)
    - get_available_mentors()
    - update_mentor_profile(mentor_id, bio, expertise_areas, hourly_rate, max_sessions_per_day)
    - update_mentor_status(mentor_id, status)
    - get_mentor_schedule(mentor_id, date)
    - is_mentor_available(mentor_id, start_time, end_time)
    - delete_mentor(mentor_id)
```

### AppointmentService - Business logic cho appointment booking
```python
class AppointmentService:
    - create_appointment(mentor_id, student_id, title, description, start_time, end_time, project_group_id)
    - get_appointment_by_id(appointment_id)
    - get_appointments_by_student(student_id)
    - get_appointments_by_mentor(mentor_id)
    - confirm_appointment(appointment_id)
    - cancel_appointment(appointment_id, cancelled_by_user_id)
    - complete_appointment(appointment_id)
    - get_available_slots(mentor_id, date, duration_hours)
```

## Infrastructure Layer

### Database Models (SQLAlchemy ORM)

**UserModel** -> `users` table
```python
class UserModel(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.STUDENT)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
```

**MentorModel** -> `mentors` table
```python
class MentorModel(Base):
    __tablename__ = 'mentors'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    bio = Column(String(500), nullable=True)
    expertise_areas = Column(JSON, nullable=True)
    hourly_rate = Column(Integer, nullable=False, default=0)
    max_sessions_per_day = Column(Integer, nullable=False, default=5)
    status = Column(SQLEnum(MentorStatus), nullable=False, default=MentorStatus.ACTIVE)
    rating = Column(Float, nullable=False, default=0.0)
    total_sessions = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
```

**AppointmentModel** -> `appointments` table
```python
class AppointmentModel(Base):
    __tablename__ = 'appointments'
    id = Column(Integer, primary_key=True)
    mentor_id = Column(Integer, ForeignKey('mentors.id'), nullable=False)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    project_group_id = Column(Integer, ForeignKey('project_groups.id'), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(SQLEnum(AppointmentStatus), nullable=False, default=AppointmentStatus.PENDING)
    points_required = Column(Integer, nullable=False, default=0)
    points_used = Column(Integer, nullable=False, default=0)
    meeting_url = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
```

### Repository Implementations

**MentorRepository** - Implements IMentorRepository
```python
class MentorRepository(IMentorRepository):
    def __init__(self):
        self.db: Session = session
    
    def create(self, mentor: Mentor) -> Mentor:
        # Create mentor in database
        # Return domain model
    
    def get_by_id(self, mentor_id: int) -> Optional[Mentor]:
        # Get mentor by ID from database
        # Return domain model or None
    
    def get_available_mentors(self) -> List[Mentor]:
        # Get all active mentors
        # Return list of domain models
```

**AppointmentRepository** - Implements IAppointmentRepository
```python
class AppointmentRepository(IAppointmentRepository):
    def __init__(self):
        self.db: Session = session
    
    def create(self, appointment: Appointment) -> Appointment:
        # Create appointment in database
        # Return domain model
    
    def get_conflicting_appointments(self, mentor_id: int, start_time: datetime, end_time: datetime) -> List[Appointment]:
        # Check for time conflicts
        # Return list of conflicting appointments
```

## API Controllers

### MentorController - HTTP endpoints cho mentor management
```python
@bp.route('/', methods=['GET'])
def get_mentors():
    # Get all mentors with filtering

@bp.route('/<int:mentor_id>', methods=['GET'])
def get_mentor(mentor_id):
    # Get mentor by ID

@bp.route('/', methods=['POST'])
def create_mentor():
    # Create new mentor profile

@bp.route('/<int:mentor_id>', methods=['PUT'])
def update_mentor(mentor_id):
    # Update mentor profile

@bp.route('/<int:mentor_id>/schedule', methods=['GET'])
def get_mentor_schedule(mentor_id):
    # Get mentor schedule for specific date

@bp.route('/<int:mentor_id>/status', methods=['PUT'])
def update_mentor_status(mentor_id):
    # Update mentor status
```

### AppointmentController - HTTP endpoints cho appointment booking
```python
@bp.route('/', methods=['POST'])
def create_appointment():
    # Create new appointment booking

@bp.route('/<int:appointment_id>', methods=['GET'])
def get_appointment(appointment_id):
    # Get appointment details

@bp.route('/student/<int:student_id>', methods=['GET'])
def get_student_appointments(student_id):
    # Get all appointments for a student

@bp.route('/mentor/<int:mentor_id>', methods=['GET'])
def get_mentor_appointments(mentor_id):
    # Get all appointments for a mentor

@bp.route('/<int:appointment_id>/confirm', methods=['PUT'])
def confirm_appointment(appointment_id):
    # Confirm an appointment

@bp.route('/<int:appointment_id>/cancel', methods=['PUT'])
def cancel_appointment(appointment_id):
    # Cancel appointment and refund points

@bp.route('/<int:appointment_id>/complete', methods=['PUT'])
def complete_appointment(appointment_id):
    # Mark appointment as completed

@bp.route('/mentor/<int:mentor_id>/available-slots', methods=['GET'])
def get_available_slots(mentor_id):
    # Get available time slots for mentor
```

## ORM Đã được triển khai trong Flask python 
Ánh xạ các class python --> Table CSDL

### Database Relationships
```python
# One-to-One: User -> Mentor
users.id = mentors.user_id

# One-to-Many: User -> Appointments (as student)
users.id = appointments.student_id

# One-to-Many: Mentor -> Appointments
mentors.id = appointments.mentor_id

# One-to-Many: User -> Wallet
users.id = wallets.user_id

# One-to-Many: Wallet -> WalletTransactions
wallets.id = wallet_transactions.wallet_id

# One-to-Many: Appointment -> WalletTransactions
appointments.id = wallet_transactions.appointment_id
```

### Key Features Implemented
- **Point-based Booking System**: Sinh viên sử dụng điểm ví để đặt lịch mentor
- **Expertise Matching**: Tìm kiếm mentor theo chuyên môn cụ thể
- **Schedule Management**: Kiểm tra xung đột lịch trình và slot khả dụng
- **Automatic Refunds**: Hoàn tiền điểm khi hủy lịch hẹn
- **Bidirectional Feedback**: Hệ thống đánh giá hai chiều giữa mentor và sinh viên
- **Project Group Support**: Hỗ trợ đặt lịch theo nhóm dự án 