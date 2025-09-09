// Sample data for better user experience
const SAMPLE_DATA = {
    todos: [
        {
            id: 1,
            title: "Hoàn thành bài tập JavaScript",
            description: "Làm bài tập về DOM manipulation và event handling",
            priority: "high",
            status: "pending",
            created_at: "2025-01-09T10:00:00Z"
        },
        {
            id: 2,
            title: "Ôn tập React Hooks",
            description: "Học và thực hành useState, useEffect, useContext",
            priority: "medium",
            status: "in_progress",
            created_at: "2025-01-08T14:30:00Z"
        },
        {
            id: 3,
            title: "Chuẩn bị presentation",
            description: "Tạo slide thuyết trình về dự án cuối khóa",
            priority: "high",
            status: "pending",
            created_at: "2025-01-07T09:15:00Z"
        }
    ],
    
    courses: [
        {
            id: 1,
            name: "JavaScript từ cơ bản đến nâng cao",
            description: "Khóa học toàn diện về JavaScript, từ ES6 đến modern frameworks",
            duration: 12,
            level: "intermediate",
            instructor: "Nguyễn Văn A",
            created_at: "2025-01-01T00:00:00Z"
        },
        {
            id: 2,
            name: "React.js Development",
            description: "Học React từ cơ bản, bao gồm hooks, context, và state management",
            duration: 8,
            level: "intermediate",
            instructor: "Trần Thị B",
            created_at: "2025-01-02T00:00:00Z"
        },
        {
            id: 3,
            name: "Node.js Backend Development",
            description: "Xây dựng API và server với Node.js, Express, và MongoDB",
            duration: 10,
            level: "advanced",
            instructor: "Lê Văn C",
            created_at: "2025-01-03T00:00:00Z"
        }
    ],
    
    mentors: [
        {
            id: 1,
            name: "Nguyễn Văn A",
            email: "nguyenvana@example.com",
            expertise: "JavaScript, React, Node.js",
            experience: 5,
            bio: "Chuyên gia JavaScript với 5 năm kinh nghiệm. Đã từng làm việc tại các công ty công nghệ hàng đầu.",
            rating: 4.8,
            created_at: "2025-01-01T00:00:00Z"
        },
        {
            id: 2,
            name: "Trần Thị B",
            email: "tranthib@example.com",
            expertise: "React, Vue.js, Frontend Architecture",
            experience: 4,
            bio: "Frontend developer chuyên nghiệp, có kinh nghiệm trong việc xây dựng ứng dụng web quy mô lớn.",
            rating: 4.9,
            created_at: "2025-01-02T00:00:00Z"
        },
        {
            id: 3,
            name: "Lê Văn C",
            email: "levanc@example.com",
            expertise: "Node.js, Python, Database Design",
            experience: 6,
            bio: "Backend developer với chuyên môn sâu về hệ thống phân tán và database optimization.",
            rating: 4.7,
            created_at: "2025-01-03T00:00:00Z"
        },
        {
            id: 4,
            name: "Phạm Thị D",
            email: "phamthid@example.com",
            expertise: "UI/UX Design, Figma, Adobe Creative Suite",
            experience: 3,
            bio: "UI/UX Designer với kinh nghiệm thiết kế giao diện người dùng cho các ứng dụng di động và web.",
            rating: 4.6,
            created_at: "2025-01-04T00:00:00Z"
        },
        {
            id: 5,
            name: "Hoàng Văn E",
            email: "hoangvane@example.com",
            expertise: "Python, Machine Learning, Data Science",
            experience: 7,
            bio: "Data Scientist với chuyên môn về Machine Learning và phân tích dữ liệu lớn.",
            rating: 4.9,
            created_at: "2025-01-05T00:00:00Z"
        },
        {
            id: 6,
            name: "Võ Thị F",
            email: "vothif@example.com",
            expertise: "Mobile Development, React Native, Flutter",
            experience: 4,
            bio: "Mobile developer chuyên nghiệp với kinh nghiệm phát triển ứng dụng di động đa nền tảng.",
            rating: 4.7,
            created_at: "2025-01-06T00:00:00Z"
        },
        {
            id: 7,
            name: "Đặng Văn G",
            email: "dangvang@example.com",
            expertise: "DevOps, AWS, Docker, Kubernetes",
            experience: 6,
            bio: "DevOps Engineer với chuyên môn về cloud infrastructure và containerization.",
            rating: 4.8,
            created_at: "2025-01-07T00:00:00Z"
        },
        {
            id: 8,
            name: "Bùi Thị H",
            email: "buithih@example.com",
            expertise: "Cybersecurity, Network Security, Ethical Hacking",
            experience: 5,
            bio: "Cybersecurity expert với kinh nghiệm bảo mật hệ thống và penetration testing.",
            rating: 4.9,
            created_at: "2025-01-08T00:00:00Z"
        },
        {
            id: 9,
            name: "Phan Văn I",
            email: "phanvani@example.com",
            expertise: "Blockchain, Smart Contracts, Web3",
            experience: 3,
            bio: "Blockchain developer chuyên về smart contracts và ứng dụng Web3.",
            rating: 4.6,
            created_at: "2025-01-09T00:00:00Z"
        },
        {
            id: 10,
            name: "Lý Thị K",
            email: "lythik@example.com",
            expertise: "Game Development, Unity, C#",
            experience: 4,
            bio: "Game developer với kinh nghiệm phát triển game 2D/3D sử dụng Unity engine.",
            rating: 4.5,
            created_at: "2025-01-10T00:00:00Z"
        },
        {
            id: 11,
            name: "Nguyễn Minh L",
            email: "nguyenminhl@example.com",
            expertise: "UI/UX Design, Figma, Adobe XD, User Research",
            experience: 5,
            bio: "UI/UX Designer chuyên nghiệp với kinh nghiệm thiết kế giao diện người dùng và nghiên cứu trải nghiệm người dùng.",
            rating: 4.8,
            created_at: "2025-01-11T00:00:00Z"
        },
        {
            id: 12,
            name: "Trần Quốc M",
            email: "tranquocm@example.com",
            expertise: "Backend Development, Node.js, Express, MongoDB",
            experience: 6,
            bio: "Backend Developer chuyên về API development và database design với Node.js và MongoDB.",
            rating: 4.7,
            created_at: "2025-01-12T00:00:00Z"
        },
        {
            id: 13,
            name: "Lê Thị N",
            email: "lethin@example.com",
            expertise: "Cloud Computing, Azure, Google Cloud, Microservices",
            experience: 7,
            bio: "Cloud Architect với chuyên môn về Azure, Google Cloud và kiến trúc microservices cho ứng dụng quy mô lớn.",
            rating: 4.9,
            created_at: "2025-01-13T00:00:00Z"
        }
    ],
    
    feedbacks: [
        {
            id: 1,
            mentor_id: 1,
            student_id: 2,
            rating: 5,
            comment: "Mentor rất nhiệt tình và có kinh nghiệm. Giải thích rất dễ hiểu!",
            created_at: "2025-01-14T15:30:00Z"
        },
        {
            id: 2,
            mentor_id: 1,
            student_id: 3,
            rating: 4,
            comment: "Buổi mentoring rất hữu ích, học được nhiều kiến thức mới.",
            created_at: "2025-01-13T10:15:00Z"
        },
        {
            id: 3,
            mentor_id: 2,
            student_id: 2,
            rating: 5,
            comment: "Mentor Python rất giỏi, giúp tôi hiểu rõ về Django framework.",
            created_at: "2025-01-12T14:20:00Z"
        },
        {
            id: 4,
            mentor_id: 3,
            student_id: 4,
            rating: 4,
            comment: "React mentoring session rất tốt, mentor có nhiều tips hay.",
            created_at: "2025-01-11T16:45:00Z"
        },
        {
            id: 5,
            mentor_id: 1,
            student_id: 5,
            rating: 5,
            comment: "Cảm ơn mentor đã giúp tôi debug code JavaScript!",
            created_at: "2025-01-10T09:30:00Z"
        },
        {
            id: 6,
            mentor_id: 11,
            student_id: 2,
            rating: 5,
            comment: "Mentor UI/UX rất sáng tạo, giúp tôi hiểu rõ về design thinking!",
            created_at: "2025-01-14T11:20:00Z"
        },
        {
            id: 7,
            mentor_id: 12,
            student_id: 3,
            rating: 4,
            comment: "Backend mentoring rất chi tiết, học được nhiều về API design.",
            created_at: "2025-01-13T16:45:00Z"
        },
        {
            id: 8,
            mentor_id: 13,
            student_id: 4,
            rating: 5,
            comment: "Cloud architecture session tuyệt vời, mentor rất chuyên nghiệp!",
            created_at: "2025-01-12T14:30:00Z"
        }
    ],
    
    appointments: [
        {
            id: 1,
            mentor_id: 1,
            student_id: 2,
            scheduled_time: "2025-01-15T14:00:00Z",
            duration: 60,
            notes: "Thảo luận về dự án JavaScript và cách tối ưu hóa performance",
            status: "pending",
            created_at: "2025-01-09T10:00:00Z"
        },
        {
            id: 2,
            mentor_id: 2,
            student_id: 3,
            scheduled_time: "2025-01-18T10:00:00Z",
            duration: 90,
            notes: "Code review và hướng dẫn React best practices",
            status: "completed",
            created_at: "2025-01-08T15:30:00Z"
        },
        {
            id: 3,
            mentor_id: 11,
            student_id: 2,
            scheduled_time: "2025-01-20T14:00:00Z",
            duration: 60,
            notes: "Thiết kế UI/UX cho ứng dụng mobile",
            status: "pending",
            created_at: "2025-01-15T09:15:00Z"
        },
        {
            id: 4,
            mentor_id: 12,
            student_id: 4,
            scheduled_time: "2025-01-22T16:00:00Z",
            duration: 90,
            notes: "Học Node.js và MongoDB cho dự án backend",
            status: "pending",
            created_at: "2025-01-16T11:30:00Z"
        },
        {
            id: 5,
            mentor_id: 13,
            student_id: 3,
            scheduled_time: "2025-01-25T10:00:00Z",
            duration: 120,
            notes: "Cloud architecture và microservices design",
            status: "pending",
            created_at: "2025-01-17T14:20:00Z"
        }
    ],
    
    users: [
        {
            id: 1,
            username: "admin",
            email: "admin@example.com",
            role: "admin",
            created_at: "2025-01-01T00:00:00Z"
        },
        {
            id: 2,
            username: "student1",
            email: "student1@example.com",
            password: "password123",
            role: "student",
            created_at: "2025-01-02T00:00:00Z"
        },
        {
            id: 3,
            username: "mentor_nguyenvana",
            email: "nguyenvana@example.com",
            role: "mentor",
            created_at: "2025-01-01T00:00:00Z"
        },
        {
            id: 4,
            username: "mentor_tranthib",
            email: "tranthib@example.com",
            role: "mentor",
            created_at: "2025-01-02T00:00:00Z"
        },
        {
            id: 5,
            username: "mentor_levanc",
            email: "levanc@example.com",
            role: "mentor",
            created_at: "2025-01-03T00:00:00Z"
        },
        {
            id: 6,
            username: "mentor_phamthid",
            email: "phamthid@example.com",
            role: "mentor",
            created_at: "2025-01-04T00:00:00Z"
        },
        {
            id: 7,
            username: "mentor_hoangvane",
            email: "hoangvane@example.com",
            role: "mentor",
            created_at: "2025-01-05T00:00:00Z"
        },
        {
            id: 8,
            username: "mentor_vothif",
            email: "vothif@example.com",
            role: "mentor",
            created_at: "2025-01-06T00:00:00Z"
        },
        {
            id: 9,
            username: "mentor_dangvang",
            email: "dangvang@example.com",
            role: "mentor",
            created_at: "2025-01-07T00:00:00Z"
        },
        {
            id: 10,
            username: "mentor_buithih",
            email: "buithih@example.com",
            role: "mentor",
            created_at: "2025-01-08T00:00:00Z"
        },
        {
            id: 11,
            username: "mentor_phanvani",
            email: "phanvani@example.com",
            role: "mentor",
            created_at: "2025-01-09T00:00:00Z"
        },
        {
            id: 12,
            username: "mentor_lythik",
            email: "lythik@example.com",
            role: "mentor",
            created_at: "2025-01-10T00:00:00Z"
        },
        {
            id: 15,
            username: "mentor_nguyenminhl",
            email: "nguyenminhl@example.com",
            password: "password123",
            role: "mentor",
            created_at: "2025-01-11T00:00:00Z"
        },
        {
            id: 16,
            username: "mentor_tranquocm",
            email: "tranquocm@example.com",
            password: "password123",
            role: "mentor",
            created_at: "2025-01-12T00:00:00Z"
        },
        {
            id: 17,
            username: "mentor_lethin",
            email: "lethin@example.com",
            password: "password123",
            role: "mentor",
            created_at: "2025-01-13T00:00:00Z"
        },
        {
            id: 13,
            username: "mentor_demo",
            email: "mentor_demo@example.com",
            password: "password123",
            role: "mentor",
            created_at: "2025-01-11T00:00:00Z"
        },
        {
            id: 14,
            username: "admin_demo",
            email: "admin_demo@example.com",
            password: "password123",
            role: "admin",
            created_at: "2025-01-12T00:00:00Z"
        }
    ]
};

