// API Configuration
const API_BASE = 'http://localhost:6868/api';

// Global state
let currentUser = null;
let currentPage = 'todos';
let userRole = 'student';

// Minimal fallback data to guarantee Admin has data even if SAMPLE_DATA fails to load
const DEFAULT_DATA = {
    users: [
        { id: 14, username: 'admin_demo', email: 'admin_demo@example.com', role: 'admin', created_at: '2025-01-12T00:00:00Z' },
        { id: 2, username: 'student1', email: 'student1@example.com', role: 'student', created_at: '2025-01-02T00:00:00Z' },
        { id: 13, username: 'mentor_demo', email: 'mentor_demo@example.com', role: 'mentor', created_at: '2025-01-11T00:00:00Z' }
    ],
    courses: [
        { id: 1, name: 'JavaScript cơ bản', description: 'JS nền tảng', duration: 6, level: 'beginner', instructor: 'Nguyễn Văn A', created_at: '2025-01-01T00:00:00Z' },
        { id: 2, name: 'React.js', description: 'React hooks, state', duration: 8, level: 'intermediate', instructor: 'Trần Thị B', created_at: '2025-01-02T00:00:00Z' },
        { id: 3, name: 'Node.js Backend', description: 'API với Express', duration: 10, level: 'advanced', instructor: 'Lê Văn C', created_at: '2025-01-03T00:00:00Z' }
    ],
    mentors: [
        { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@example.com', expertise: 'JavaScript, React', experience: 5, bio: 'JS expert', rating: 4.8, created_at: '2025-01-01T00:00:00Z' },
        { id: 2, name: 'Trần Thị B', email: 'tranthib@example.com', expertise: 'React, Vue', experience: 4, bio: 'Frontend dev', rating: 4.9, created_at: '2025-01-02T00:00:00Z' },
        { id: 3, name: 'Lê Văn C', email: 'levanc@example.com', expertise: 'Node.js, DB', experience: 6, bio: 'Backend dev', rating: 4.7, created_at: '2025-01-03T00:00:00Z' }
    ],
    appointments: [
        { id: 1, mentor_id: 1, student_id: 2, scheduled_time: '2025-01-15T14:00:00Z', duration: 60, notes: 'Trao đổi JS', status: 'pending', created_at: '2025-01-09T10:00:00Z' },
        { id: 2, mentor_id: 2, student_id: 2, scheduled_time: '2025-01-18T10:00:00Z', duration: 90, notes: 'React best practices', status: 'completed', created_at: '2025-01-08T15:30:00Z' }
    ],
    projectGroups: [],
    feedbacks: [
        { id: 1, mentor_id: 1, student_id: 2, rating: 5, comment: 'Rất hữu ích', created_at: '2025-01-14T15:30:00Z' }
    ],
    notifications: [],
    mentorAvailabilities: [
        // Weekly availability: weekday 1-5 (Mon-Fri), 09:00-17:00, slot 60m
        { mentor_id: 1, weekday: [1,2,3,4,5], start: '09:00', end: '17:00', slotMinutes: 60 },
        { mentor_id: 2, weekday: [1,3,5], start: '13:00', end: '18:00', slotMinutes: 60 },
        { mentor_id: 3, weekday: [2,4], start: '08:00', end: '12:00', slotMinutes: 60 }
    ]
};

// Lightweight storage helpers
function getStore(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : (fallback !== undefined ? fallback : null);
    } catch (_e) {
        return (fallback !== undefined ? fallback : null);
    }
}

function setStore(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function backfillIfEmpty(key, fallbackArray) {
    const data = getStore(key, []);
    if (Array.isArray(data) && data.length === 0 && Array.isArray(fallbackArray) && fallbackArray.length > 0) {
        setStore(key, fallbackArray);
        return fallbackArray;
    }
    return data;
}

// Seed localStorage once from SAMPLE_DATA for global datasets (admin/system scope)
function initAppData() {
    const maps = {
        users: 'users',
        courses: 'courses',
        mentors: 'mentors',
        appointments: 'appointments',
        projectGroups: 'projectGroups',
        feedbacks: 'feedbacks',
        notifications: 'notifications',
        mentorAvailabilities: 'mentorAvailabilities'
    };
    Object.keys(maps).forEach((k) => {
        const lsKey = k;
        if (!localStorage.getItem(lsKey)) {
            const src = (typeof SAMPLE_DATA !== 'undefined' && SAMPLE_DATA[maps[k]])
                ? SAMPLE_DATA[maps[k]]
                : (DEFAULT_DATA[maps[k]] || []);
            setStore(lsKey, src);
        }
        // If key exists but is empty, backfill from DEFAULT_DATA
        const current = getStore(lsKey, []);
        if (Array.isArray(current) && current.length === 0) {
            const fb = DEFAULT_DATA[maps[k]] || [];
            if (fb.length > 0) setStore(lsKey, fb);
        }
    });
}

// Load sample data script safely and return a promise when ready
function loadSampleDataScript() {
    return new Promise((resolve) => {
        if (typeof SAMPLE_DATA !== 'undefined' && SAMPLE_DATA.courses && SAMPLE_DATA.mentors) {
            resolve();
            return;
        }
        const sampleDataScript = document.createElement('script');
        sampleDataScript.src = '/sample-data.js';
        sampleDataScript.onload = () => resolve();
        sampleDataScript.onerror = () => resolve();
        document.head.appendChild(sampleDataScript);
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, initializing app...');
    
    // Load sample data script and wait until available
    await loadSampleDataScript();
    // Seed app data to localStorage (one-time per key)
    initAppData();
    
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
        
        // Check if user has sample data, if not create it
        const userSampleData = JSON.parse(localStorage.getItem('userSampleData') || '{}');
        console.log('User sample data on load:', userSampleData);
        
        if (!userSampleData.todos || userSampleData.todos.length === 0) {
            console.log('No user sample data found, creating...');
            createUserSampleData();
        } else {
            console.log('User sample data found, loading...');
            showMainApp();
        }
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
    
    // Student feedback form
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleSubmitFeedback);
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
            localStorage.setItem('currentUser', JSON.stringify({
                id: data.user.id,
                username: username, 
                role: data.user.role 
            }));
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
            // Backend rejected. Try local fallback auth for demo
            const users = getStore('users', []);
            const localUser = users.find(u => u.username === username && u.password === password);
            if (localUser) {
                const role = (localUser.role || 'student').toLowerCase();
                localStorage.setItem('token', 'local');
                localStorage.setItem('username', username);
                localStorage.setItem('userRole', role);
                localStorage.setItem('currentUser', JSON.stringify({ id: localUser.id || Date.now(), username, role }));
                currentUser = { username, role, id: localUser.id || Date.now() };
                userRole = role;
                alert(`Đăng nhập (offline) thành công!\n\n👤 ${username}\n🎭 Vai trò: ${role.toUpperCase()}`);
                showMainApp();
            } else {
                showError('loginError', data.error || 'Login failed');
            }
        }
    } catch (error) {
        // Network error: try local fallback auth
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const users = getStore('users', []);
        const localUser = users.find(u => u.username === username && u.password === password);
        if (localUser) {
            const role = (localUser.role || 'student').toLowerCase();
            localStorage.setItem('token', 'local');
            localStorage.setItem('username', username);
            localStorage.setItem('userRole', role);
            localStorage.setItem('currentUser', JSON.stringify({ id: localUser.id || Date.now(), username, role }));
            currentUser = { username, role, id: localUser.id || Date.now() };
            userRole = role;
            alert(`Đăng nhập (offline) thành công!\n\n👤 ${username}\n🎭 Vai trò: ${role.toUpperCase()}`);
            showMainApp();
        } else {
            showError('loginError', 'Network error. Make sure backend is running on port 6868.');
        }
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
    
    // Load dashboard data immediately
    loadDashboard();
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
        case 'mentorEarnings':
            loadMentorEarnings();
            break;
        case 'mentorChat':
            loadMentorChat();
            break;
        case 'mentorStatistics':
            loadMentorStatistics();
            break;
        case 'mentorDashboard':
            loadMentorDashboard();
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
            
            // Persist new user to localStorage users so Admin can see it
            const users = getStore('users', []);
            const newId = users.length ? Math.max(...users.map(u => u.id || 0)) + 1 : Date.now();
            users.push({ id: newId, username, email, role, created_at: new Date().toISOString() });
            setStore('users', users);

            // Clear form
            document.getElementById('registerForm').reset();
            
            // Auto switch to login after 3 seconds
            setTimeout(() => {
                showLogin();
            }, 3000);
        } else {
            // Backend rejected => try local registration fallback
            const users = getStore('users', []);
            if (users.some(u => u.username === username)) {
                showError('registerError', 'Username đã tồn tại');
                return;
            }
            const newId = users.length ? Math.max(...users.map(u => u.id || 0)) + 1 : Date.now();
            users.push({ id: newId, username, email, password, role, created_at: new Date().toISOString() });
            setStore('users', users);
            showSuccess('registerSuccess', `Đăng ký (offline) thành công!\n\n👤 ${username}\n🎭 ${role}\n📧 ${email}`);
            document.getElementById('registerForm').reset();
            setTimeout(() => showLogin(), 1500);
        }
        
    } catch (error) {
        // Network error => local fallback
        const users = getStore('users', []);
        if (users.some(u => u.username === username)) {
            showError('registerError', 'Username đã tồn tại');
            return;
        }
        const newId = users.length ? Math.max(...users.map(u => u.id || 0)) + 1 : Date.now();
        users.push({ id: newId, username, email, password, role, created_at: new Date().toISOString() });
        setStore('users', users);
        showSuccess('registerSuccess', `Đăng ký (offline) thành công!\n\n👤 ${username}\n🎭 ${role}\n📧 ${email}`);
        document.getElementById('registerForm').reset();
        setTimeout(() => showLogin(), 1500);
    }
}

