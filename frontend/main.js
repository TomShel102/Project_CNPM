// API Configuration
const API_BASE = 'http://localhost:6868/api';

// Global state
let currentUser = null;
let currentPage = 'todos';
let userRole = 'student';

// Load sample data script safely
function loadSampleDataScript() {
    const sampleDataScript = document.createElement('script');
    sampleDataScript.src = '/sample-data.js';
    sampleDataScript.onerror = function() {
        console.log('Sample data script not found, continuing without it');
    };
    document.head.appendChild(sampleDataScript);
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // Load sample data script
    loadSampleDataScript();
    
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('userRole');
    if (token && username) {
        currentUser = { 
            username: username, 
            role: role || 'student' 
        };
        userRole = role || 'student';
        showMainApp();
    } else {
        showLandingPage();
    }

    // Setup event listeners
    setupEventListeners();
    console.log('App initialized successfully');
});

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('Login form listener added');
    } else {
        console.error('Login form not found!');
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        console.log('Register form listener added');
    } else {
        console.error('Register form not found!');
    }
    
    // Todo form
    const todoForm = document.getElementById('todoForm');
    if (todoForm) {
        todoForm.addEventListener('submit', handleAddTodo);
    }
    
    // Course form
    const courseForm = document.getElementById('courseForm');
    if (courseForm) {
        courseForm.addEventListener('submit', handleAddCourse);
    }
    
    // Mentor form
    const mentorForm = document.getElementById('mentorForm');
    if (mentorForm) {
        mentorForm.addEventListener('submit', handleAddMentor);
    }
    
    // Appointment form
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', handleAddAppointment);
    }
    
    // Project group form
    const projectGroupForm = document.getElementById('projectGroupForm');
    if (projectGroupForm) {
        projectGroupForm.addEventListener('submit', handleAddProjectGroup);
    }
    
    // Forgot password form
    const forgotPasswordFormElement = document.getElementById('forgotPasswordFormElement');
    if (forgotPasswordFormElement) {
        forgotPasswordFormElement.addEventListener('submit', handleForgotPassword);
    }
    
    // Reset password form
    const resetPasswordFormElement = document.getElementById('resetPasswordFormElement');
    if (resetPasswordFormElement) {
        resetPasswordFormElement.addEventListener('submit', handleResetPassword);
    }
    
    // Profile form (will be setup dynamically when edit mode is enabled)
    // The form submission is handled in enableProfileEdit() function
    
    console.log('Event listeners setup complete');
}

// Authentication
async function handleLogin(e) {
    e.preventDefault();
    console.log('Login attempt started');
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('Username:', username);
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        const data = await response.json();
        console.log('Login response:', response.status, data);
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', username);
            localStorage.setItem('userRole', data.user.role);
            currentUser = { 
                username: username, 
                role: data.user.role,
                id: data.user.id 
            };
            userRole = data.user.role;
            
            // Show role-specific welcome message
            const roleText = {
                'student': 'Sinh viên',
                'mentor': 'Mentor',
                'admin': 'Admin'
            };
            
            alert(`Đăng nhập thành công!\n\n👤 Tài khoản: ${username}\n🎭 Vai trò: ${roleText[data.user.role] || data.user.role}\n🆔 ID: ${data.user.id}`);
            
            showMainApp();
        } else {
            showError('loginError', data.error || 'Login failed');
        }
    } catch (error) {
        showError('loginError', 'Network error. Make sure backend is running on port 6868.');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    currentUser = null;
    userRole = 'student';
    showLandingPage();
}

function showLandingPage() {
    document.getElementById('landingPage').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('forgotPasswordForm').classList.add('hidden');
    document.getElementById('resetPasswordForm').classList.add('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showLogin() {
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('forgotPasswordForm').classList.add('hidden');
    document.getElementById('resetPasswordForm').classList.add('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showRegister() {
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('forgotPasswordForm').classList.add('hidden');
    document.getElementById('resetPasswordForm').classList.add('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showForgotPassword() {
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('forgotPasswordForm').classList.remove('hidden');
    document.getElementById('resetPasswordForm').classList.add('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showResetPassword(email) {
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('forgotPasswordForm').classList.add('hidden');
    document.getElementById('resetPasswordForm').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    
    // Set email in reset form
    document.getElementById('resetEmail').value = email;
}

async function showMainApp() {
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    
    // Update user info
    const roleText = userRole === 'student' ? 'Sinh viên' : 
                    userRole === 'mentor' ? 'Mentor' : 'Admin';
    document.getElementById('welcomeText').textContent = `Welcome back, ${currentUser.username} (${roleText})`;
    document.getElementById('userAvatar').textContent = currentUser.username.charAt(0).toUpperCase();
    
    // Show appropriate menu based on role
    showRoleBasedMenu();
    
    showSection('dashboard');
    
    // Check if sample data exists and create if needed
    setTimeout(async () => {
        if (typeof checkSampleData === 'function') {
            const dataCheck = await checkSampleData();
            if (!dataCheck.hasData) {
                // Create sample data for new user
                createUserSampleData();
            }
        }
    }, 1000);
}

// Show role-based menu
function showRoleBasedMenu() {
    // Hide all role menus
    document.getElementById('studentMenu').classList.add('hidden');
    document.getElementById('mentorMenu').classList.add('hidden');
    document.getElementById('adminMenu').classList.add('hidden');
    
    // Show appropriate menu based on role
    switch(userRole) {
        case 'student':
            document.getElementById('studentMenu').classList.remove('hidden');
            break;
        case 'mentor':
            document.getElementById('mentorMenu').classList.remove('hidden');
            break;
        case 'admin':
            document.getElementById('adminMenu').classList.remove('hidden');
            break;
        default:
            document.getElementById('studentMenu').classList.remove('hidden');
    }
}

// Navigation
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    
    // Show selected section
    const sectionElement = document.getElementById(section + 'Section');
    if (sectionElement) {
        sectionElement.classList.add('active');
    } else {
        console.error(`Section element not found: ${section}Section`);
        return;
    }
    
    // Update navigation - only if it's not profile (profile is accessed via avatar)
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (section !== 'profile') {
        const navButton = document.getElementById('nav' + section.charAt(0).toUpperCase() + section.slice(1));
        if (navButton) {
            navButton.classList.add('active');
        }
    }
    
    currentPage = section;
    
    // Load data for the section
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'profile':
            loadProfile();
            break;
        case 'todos':
            loadTodos();
            break;
        case 'courses':
            loadCourses();
            break;
        case 'mentors':
            loadMentors();
            break;
        case 'appointments':
            loadAppointments();
            loadMentorsForAppointment();
            break;
        case 'projectGroups':
            loadProjectGroups();
            break;
        case 'wallet':
            loadWallet();
            break;
        case 'mentorBooking':
            loadMentorBooking();
            break;
        case 'feedback':
            loadFeedback();
            loadMentorsForFeedback();
            break;
        case 'mentorProfile':
            loadMentorProfile();
            break;
        case 'mentorSchedule':
            loadMentorSchedule();
            break;
        case 'mentorAppointments':
            loadMentorAppointments();
            break;
        case 'mentorFeedback':
            loadMentorFeedback();
            break;
        case 'userManagement':
            loadUserManagement();
            break;
        case 'projectManagement':
            loadProjectManagement();
            break;
        case 'reports':
            loadReports();
            break;
        case 'notifications':
            loadNotifications();
            break;
    }
}

// Register function
async function handleRegister(e) {
    e.preventDefault();
    console.log('Register attempt started');
    
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const role = document.getElementById('regRole').value;
    
    console.log('Register data:', { username, email });
    
    if (password !== confirmPassword) {
        showError('registerError', 'Passwords do not match');
        return;
    }
    
    try {
        const response = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                role: role
            })
        });
        
        console.log('Register response status:', response.status);
        console.log('Register response ok:', response.ok);
        
        if (response && response.ok) {
            const result = await response.json();
            console.log('Register success:', result);
            
            const roleText = {
                'student': 'Sinh viên',
                'mentor': 'Mentor',
                'admin': 'Admin'
            };
            
            showSuccess('registerSuccess', `Đăng ký thành công!\n\n👤 Tài khoản: ${username}\n🎭 Vai trò: ${roleText[role] || role}\n📧 Email: ${email}\n\nBạn có thể đăng nhập ngay bây giờ!`);
            
            // Clear form
            document.getElementById('registerForm').reset();
            
            // Auto switch to login after 3 seconds
            setTimeout(() => {
                showLogin();
            }, 3000);
        } else {
            let errorMessage = 'Registration failed. Please try again.';
            try {
                const error = await response.json();
                console.log('Register error:', error);
                errorMessage = error.error || errorMessage;
            } catch (e) {
                console.log('Could not parse error response:', e);
            }
            showError('registerError', errorMessage);
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        showError('registerError', 'Registration failed. Please try again.');
    }
}

