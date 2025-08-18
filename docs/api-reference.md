# API Reference - Mentor Booking System

## Tổng quan

API của Mentor Booking System cung cấp các endpoint để quản lý mentor, đặt lịch hẹn, quản lý ví điểm và đánh giá. Tất cả responses đều theo format JSON.

## Base URL

```
http://localhost:6868
```

## Authentication

Hiện tại API chưa có authentication. Trong tương lai sẽ sử dụng JWT tokens.

## Response Format

Tất cả API responses đều theo format:

```json
{
  "success": true/false,
  "data": {...},
  "message": "Description message"
}
```

## Error Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## Mentor Endpoints

### 1. Get All Mentors

**GET** `/api/mentors/`

Lấy danh sách tất cả mentor với optional filtering.

**Query Parameters:**
- `expertise` (string, optional): Lọc theo chuyên môn
- `available_only` (boolean, optional): Chỉ lấy mentor có sẵn

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "bio": "Experienced software engineer",
      "expertise_areas": ["Python", "Flask", "React"],
      "hourly_rate": 50,
      "max_sessions_per_day": 5,
      "rating": 4.5,
      "total_sessions": 25,
      "status": "active",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ],
  "message": "Found 1 mentors"
}
```

### 2. Get Mentor by ID

**GET** `/api/mentors/{id}`

Lấy thông tin chi tiết của một mentor.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "bio": "Experienced software engineer",
    "expertise_areas": ["Python", "Flask", "React"],
    "hourly_rate": 50,
    "max_sessions_per_day": 5,
    "rating": 4.5,
    "total_sessions": 25,
    "status": "active",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  },
  "message": "Mentor found successfully"
}
```

### 3. Create Mentor

**POST** `/api/mentors/`

Tạo hồ sơ mentor mới.

**Request Body:**
```json
{
  "user_id": 1,
  "bio": "Experienced software engineer with 10+ years in web development",
  "expertise_areas": ["Python", "Flask", "React", "Database Design"],
  "hourly_rate": 50,
  "max_sessions_per_day": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 1,
    "bio": "Experienced software engineer with 10+ years in web development",
    "expertise_areas": ["Python", "Flask", "React", "Database Design"],
    "hourly_rate": 50,
    "max_sessions_per_day": 5,
    "status": "active"
  },
  "message": "Mentor profile created successfully"
}
```

### 4. Update Mentor

**PUT** `/api/mentors/{id}`

Cập nhật thông tin mentor.

**Request Body:**
```json
{
  "bio": "Updated bio information",
  "expertise_areas": ["Python", "Flask", "React", "Vue.js"],
  "hourly_rate": 60,
  "max_sessions_per_day": 6
}
```

### 5. Get Mentor Schedule

**GET** `/api/mentors/{id}/schedule`

Lấy lịch trình của mentor cho một ngày cụ thể.

**Query Parameters:**
- `date` (string, required): Ngày theo format YYYY-MM-DD

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "start_time": "2024-01-15T10:00:00",
      "end_time": "2024-01-15T11:00:00",
      "status": "confirmed",
      "title": "Flask Architecture Review"
    }
  ],
  "message": "Schedule for 2024-01-15"
}
```

### 6. Update Mentor Status

**PUT** `/api/mentors/{id}/status`

Cập nhật trạng thái mentor.

**Request Body:**
```json
{
  "status": "busy"
}
```

**Status Values:**
- `active` - Có thể nhận lịch hẹn
- `inactive` - Không hoạt động
- `busy` - Bận, không nhận lịch mới

---

## Appointment Endpoints

### 1. Create Appointment

**POST** `/api/appointments/`

Tạo lịch hẹn mới với mentor.

**Request Body:**
```json
{
  "mentor_id": 1,
  "student_id": 2,
  "title": "Flask Architecture Review",
  "description": "Need help reviewing our Flask project structure",
  "start_time": "2024-01-15T10:00:00",
  "end_time": "2024-01-15T11:00:00",
  "project_group_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "mentor_id": 1,
    "student_id": 2,
    "project_group_id": 1,
    "title": "Flask Architecture Review",
    "description": "Need help reviewing our Flask project structure",
    "start_time": "2024-01-15T10:00:00",
    "end_time": "2024-01-15T11:00:00",
    "status": "pending",
    "points_required": 50,
    "points_used": 50,
    "meeting_url": null,
    "notes": null
  },
  "message": "Appointment booked successfully"
}
```

### 2. Get Appointment by ID

**GET** `/api/appointments/{id}`

Lấy thông tin chi tiết lịch hẹn.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "mentor_id": 1,
    "student_id": 2,
    "project_group_id": 1,
    "title": "Flask Architecture Review",
    "description": "Need help reviewing our Flask project structure",
    "start_time": "2024-01-15T10:00:00",
    "end_time": "2024-01-15T11:00:00",
    "status": "confirmed",
    "points_required": 50,
    "points_used": 50,
    "meeting_url": "https://meet.google.com/abc-defg-hij",
    "notes": "Please prepare your code for review",
    "created_at": "2024-01-10T09:00:00",
    "updated_at": "2024-01-10T09:00:00"
  },
  "message": "Appointment found successfully"
}
```