// Dashboard
async function loadDashboard() {
    try {
        // Load user sample data first
        const userSampleData = JSON.parse(localStorage.getItem('userSampleData') || '{}');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const roleFromStorage = (localStorage.getItem('userRole') || currentUser.role || 'student').toLowerCase();

        // Ensure SAMPLE_DATA is always available
        if (!SAMPLE_DATA.courses || SAMPLE_DATA.courses.length === 0) {
            loadSampleDataScript();
        }
        if (!SAMPLE_DATA.mentors || SAMPLE_DATA.mentors.length === 0) {
            loadSampleDataScript();
        }

        const now = new Date();

        if (roleFromStorage === 'admin') {
            // Admin dashboard: show system-wide, real-time stats
            const allUsers = backfillIfEmpty('users', DEFAULT_DATA.users);
            const allCourses = backfillIfEmpty('courses', DEFAULT_DATA.courses);
            const allMentors = backfillIfEmpty('mentors', DEFAULT_DATA.mentors);
            const allAppointments = backfillIfEmpty('appointments', DEFAULT_DATA.appointments);
            const upcomingAllAppointments = allAppointments.filter(apt => new Date(apt.scheduled_time) >= now);

            // Update labels for admin context
            const todosLabel = document.getElementById('todosLabel');
            const coursesLabel = document.getElementById('coursesLabel');
            const mentorsLabel = document.getElementById('mentorsLabel');
            const appointmentsLabel = document.getElementById('appointmentsLabel');
            if (todosLabel) todosLabel.textContent = 'Tổng số người dùng';
            if (coursesLabel) coursesLabel.textContent = 'Tổng số khóa học';
            if (mentorsLabel) mentorsLabel.textContent = 'Tổng số mentor';
            if (appointmentsLabel) appointmentsLabel.textContent = 'Lịch hẹn sắp tới (toàn hệ thống)';

            // Set values
            document.getElementById('todosCount').textContent = allUsers.length;
            document.getElementById('coursesCount').textContent = allCourses.length;
            document.getElementById('mentorsCount').textContent = allMentors.length;
            document.getElementById('appointmentsCount').textContent = upcomingAllAppointments.length;

            // Show upcoming appointments across the system
            displayUpcomingAppointments(allAppointments);
        } else {
            // Student/Mentor: show user-specific stats
            // Reset labels back to student/mentor context
            const todosLabel = document.getElementById('todosLabel');
            const coursesLabel = document.getElementById('coursesLabel');
            const mentorsLabel = document.getElementById('mentorsLabel');
            const appointmentsLabel = document.getElementById('appointmentsLabel');
            if (todosLabel) todosLabel.textContent = 'Công việc cần làm';
            if (coursesLabel) coursesLabel.textContent = 'Khóa học đã đăng ký';
            if (mentorsLabel) mentorsLabel.textContent = 'Mentor có sẵn';
            if (appointmentsLabel) appointmentsLabel.textContent = 'Lịch hẹn sắp tới';
            const todos = userSampleData.todos || [];
            const pendingTodos = todos.filter(todo => !todo.completed);
            document.getElementById('todosCount').textContent = pendingTodos.length;

            const courses = backfillIfEmpty('courses', DEFAULT_DATA.courses);
            document.getElementById('coursesCount').textContent = courses.length;

            const mentors = backfillIfEmpty('mentors', DEFAULT_DATA.mentors);
            document.getElementById('mentorsCount').textContent = mentors.length;

            const appointments = userSampleData.appointments || [];
            const upcomingAppointments = appointments.filter(apt => new Date(apt.scheduled_time) >= now);
            document.getElementById('appointmentsCount').textContent = upcomingAppointments.length;

            displayUpcomingAppointments(appointments);
        }
        
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
                    <p><strong>Thời gian:</strong> ${formatDateTime(appointment.scheduled_time)}</p>
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

// Todos (localStorage-based)
async function loadTodos() {
    try {
        const userSampleData = JSON.parse(localStorage.getItem('userSampleData') || '{}');
        const todos = Array.isArray(userSampleData.todos) ? userSampleData.todos : [];
        displayTodos(todos);
    } catch (error) {
        console.error('Error loading todos:', error);
        displayTodos([]);
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
                <span class="item-status status-${todo.status || 'pending'}">${todo.status || 'pending'}</span>
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
        todosList.innerHTML = '<div class="card"><p>Chưa có công việc nào. Hãy thêm công việc đầu tiên!</p></div>';
    }
}

async function handleAddTodo(e) {
    e.preventDefault();
    const title = (document.getElementById('todoTitle').value || '').trim();
    const description = (document.getElementById('todoDescription').value || '').trim();
    const status = document.getElementById('todoStatus').value || 'pending';
    if (!title) {
        alert('Vui lòng nhập tiêu đề công việc');
        return;
    }
    try {
        const userSampleData = JSON.parse(localStorage.getItem('userSampleData') || '{}');
        if (!userSampleData || typeof userSampleData !== 'object') {
            localStorage.setItem('userSampleData', JSON.stringify({ todos: [] }));
        }
        const fresh = JSON.parse(localStorage.getItem('userSampleData') || '{}');
        if (!Array.isArray(fresh.todos)) fresh.todos = [];
        fresh.todos.push({
            id: Date.now(),
            title,
            description,
            status,
            created_at: new Date().toISOString()
        });
        localStorage.setItem('userSampleData', JSON.stringify(fresh));
        const formEl = document.getElementById('todoForm');
        if (formEl) formEl.reset();
        loadTodos();
        loadDashboard();
    } catch (error) {
        console.error('Error adding todo:', error);
        alert('Không thể thêm công việc: ' + (error?.message || 'Lỗi không xác định'));
    }
}

async function deleteTodo(id) {
    if (!confirm('Bạn có chắc muốn xóa công việc này?')) return;
    try {
        const userSampleData = JSON.parse(localStorage.getItem('userSampleData') || '{}');
        userSampleData.todos = (userSampleData.todos || []).filter(t => Number(t.id) !== Number(id));
        localStorage.setItem('userSampleData', JSON.stringify(userSampleData));
        loadTodos();
        if (currentPage === 'dashboard') loadDashboard();
    } catch (error) {
        console.error('Error deleting todo:', error);
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
            <td>${course.start_date ? formatDate(course.start_date) : ''}</td>
            <td>${course.end_date ? formatDate(course.end_date) : ''}</td>
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
        // Load user-specific appointments from localStorage
        const userSampleData = JSON.parse(localStorage.getItem('userSampleData') || '{}');
        const appointments = userSampleData.appointments || [];
        console.log('Loading appointments:', appointments.length, 'appointments found');
        displayAppointments(appointments);
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

// Project Groups
async function loadProjectGroups() {
    try {
        // Load user-specific project groups from localStorage
        const userSampleData = JSON.parse(localStorage.getItem('userSampleData') || '{}');
        const groups = userSampleData.projectGroups || [];
        
        const groupsHtml = groups.map(group => `
            <div class="item-card">
                <div class="item-header">
                    <h4 class="item-title">${group.name}</h4>
                    <span class="item-status status-${group.status || 'active'}">${group.status || 'Active'}</span>
                </div>
                <p><strong>Chủ đề:</strong> ${group.topic}</p>
                <p><strong>Mô tả:</strong> ${group.description || 'Không có mô tả'}</p>
                <p><strong>Thành viên:</strong> ${group.member_count || 0} người</p>
                <p><strong>Ngày tạo:</strong> ${formatDate(group.created_at)}</p>
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
        
        // Load user-specific wallet from localStorage
        const userSampleData = JSON.parse(localStorage.getItem('userSampleData') || '{}');
        const wallet = userSampleData.wallet || {
            id: userId,
            user_id: userId,
            balance: 0,
            total_spent: 0,
            total_earned: 0
        };
        
        document.getElementById('walletBalance').textContent = wallet.balance || 0;
        document.getElementById('totalSpent').textContent = wallet.total_spent || 0;
        document.getElementById('totalEarned').textContent = wallet.total_earned || 0;
        
        // Load transactions from user data
        const transactions = userSampleData.wallet?.transactions || [];
        
        if (transactions.length > 0) {
            const historyHtml = transactions.map(transaction => `
                <div class="item-card">
                    <div class="item-header">
                        <h4 class="item-title">${transaction.description}</h4>
                        <span class="item-status ${transaction.type === 'earn' ? 'status-success' : 'status-danger'}">
                            ${transaction.type === 'earn' ? '+' : '-'}${transaction.amount} điểm
                        </span>
                    </div>
                    <p><strong>Ngày:</strong> ${formatDate(transaction.timestamp || transaction.created_at)}</p>
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
        // Load from localStorage to persist across reloads
        const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
        
        const feedbacksHtml = feedbacks.map(feedback => `
            <div class="item-card">
                <div class="item-header">
                    <h4 class="item-title">Đánh giá ${feedback.mentor_name || ('Mentor ' + feedback.mentor_id)}</h4>
                    <span class="item-status">${'⭐'.repeat(feedback.rating)}</span>
                </div>
                <p><strong>Nhận xét:</strong> ${feedback.comment}</p>
                <p><strong>Ngày:</strong> ${formatDate(feedback.created_at)}</p>
            </div>
        `).join('');
        
        document.getElementById('feedbackHistory').innerHTML = feedbacksHtml || '<p>Chưa có đánh giá nào</p>';
    } catch (error) {
        console.error('Error loading feedback:', error);
        document.getElementById('feedbackHistory').innerHTML = '<p>Error loading feedback</p>';
    }
}

// Submit student feedback
async function handleSubmitFeedback(e) {
    e.preventDefault();
    const mentorId = parseInt(document.getElementById('feedbackMentor').value, 10);
    const rating = parseInt(document.getElementById('feedbackRating').value, 10);
    const comment = (document.getElementById('feedbackComment').value || '').trim();
    const current = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!mentorId || !rating) {
        alert('Vui lòng chọn mentor và mức đánh giá');
        return;
    }
    
    const mentors = backfillIfEmpty('mentors', DEFAULT_DATA.mentors) || [];
    const m = mentors.find(x => Number(x.id) === mentorId);
    const feedback = {
        id: Date.now(),
        mentor_id: mentorId,
        mentor_name: m?.name || `Mentor ${mentorId}`,
        student_id: current.id,
        rating: rating,
        comment: comment,
        created_at: new Date().toISOString()
    };
    
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    feedbacks.unshift(feedback);
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    
    alert('✅ Gửi đánh giá thành công!');
    document.getElementById('feedbackForm').reset();
    loadFeedback();
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

// Add points function (persistent, localStorage-based)
async function addPoints() {
    const amountEl = document.getElementById('addPointsAmount');
    const descEl = document.getElementById('addPointsDescription');
    const methodEl = document.getElementById('paymentMethod');
    
    const amount = parseInt((amountEl?.value || '').trim(), 10);
    const description = (descEl?.value || 'Nạp điểm').trim();
    const paymentMethod = (methodEl?.value || '').trim();
    
    if (!Number.isFinite(amount) || amount <= 0) {
        alert('Vui lòng nhập số điểm hợp lệ (lớn hơn 0)');
        return;
    }
    if (!paymentMethod) {
        alert('Vui lòng chọn hình thức thanh toán');
        return;
    }
    
    try {
        const userId = currentUser?.id || 1;
        const userSampleData = JSON.parse(localStorage.getItem('userSampleData') || '{}');
        
        if (!userSampleData.wallet) {
            userSampleData.wallet = {
                id: userId,
                user_id: userId,
                balance: 0,
                total_spent: 0,
                total_earned: 0,
                transactions: []
            };
        }
        
        const currentBalance = parseInt(userSampleData.wallet.balance || 0, 10) || 0;
        const newBalance = currentBalance + amount;
        
        const transaction = {
            id: Date.now(),
            wallet_id: userId,
            amount: amount,
            type: 'earn',
            description: `${description} (${paymentMethod})`,
            created_at: new Date().toISOString()
        };
        
        userSampleData.wallet.transactions = userSampleData.wallet.transactions || [];
        userSampleData.wallet.transactions.push(transaction);
        userSampleData.wallet.balance = newBalance;
        userSampleData.wallet.total_earned = (parseInt(userSampleData.wallet.total_earned || 0, 10) || 0) + amount;
        
        localStorage.setItem('userSampleData', JSON.stringify(userSampleData));
        
        await loadWallet();
        
        const paymentMethodText = {
            'credit_card': '💳 Thẻ tín dụng',
            'debit_card': '💳 Thẻ ghi nợ',
            'bank_transfer': '🏦 Chuyển khoản ngân hàng',
            'momo': '📱 Ví MoMo',
            'zalopay': '📱 Ví ZaloPay',
            'demo': '🎯 Demo (Miễn phí)'
        };
        
        alert(`Nạp ${amount} điểm thành công!\n\n${paymentMethodText[paymentMethod] || paymentMethod}\n💰 Số dư mới: ${newBalance} điểm`);
        
        if (amountEl) amountEl.value = '';
        if (descEl) descEl.value = '';
        if (methodEl) methodEl.value = '';
        
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
        
        // Get user sample data
        const userSampleData = JSON.parse(localStorage.getItem('userSampleData') || '{}');
        
        // Initialize project groups if not exists
        if (!userSampleData.projectGroups) {
            userSampleData.projectGroups = [];
        }
        userSampleData.projectGroups.push(newGroup);
        
        // Save to localStorage
        localStorage.setItem('userSampleData', JSON.stringify(userSampleData));
        
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
        // Use sample data instead of API
        const mentors = SAMPLE_DATA.mentors || [];
        console.log('Loading mentors for appointment:', mentors.length, 'mentors found');
        console.log('SAMPLE_DATA.mentors:', SAMPLE_DATA.mentors);
        
        const mentorSelect = document.getElementById('appointmentMentor');
        console.log('mentorSelect element:', mentorSelect);
        
        if (mentorSelect) {
            // Clear existing options except the first one
            mentorSelect.innerHTML = '<option value="">-- Chọn mentor --</option>';
            
            // Add mentors to dropdown
            mentors.forEach((mentor, index) => {
                console.log(`Adding mentor ${index + 1}:`, mentor);
                const option = document.createElement('option');
                option.value = mentor.id;
                option.textContent = `${mentor.name} - ${mentor.expertise}`;
                mentorSelect.appendChild(option);
            });
            
            // Render time slots based on availability and existing appointments
            const dateEl = document.getElementById('appointmentDate');
            const timeEl = document.getElementById('appointmentTime');
            const durationEl = document.getElementById('appointmentDuration');
            const renderSlots = () => {
                if (!dateEl || !timeEl) return;
                const mentorId = parseInt(mentorSelect.value, 10);
                const dateStr = dateEl.value; // yyyy-mm-dd
                const duration = parseInt((durationEl?.value || '60'), 10) || 60;
                if (!mentorId || !dateStr) return;
                const slots = getAvailableSlotsForDate(mentorId, dateStr, duration);
                timeEl.innerHTML = '';
                if (slots.length === 0) {
                    const opt = document.createElement('option');
                    opt.value = '';
                    opt.textContent = 'Không còn giờ trống';
                    timeEl.appendChild(opt);
                } else {
                    slots.forEach(t => {
                        const opt = document.createElement('option');
                        opt.value = t;
                        opt.textContent = t;
                        timeEl.appendChild(opt);
                    });
                }
            };
            mentorSelect.addEventListener('change', renderSlots);
            if (dateEl) dateEl.addEventListener('change', renderSlots);
            if (durationEl) durationEl.addEventListener('change', renderSlots);
            
            console.log('Added', mentors.length, 'mentors to dropdown');
            console.log('Final dropdown options:', mentorSelect.options.length);
        } else {
            console.error('appointmentMentor element not found');
        }
    } catch (error) {
        console.error('Error loading mentors for appointment:', error);
    }
}

// Load mentors for feedback dropdown
async function loadMentorsForFeedback() {
    try {
        const mentorSelect = document.getElementById('feedbackMentor');
        if (!mentorSelect) return;
        mentorSelect.innerHTML = '<option value="">-- Chọn mentor --</option>';

        const current = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const sysAppointments = getStore('appointments', []);
        const userData = JSON.parse(localStorage.getItem('userSampleData') || '{}');
        const userAppointments = Array.isArray(userData.appointments) ? userData.appointments : [];
        const sampleAppointments = (typeof SAMPLE_DATA !== 'undefined' && Array.isArray(SAMPLE_DATA.appointments)) ? SAMPLE_DATA.appointments : [];

        // Merge sources and filter completed by this student (ensure numeric compare)
        const merged = [...sysAppointments, ...userAppointments, ...sampleAppointments];
        const currentId = Number(current.id);
        const completedForUser = merged.filter(a => a && Number(a.student_id) === currentId && a.status === 'completed');
        const uniqueMentorIds = Array.from(new Set(completedForUser.map(a => a.mentor_id)));

        // Build a rich lookup map from multiple sources
        const mentorsLS = backfillIfEmpty('mentors', DEFAULT_DATA.mentors) || [];
        const mentorsSample = (typeof SAMPLE_DATA !== 'undefined' && Array.isArray(SAMPLE_DATA.mentors)) ? SAMPLE_DATA.mentors : [];
        const idToMentor = new Map([
            ...mentorsLS.map(m => [Number(m.id), m]),
            ...mentorsSample.map(m => [Number(m.id), m])
        ]);

        uniqueMentorIds.forEach(mid => {
            const m = idToMentor.get(Number(mid)) || { id: mid, name: `Mentor ${mid}` };
            const option = document.createElement('option');
            option.value = mid;
            option.textContent = m.name || `Mentor ${mid}`;
            mentorSelect.appendChild(option);
        });

        // If still empty, hint user
        if (mentorSelect.options.length === 1) {
            const opt = document.createElement('option');
            opt.disabled = true;
            opt.textContent = 'Chưa có mentor nào đã hoàn thành để đánh giá';
            mentorSelect.appendChild(opt);
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
        const appointmentsHtml = appointments.map(appointment => {
            const mentor = SAMPLE_DATA.mentors.find(m => m.id === appointment.mentor_id);
            const mentorName = mentor ? mentor.name : `Mentor ${appointment.mentor_id}`;
            
            return `
                <div class="item-card">
                    <div class="item-header">
                        <h4 class="item-title">Lịch hẹn với ${mentorName}</h4>
                        <span class="item-status status-${appointment.status || 'pending'}">${appointment.status || 'pending'}</span>
                    </div>
                    <p><strong>Thời gian:</strong> ${appointment.scheduled_time ? formatDateTime(appointment.scheduled_time) : 'Chưa xác định'}</p>
                    <p><strong>Ghi chú:</strong> ${appointment.notes || 'Không có ghi chú'}</p>
                    <p><strong>Ngày tạo:</strong> ${formatDate(appointment.created_at)}</p>
                    <div class="item-actions">
                        <button onclick="editAppointment(${appointment.id})" class="btn btn-sm">✏️ Chỉnh sửa</button>
                        <button onclick="deleteAppointment(${appointment.id})" class="btn btn-sm btn-danger">🗑️ Xóa</button>
                        ${appointment.status === 'completed' ? '' : `<button onclick="studentCompleteAppointment(${appointment.id})" class="btn btn-sm" style="background:#28a745;">✅ Đánh dấu hoàn thành</button>`}
                    </div>
                </div>
            `;
        }).join('');
        
        appointmentsList.innerHTML = appointmentsHtml || '<p>Chưa có lịch hẹn nào</p>';
    }
}

// Student marks an appointment as completed
function studentCompleteAppointment(appointmentId) {
    try {
        // Update in user-specific data
        const userSampleData = JSON.parse(localStorage.getItem('userSampleData') || '{}');
        if (Array.isArray(userSampleData.appointments)) {
            const idx = userSampleData.appointments.findIndex(a => a.id === appointmentId);
            if (idx !== -1) {
                userSampleData.appointments[idx].status = 'completed';
                localStorage.setItem('userSampleData', JSON.stringify(userSampleData));
            }
        }

        // Mirror to system-level appointments in localStorage
        const sysAppointments = getStore('appointments', []);
        const sIdx = sysAppointments.findIndex(a => a.id === appointmentId);
        if (sIdx !== -1) {
            sysAppointments[sIdx].status = 'completed';
            setStore('appointments', sysAppointments);
        }

        // Refresh UI and feedback mentor list
        loadAppointments();
        loadMentorsForFeedback();
        alert('✅ Đã đánh dấu hoàn thành buổi hẹn. Bạn có thể vào mục Đánh giá để đánh giá mentor.');
    } catch (e) {
        console.error('Error completing appointment:', e);
        alert('Có lỗi xảy ra khi cập nhật trạng thái.');
    }
}

// Edit appointment function
function editAppointment(appointmentId) {
    // Try to find appointment in user sample data first
    const userSampleData = JSON.parse(localStorage.getItem('userSampleData') || '{}');
    let appointment = userSampleData.appointments?.find(apt => apt.id === appointmentId);
    
    // If not found in user data, try global sample data
    if (!appointment) {
        appointment = SAMPLE_DATA.appointments?.find(apt => apt.id === appointmentId);
    }
    
    if (!appointment) {
        alert('Không tìm thấy lịch hẹn');
        return;
    }
    
    // Create edit form
    const editForm = `
        <div class="edit-appointment-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>✏️ Chỉnh sửa lịch hẹn</h2>
                    <button onclick="closeEditModal()" class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="editAppointmentForm">
                        <div class="form-group">
                            <label>Mentor:</label>
                            <select id="editMentorId" required>
                                ${SAMPLE_DATA.mentors.map(mentor => 
                                    `<option value="${mentor.id}" ${mentor.id === appointment.mentor_id ? 'selected' : ''}>${mentor.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Ngày hẹn:</label>
                            <input type="date" id="editAppointmentDate" value="${appointment.scheduled_time.split('T')[0]}" required>
                        </div>
                        <div class="form-group">
                            <label>Giờ hẹn:</label>
                            <input type="time" id="editAppointmentTime" value="${appointment.scheduled_time.split('T')[1].substring(0,5)}" required>
                        </div>
                        <div class="form-group">
                            <label>Thời lượng (phút):</label>
                            <select id="editAppointmentDuration" required>
                                <option value="30" ${appointment.duration === 30 ? 'selected' : ''}>30 phút</option>
                                <option value="60" ${appointment.duration === 60 ? 'selected' : ''}>60 phút</option>
                                <option value="90" ${appointment.duration === 90 ? 'selected' : ''}>90 phút</option>
                                <option value="120" ${appointment.duration === 120 ? 'selected' : ''}>120 phút</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Ghi chú:</label>
                            <textarea id="editAppointmentNotes" rows="3">${appointment.notes || ''}</textarea>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">💾 Lưu thay đổi</button>
                            <button type="button" onclick="closeEditModal()" class="btn btn-secondary">❌ Hủy</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', editForm);
    
    // Add form submit handler
    document.getElementById('editAppointmentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        handleEditAppointment(appointmentId);
    });
}

// Handle edit appointment
function handleEditAppointment(appointmentId) {
    const mentorId = document.getElementById('editMentorId').value;
    const appointmentDate = document.getElementById('editAppointmentDate').value;
    const appointmentTime = document.getElementById('editAppointmentTime').value;
    const appointmentDuration = document.getElementById('editAppointmentDuration').value;
    const notes = document.getElementById('editAppointmentNotes').value;
    
    if (!mentorId || !appointmentDate || !appointmentTime) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }
    
    // Get user sample data
    const userSampleData = JSON.parse(localStorage.getItem('userSampleData') || '{}');
    
    // Find and update appointment in user data first
    let appointmentIndex = userSampleData.appointments?.findIndex(apt => apt.id === appointmentId);
    let appointmentToUpdate = userSampleData.appointments?.[appointmentIndex];
    
    // If not found in user data, try global sample data
    if (appointmentIndex === -1 || !appointmentToUpdate) {
        appointmentIndex = SAMPLE_DATA.appointments?.findIndex(apt => apt.id === appointmentId);
        appointmentToUpdate = SAMPLE_DATA.appointments?.[appointmentIndex];
    }
    
    if (appointmentIndex === -1 || !appointmentToUpdate) {
        alert('Không tìm thấy lịch hẹn');
        return;
    }
    
    // Calculate new cost
    const newCost = Math.ceil(parseInt(appointmentDuration) / 60) * 500;
    const oldCost = Math.ceil(appointmentToUpdate.duration / 60) * 500;
    const costDifference = newCost - oldCost;
    
    // Check wallet if cost increased
    if (costDifference > 0) {
        const currentBalance = userSampleData.wallet?.balance || 0;
        
        if (currentBalance < costDifference) {
            alert(`❌ Số dư không đủ để thanh toán phần chênh lệch!\n\n💰 Cần thêm: ${costDifference} điểm\n💳 Hiện có: ${currentBalance} điểm`);
            return;
        }
        
        // Deduct additional cost
        userSampleData.wallet.balance -= costDifference;
        
        // Add transaction record
        const transaction = {
            id: Date.now(),
            type: 'appointment_edit_payment',
            amount: -costDifference,
            description: `Thanh toán chênh lệch chỉnh sửa lịch hẹn`,
            timestamp: new Date().toISOString()
        };
        userSampleData.wallet.transactions.push(transaction);
        
        localStorage.setItem('userSampleData', JSON.stringify(userSampleData));
    }
    
    // Update appointment
    const scheduledTime = `${appointmentDate}T${appointmentTime}:00`;
    const updatedAppointment = {
        ...appointmentToUpdate,
        mentor_id: parseInt(mentorId),
        scheduled_time: scheduledTime,
        duration: parseInt(appointmentDuration),
        notes: notes || '',
        updated_at: new Date().toISOString()
    };
    
    // Update in user data if it exists there, otherwise update in global data
    if (userSampleData.appointments && userSampleData.appointments[appointmentIndex]) {
        userSampleData.appointments[appointmentIndex] = updatedAppointment;
        localStorage.setItem('userSampleData', JSON.stringify(userSampleData));
    } else {
        SAMPLE_DATA.appointments[appointmentIndex] = updatedAppointment;
    }
    
    alert(`✅ Chỉnh sửa lịch hẹn thành công!\n\n👨‍💻 Mentor: ${mentorId}\n📅 Thời gian: ${formatDateTime(scheduledTime)}\n⏱️ Thời lượng: ${appointmentDuration} phút${costDifference > 0 ? `\n💰 Đã thanh toán thêm: ${costDifference} điểm` : ''}`);
    
    // Close modal and reload
    closeEditModal();
    loadAppointments();
    loadWallet();
}

// Close edit modal
function closeEditModal() {
    const modal = document.querySelector('.edit-appointment-modal');
    if (modal) {
        modal.remove();
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

        // Validate availability & conflicts
        const duration = parseInt(appointmentDuration);
        const mentorIdNum = parseInt(mentorId);
        if (!isInAvailability(mentorIdNum, appointmentDate, appointmentTime, duration)) {
            alert('Khung giờ này không nằm trong thời gian rảnh của mentor. Vui lòng chọn giờ khác.');
            return;
        }
        if (isConflicted(mentorIdNum, scheduledTime, duration)) {
            alert('Khung giờ này bị trùng với lịch hẹn khác. Vui lòng chọn giờ khác.');
            return;
        }
        
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
        
        // Calculate cost (500 points per hour)
        const cost = Math.ceil(parseInt(appointmentDuration) / 60) * 500;
        
        // Check wallet balance
        const userSampleData = JSON.parse(localStorage.getItem('userSampleData') || '{}');
        const currentBalance = userSampleData.wallet?.balance || 0;
        
        if (currentBalance < cost) {
            alert(`❌ Số dư không đủ!\n\n💰 Cần: ${cost} điểm\n💳 Hiện có: ${currentBalance} điểm\n\nVui lòng nạp thêm điểm vào ví!`);
            return;
        }
        
        // Deduct points from wallet
        if (!userSampleData.wallet) {
            userSampleData.wallet = { balance: 0, transactions: [] };
        }
        userSampleData.wallet.balance -= cost;
        
        // Add transaction record
        const transaction = {
            id: Date.now(),
            type: 'appointment_payment',
            amount: -cost,
            description: `Thanh toán lịch hẹn với mentor ${mentorId}`,
            timestamp: new Date().toISOString()
        };
        userSampleData.wallet.transactions.push(transaction);
        
        // Add to user list (so student's list shows it)
        if (!Array.isArray(userSampleData.appointments)) {
            userSampleData.appointments = [];
        }
        userSampleData.appointments.push(newAppointment);

        // Add to sample data
        if (!SAMPLE_DATA.appointments) {
            SAMPLE_DATA.appointments = [];
        }
        SAMPLE_DATA.appointments.push(newAppointment);
        // Also persist to system-level localStorage so Admin and feedback can see it
        const sysAppointments = getStore('appointments', []);
        sysAppointments.push(newAppointment);
        setStore('appointments', sysAppointments);
        
        // Save updated data
        localStorage.setItem('userSampleData', JSON.stringify(userSampleData));
        
        alert(`✅ Đặt lịch hẹn thành công!\n\n👨‍💻 Mentor: ${mentorId}\n📅 Thời gian: ${formatDateTime(scheduledTime)}\n⏱️ Thời lượng: ${appointmentDuration} phút\n💰 Đã thanh toán: ${cost} điểm\n💳 Số dư còn lại: ${userSampleData.wallet.balance} điểm`);
        
        // Clear form
        document.getElementById('appointmentForm').reset();
        
        // Reload appointments and wallet
        loadAppointments();
        loadWallet();
        
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
                SAMPLE_DATA.appointments = SAMPLE_DATA.appointments.filter(apt => Number(apt.id) !== Number(id));
            }
            // Remove from user data
            const userSampleData = JSON.parse(localStorage.getItem('userSampleData') || '{}');
            if (Array.isArray(userSampleData.appointments)) {
                userSampleData.appointments = userSampleData.appointments.filter(apt => Number(apt.id) !== Number(id));
                localStorage.setItem('userSampleData', JSON.stringify(userSampleData));
            }
            // Remove from system-level localStorage
            const sysAppointments = getStore('appointments', []);
            const nextSys = sysAppointments.filter(apt => Number(apt.id) !== Number(id));
            setStore('appointments', nextSys);
            
            alert('Xóa lịch hẹn thành công!');
            loadAppointments();
            // Also refresh feedback list in case it affects available mentors
            if (typeof loadMentorsForFeedback === 'function') {
                loadMentorsForFeedback();
            }
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
    try {
        // Initialize schedule management
        initializeScheduleManagement();
        loadTimeOffList();
        
        // Setup form handlers
        document.getElementById('availabilityForm').addEventListener('submit', saveAvailabilitySettings);
        document.getElementById('timeOffForm').addEventListener('submit', addTimeOff);
        document.getElementById('addTimeSlotForm').addEventListener('submit', handleAddTimeSlot);
        
        console.log('Mentor schedule loaded successfully');
    } catch (error) {
        console.error('Error loading mentor schedule:', error);
    }
}

// Schedule Management Functions
function initializeScheduleManagement() {
    // Add click handlers to existing time slots for removal
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', function() {
            if (confirm('Bạn muốn xóa slot thời gian này?')) {
                this.remove();
                saveScheduleChanges();
            }
        });
    });
}

function addTimeSlot(day) {
    document.getElementById('slotDay').value = day;
    document.getElementById('addTimeSlotModal').style.display = 'block';
}

function closeTimeSlotModal() {
    document.getElementById('addTimeSlotModal').style.display = 'none';
    document.getElementById('addTimeSlotForm').reset();
}

function handleAddTimeSlot(e) {
    e.preventDefault();
    
    const day = document.getElementById('slotDay').value;
    const startTime = document.getElementById('slotStartTime').value;
    const endTime = document.getElementById('slotEndTime').value;
    const type = document.getElementById('slotType').value;
    
    if (startTime >= endTime) {
        alert('Thời gian kết thúc phải sau thời gian bắt đầu!');
        return;
    }
    
    // Check for conflicts
    const daySlots = document.getElementById(`${day}-slots`);
    const existingSlots = Array.from(daySlots.querySelectorAll('.time-slot'));
    
    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);
    
    const hasConflict = existingSlots.some(slot => {
        const slotText = slot.textContent;
        const [slotStart, slotEnd] = slotText.split(' - ');
        const existingStart = timeToMinutes(slotStart);
        const existingEnd = timeToMinutes(slotEnd);
        
        return (newStart < existingEnd && newEnd > existingStart);
    });
    
    if (hasConflict) {
        alert('Slot thời gian này bị trung với slot đã có!');
        return;
    }
    
    // Create new slot
    const slotElement = document.createElement('div');
    slotElement.className = 'time-slot';
    slotElement.innerHTML = `${startTime} - ${endTime}`;
    slotElement.addEventListener('click', function() {
        if (confirm('Bạn muốn xóa slot thời gian này?')) {
            this.remove();
            saveScheduleChanges();
        }
    });
    
    daySlots.appendChild(slotElement);
    
    closeTimeSlotModal();
    saveScheduleChanges();
}