// Dashboard
async function loadDashboard() {
    try {
        // Load user sample data first
        const userSampleData = JSON.parse(localStorage.getItem('userSampleData') || '{}');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        // Load todos for dashboard
        const todos = userSampleData.todos || [];
        document.getElementById('todosCount').textContent = todos.length;
        
        // Load courses for dashboard (from global sample data)
        const courses = SAMPLE_DATA.courses || [];
        document.getElementById('coursesCount').textContent = courses.length;
        
        // Load mentors for dashboard (from global sample data)
        const mentors = SAMPLE_DATA.mentors || [];
        document.getElementById('mentorsCount').textContent = mentors.length;
        
        // Load appointments for dashboard (user-specific)
        const appointments = userSampleData.appointments || [];
        document.getElementById('appointmentsCount').textContent = appointments.length;
        
        // Show upcoming appointments on dashboard
        displayUpcomingAppointments(appointments);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('todosCount').textContent = '0';
        document.getElementById('coursesCount').textContent = '0';
        document.getElementById('mentorsCount').textContent = '0';
        document.getElementById('appointmentsCount').textContent = '0';
    }
}

// Display upcoming appointments on dashboard
function displayUpcomingAppointments(appointments) {
    const upcomingContainer = document.getElementById('upcomingAppointments');
    if (!upcomingContainer) return;
    
    // Filter upcoming appointments (next 7 days)
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcomingAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.scheduled_time);
        return aptDate >= now && aptDate <= nextWeek;
    }).sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time));
    
    if (upcomingAppointments.length === 0) {
        upcomingContainer.innerHTML = '<p>Không có lịch hẹn sắp tới</p>';
        return;
    }
    
    const appointmentsHtml = upcomingAppointments.map(appointment => {
        const mentor = SAMPLE_DATA.mentors.find(m => m.id === appointment.mentor_id);
        const mentorName = mentor ? mentor.name : `Mentor ${appointment.mentor_id}`;
        const aptDate = new Date(appointment.scheduled_time);
        
        return `
            <div class="upcoming-appointment-card">
                <div class="appointment-info">
                    <h4>📅 ${mentorName}</h4>
                    <p><strong>Thời gian:</strong> ${aptDate.toLocaleString('vi-VN')}</p>
                    <p><strong>Thời lượng:</strong> ${appointment.duration} phút</p>
                    <p><strong>Trạng thái:</strong> <span class="status-${appointment.status}">${appointment.status === 'pending' ? 'Chờ xác nhận' : 'Đã xác nhận'}</span></p>
                </div>
            </div>
        `;
    }).join('');
    
    upcomingContainer.innerHTML = appointmentsHtml;
}

// API Helper
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: { ...defaultOptions.headers, ...options.headers }
    });
    
    if (response.status === 401) {
        logout();
        return null;
    }
    
    return response;
}

// Todos
async function loadTodos() {
    try {
        const response = await apiCall('/todos/');
        if (response && response.ok) {
            const todos = await response.json();
            displayTodos(todos);
        }
    } catch (error) {
        console.error('Error loading todos:', error);
    }
}

function displayTodos(todos) {
    const todosList = document.getElementById('todosList');
    todosList.innerHTML = '';
    
    todos.forEach(todo => {
        const todoCard = document.createElement('div');
        todoCard.className = 'item-card';
        todoCard.innerHTML = `
            <div class="item-header">
                <h4 class="item-title">${todo.title}</h4>
                <span class="item-status status-${todo.status}">${todo.status}</span>
            </div>
            <p style="color: #666; margin: 10px 0;">${todo.description || 'No description'}</p>
            <div class="item-actions">
                <button onclick="editTodo(${todo.id})" class="btn btn-sm btn-secondary">Edit</button>
                <button onclick="deleteTodo(${todo.id})" class="btn btn-sm btn-danger">Delete</button>
            </div>
        `;
        todosList.appendChild(todoCard);
    });
    
    if (todos.length === 0) {
        todosList.innerHTML = '<div class="card"><p>No todos found. Create your first todo!</p></div>';
    }
}

async function handleAddTodo(e) {
    e.preventDefault();
    
    const todoData = {
        title: document.getElementById('todoTitle').value,
        description: document.getElementById('todoDescription').value,
        status: document.getElementById('todoStatus').value
    };
    
    try {
        const response = await apiCall('/todos/', {
            method: 'POST',
            body: JSON.stringify(todoData)
        });
        
        if (response && response.ok) {
            hideAddTodoForm();
            loadTodos();
            document.getElementById('todoForm').reset();
        }
    } catch (error) {
        console.error('Error adding todo:', error);
    }
}