// Function to populate sample data
function populateSampleData() {
    console.log('Populating sample data...');
    
    // Add sample todos
    SAMPLE_DATA.todos.forEach(todo => {
        addSampleTodo(todo);
    });
    
    // Add sample courses
    SAMPLE_DATA.courses.forEach(course => {
        addSampleCourse(course);
    });
    
    // Add sample mentors
    SAMPLE_DATA.mentors.forEach(mentor => {
        addSampleMentor(mentor);
    });
    
    // Add sample appointments
    SAMPLE_DATA.appointments.forEach(appointment => {
        addSampleAppointment(appointment);
    });
    
    console.log('Sample data populated successfully!');
}

// Helper functions to add sample data
async function addSampleTodo(todo) {
    try {
        const response = await apiCall('/todos/', {
            method: 'POST',
            body: JSON.stringify({
                title: todo.title,
                description: todo.description,
                priority: todo.priority,
                status: todo.status
            })
        });
        
        if (response.ok) {
            console.log(`Added sample todo: ${todo.title}`);
        }
    } catch (error) {
        console.log(`Could not add sample todo: ${todo.title}`, error);
    }
}

async function addSampleCourse(course) {
    try {
        const response = await apiCall('/courses/', {
            method: 'POST',
            body: JSON.stringify({
                name: course.name,
                description: course.description,
                duration: course.duration,
                level: course.level,
                instructor: course.instructor
            })
        });
        
        if (response.ok) {
            console.log(`Added sample course: ${course.name}`);
        }
    } catch (error) {
        console.log(`Could not add sample course: ${course.name}`, error);
    }
}