### 3. Get Student Appointments

**GET** `/api/appointments/student/{student_id}`

Lấy tất cả lịch hẹn của một sinh viên.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "mentor_id": 1,
      "student_id": 2,
      "project_group_id": 1,
      "title": "Flask Architecture Review",
      "description": "Need help reviewing our Flask project structure",
      "start_time": "2024-01-15T10:00:00",
      "end_time": "2024-01-15T11:00:00",
      "status": "confirmed",
      "points_required": 50,
      "points_used": 50,
      "meeting_url": "https://meet.google.com/abc-defg-hij",
      "notes": "Please prepare your code for review",
      "created_at": "2024-01-10T09:00:00",
      "updated_at": "2024-01-10T09:00:00"
    }
  ],
  "message": "Found 1 appointments"
}
```

### 4. Get Mentor Appointments

**GET** `/api/appointments/mentor/{mentor_id}`

Lấy tất cả lịch hẹn của một mentor.

### 5. Confirm Appointment

**PUT** `/api/appointments/{id}/confirm`

Xác nhận lịch hẹn.

**Response:**
```json
{
  "success": true,
  "message": "Appointment confirmed successfully"
}
```

### 6. Cancel Appointment

**PUT** `/api/appointments/{id}/cancel`

Hủy lịch hẹn và hoàn tiền điểm.

**Request Body:**
```json
{
  "cancelled_by_user_id": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully. Points have been refunded."
}
```

### 7. Complete Appointment

**PUT** `/api/appointments/{id}/complete`

Đánh dấu lịch hẹn đã hoàn thành.

**Response:**
```json
{
  "success": true,
  "message": "Appointment marked as completed"
}
```

### 8. Get Available Slots

**GET** `/api/appointments/mentor/{mentor_id}/available-slots`

Lấy các slot thời gian có sẵn của mentor.

**Query Parameters:**
- `date` (string, required): Ngày theo format YYYY-MM-DD
- `duration_hours` (number, optional): Thời lượng slot (mặc định: 1.0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "start_time": "2024-01-15T09:00:00",
      "end_time": "2024-01-15T10:00:00",
      "points_required": 50
    },
    {
      "start_time": "2024-01-15T14:00:00",
      "end_time": "2024-01-15T15:00:00",
      "points_required": 50
    }
  ],
  "message": "Available slots for 2024-01-15"
}
```

---

## Error Responses

### Validation Error (400)

```json
{
  "success": false,
  "message": "Missing required field: mentor_id"
}
```

### Not Found Error (404)

```json
{
  "success": false,
  "message": "Mentor not found"
}
```

### Business Logic Error (400)

```json
{
  "success": false,
  "message": "Insufficient points in wallet"
}
```

### Server Error (500)

```json
{
  "success": false,
  "message": "Internal server error occurred"
}
```

---

## Data Types

### Enums

**UserRole:**
- `admin`
- `student`
- `mentor`

**MentorStatus:**
- `active`
- `inactive`
- `busy`

**AppointmentStatus:**
- `pending`
- `confirmed`
- `cancelled`
- `completed`
- `no_show`

**ProjectStatus:**
- `planning`
- `in_progress`
- `completed`
- `on_hold`

**TransactionType:**
- `earned`
- `spent`
- `refunded`
- `bonus`

**FeedbackType:**
- `student_to_mentor`
- `mentor_to_student`

### Date Formats

Tất cả datetime fields sử dụng ISO 8601 format:
```
YYYY-MM-DDTHH:MM:SS
```

Ví dụ: `2024-01-15T10:00:00`

---

## Rate Limiting

Hiện tại chưa có rate limiting. Trong tương lai sẽ áp dụng:
- 100 requests per minute per IP
- 1000 requests per hour per user

---

## Pagination

Các endpoint list sẽ hỗ trợ pagination trong tương lai:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

## Webhooks

Trong tương lai sẽ hỗ trợ webhooks cho các events:
- Appointment created
- Appointment confirmed
- Appointment cancelled
- Appointment completed
- Points deducted
- Points refunded