async function deleteTodo(id) {
    if (confirm('Are you sure you want to delete this todo?')) {
        try {
            const response = await apiCall(`/todos/${id}`, {
                method: 'DELETE'
            });
            
            if (response && response.ok) {
                loadTodos();
            }
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    }
}

function showAddTodoForm() {
    document.getElementById('addTodoForm').classList.remove('hidden');
}

function hideAddTodoForm() {
    document.getElementById('addTodoForm').classList.add('hidden');
}

// Courses
async function loadCourses() {
    try {
        const response = await apiCall('/courses/');
        if (response && response.ok) {
            const courses = await response.json();
            displayCourses(courses);
        }
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

function displayCourses(courses) {
    const tbody = document.querySelector('#coursesTable tbody');
    tbody.innerHTML = '';
    
    courses.forEach(course => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course.id}</td>
            <td>${course.course_name}</td>
            <td>${course.description || ''}</td>
            <td>${course.status}</td>
            <td>${course.start_date ? new Date(course.start_date).toLocaleDateString() : ''}</td>
            <td>${course.end_date ? new Date(course.end_date).toLocaleDateString() : ''}</td>
            <td>
                <button onclick="editCourse(${course.id})" class="btn">Edit</button>
                <button onclick="deleteCourse(${course.id})" class="btn btn-danger">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function handleAddCourse(e) {
    e.preventDefault();
    
    const courseData = {
        course_name: document.getElementById('courseName').value,
        description: document.getElementById('courseDescription').value,
        status: document.getElementById('courseStatus').value,
        start_date: document.getElementById('startDate').value,
        end_date: document.getElementById('endDate').value
    };
    
    try {
        const response = await apiCall('/courses/', {
            method: 'POST',
            body: JSON.stringify(courseData)
        });
        
        if (response && response.ok) {
            hideAddCourseForm();
            loadCourses();
            document.getElementById('courseForm').reset();
        }
    } catch (error) {
        console.error('Error adding course:', error);
    }
}

async function deleteCourse(id) {
    if (confirm('Are you sure you want to delete this course?')) {
        try {
            const response = await apiCall(`/courses/${id}`, {
                method: 'DELETE'
            });
            
            if (response && response.ok) {
                loadCourses();
            }
        } catch (error) {
            console.error('Error deleting course:', error);
        }
    }
}

function showAddCourseForm() {
    document.getElementById('addCourseForm').classList.remove('hidden');
}

function hideAddCourseForm() {
    document.getElementById('addCourseForm').classList.add('hidden');
}

// Mentors
async function loadMentors() {
    try {
        const response = await apiCall('/mentors/');
        if (response && response.ok) {
            const data = await response.json();
            const mentors = data.data || data;
            displayMentors(mentors);
        }
    } catch (error) {
        console.error('Error loading mentors:', error);
    }
}

function displayMentors(mentors) {
    const tbody = document.querySelector('#mentorsTable tbody');
    tbody.innerHTML = '';
    
    mentors.forEach(mentor => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${mentor.id}</td>
            <td>${mentor.user_id}</td>
            <td>${mentor.bio || ''}</td>
            <td>${Array.isArray(mentor.expertise_areas) ? mentor.expertise_areas.join(', ') : mentor.expertise_areas || ''}</td>
            <td>$${mentor.hourly_rate || 0}</td>
            <td>${mentor.max_sessions_per_day || 0}</td>
            <td>${mentor.status || 'active'}</td>
            <td>
                <button onclick="editMentor(${mentor.id})" class="btn">Edit</button>
                <button onclick="deleteMentor(${mentor.id})" class="btn btn-danger">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function handleAddMentor(e) {
    e.preventDefault();
    
    const mentorData = {
        user_id: parseInt(document.getElementById('mentorUserId').value),
        bio: document.getElementById('mentorBio').value,
        expertise_areas: document.getElementById('mentorExpertise').value.split(',').map(s => s.trim()).filter(s => s),
        hourly_rate: parseFloat(document.getElementById('mentorRate').value),
        max_sessions_per_day: parseInt(document.getElementById('mentorMaxSessions').value)
    };
    
    try {
        const response = await apiCall('/mentors/', {
            method: 'POST',
            body: JSON.stringify(mentorData)
        });
        
        if (response && response.ok) {
            hideAddMentorForm();
            loadMentors();
            document.getElementById('mentorForm').reset();
        }
    } catch (error) {
        console.error('Error adding mentor:', error);
    }
}

async function deleteMentor(id) {
    if (confirm('Are you sure you want to delete this mentor?')) {
        try {
            const response = await apiCall(`/mentors/${id}`, {
                method: 'DELETE'
            });
            
            if (response && response.ok) {
                loadMentors();
            }
        } catch (error) {
            console.error('Error deleting mentor:', error);
        }
    }
}

function showAddMentorForm() {
    document.getElementById('addMentorForm').classList.remove('hidden');
}

function hideAddMentorForm() {
    document.getElementById('addMentorForm').classList.add('hidden');
}

// Appointments
async function loadAppointments() {
    try {
        // Use sample data for now
        const appointments = SAMPLE_DATA.appointments || [];
        displayAppointments(appointments);
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

// Project Groups
async function loadProjectGroups() {
    try {
        // Use sample data for now
        const groups = SAMPLE_DATA.projectGroups || [];
        
        const groupsHtml = groups.map(group => `
            <div class="item-card">
                <div class="item-header">
                    <h4 class="item-title">${group.name}</h4>
                    <span class="item-status status-${group.status || 'active'}">${group.status || 'Active'}</span>
                </div>
                <p><strong>Chủ đề:</strong> ${group.topic}</p>
                <p><strong>Mô tả:</strong> ${group.description || 'Không có mô tả'}</p>
                <p><strong>Thành viên:</strong> ${group.member_count || 0} người</p>
                <p><strong>Ngày tạo:</strong> ${new Date(group.created_at).toLocaleDateString()}</p>
                <div class="item-actions">
                    <button onclick="editProjectGroup(${group.id})" class="btn btn-sm">Chỉnh sửa</button>
                    <button onclick="deleteProjectGroup(${group.id})" class="btn btn-sm btn-danger">Xóa</button>
                </div>
            </div>
        `).join('');
        
        document.getElementById('projectGroupsList').innerHTML = groupsHtml || '<p>Chưa có nhóm dự án nào</p>';
    } catch (error) {
        console.error('Error loading project groups:', error);
        document.getElementById('projectGroupsList').innerHTML = '<p>Error loading project groups</p>';
    }
}

// Wallet
async function loadWallet() {
    try {
        const userId = currentUser?.id || 1;
        
        // Use sample data
        const wallet = SAMPLE_DATA.wallet || {
            id: userId,
            user_id: userId,
            balance: 0,
            total_spent: 0,
            total_earned: 0
        };
        
        document.getElementById('walletBalance').textContent = wallet.balance || 0;
        document.getElementById('totalSpent').textContent = wallet.total_spent || 0;
        document.getElementById('totalEarned').textContent = wallet.total_earned || 0;
        
        // Load transactions
        const transactions = SAMPLE_DATA.walletTransactions || [];
        
        if (transactions.length > 0) {
            const historyHtml = transactions.map(transaction => `
                <div class="item-card">
                    <div class="item-header">
                        <h4 class="item-title">${transaction.description}</h4>
                        <span class="item-status ${transaction.type === 'earn' ? 'status-success' : 'status-danger'}">
                            ${transaction.type === 'earn' ? '+' : '-'}${transaction.amount} điểm
                        </span>
                    </div>
                    <p><strong>Ngày:</strong> ${new Date(transaction.created_at).toLocaleDateString()}</p>
                    <p><strong>Loại:</strong> ${transaction.type === 'earn' ? 'Nhận điểm' : 'Sử dụng điểm'}</p>
                </div>
            `).join('');
            
            document.getElementById('walletHistory').innerHTML = historyHtml;
        } else {
            document.getElementById('walletHistory').innerHTML = '<p>Chưa có giao dịch nào</p>';
        }
    } catch (error) {
        console.error('Error loading wallet:', error);
        document.getElementById('walletBalance').textContent = '0';
        document.getElementById('totalSpent').textContent = '0';
        document.getElementById('totalEarned').textContent = '0';
        document.getElementById('walletHistory').innerHTML = '<p>Error loading wallet</p>';
    }
}

// Mentor Booking
async function loadMentorBooking() {
    try {
        // Use sample data instead of API
        const mentors = SAMPLE_DATA.mentors || [];
        
        const mentorList = document.getElementById('availableMentors');
        if (mentorList) {
            if (mentors.length === 0) {
                mentorList.innerHTML = '<p>Không có mentor nào khả dụng</p>';
                return;
            }
            
            const mentorsHtml = mentors.map(mentor => `
                <div class="item-card">
                    <div class="item-header">
                        <h4 class="item-title">${mentor.name}</h4>
                        <span class="item-status status-available">Có sẵn</span>
                    </div>
                    <p><strong>📧 Email:</strong> ${mentor.email}</p>
                    <p><strong>🛠️ Chuyên môn:</strong> ${mentor.expertise}</p>
                    <p><strong>⭐ Đánh giá:</strong> ${mentor.rating}/5.0 (${mentor.experience} năm kinh nghiệm)</p>
                    <p><strong>💰 Giá:</strong> 500 điểm/giờ</p>
                    <p><strong>📝 Giới thiệu:</strong> ${mentor.bio}</p>
                    <div class="item-actions">
                        <button onclick="bookMentor(${mentor.id}, '${mentor.name}')" class="btn btn-sm">📅 Đặt lịch</button>
                        <button onclick="viewMentorProfile(${mentor.id})" class="btn btn-sm">👁️ Xem hồ sơ</button>
                    </div>
                </div>
            `).join('');
            
            mentorList.innerHTML = mentorsHtml;
        }
    } catch (error) {
        console.error('Error loading mentors:', error);
        document.getElementById('availableMentors').innerHTML = '<p>Error loading mentors</p>';
    }
}

// Feedback
async function loadFeedback() {
    try {
        const response = await apiCall('/feedback/');
        const feedbacks = await response.json();
        
        const feedbacksHtml = feedbacks.map(feedback => `
            <div class="item-card">
                <div class="item-header">
                    <h4 class="item-title">Đánh giá ${feedback.mentor_name}</h4>
                    <span class="item-status">${'⭐'.repeat(feedback.rating)}</span>
                </div>
                <p><strong>Nhận xét:</strong> ${feedback.comment}</p>
                <p><strong>Ngày:</strong> ${new Date(feedback.created_at).toLocaleDateString()}</p>
            </div>
        `).join('');
        
        document.getElementById('feedbackHistory').innerHTML = feedbacksHtml || '<p>Chưa có đánh giá nào</p>';
    } catch (error) {
        console.error('Error loading feedback:', error);
        document.getElementById('feedbackHistory').innerHTML = '<p>Error loading feedback</p>';
    }
}

// Book mentor function
function bookMentor(mentorId, mentorName) {
    // Fill the appointment form with mentor info
    const mentorSelect = document.getElementById('appointmentMentor');
    if (mentorSelect) {
        // Clear existing options
        mentorSelect.innerHTML = '<option value="">-- Chọn mentor --</option>';
        
        // Add the selected mentor
        const option = document.createElement('option');
        option.value = mentorId;
        option.textContent = mentorName;
        option.selected = true;
        mentorSelect.appendChild(option);
    }
    
    // Switch to appointments section
    showSection('appointments');
    
    // Show success message
    alert(`Đã chọn mentor: ${mentorName}. Vui lòng điền thông tin lịch hẹn bên dưới.`);
}

// View mentor profile function
function viewMentorProfile(mentorId) {
    // Find mentor in sample data
    const mentor = SAMPLE_DATA.mentors.find(m => m.id === mentorId);
    if (!mentor) {
        alert('Không tìm thấy thông tin mentor');
        return;
    }
    
    // Create modal content
    const modalContent = `
        <div class="mentor-profile-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>👨‍💻 Hồ sơ Mentor</h2>
                    <button onclick="closeMentorProfile()" class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="mentor-info">
                        <div class="mentor-avatar">
                            <div class="avatar-circle">${mentor.name.charAt(0).toUpperCase()}</div>
                        </div>
                        <div class="mentor-details">
                            <h3>${mentor.name}</h3>
                            <p class="mentor-email">📧 ${mentor.email}</p>
                            <p class="mentor-rating">⭐ ${mentor.rating}/5.0 (${mentor.experience} năm kinh nghiệm)</p>
                        </div>
                    </div>
                    
                    <div class="mentor-expertise">
                        <h4>🛠️ Chuyên môn</h4>
                        <div class="expertise-tags">
                            ${mentor.expertise.split(', ').map(skill => 
                                `<span class="expertise-tag">${skill}</span>`
                            ).join('')}
                        </div>
                    </div>
                    
                    <div class="mentor-bio">
                        <h4>📝 Giới thiệu</h4>
                        <p>${mentor.bio}</p>
                    </div>
                    
                    <div class="mentor-actions">
                        <button onclick="bookMentor(${mentor.id}, '${mentor.name}')" class="btn" style="background: #007bff;">
                            📅 Đặt lịch ngay
                        </button>
                        <button onclick="closeMentorProfile()" class="btn" style="background: #6c757d;">
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    const modal = document.createElement('div');
    modal.innerHTML = modalContent;
    modal.id = 'mentorProfileModal';
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeMentorProfile();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMentorProfile();
        }
    });
}

function closeMentorProfile() {
    const modal = document.getElementById('mentorProfileModal');
    if (modal) {
        // Remove escape key listener
        document.removeEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeMentorProfile();
            }
        });
        
        // Remove modal
        modal.remove();
    }
}

// Add points function
async function addPoints() {
    const amount = document.getElementById('addPointsAmount').value;
    const description = document.getElementById('addPointsDescription').value || 'Nạp điểm';
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    if (!amount || amount <= 0) {
        alert('Vui lòng nhập số điểm hợp lệ (lớn hơn 0)');
        return;
    }
    
    if (!paymentMethod) {
        alert('Vui lòng chọn hình thức thanh toán');
        return;
    }
    
    try {
        const userId = currentUser?.id || 1;
        
        // For demo purposes, just simulate success
        const newBalance = (parseInt(amount) + (parseInt(document.getElementById('walletBalance').textContent) || 0));
        
        // Create transaction record
        const transaction = {
            id: Date.now(),
            wallet_id: userId,
            amount: parseInt(amount),
            type: 'earn',
            description: `${description} (${paymentMethod})`,
            created_at: new Date().toISOString()
        };
        
        // Add to sample data
        if (!SAMPLE_DATA.walletTransactions) {
            SAMPLE_DATA.walletTransactions = [];
        }
        SAMPLE_DATA.walletTransactions.push(transaction);
        
        // Update wallet balance
        if (!SAMPLE_DATA.wallet) {
            SAMPLE_DATA.wallet = {
                id: userId,
                user_id: userId,
                balance: 0,
                total_spent: 0,
                total_earned: 0
            };
        }
        SAMPLE_DATA.wallet.balance = newBalance;
        SAMPLE_DATA.wallet.total_earned += parseInt(amount);
        
        const paymentMethodText = {
            'credit_card': '💳 Thẻ tín dụng',
            'debit_card': '💳 Thẻ ghi nợ',
            'bank_transfer': '🏦 Chuyển khoản ngân hàng',
            'momo': '📱 Ví MoMo',
            'zalopay': '📱 Ví ZaloPay',
            'demo': '🎯 Demo (Miễn phí)'
        };
        
        alert(`Nạp ${amount} điểm thành công!\n\n${paymentMethodText[paymentMethod]}\n💰 Số dư mới: ${newBalance} điểm`);
        
        // Clear form
        document.getElementById('addPointsAmount').value = '';
        document.getElementById('addPointsDescription').value = '';
        document.getElementById('paymentMethod').value = '';
        
        // Reload wallet
        loadWallet();
        
    } catch (error) {
        console.error('Error adding points:', error);
        alert('Có lỗi xảy ra khi nạp điểm. Vui lòng thử lại.');
    }
}

// Handle add project group
async function handleAddProjectGroup(e) {
    e.preventDefault();
    
    const groupName = document.getElementById('groupName').value;
    const projectTopic = document.getElementById('projectTopic').value;
    const projectDescription = document.getElementById('projectDescription').value;
    const groupMembers = document.getElementById('groupMembers').value;
    
    if (!groupName || !projectTopic) {
        alert('Vui lòng điền tên nhóm và chủ đề dự án');
        return;
    }
    
    try {
        // Create new project group object
        const newGroup = {
            id: Date.now(), // Simple ID generation
            name: groupName,
            topic: projectTopic,
            description: projectDescription,
            members: groupMembers ? groupMembers.split(',').map(m => m.trim()) : [],
            member_count: groupMembers ? groupMembers.split(',').length : 1,
            created_at: new Date().toISOString(),
            status: 'active'
        };
        
        // Add to sample data
        if (!SAMPLE_DATA.projectGroups) {
            SAMPLE_DATA.projectGroups = [];
        }
        SAMPLE_DATA.projectGroups.push(newGroup);
        
        alert(`Tạo nhóm "${groupName}" thành công!`);
        
        // Clear form
        document.getElementById('projectGroupForm').reset();
        
        // Reload project groups
        loadProjectGroups();
        
    } catch (error) {
        console.error('Error creating project group:', error);
        alert('Có lỗi xảy ra khi tạo nhóm dự án. Vui lòng thử lại.');
    }
}

// Load mentors for appointment dropdown
async function loadMentorsForAppointment() {
    try {
        const response = await apiCall('/mentors/');
        const result = await response.json();
        
        const mentorSelect = document.getElementById('appointmentMentor');
        if (mentorSelect) {
            // Clear existing options except the first one
            mentorSelect.innerHTML = '<option value="">-- Chọn mentor --</option>';
            
            // Add mentors to dropdown
            if (result.success && result.data) {
                result.data.forEach(mentor => {
                    const option = document.createElement('option');
                    option.value = mentor.id;
                    option.textContent = `Mentor ${mentor.id} - ${mentor.expertise_areas}`;
                    mentorSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading mentors for appointment:', error);
    }
}

// Load mentors for feedback dropdown
async function loadMentorsForFeedback() {
    try {
        const response = await apiCall('/mentors/');
        const result = await response.json();
        
        const mentorSelect = document.getElementById('feedbackMentor');
        if (mentorSelect) {
            // Clear existing options except the first one
            mentorSelect.innerHTML = '<option value="">-- Chọn mentor --</option>';
            
            // Add mentors to dropdown
            if (result.success && result.data) {
                result.data.forEach(mentor => {
                    const option = document.createElement('option');
                    option.value = mentor.id;
                    option.textContent = `Mentor ${mentor.id} - ${mentor.expertise_areas}`;
                    mentorSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading mentors for feedback:', error);
    }
}

// Search mentors function
async function searchMentors() {
    const skill = document.getElementById('searchSkill').value;
    const date = document.getElementById('searchDate').value;
    
    try {
        let url = '/mentors/';
        const params = new URLSearchParams();
        if (skill) params.append('skill', skill);
        if (date) params.append('date', date);
        if (params.toString()) url += '?' + params.toString();
        
        const response = await apiCall(url);
        const mentors = await response.json();
        
        const mentorsHtml = mentors.map(mentor => `
            <div class="item-card">
                <div class="item-header">
                    <h4 class="item-title">${mentor.name}</h4>
                    <span class="item-status status-available">Available</span>
                </div>
                <p><strong>Chuyên môn:</strong> ${mentor.expertise}</p>
                <p><strong>Kinh nghiệm:</strong> ${mentor.experience} năm</p>
                <p><strong>Đánh giá:</strong> ⭐ ${mentor.rating || 'Chưa có'}</p>
                <div class="item-actions">
                    <button onclick="bookMentor(${mentor.id}, '${mentor.name}')" class="btn btn-sm">Đặt lịch</button>
                    <button onclick="viewMentorProfile(${mentor.id})" class="btn btn-sm">Xem hồ sơ</button>
                </div>
            </div>
        `).join('');
        
        document.getElementById('availableMentors').innerHTML = mentorsHtml || '<p>Không tìm thấy mentor phù hợp</p>';
    } catch (error) {
        console.error('Error searching mentors:', error);
        document.getElementById('availableMentors').innerHTML = '<p>Error searching mentors</p>';
    }
}

function displayAppointments(appointments) {
    const appointmentsList = document.getElementById('appointmentsList');
    if (appointmentsList) {
        const appointmentsHtml = appointments.map(appointment => `
            <div class="item-card">
                <div class="item-header">
                    <h4 class="item-title">Lịch hẹn với Mentor ${appointment.mentor_id}</h4>
                    <span class="item-status status-${appointment.status || 'pending'}">${appointment.status || 'pending'}</span>
                </div>
                <p><strong>Thời gian:</strong> ${appointment.scheduled_time ? new Date(appointment.scheduled_time).toLocaleString() : 'Chưa xác định'}</p>
                <p><strong>Ghi chú:</strong> ${appointment.notes || 'Không có ghi chú'}</p>
                <p><strong>Ngày tạo:</strong> ${new Date(appointment.created_at).toLocaleDateString()}</p>
                <div class="item-actions">
                    <button onclick="editAppointment(${appointment.id})" class="btn btn-sm">Chỉnh sửa</button>
                    <button onclick="deleteAppointment(${appointment.id})" class="btn btn-sm btn-danger">Xóa</button>
                </div>
            </div>
        `).join('');
        
        appointmentsList.innerHTML = appointmentsHtml || '<p>Chưa có lịch hẹn nào</p>';
    }
}

async function handleAddAppointment(e) {
    e.preventDefault();
    
    const mentorId = document.getElementById('appointmentMentor').value;
    const appointmentDate = document.getElementById('appointmentDate').value;
    const appointmentTime = document.getElementById('appointmentTime').value;
    const appointmentDuration = document.getElementById('appointmentDuration').value;
    const notes = document.getElementById('appointmentNotes').value;
    
    if (!mentorId || !appointmentDate || !appointmentTime) {
        alert('Vui lòng chọn mentor, ngày và giờ hẹn');
        return;
    }
    
    try {
        // Combine date and time
        const scheduledTime = `${appointmentDate}T${appointmentTime}:00`;
        
        // Create new appointment object
        const newAppointment = {
            id: Date.now(),
            student_id: currentUser?.id || 1,
            mentor_id: parseInt(mentorId),
            scheduled_time: scheduledTime,
            duration: parseInt(appointmentDuration),
            notes: notes || '',
            status: 'pending',
            created_at: new Date().toISOString()
        };
        
        // Add to sample data
        if (!SAMPLE_DATA.appointments) {
            SAMPLE_DATA.appointments = [];
        }
        SAMPLE_DATA.appointments.push(newAppointment);
        
        alert(`Đặt lịch hẹn thành công!\nMentor: ${mentorId}\nThời gian: ${new Date(scheduledTime).toLocaleString()}\nThời lượng: ${appointmentDuration} phút`);
        
        // Clear form
        document.getElementById('appointmentForm').reset();
        
        // Reload appointments
        loadAppointments();
        
    } catch (error) {
        console.error('Error adding appointment:', error);
        alert('Có lỗi xảy ra khi đặt lịch hẹn. Vui lòng thử lại.');
    }
}

async function deleteAppointment(id) {
    if (confirm('Bạn có chắc chắn muốn xóa lịch hẹn này?')) {
        try {
            // Remove from sample data
            if (SAMPLE_DATA.appointments) {
                SAMPLE_DATA.appointments = SAMPLE_DATA.appointments.filter(apt => apt.id !== id);
            }
            
            alert('Xóa lịch hẹn thành công!');
            loadAppointments();
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert('Có lỗi xảy ra khi xóa lịch hẹn.');
        }
    }
}

function showAddAppointmentForm() {
    document.getElementById('addAppointmentForm').classList.remove('hidden');
}

function hideAddAppointmentForm() {
    document.getElementById('addAppointmentForm').classList.add('hidden');
}

// Mentor Profile functions
async function loadMentorProfile() {
    try {
        // Load current mentor profile
        const userId = currentUser?.id || 1;
        const response = await apiCall(`/mentors/?user_id=${userId}`);
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            const mentor = result.data[0];
            document.getElementById('mentorBio').value = mentor.bio || '';
            document.getElementById('mentorExpertise').value = Array.isArray(mentor.expertise_areas) ? mentor.expertise_areas.join(', ') : mentor.expertise_areas || '';
            document.getElementById('mentorRate').value = mentor.hourly_rate || '';
            document.getElementById('mentorMaxSessions').value = mentor.max_sessions_per_day || '';
        }
    } catch (error) {
        console.error('Error loading mentor profile:', error);
    }
}

async function loadMentorSchedule() {
    // Schedule is static for now
    console.log('Loading mentor schedule...');
}

async function loadMentorAppointments() {
    try {
        // Use sample data for now
        const appointments = SAMPLE_DATA.appointments || [];
        
        // Filter appointments for current mentor
        const mentorId = currentUser?.id || 1;
        const mentorAppointments = appointments.filter(apt => apt.mentor_id === mentorId);
        
        // Update dashboard stats
        const today = new Date().toDateString();
        const todayAppointments = mentorAppointments.filter(apt => 
            new Date(apt.scheduled_time).toDateString() === today
        );
        const pendingAppointments = mentorAppointments.filter(apt => apt.status === 'pending');
        const completedAppointments = mentorAppointments.filter(apt => apt.status === 'completed');
        
        document.getElementById('mentorTotalAppointments').textContent = mentorAppointments.length;
        document.getElementById('mentorTodayAppointments').textContent = todayAppointments.length;
        document.getElementById('mentorPendingAppointments').textContent = pendingAppointments.length;
        document.getElementById('mentorCompletedAppointments').textContent = completedAppointments.length;
        
        // Display appointments
        const appointmentsHtml = mentorAppointments.map(appointment => `
            <div class="appointment-card ${appointment.status}">
                <div class="appointment-header">
                    <h4>Lịch hẹn với Student ${appointment.student_id}</h4>
                    <span class="appointment-status status-${appointment.status}">${appointment.status === 'pending' ? 'Chờ xác nhận' : 'Đã hoàn thành'}</span>
                </div>
                <p><strong>📅 Thời gian:</strong> ${new Date(appointment.scheduled_time).toLocaleString('vi-VN')}</p>
                <p><strong>⏱️ Thời lượng:</strong> ${appointment.duration || 60} phút</p>
                <p><strong>📝 Ghi chú:</strong> ${appointment.notes || 'Không có ghi chú'}</p>
                <div class="appointment-actions">
                    ${appointment.status === 'pending' ? 
                        `<button onclick="updateAppointmentStatus(${appointment.id}, 'completed')" class="btn" style="background: #28a745;">Xác nhận</button>` : 
                        `<span style="color: #28a745;">✓ Đã hoàn thành</span>`
                    }
                </div>
            </div>
        `).join('');
        
        document.getElementById('mentorAppointmentsList').innerHTML = appointmentsHtml || '<p>Chưa có lịch hẹn nào</p>';
    } catch (error) {
        console.error('Error loading mentor appointments:', error);
        document.getElementById('mentorAppointmentsList').innerHTML = '<p>Có lỗi khi tải lịch hẹn</p>';
    }
}

async function loadMentorFeedback() {
    try {
        // Use sample data for now
        const feedbacks = SAMPLE_DATA.feedbacks || [];
        
        // Filter feedback for current mentor
        const mentorId = currentUser?.id || 1;
        const mentorFeedbacks = feedbacks.filter(fb => fb.mentor_id === mentorId);
        
        // Calculate stats
        const totalFeedback = mentorFeedbacks.length;
        const averageRating = totalFeedback > 0 ? 
            (mentorFeedbacks.reduce((sum, fb) => sum + fb.rating, 0) / totalFeedback).toFixed(1) : 0;
        const fiveStarCount = mentorFeedbacks.filter(fb => fb.rating === 5).length;
        
        // Recent feedback (this week)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recentFeedback = mentorFeedbacks.filter(fb => 
            new Date(fb.created_at) >= oneWeekAgo
        ).length;
        
        // Update dashboard stats
        document.getElementById('mentorAverageRating').textContent = averageRating;
        document.getElementById('mentorTotalFeedback').textContent = totalFeedback;
        document.getElementById('mentor5StarRating').textContent = fiveStarCount;
        document.getElementById('mentorRecentFeedback').textContent = recentFeedback;
        
        // Display feedback
        const feedbacksHtml = mentorFeedbacks.map(feedback => `
            <div class="feedback-card">
                <div class="feedback-header">
                    <h4>Đánh giá từ Student ${feedback.student_id}</h4>
                    <span class="feedback-rating rating-${feedback.rating}">${'⭐'.repeat(feedback.rating)} (${feedback.rating}/5)</span>
                </div>
                <p><strong>💬 Nhận xét:</strong> ${feedback.comment}</p>
                <p><strong>📅 Ngày:</strong> ${new Date(feedback.created_at).toLocaleDateString('vi-VN')}</p>
            </div>
        `).join('');
        
        document.getElementById('mentorFeedbackList').innerHTML = feedbacksHtml || '<p>Chưa có đánh giá nào</p>';
    } catch (error) {
        console.error('Error loading mentor feedback:', error);
        document.getElementById('mentorFeedbackList').innerHTML = '<p>Có lỗi khi tải đánh giá</p>';
    }
}

// Admin functions
async function loadUserManagement() {
    try {
        // Load sample users for demo
        const users = SAMPLE_DATA.users || [];
        
        // Count users by role
        const students = users.filter(u => u.role === 'student').length;
        const mentors = users.filter(u => u.role === 'mentor').length;
        const admins = users.filter(u => u.role === 'admin').length;
        
        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('totalStudents').textContent = students;
        document.getElementById('totalMentors').textContent = mentors;
        document.getElementById('totalAdmins').textContent = admins;
        
        // Display users list
        const usersHtml = users.map(user => `
            <div class="item-card">
                <div class="item-header">
                    <h4 class="item-title">${user.username}</h4>
                    <span class="item-status status-${user.role}">${user.role.toUpperCase()}</span>
                </div>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Ngày tạo:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
                <div class="item-actions">
                    <button onclick="editUser(${user.id})" class="btn btn-sm">Chỉnh sửa</button>
                    <button onclick="deleteUser(${user.id})" class="btn btn-sm btn-danger">Xóa</button>
                </div>
            </div>
        `).join('');
        
        document.getElementById('usersList').innerHTML = usersHtml;
    } catch (error) {
        console.error('Error loading user management:', error);
    }
}

async function loadProjectManagement() {
    try {
        // Load project groups as projects
        const projects = SAMPLE_DATA.projectGroups || [];
        
        // Count projects by status
        const activeProjects = projects.filter(p => p.status === 'active').length;
        const completedProjects = projects.filter(p => p.status === 'completed').length;
        const pendingProjects = projects.filter(p => p.status === 'pending').length;
        
        document.getElementById('totalProjects').textContent = projects.length;
        document.getElementById('activeProjects').textContent = activeProjects;
        document.getElementById('completedProjects').textContent = completedProjects;
        document.getElementById('pendingProjects').textContent = pendingProjects;
        
        // Display projects list
        const projectsHtml = projects.map(project => `
            <div class="item-card">
                <div class="item-header">
                    <h4 class="item-title">${project.name}</h4>
                    <span class="item-status status-${project.status || 'active'}">${project.status || 'Active'}</span>
                </div>
                <p><strong>Chủ đề:</strong> ${project.topic}</p>
                <p><strong>Mô tả:</strong> ${project.description || 'Không có mô tả'}</p>
                <p><strong>Thành viên:</strong> ${project.member_count || 0} người</p>
                <p><strong>Ngày tạo:</strong> ${new Date(project.created_at).toLocaleDateString()}</p>
                <div class="item-actions">
                    <button onclick="editProject(${project.id})" class="btn btn-sm">Chỉnh sửa</button>
                    <button onclick="deleteProject(${project.id})" class="btn btn-sm btn-danger">Xóa</button>
                </div>
            </div>
        `).join('');
        
        document.getElementById('projectsList').innerHTML = projectsHtml || '<p>Chưa có dự án nào</p>';
    } catch (error) {
        console.error('Error loading project management:', error);
    }
}

async function loadReports() {
    try {
        // Calculate statistics
        const users = SAMPLE_DATA.users || [];
        const appointments = SAMPLE_DATA.appointments || [];
        const projectGroups = SAMPLE_DATA.projectGroups || [];
        const walletTransactions = SAMPLE_DATA.walletTransactions || [];
        
        // Calculate revenue
        const totalRevenue = walletTransactions
            .filter(t => t.type === 'earn')
            .reduce((sum, t) => sum + t.amount, 0);
        
        // Calculate average rating (mock data)
        const avgRating = 4.7;
        
        // Active users (users with appointments or projects)
        const activeUsers = new Set([
            ...appointments.map(a => a.student_id),
            ...appointments.map(a => a.mentor_id),
            ...projectGroups.map(p => p.members).flat()
        ]).size;
        
        document.getElementById('totalRevenue').textContent = totalRevenue;
        document.getElementById('totalSessions').textContent = appointments.length;
        document.getElementById('avgRating').textContent = avgRating;
        document.getElementById('activeUsers').textContent = activeUsers;
        
    } catch (error) {
        console.error('Error loading reports:', error);
    }
}

async function loadNotifications() {
    try {
        // Load notifications (static for now)
        console.log('Loading notifications...');
        
        // Add event listener for notification form
        const notificationForm = document.getElementById('notificationForm');
        if (notificationForm) {
            notificationForm.addEventListener('submit', handleSendNotification);
        }
        
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

// Handle send notification
async function handleSendNotification(e) {
    e.preventDefault();
    
    const title = document.getElementById('notificationTitle').value;
    const content = document.getElementById('notificationContent').value;
    const target = document.getElementById('notificationTarget').value;
    
    if (!title || !content || !target) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }
    
    try {
        // Create new notification
        const newNotification = {
            id: Date.now(),
            title: title,
            content: content,
            target: target,
            status: 'sent',
            created_at: new Date().toISOString()
        };
        
        // Add to sample data
        if (!SAMPLE_DATA.notifications) {
            SAMPLE_DATA.notifications = [];
        }
        SAMPLE_DATA.notifications.push(newNotification);
        
        alert(`Gửi thông báo thành công!\nTiêu đề: ${title}\nGửi đến: ${target}`);
        
        // Clear form
        document.getElementById('notificationForm').reset();
        
        // Reload notifications
        loadNotifications();
        
    } catch (error) {
        console.error('Error sending notification:', error);
        alert('Có lỗi xảy ra khi gửi thông báo.');
    }
}

// Forgot Password functions
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail').value;
    
    if (!email) {
        showError('forgotPasswordError', 'Vui lòng nhập email');
        return;
    }
    
    try {
        // Check if email exists in sample data
        const users = SAMPLE_DATA.users || [];
        const user = users.find(u => u.email === email);
        
        if (!user) {
            showError('forgotPasswordError', 'Email không tồn tại trong hệ thống');
            return;
        }
        
        // Generate verification code (6 digits)
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store verification code temporarily (in real app, this would be stored in database)
        if (!SAMPLE_DATA.verificationCodes) {
            SAMPLE_DATA.verificationCodes = {};
        }
        SAMPLE_DATA.verificationCodes[email] = {
            code: verificationCode,
            expires: Date.now() + 10 * 60 * 1000 // 10 minutes
        };
        
        // Simulate sending email
        showSuccess('forgotPasswordSuccess', `Mã xác minh đã được gửi đến ${email}\n\n📧 Mã xác minh: ${verificationCode}\n⏰ Mã có hiệu lực trong 10 phút\n\n(Demo: Mã được hiển thị để test)`);
        
        // Clear form
        document.getElementById('forgotPasswordFormElement').reset();
        
        // Switch to reset password form after 3 seconds
        setTimeout(() => {
            showResetPassword(email);
        }, 3000);
        
    } catch (error) {
        console.error('Error handling forgot password:', error);
        showError('forgotPasswordError', 'Có lỗi xảy ra. Vui lòng thử lại.');
    }
}

async function handleResetPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('resetEmail').value;
    const code = document.getElementById('resetCode').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (!code || !newPassword || !confirmPassword) {
        showError('resetPasswordError', 'Vui lòng điền đầy đủ thông tin');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError('resetPasswordError', 'Mật khẩu mới và xác nhận không khớp');
        return;
    }
    
    if (newPassword.length < 6) {
        showError('resetPasswordError', 'Mật khẩu phải có ít nhất 6 ký tự');
        return;
    }
    
    try {
        // Check verification code
        const verificationData = SAMPLE_DATA.verificationCodes?.[email];
        
        if (!verificationData) {
            showError('resetPasswordError', 'Mã xác minh không hợp lệ hoặc đã hết hạn');
            return;
        }
        
        if (verificationData.code !== code) {
            showError('resetPasswordError', 'Mã xác minh không đúng');
            return;
        }
        
        if (Date.now() > verificationData.expires) {
            showError('resetPasswordError', 'Mã xác minh đã hết hạn. Vui lòng yêu cầu mã mới.');
            return;
        }
        
        // Update password in sample data (in real app, this would update database)
        const users = SAMPLE_DATA.users || [];
        const userIndex = users.findIndex(u => u.email === email);
        
        if (userIndex !== -1) {
            // In real app, password would be hashed
            users[userIndex].password = newPassword; // This is just for demo
        }
        
        // Remove verification code
        delete SAMPLE_DATA.verificationCodes[email];
        
        showSuccess('resetPasswordSuccess', 'Đặt lại mật khẩu thành công!\n\nBạn có thể đăng nhập với mật khẩu mới.');
        
        // Clear form
        document.getElementById('resetPasswordFormElement').reset();
        
        // Switch to login form after 3 seconds
        setTimeout(() => {
            showLogin();
        }, 3000);
        
    } catch (error) {
        console.error('Error handling reset password:', error);
        showError('resetPasswordError', 'Có lỗi xảy ra. Vui lòng thử lại.');
    }
}

// Mentor appointment functions
function updateAppointmentStatus(appointmentId, newStatus) {
    try {
        // Update in sample data
        const appointment = SAMPLE_DATA.appointments.find(apt => apt.id === appointmentId);
        if (appointment) {
            appointment.status = newStatus;
            
            // Reload the appointments list
            loadMentorAppointments();
            
            // Show success message
            alert(`Đã cập nhật trạng thái lịch hẹn thành "${newStatus === 'completed' ? 'Đã hoàn thành' : 'Chờ xác nhận'}"`);
        }
    } catch (error) {
        console.error('Error updating appointment status:', error);
        alert('Có lỗi khi cập nhật trạng thái lịch hẹn');
    }
}

// Create sample data for new user
function createUserSampleData() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (!currentUser.id) return;
        
        // Create user-specific sample data
        const userSampleData = {
            todos: [
                {
                    id: 1,
                    title: "Hoàn thành dự án JavaScript",
                    description: "Làm xong project cuối kỳ môn JavaScript",
                    completed: false,
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    title: "Học React hooks",
                    description: "Tìm hiểu về useState, useEffect và custom hooks",
                    completed: false,
                    created_at: new Date().toISOString()
                },
                {
                    id: 3,
                    title: "Chuẩn bị CV xin việc",
                    description: "Cập nhật CV và portfolio để apply internship",
                    completed: true,
                    created_at: new Date().toISOString()
                }
            ],
            appointments: [
                {
                    id: 1,
                    mentor_id: 1,
                    student_id: currentUser.id,
                    scheduled_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
                    duration: 60,
                    notes: "Thảo luận về dự án JavaScript và cách tối ưu hóa performance",
                    status: "pending",
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    mentor_id: 2,
                    student_id: currentUser.id,
                    scheduled_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
                    duration: 90,
                    notes: "Học Python Django và database design",
                    status: "pending",
                    created_at: new Date().toISOString()
                }
            ],
            projectGroups: [
                {
                    id: 1,
                    name: "Dự án Web App",
                    description: "Xây dựng ứng dụng web quản lý sinh viên",
                    members: [currentUser.username],
                    status: "active",
                    created_at: new Date().toISOString()
                }
            ],
            wallet: {
                balance: 1000,
                last_updated: new Date().toISOString()
            },
            walletTransactions: [
                {
                    id: 1,
                    amount: 1000,
                    type: "credit",
                    description: "Điểm khởi tạo tài khoản",
                    created_at: new Date().toISOString()
                }
            ]
        };
        
        // Save to localStorage
        localStorage.setItem('userSampleData', JSON.stringify(userSampleData));
        
        // Show welcome message
        setTimeout(() => {
            alert(`🎉 Chào mừng ${currentUser.username}!\n\n✅ Đã tạo dữ liệu mẫu cho bạn:\n• 3 công việc cần làm\n• 2 lịch hẹn với mentor (1 và 3 ngày tới)\n• 1 nhóm dự án\n• 1000 điểm trong ví\n\nHãy khám phá các tính năng của MentorHub!`);
        }, 500);
        
        // Reload dashboard to show new data
        setTimeout(() => {
            loadDashboard();
        }, 1000);
        
    } catch (error) {
        console.error('Error creating user sample data:', error);
    }
}

// Profile functions
async function loadProfile() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showError('profileUpdateError', 'Bạn cần đăng nhập để xem trang cá nhân');
            return;
        }

        const response = await fetch(`${API_BASE}/users/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            const profile = result.data;
            
            // Update profile display
            document.getElementById('profileUsername').textContent = profile.username;
            document.getElementById('profileAvatarLarge').textContent = profile.username.charAt(0).toUpperCase();
            
            // Update role badge
            const roleBadge = document.getElementById('profileRoleBadge');
            const roleMap = {
                'student': { text: 'Sinh viên', class: 'role-student' },
                'mentor': { text: 'Mentor', class: 'role-mentor' },
                'admin': { text: 'Admin', class: 'role-admin' }
            };
            const roleInfo = roleMap[profile.role] || { text: profile.role, class: 'role-student' };
            roleBadge.textContent = roleInfo.text;
            roleBadge.className = `profile-role-badge ${roleInfo.class}`;
            
            // Update join date
            if (profile.created_at) {
                const joinDate = new Date(profile.created_at).toLocaleDateString('vi-VN');
                document.getElementById('profileJoinDate').textContent = joinDate;
            }
            
            // Update profile fields
            document.getElementById('displayUsername').textContent = profile.username;
            document.getElementById('displayEmail').textContent = profile.email;
            document.getElementById('displayFullName').textContent = profile.full_name || 'Chưa cập nhật';
            document.getElementById('displayPhone').textContent = profile.phone || 'Chưa cập nhật';
            document.getElementById('displayRole').textContent = roleInfo.text;
            document.getElementById('displayUserId').textContent = profile.id;
            
            // Store profile data for editing
            window.currentProfileData = profile;
            
        } else {
            const error = await response.json();
            showError('profileUpdateError', error.error || 'Không thể tải thông tin cá nhân');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('profileUpdateError', 'Có lỗi xảy ra khi tải thông tin cá nhân');
    }
}

function enableProfileEdit() {
    if (!window.currentProfileData) {
        showError('profileUpdateError', 'Không có dữ liệu để chỉnh sửa');
        return;
    }
    
    // Hide view mode, show edit mode
    document.getElementById('profileViewMode').style.display = 'none';
    document.getElementById('profileEditMode').style.display = 'block';
    
    // Populate form with current data
    document.getElementById('editEmail').value = window.currentProfileData.email || '';
    document.getElementById('editFullName').value = window.currentProfileData.full_name || '';
    document.getElementById('editPhone').value = window.currentProfileData.phone || '';
    
    // Hide messages
    document.getElementById('profileUpdateMessage').style.display = 'none';
    document.getElementById('profileUpdateError').style.display = 'none';
    
    // Setup form submission
    const form = document.getElementById('profileForm');
    form.onsubmit = handleProfileUpdate;
}

function cancelProfileEdit() {
    // Show view mode, hide edit mode
    document.getElementById('profileViewMode').style.display = 'block';
    document.getElementById('profileEditMode').style.display = 'none';
    
    // Hide messages
    document.getElementById('profileUpdateMessage').style.display = 'none';
    document.getElementById('profileUpdateError').style.display = 'none';
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showError('profileUpdateError', 'Bạn cần đăng nhập để cập nhật thông tin');
            return;
        }
        
        const formData = {
            email: document.getElementById('editEmail').value,
            full_name: document.getElementById('editFullName').value,
            phone: document.getElementById('editPhone').value
        };
        
        const response = await fetch(`${API_BASE}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const result = await response.json();
            
            // Update stored profile data
            window.currentProfileData = result.data;
            
            // Update display
            document.getElementById('displayEmail').textContent = result.data.email;
            document.getElementById('displayFullName').textContent = result.data.full_name || 'Chưa cập nhật';
            document.getElementById('displayPhone').textContent = result.data.phone || 'Chưa cập nhật';
            
            // Show success message
            document.getElementById('profileUpdateMessage').style.display = 'block';
            document.getElementById('profileUpdateError').style.display = 'none';
            
            // Return to view mode
            setTimeout(() => {
                cancelProfileEdit();
            }, 2000);
            
        } else {
            const error = await response.json();
            document.getElementById('profileUpdateError').textContent = error.error || 'Cập nhật thông tin thất bại';
            document.getElementById('profileUpdateError').style.display = 'block';
            document.getElementById('profileUpdateMessage').style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error updating profile:', error);
        document.getElementById('profileUpdateError').textContent = 'Có lỗi xảy ra khi cập nhật thông tin';
        document.getElementById('profileUpdateError').style.display = 'block';
        document.getElementById('profileUpdateMessage').style.display = 'none';
    }
}

// Utility functions
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
}

function showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.remove('hidden');
    }
}