function applyScheduleTemplate(template) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Clear all slots first
    days.forEach(day => {
        document.getElementById(`${day}-slots`).innerHTML = '';
    });
    
    let templateSlots = {};
    
    switch(template) {
        case 'workingDays':
            templateSlots = {
                monday: ['09:00 - 10:00', '10:00 - 11:00', '14:00 - 15:00', '15:00 - 16:00'],
                tuesday: ['09:00 - 10:00', '10:00 - 11:00', '14:00 - 15:00', '15:00 - 16:00'],
                wednesday: ['09:00 - 10:00', '10:00 - 11:00', '14:00 - 15:00', '15:00 - 16:00'],
                thursday: ['09:00 - 10:00', '10:00 - 11:00', '14:00 - 15:00', '15:00 - 16:00'],
                friday: ['09:00 - 10:00', '10:00 - 11:00', '14:00 - 15:00', '15:00 - 16:00']
            };
            break;
        case 'fullWeek':
            const allDaySlots = ['09:00 - 10:00', '10:00 - 11:00', '14:00 - 15:00', '15:00 - 16:00'];
            days.forEach(day => {
                templateSlots[day] = [...allDaySlots];
            });
            break;
        case 'weekend':
            templateSlots = {
                saturday: ['09:00 - 10:00', '10:00 - 11:00', '14:00 - 15:00'],
                sunday: ['09:00 - 10:00', '10:00 - 11:00']
            };
            break;
    }
    
    // Apply template
    Object.keys(templateSlots).forEach(day => {
        const dayContainer = document.getElementById(`${day}-slots`);
        templateSlots[day].forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = 'time-slot';
            slotElement.innerHTML = slot;
            slotElement.addEventListener('click', function() {
                if (confirm('Bạn muốn xóa slot thời gian này?')) {
                    this.remove();
                    saveScheduleChanges();
                }
            });
            dayContainer.appendChild(slotElement);
        });
    });
    
    saveScheduleChanges();
}

