# Quick Start Guide - Mentor Booking System

## Cài đặt và chạy hệ thống

### 1. Cài đặt dependencies
```bash
cd src
pip install -r requirements.txt
```

### 2. Chạy ứng dụng
```bash
python app.py
```

### 3. Truy cập API
- Base URL: `http://localhost:6868`
- Swagger Documentation: `http://localhost:6868/docs`

## Các bước sử dụng cơ bản

### 1. Tạo mentor profile
```bash
curl -X POST http://localhost:6868/api/mentors/ \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "bio": "Experienced software engineer",
    "expertise_areas": ["Python", "Flask", "React"],
    "hourly_rate": 50,
    "max_sessions_per_day": 5
  }'
```

### 2. Xem danh sách mentor
```bash
curl http://localhost:6868/api/mentors/
```

### 3. Tìm mentor theo chuyên môn
```bash
curl "http://localhost:6868/api/mentors/?expertise=Python"
```

### 4. Kiểm tra slot trống của mentor
```bash
curl "http://localhost:6868/api/appointments/mentor/1/available-slots?date=2024-01-15"
```

### 5. Đặt lịch hẹn
```bash
curl -X POST http://localhost:6868/api/appointments/ \
  -H "Content-Type: application/json" \
  -d '{
    "mentor_id": 1,
    "student_id": 2,
    "title": "Code Review Session",
    "description": "Need help reviewing my Flask project",
    "start_time": "2024-01-15T10:00:00",
    "end_time": "2024-01-15T11:00:00"
  }'
```

### 6. Xem lịch hẹn của sinh viên
```bash
curl http://localhost:6868/api/appointments/student/2
```

### 7. Xác nhận lịch hẹn
```bash
curl -X PUT http://localhost:6868/api/appointments/1/confirm
```

### 8. Hủy lịch hẹn
```bash
curl -X PUT http://localhost:6868/api/appointments/1/cancel \
  -H "Content-Type: application/json" \
  -d '{"cancelled_by_user_id": 2}'
```

## Các tính năng chính

### Point-based Booking
- Sinh viên sử dụng điểm ví để đặt lịch mentor
- Điểm được trừ tự động khi đặt lịch
- Hoàn tiền điểm khi hủy lịch hẹn

### Expertise Matching
- Tìm kiếm mentor theo chuyên môn cụ thể
- Lọc mentor theo trạng thái khả dụng
- Xem đánh giá và số buổi đã thực hiện

### Schedule Management
- Kiểm tra xung đột lịch trình tự động
- Xem slot thời gian có sẵn
- Quản lý trạng thái lịch hẹn

### Project Group Support
- Đặt lịch theo nhóm dự án
- Theo dõi tiến độ dự án
- Quản lý thành viên nhóm

## API Endpoints chính

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/mentors/` | Lấy danh sách mentor |
| POST | `/api/mentors/` | Tạo mentor mới |
| GET | `/api/mentors/{id}` | Lấy chi tiết mentor |
| PUT | `/api/mentors/{id}` | Cập nhật mentor |
| GET | `/api/mentors/{id}/schedule` | Lịch trình mentor |
| POST | `/api/appointments/` | Đặt lịch hẹn |
| GET | `/api/appointments/student/{id}` | Lịch hẹn sinh viên |
| GET | `/api/appointments/mentor/{id}` | Lịch hẹn mentor |
| PUT | `/api/appointments/{id}/confirm` | Xác nhận lịch hẹn |
| PUT | `/api/appointments/{id}/cancel` | Hủy lịch hẹn |
| GET | `/api/appointments/mentor/{id}/available-slots` | Slot trống |

## Cấu trúc dữ liệu

### Mentor
```json
{
  "id": 1,
  "user_id": 1,
  "bio": "Experienced software engineer",
  "expertise_areas": ["Python", "Flask", "React"],
  "hourly_rate": 50,
  "max_sessions_per_day": 5,
  "rating": 4.5,
  "total_sessions": 25,
  "status": "active"
}
```

### Appointment
```json
{
  "id": 1,
  "mentor_id": 1,
  "student_id": 2,
  "title": "Code Review Session",
  "description": "Need help reviewing my Flask project",
  "start_time": "2024-01-15T10:00:00",
  "end_time": "2024-01-15T11:00:00",
  "status": "confirmed",
  "points_required": 50,
  "points_used": 50
}
```

## Troubleshooting

### Lỗi thường gặp

1. **"Mentor is not available for this time slot"**
   - Kiểm tra lịch trình mentor
   - Chọn thời gian khác

2. **"Insufficient points in wallet"**
   - Kiểm tra số điểm trong ví
   - Nạp thêm điểm hoặc chọn mentor có giá thấp hơn

3. **"Invalid datetime format"**
   - Sử dụng format ISO 8601: `YYYY-MM-DDTHH:MM:SS`
   - Ví dụ: `2024-01-15T10:00:00`

### Kiểm tra hệ thống

```bash
# Kiểm tra API health
curl http://localhost:6868/

# Xem Swagger docs
open http://localhost:6868/docs
```

## Phát triển

### Thêm tính năng mới
1. Tạo domain model trong `domain/models/`
2. Tạo repository interface trong `domain/models/`
3. Implement repository trong `infrastructure/repositories/`
4. Tạo service trong `services/`
5. Tạo controller trong `api/controllers/`
6. Đăng ký blueprint trong `app.py`

### Testing
```bash
# Chạy tests (khi có)
python -m pytest tests/

# Kiểm tra code style
flake8 src/
```