async function addSampleMentor(mentor) {
    try {
        const response = await apiCall('/mentors/', {
            method: 'POST',
            body: JSON.stringify({
                name: mentor.name,
                email: mentor.email,
                expertise: mentor.expertise,
                experience: mentor.experience,
                bio: mentor.bio
            })
        });
        
        if (response.ok) {
            console.log(`Added sample mentor: ${mentor.name}`);
        }
    } catch (error) {
        console.log(`Could not add sample mentor: ${mentor.name}`, error);
    }
}

async function addSampleAppointment(appointment) {
    try {
        const response = await apiCall('/appointments/', {
            method: 'POST',
            body: JSON.stringify({
                mentor_id: appointment.mentor_id,
                date: appointment.date,
                time: appointment.time,
                duration: appointment.duration,
                notes: appointment.notes,
                status: appointment.status
            })
        });
        
        if (response.ok) {
            console.log(`Added sample appointment with ${appointment.mentor_name}`);
        }
    } catch (error) {
        console.log(`Could not add sample appointment with ${appointment.mentor_name}`, error);
    }
}

// Function to check if sample data exists
async function checkSampleData() {
    try {
        // Check if user has sample data in localStorage
        const userSampleData = localStorage.getItem('userSampleData');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        if (!userSampleData || !currentUser.id) {
            return { hasData: false };
        }
        
        const data = JSON.parse(userSampleData);
        const hasData = (data.todos && data.todos.length > 0) || 
                       (data.appointments && data.appointments.length > 0) ||
                       (data.projectGroups && data.projectGroups.length > 0);
        
        return {
            hasData,
            counts: {
                todos: data.todos ? data.todos.length : 0,
                appointments: data.appointments ? data.appointments.length : 0,
                projectGroups: data.projectGroups ? data.projectGroups.length : 0
            }
        };
    } catch (error) {
        console.log('Error checking sample data:', error);
        return { hasData: false, counts: { todos: 0, appointments: 0, projectGroups: 0 } };
    }
}

// Function to show sample data prompt
function showSampleDataPrompt() {
    const prompt = `
    🎯 **Chào mừng bạn đến với MentorHub!**
    
    Để có trải nghiệm tốt nhất, bạn có muốn tôi tạo dữ liệu mẫu không?
    
    Dữ liệu mẫu sẽ bao gồm:
    • 3 công việc mẫu
    • 3 khóa học mẫu  
    • 3 mentor mẫu
    • 2 lịch hẹn mẫu
    
    Điều này sẽ giúp bạn hiểu rõ hơn về các chức năng của hệ thống.
    `;
    
    if (confirm(prompt)) {
        populateSampleData();
        setTimeout(() => {
            loadDashboard();
            showSection('dashboard');
        }, 2000);
    }
}