function clearAllSlots() {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả các slot thời gian?')) {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(day => {
            document.getElementById(`${day}-slots`).innerHTML = '';
        });
        saveScheduleChanges();
    }
}

function saveScheduleChanges() {
    // In real app, would save to backend
    console.log('Schedule changes saved');
    showSuccess('scheduleMessage', 'Lịch làm việc đã được cập nhật!');
}

function saveAvailabilitySettings(e) {
    e.preventDefault();
    
    const settings = {
        minSessionTime: document.getElementById('minSessionTime').value,
        maxSessionsPerDay: document.getElementById('maxSessionsPerDay').value,
        breakTime: document.getElementById('breakTime').value,
        advanceBooking: document.getElementById('advanceBooking').value
    };
    
    // Save to local storage for demo
    localStorage.setItem('mentorAvailabilitySettings', JSON.stringify(settings));
    
    alert('Cài đặt đã được lưu!');
}

function addTimeOff(e) {
    e.preventDefault();
    
    const date = document.getElementById('timeOffDate').value;
    const startTime = document.getElementById('timeOffStart').value;
    const endTime = document.getElementById('timeOffEnd').value;
    const reason = document.getElementById('timeOffReason').value;
    
    if (!date) {
        alert('Vui lòng chọn ngày nghỉ!');
        return;
    }
    
    const timeOffItem = {
        id: Date.now(),
        date: date,
        startTime: startTime,
        endTime: endTime,
        reason: reason || 'Không có lý do'
    };
    
    // Get existing time off list
    let timeOffList = JSON.parse(localStorage.getItem('mentorTimeOff') || '[]');
    timeOffList.push(timeOffItem);
    localStorage.setItem('mentorTimeOff', JSON.stringify(timeOffList));
    
    // Refresh the list display
    loadTimeOffList();
    
    // Clear form
    document.getElementById('timeOffForm').reset();
    
    alert('Đã thêm thời gian nghỉ!');
}

function loadTimeOffList() {
    const timeOffList = JSON.parse(localStorage.getItem('mentorTimeOff') || '[]');
    const container = document.getElementById('timeOffList');
    
    if (timeOffList.length === 0) {
        container.innerHTML = '<p>Chưa có thời gian nghỉ nào được đặt.</p>';
        return;
    }
    
    const timeOffHtml = timeOffList.map(item => {
        const dateStr = new Date(item.date).toLocaleDateString('vi-VN');
        const timeStr = item.startTime && item.endTime ? 
            `${item.startTime} - ${item.endTime}` : 'Cả ngày';
        
        return `
            <div class="time-off-item">
                <div>
                    <strong>${dateStr}</strong> - ${timeStr}<br>
                    <small>Lý do: ${item.reason}</small>
                </div>
                <button onclick="removeTimeOff(${item.id})" class="btn-sm" style="background: #dc3545;">Xóa</button>
            </div>
        `;
    }).join('');
    
    container.innerHTML = timeOffHtml;
}

function removeTimeOff(id) {
    if (confirm('Bạn có chắc chắn muốn xóa thời gian nghỉ này?')) {
        let timeOffList = JSON.parse(localStorage.getItem('mentorTimeOff') || '[]');
        timeOffList = timeOffList.filter(item => item.id !== id);
        localStorage.setItem('mentorTimeOff', JSON.stringify(timeOffList));
        loadTimeOffList();
    }
}

// Utility functions for time management
function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
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
                <p><strong>📅 Thời gian:</strong> ${formatDateTime(appointment.scheduled_time)}</p>
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
                <p><strong>📅 Ngày:</strong> ${formatDate(feedback.created_at)}</p>
            </div>
        `).join('');
        
        document.getElementById('mentorFeedbackList').innerHTML = feedbacksHtml || '<p>Chưa có đánh giá nào</p>';
    } catch (error) {
        console.error('Error loading mentor feedback:', error);
        document.getElementById('mentorFeedbackList').innerHTML = '<p>Có lỗi khi tải đánh giá</p>';
    }
}

// Mentor Earnings functions
async function loadMentorEarnings() {
    try {
        // Generate sample earnings data
        const mentorId = currentUser?.id || 1;
        const appointments = SAMPLE_DATA.appointments || [];
        const mentorAppointments = appointments.filter(apt => apt.mentor_id === mentorId && apt.status === 'completed');
        
        // Calculate earnings (assuming 500k VND per hour)
        const hourlyRate = 500000;
        const totalHours = mentorAppointments.reduce((sum, apt) => sum + (apt.duration / 60), 0);
        const totalEarnings = totalHours * hourlyRate;
        
        // Monthly earnings
        const thisMonth = new Date();
        const monthlyAppointments = mentorAppointments.filter(apt => {
            const aptDate = new Date(apt.scheduled_time);
            return aptDate.getMonth() === thisMonth.getMonth() && aptDate.getFullYear() === thisMonth.getFullYear();
        });
        const monthlyHours = monthlyAppointments.reduce((sum, apt) => sum + (apt.duration / 60), 0);
        const monthlyEarnings = monthlyHours * hourlyRate;
        
        // Weekly earnings
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyAppointments = mentorAppointments.filter(apt => new Date(apt.scheduled_time) >= oneWeekAgo);
        const weeklyHours = weeklyAppointments.reduce((sum, apt) => sum + (apt.duration / 60), 0);
        const weeklyEarnings = weeklyHours * hourlyRate;
        
        // Update UI
        document.getElementById('mentorTotalEarnings').textContent = formatCurrency(totalEarnings);
        document.getElementById('mentorMonthlyEarnings').textContent = formatCurrency(monthlyEarnings);
        document.getElementById('mentorWeeklyEarnings').textContent = formatCurrency(weeklyEarnings);
        document.getElementById('mentorHourlyRate').textContent = formatCurrency(hourlyRate);
        
        // Generate earnings history
        const earningsHistory = mentorAppointments.map(apt => ({
            date: apt.scheduled_time,
            amount: (apt.duration / 60) * hourlyRate,
            student: `Student ${apt.student_id}`,
            duration: apt.duration,
            type: 'Buổi học 1:1'
        }));
        
        displayEarningsHistory(earningsHistory);
        createEarningsChart(earningsHistory);
        
    } catch (error) {
        console.error('Error loading mentor earnings:', error);
    }
}

function displayEarningsHistory(earnings) {
    const earningsHtml = earnings.map(earning => `
        <div class="earning-item">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h4>${earning.type}</h4>
                    <p>Sinh viên: ${earning.student}</p>
                    <p>Thời gian: ${earning.duration} phút</p>
                    <small>${formatDateTime(earning.date)}</small>
                </div>
                <div class="earning-amount">
                    <h3 style="color: #28a745; margin: 0;">${formatCurrency(earning.amount)}</h3>
                </div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('mentorEarningsList').innerHTML = earningsHtml || '<p>Chưa có giao dịch nào</p>';
}

function createEarningsChart(earnings) {
    // Simple chart implementation using canvas
    const canvas = document.getElementById('earningsChart');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Sample chart - would use Chart.js in real app
    ctx.fillStyle = '#28a745';
    ctx.fillRect(50, 150, 30, 50);
    ctx.fillRect(100, 130, 30, 70);
    ctx.fillRect(150, 140, 30, 60);
    ctx.fillRect(200, 120, 30, 80);
    ctx.fillRect(250, 110, 30, 90);
    ctx.fillRect(300, 100, 30, 100);
    
    // Labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.fillText('T1', 55, 215);
    ctx.fillText('T2', 105, 215);
    ctx.fillText('T3', 155, 215);
    ctx.fillText('T4', 205, 215);
    ctx.fillText('T5', 255, 215);
    ctx.fillText('T6', 305, 215);
}

function exportEarnings() {
    // Simple export functionality
    const earnings = document.getElementById('mentorEarningsList').innerText;
    const blob = new Blob([earnings], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mentor-earnings-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Mentor Chat functions
async function loadMentorChat() {
    try {
        // Generate sample chat data
        const chats = [
            {
                id: 1,
                studentName: 'Nguyễn Văn A',
                lastMessage: 'Cảm ơn thầy về buổi học hôm nay!',
                timestamp: '2025-01-15T10:30:00Z',
                unread: 2,
                online: true
            },
            {
                id: 2,
                studentName: 'Trần Thị B',
                lastMessage: 'Thầy có thể giải thích thêm về React hooks không?',
                timestamp: '2025-01-15T09:15:00Z',
                unread: 0,
                online: false
            },
            {
                id: 3,
                studentName: 'Lê Văn C',
                lastMessage: 'Em sẽ chuẩn bị bài tập và gửi lại thầy',
                timestamp: '2025-01-14T16:45:00Z',
                unread: 1,
                online: true
            }
        ];
        
        const chatListHtml = chats.map(chat => `
            <div class="chat-item" onclick="openChat(${chat.id}, '${chat.studentName}')">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin: 0 0 5px 0;">${chat.studentName}</h4>
                        <p style="margin: 0; color: #6c757d; font-size: 14px;">${chat.lastMessage}</p>
                        <small style="color: #999;">${formatDateTime(chat.timestamp)}</small>
                    </div>
                    <div style="text-align: right;">
                        ${chat.online ? '<span style="color: #28a745;">●</span>' : '<span style="color: #6c757d;">●</span>'}
                        ${chat.unread > 0 ? `<div style="background: #dc3545; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; margin-top: 5px;">${chat.unread}</div>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
        
        document.getElementById('chatList').innerHTML = chatListHtml;
        
    } catch (error) {
        console.error('Error loading mentor chat:', error);
    }
}

function openChat(chatId, studentName) {
    // Update chat header
    document.getElementById('chatTitle').textContent = `Chat với ${studentName}`;
    
    // Enable chat input
    const messageInput = document.getElementById('messageInput');
    const sendButton = messageInput.nextElementSibling;
    messageInput.disabled = false;
    sendButton.disabled = false;
    
    // Load chat messages
    const sampleMessages = [
        { text: 'Chào thầy! Em có thể hỏi về bài tập không?', sent: false, time: '10:00' },
        { text: 'Chào em! Tất nhiên, em hỏi đi.', sent: true, time: '10:01' },
        { text: 'Em đang gặp khó khăn với phần useState trong React', sent: false, time: '10:02' },
        { text: 'Được, thầy sẽ giải thích chi tiết cho em.', sent: true, time: '10:03' }
    ];
    
    const messagesHtml = sampleMessages.map(msg => `
        <div class="message-item ${msg.sent ? 'sent' : 'received'}">
            <div class="message-bubble">
                ${msg.text}
                <div style="font-size: 11px; opacity: 0.7; margin-top: 5px;">${msg.time}</div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('chatMessages').innerHTML = messagesHtml;
    
    // Mark chat as active
    document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.chat-item').classList.add('active');
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Add message to chat
    const messagesContainer = document.getElementById('chatMessages');
    const messageHtml = `
        <div class="message-item sent">
            <div class="message-bubble">
                ${message}
                <div style="font-size: 11px; opacity: 0.7; margin-top: 5px;">${new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}</div>
            </div>
        </div>
    `;
    
    messagesContainer.insertAdjacentHTML('beforeend', messageHtml);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Clear input
    messageInput.value = '';
}

function startVideoCall() {
    alert('Tính năng video call sẽ được phát triển trong phiên bản tiếp theo!');
}

function endChat() {
    document.getElementById('chatTitle').textContent = 'Chọn một cuộc trò chuyện';
    document.getElementById('chatMessages').innerHTML = '<div class="welcome-message"><p>Chọn một sinh viên để bắt đầu trò chuyện</p></div>';
    
    const messageInput = document.getElementById('messageInput');
    const sendButton = messageInput.nextElementSibling;
    messageInput.disabled = true;
    sendButton.disabled = true;
    messageInput.value = '';
    
    document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
}

function attachFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.doc,.docx';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            // In real app, would upload file and send message
            const messagesContainer = document.getElementById('chatMessages');
            const messageHtml = `
                <div class="message-item sent">
                    <div class="message-bubble">
                        📎 Đã gửi file: ${file.name}
                        <div style="font-size: 11px; opacity: 0.7; margin-top: 5px;">${new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}</div>
                    </div>
                </div>
            `;
            messagesContainer.insertAdjacentHTML('beforeend', messageHtml);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    };
    input.click();
}

// Mentor Statistics functions
async function loadMentorStatistics() {
    try {
        // Generate sample statistics
        const appointments = SAMPLE_DATA.appointments || [];
        const mentorId = currentUser?.id || 1;
        const mentorAppointments = appointments.filter(apt => apt.mentor_id === mentorId);
        
        // Calculate stats
        const totalHours = mentorAppointments.reduce((sum, apt) => sum + (apt.duration / 60), 0);
        const avgSessionTime = mentorAppointments.length > 0 ? 
            (mentorAppointments.reduce((sum, apt) => sum + apt.duration, 0) / mentorAppointments.length) : 0;
        
        // Student retention (students who booked more than once)
        const studentCounts = {};
        mentorAppointments.forEach(apt => {
            studentCounts[apt.student_id] = (studentCounts[apt.student_id] || 0) + 1;
        });
        const returningStudents = Object.values(studentCounts).filter(count => count > 1).length;
        const retentionRate = Object.keys(studentCounts).length > 0 ? 
            (returningStudents / Object.keys(studentCounts).length * 100) : 0;
        
        // Cancellation rate
        const canceledAppointments = appointments.filter(apt => apt.mentor_id === mentorId && apt.status === 'cancelled').length;
        const totalScheduled = appointments.filter(apt => apt.mentor_id === mentorId).length;
        const cancelationRate = totalScheduled > 0 ? (canceledAppointments / totalScheduled * 100) : 0;
        
        // Update UI
        document.getElementById('totalHoursWorked').textContent = totalHours.toFixed(1);
        document.getElementById('averageSessionTime').textContent = `${avgSessionTime.toFixed(0)} phút`;
        document.getElementById('studentRetentionRate').textContent = `${retentionRate.toFixed(1)}%`;
        document.getElementById('cancelationRate').textContent = `${cancelationRate.toFixed(1)}%`;
        
        // Create charts
        createWeeklyChart();
        createTimeDistributionChart();
        createRatingTrendChart();
        
    } catch (error) {
        console.error('Error loading mentor statistics:', error);
    }
}

function createWeeklyChart() {
    const canvas = document.getElementById('weeklyChart');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Sample weekly data
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const values = [3, 5, 4, 6, 4, 2, 1];
    
    // Draw bars
    ctx.fillStyle = '#007bff';
    values.forEach((value, index) => {
        const x = 50 + index * 45;
        const height = value * 20;
        ctx.fillRect(x, 150 - height, 30, height);
    });
    
    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    days.forEach((day, index) => {
        const x = 55 + index * 45;
        ctx.fillText(day, x, 170);
    });
}

function createTimeDistributionChart() {
    const canvas = document.getElementById('timeDistributionChart');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Simple pie chart
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;
    
    const data = [
        { label: 'Sáng', value: 30, color: '#28a745' },
        { label: 'Chiều', value: 45, color: '#007bff' },
        { label: 'Tối', value: 25, color: '#ffc107' }
    ];
    
    let currentAngle = 0;
    data.forEach(segment => {
        const sliceAngle = (segment.value / 100) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = segment.color;
        ctx.fill();
        
        currentAngle += sliceAngle;
    });
}

function createRatingTrendChart() {
    const canvas = document.getElementById('ratingTrendChart');
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Sample rating trend
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'];
    const ratings = [4.2, 4.5, 4.3, 4.7, 4.8, 4.9];
    
    // Draw line chart
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    ratings.forEach((rating, index) => {
        const x = 50 + index * 50;
        const y = 150 - (rating - 3) * 50; // Scale 3-5 to fit canvas
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        // Draw points
        ctx.fillStyle = '#28a745';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
    });
    
    ctx.stroke();
    
    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    months.forEach((month, index) => {
        const x = 45 + index * 50;
        ctx.fillText(month, x, 170);
    });
}

function refreshStats() {
    loadMentorStatistics();
}

// Utility function for currency formatting
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount);
}

// Mentor Dashboard functions
async function loadMentorDashboard() {
    try {
        // Load all dashboard data
        await loadDashboardStats();
        loadTodaySchedule();
        loadRecentActivities();
        updateMentorStatus();
        
        console.log('Mentor dashboard loaded successfully');
    } catch (error) {
        console.error('Error loading mentor dashboard:', error);
    }
}

async function loadDashboardStats() {
    const mentorId = currentUser?.id || 1;
    const appointments = SAMPLE_DATA.appointments || [];
    const feedbacks = SAMPLE_DATA.feedbacks || [];
    
    // Calculate stats
    const mentorAppointments = appointments.filter(apt => apt.mentor_id === mentorId);
    const completedSessions = mentorAppointments.filter(apt => apt.status === 'completed').length;
    
    // Monthly sessions
    const thisMonth = new Date();
    const monthlyAppointments = mentorAppointments.filter(apt => {
        const aptDate = new Date(apt.scheduled_time);
        return aptDate.getMonth() === thisMonth.getMonth() && aptDate.getFullYear() === thisMonth.getFullYear();
    });
    
    // Active students (unique students this month)
    const activeStudents = [...new Set(monthlyAppointments.map(apt => apt.student_id))].length;
    
    // Average rating
    const mentorFeedbacks = feedbacks.filter(fb => fb.mentor_id === mentorId);
    const averageRating = mentorFeedbacks.length > 0 ? 
        (mentorFeedbacks.reduce((sum, fb) => sum + fb.rating, 0) / mentorFeedbacks.length).toFixed(1) : 0;
    
    // Monthly earnings (assuming 500k per hour)
    const monthlyHours = monthlyAppointments.reduce((sum, apt) => sum + (apt.duration / 60), 0);
    const monthlyEarnings = monthlyHours * 500000;
    
    // Update UI
    document.getElementById('mentorDashTotalSessions').textContent = completedSessions;
    document.getElementById('monthlySessionCount').textContent = monthlyAppointments.length;
    document.getElementById('mentorDashActiveStudents').textContent = activeStudents;
    document.getElementById('newStudentCount').textContent = Math.max(0, activeStudents - 2); // Mock new students
    document.getElementById('mentorDashRating').textContent = averageRating;
    document.getElementById('recentRatingCount').textContent = mentorFeedbacks.filter(fb => {
        const fbDate = new Date(fb.created_at);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return fbDate >= oneWeekAgo;
    }).length;
    document.getElementById('mentorDashEarnings').textContent = formatCurrency(monthlyEarnings);
    document.getElementById('earningsGrowth').textContent = '+15%'; // Mock growth
}

function loadTodaySchedule() {
    const today = new Date().toDateString();
    const appointments = SAMPLE_DATA.appointments || [];
    const mentorId = currentUser?.id || 1;
    
    const todayAppointments = appointments.filter(apt => 
        apt.mentor_id === mentorId && new Date(apt.scheduled_time).toDateString() === today
    );
    
    if (todayAppointments.length === 0) {
        document.getElementById('todayScheduleList').innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Không có lịch hẹn nào hôm nay</p>';
        return;
    }
    
    const scheduleHtml = todayAppointments.map(apt => {
        const time = new Date(apt.scheduled_time).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'});
        return `
            <div class="schedule-item ${apt.status}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4>🎯 Buổi học với Student ${apt.student_id}</h4>
                        <p>⏰ ${time} - ${apt.duration} phút</p>
                        <p>📝 ${apt.notes || 'Không có ghi chú'}</p>
                    </div>
                    <div>
                        <span class="status-badge ${apt.status}">${getStatusText(apt.status)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('todayScheduleList').innerHTML = scheduleHtml;
}

function loadRecentActivities() {
    // Generate sample recent activities
    const activities = [
        {
            type: 'new',
            icon: '📚',
            text: 'Sinh viên mới đăng ký học với bạn',
            time: '10 phút trước',
            iconClass: 'new'
        },
        {
            type: 'completed',
            icon: '✅',
            text: 'Hoàn thành buổi học React với Student 2',
            time: '1 giờ trước',
            iconClass: 'completed'
        },
        {
            type: 'rating',
            icon: '⭐',
            text: 'Nhận đánh giá 5 sao từ Student 1',
            time: '2 giờ trước',
            iconClass: 'rating'
        },
        {
            type: 'message',
            icon: '💬',
            text: 'Tin nhắn mới từ Student 3',
            time: '3 giờ trước',
            iconClass: 'new'
        },
        {
            type: 'booking',
            icon: '📅',
            text: 'Lịch hẹn mới được đặt cho ngày mai',
            time: '4 giờ trước',
            iconClass: 'new'
        }
    ];
    
    const activitiesHtml = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.iconClass}">
                ${activity.icon}
            </div>
            <div style="flex: 1;">
                <p style="margin: 0 0 5px 0;">${activity.text}</p>
                <small style="color: #666;">${activity.time}</small>
            </div>
        </div>
    `).join('');
    
    document.getElementById('recentActivitiesList').innerHTML = activitiesHtml;
}

function updateMentorStatus() {
    // Update current status
    document.getElementById('mentorCurrentStatus').textContent = 'Trực tuyến';
    document.getElementById('availableSlotsToday').textContent = '3';
    document.getElementById('onlineTime').textContent = '2h 30m';
    document.getElementById('unreadMessages').textContent = '5';
}

function updateAvailabilityStatus() {
    const currentStatus = document.getElementById('mentorCurrentStatus');
    const statuses = [
        { text: 'Trực tuyến', class: 'online' },
        { text: 'Bận', class: 'busy' },
        { text: 'Offline', class: 'offline' }
    ];
    
    // Find current status index
    let currentIndex = statuses.findIndex(s => currentStatus.textContent === s.text);
    currentIndex = (currentIndex + 1) % statuses.length;
    
    const newStatus = statuses[currentIndex];
    currentStatus.textContent = newStatus.text;
    currentStatus.className = `status-badge ${newStatus.class}`;
    
    alert(`Trạng thái đã được cập nhật thành: ${newStatus.text}`);
}

function getStatusText(status) {
    switch(status) {
        case 'pending': return 'Chờ xác nhận';
        case 'completed': return 'Hoàn thành';
        case 'cancelled': return 'Đã hủy';
        default: return status;
    }
}

// Admin functions
async function loadUserManagement() {
    try {
        // Load users from localStorage for persistence
        const users = getStore('users', []);
        
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
                <p><strong>Ngày tạo:</strong> ${formatDate(user.created_at)}</p>
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

// Admin: Edit user (demo: update email/role in SAMPLE_DATA)
function editUser(userId) {
    const users = getStore('users', []);
    const user = users.find(u => u.id === userId);
    if (!user) return alert('Không tìm thấy người dùng');
    const newEmail = prompt('Nhập email mới:', user.email || '');
    if (newEmail === null) return; // cancelled
    const newRole = prompt('Nhập vai trò mới (admin|mentor|student):', user.role || 'student');
    if (!newRole) return;
    user.email = newEmail;
    user.role = newRole.toLowerCase();
    setStore('users', users);
    loadUserManagement();
}

// Admin: Delete user (demo: remove from SAMPLE_DATA)
function deleteUser(userId) {
    if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    const users = getStore('users', []);
    const next = users.filter(u => u.id !== userId);
    setStore('users', next);
    loadUserManagement();
}

async function loadProjectManagement() {
    try {
        // Load project groups as projects from localStorage
        const projects = getStore('projectGroups', []);
        
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
                <p><strong>Ngày tạo:</strong> ${formatDate(project.created_at)}</p>
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
        const users = getStore('users', []);
        const appointments = getStore('appointments', []);
        const projectGroups = getStore('projectGroups', []);
        const feedbacks = getStore('feedbacks', []);
        
        // Calculate revenue based on appointments (500 điểm/giờ)
        const POINTS_PER_HOUR = 500;
        const totalRevenue = appointments
            .filter(a => a.status !== 'cancelled')
            .reduce((sum, a) => sum + Math.ceil((a.duration || 60) / 60) * POINTS_PER_HOUR, 0);
        
        // Calculate average rating
        const avgRating = feedbacks.length
            ? (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
            : '0.0';
        
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
        // Add event listener for notification form
        const notificationForm = document.getElementById('notificationForm');
        if (notificationForm) {
            notificationForm.addEventListener('submit', handleSendNotification);
        }
        
        // Ensure in-memory container exists
        if (!SAMPLE_DATA.notifications) {
            SAMPLE_DATA.notifications = [];
        }

        // Merge notifications from localStorage and SAMPLE_DATA
        const stored = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        const merged = [...SAMPLE_DATA.notifications, ...stored]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Render list
        const listEl = document.getElementById('notificationsList');
        if (listEl) {
            if (merged.length === 0) {
                listEl.innerHTML = '<p style="text-align:center;color:#666;padding:20px;">Chưa có thông báo nào</p>';
            } else {
                listEl.innerHTML = merged.map(n => `
                    <div class="item-card">
                        <div class="item-header">
                            <h4 class="item-title">${n.title}</h4>
                            <span class="item-status status-${n.status || 'success'}">${(n.status || 'sent') === 'sent' ? 'Đã gửi' : 'Đang gửi'}</span>
                        </div>
                        <p><strong>Gửi đến:</strong> ${n.target === 'all' ? 'Tất cả người dùng' : n.target}</p>
                        <p><strong>Ngày gửi:</strong> ${formatDate(n.created_at)}</p>
                        <p>${n.content}</p>
                    </div>
                `).join('');
            }
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

        // Persist to localStorage history for Admin
        const stored = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        stored.push(newNotification);
        localStorage.setItem('adminNotifications', JSON.stringify(stored));
        
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
            // Mirror to localStorage system appointments as well
            const sysAppointments = getStore('appointments', []);
            const idx = sysAppointments.findIndex(a => a.id === appointmentId);
            if (idx !== -1) {
                sysAppointments[idx].status = newStatus;
                setStore('appointments', sysAppointments);
            }
            
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
        
        console.log('Creating new user sample data for:', currentUser);
        
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
                    scheduled_time: "2025-01-11T21:00:00.000Z", // 11/01/2025 9:00 PM
                    duration: 60,
                    notes: "Thảo luận về dự án JavaScript và cách tối ưu hóa performance",
                    status: "pending",
                    created_at: "2025-01-10T10:00:00.000Z" // 10/01/2025
                },
                {
                    id: 2,
                    mentor_id: 2,
                    student_id: currentUser.id,
                    scheduled_time: "2025-01-13T14:30:00.000Z", // 13/01/2025 2:30 PM
                    duration: 90,
                    notes: "Học Python Django và database design",
                    status: "pending",
                    created_at: "2025-01-10T10:00:00.000Z" // 10/01/2025
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
        console.log('Saved user sample data:', userSampleData);
        
        // Show welcome message
        setTimeout(() => {
            alert(`🎉 Chào mừng ${currentUser.username}!\n\n✅ Đã tạo dữ liệu mẫu cho bạn:\n• 3 công việc cần làm\n• 2 lịch hẹn với mentor (11/01 và 13/01)\n• 1 nhóm dự án\n• 1000 điểm trong ví\n\nHãy khám phá các tính năng của MentorHub!`);
        }, 500);
        
        // Show main app and load dashboard
        setTimeout(() => {
            showMainApp();
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
function formatDateTime(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    // Bỏ số 0 ở đầu giờ nếu < 10
    const finalHours = displayHours < 10 ? displayHours : displayHours;
    
    return `${day}/${month}/${year} ${finalHours}:${minutes} ${ampm}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

// Availability helpers
function getAvailableSlotsForDate(mentorId, dateStr, durationMinutes) {
    const avails = getStore('mentorAvailabilities', DEFAULT_DATA.mentorAvailabilities) || [];
    const slots = [];
    if (!Array.isArray(avails)) return slots;
    const d = new Date(`${dateStr}T00:00:00`);
    const weekday = d.getDay(); // 0-6
    const aForMentor = avails.filter(a => Number(a.mentor_id) === Number(mentorId) && Array.isArray(a.weekday) && a.weekday.includes(weekday));
    if (aForMentor.length === 0) return slots;
    // collect existing appointments
    const sys = getStore('appointments', []);
    const user = JSON.parse(localStorage.getItem('userSampleData') || '{}');
    const userApts = Array.isArray(user.appointments) ? user.appointments : [];
    const sameDay = (apt) => apt.scheduled_time && apt.scheduled_time.startsWith(dateStr);
    const existing = [...sys, ...userApts].filter(a => Number(a.mentor_id) === Number(mentorId) && sameDay(a));
    // generate slots per availability range
    aForMentor.forEach(a => {
        const slot = a.slotMinutes || 60;
        let cur = toMinutes(a.start);
        const end = toMinutes(a.end);
        while (cur + durationMinutes <= end) {
            const startStr = fromMinutes(cur);
            const iso = `${dateStr}T${startStr}:00`;
            if (!hasConflict(existing, iso, durationMinutes)) {
                slots.push(startStr);
            }
            cur += slot;
        }
    });
    return slots;
}

function isInAvailability(mentorId, dateStr, timeStr, durationMinutes) {
    const avails = getStore('mentorAvailabilities', DEFAULT_DATA.mentorAvailabilities) || [];
    const d = new Date(`${dateStr}T00:00:00`);
    const weekday = d.getDay();
    const mins = toMinutes(timeStr);
    const aForMentor = avails.filter(a => Number(a.mentor_id) === Number(mentorId) && a.weekday.includes(weekday));
    return aForMentor.some(a => mins >= toMinutes(a.start) && (mins + durationMinutes) <= toMinutes(a.end));
}

function isConflicted(mentorId, isoStart, durationMinutes) {
    const sys = getStore('appointments', []);
    const user = JSON.parse(localStorage.getItem('userSampleData') || '{}');
    const userApts = Array.isArray(user.appointments) ? user.appointments : [];
    const existing = [...sys, ...userApts].filter(a => Number(a.mentor_id) === Number(mentorId));
    return hasConflict(existing, isoStart, durationMinutes);
}

function hasConflict(existing, isoStart, durationMinutes) {
    const start = new Date(isoStart).getTime();
    const end = start + durationMinutes * 60000;
    return existing.some(a => {
        const s = new Date(a.scheduled_time).getTime();
        const e = s + (parseInt(a.duration || 60) * 60000);
        return Math.max(start, s) < Math.min(end, e);
    });
}

function toMinutes(hhmm) {
    const [h, m] = (hhmm || '00:00').split(':').map(x => parseInt(x, 10));
    return (h * 60) + (m || 0);
}

function fromMinutes(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

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

// Removed clearAndRecreateData (no longer needed)
