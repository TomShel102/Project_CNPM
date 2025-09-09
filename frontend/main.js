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
    document.getElementById('mainApp').classList.add('hidden');
}

function showLogin() {
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('mainApp').classList.add('hidden');
}

function showRegister() {
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
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
    
    // Check if sample data exists and show prompt if needed
    setTimeout(async () => {
        if (typeof checkSampleData === 'function') {
            const dataCheck = await checkSampleData();
            if (!dataCheck.hasData) {
                showSampleDataPrompt();
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
    document.getElementById(section + 'Section').classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('nav' + section.charAt(0).toUpperCase() + section.slice(1)).classList.add('active');
    
    currentPage = section;
    
    // Load data for the section
    switch(section) {
        case 'dashboard':
            loadDashboard();
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
        
        console.log('Register response:', response.status);
        
        if (response && response.ok) {
            const result = await response.json();
            console.log('Register success:', result);
            showSuccess('registerSuccess', 'Registration successful! You can now login.');
            
            // Clear form
            document.getElementById('registerForm').reset();
            
            // Auto switch to login after 2 seconds
            setTimeout(() => {
                showLogin();
            }, 2000);
        } else {
            const error = await response.json();
            console.log('Register error:', error);
            showError('registerError', error.error || 'Registration failed. Please try again.');
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        showError('registerError', 'Registration failed. Please try again.');
    }
}

// Dashboard
async function loadDashboard() {
    try {
        // Load todos for dashboard
        const todosResponse = await apiCall('/todos/');
        const todos = await todosResponse.json();
        document.getElementById('todosCount').textContent = todos.length;
        
        // Load courses for dashboard
        const coursesResponse = await apiCall('/courses/');
        const courses = await coursesResponse.json();
        document.getElementById('coursesCount').textContent = courses.length;
        
        // Load mentors for dashboard
        const mentorsResponse = await apiCall('/mentors/');
        const mentorsResult = await mentorsResponse.json();
        const mentorsCount = mentorsResult.success ? mentorsResult.data.length : 0;
        document.getElementById('mentorsCount').textContent = mentorsCount;
        
        // Load appointments for dashboard
        const appointmentsResponse = await apiCall('/appointments/');
        const appointments = await appointmentsResponse.json();
        document.getElementById('appointmentsCount').textContent = appointments.length;
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        document.getElementById('todosCount').textContent = '0';
        document.getElementById('coursesCount').textContent = '0';
        document.getElementById('mentorsCount').textContent = '0';
        document.getElementById('appointmentsCount').textContent = '0';
    }
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
        const response = await apiCall('/mentors/');
        const result = await response.json();
        
        const mentorList = document.getElementById('availableMentors');
        if (mentorList) {
            if (!result.success || !result.data || result.data.length === 0) {
                mentorList.innerHTML = '<p>Không có mentor nào khả dụng</p>';
                return;
            }
            
            const mentorsHtml = result.data.map(mentor => `
                <div class="item-card">
                    <div class="item-header">
                        <h4 class="item-title">Mentor ${mentor.id}</h4>
                        <span class="item-status status-${mentor.status}">${mentor.status}</span>
                    </div>
                    <p><strong>Chuyên môn:</strong> ${mentor.expertise_areas}</p>
                    <p><strong>Giá:</strong> ${mentor.hourly_rate} điểm/giờ</p>
                    <p><strong>Đánh giá:</strong> ⭐ ${mentor.rating || 'Chưa có'}</p>
                    <p><strong>Sessions/ngày:</strong> ${mentor.max_sessions_per_day}</p>
                    <p>${mentor.bio || 'Chưa có mô tả'}</p>
                    <div class="item-actions">
                        <button onclick="bookMentor(${mentor.id}, 'Mentor ${mentor.id}')" class="btn btn-sm">Đặt lịch</button>
                        <button onclick="viewMentorProfile(${mentor.id})" class="btn btn-sm">Xem hồ sơ</button>
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
    alert(`Xem hồ sơ mentor ID: ${mentorId}\n(Chức năng này sẽ được phát triển thêm)`);
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
    const tbody = document.querySelector('#appointmentsTable tbody');
    tbody.innerHTML = '';
    
    appointments.forEach(appointment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${appointment.id}</td>
            <td>${appointment.student_id}</td>
            <td>${appointment.mentor_id}</td>
            <td>${appointment.scheduled_time ? new Date(appointment.scheduled_time).toLocaleString() : ''}</td>
            <td>${appointment.status || 'pending'}</td>
            <td>${appointment.notes || ''}</td>
            <td>
                <button onclick="editAppointment(${appointment.id})" class="btn">Edit</button>
                <button onclick="deleteAppointment(${appointment.id})" class="btn btn-danger">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function handleAddAppointment(e) {
    e.preventDefault();
    
    const mentorId = document.getElementById('appointmentMentor').value;
    const scheduledTime = document.getElementById('appointmentTime').value;
    const notes = document.getElementById('appointmentNotes').value;
    
    if (!mentorId || !scheduledTime) {
        alert('Vui lòng chọn mentor và thời gian hẹn');
        return;
    }
    
    try {
        // Create new appointment object
        const newAppointment = {
            id: Date.now(),
            student_id: currentUser?.id || 1,
            mentor_id: parseInt(mentorId),
            scheduled_time: scheduledTime,
            notes: notes || '',
            status: 'pending',
            created_at: new Date().toISOString()
        };
        
        // Add to sample data
        if (!SAMPLE_DATA.appointments) {
            SAMPLE_DATA.appointments = [];
        }
        SAMPLE_DATA.appointments.push(newAppointment);
        
        alert(`Đặt lịch hẹn thành công!\nMentor: ${mentorId}\nThời gian: ${new Date(scheduledTime).toLocaleString()}`);
        
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
    if (confirm('Are you sure you want to delete this appointment?')) {
        try {
            const response = await apiCall(`/appointments/${id}`, {
                method: 'DELETE'
            });
            
            if (response && response.ok) {
                loadAppointments();
            }
        } catch (error) {
            console.error('Error deleting appointment:', error);
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
        const response = await apiCall('/appointments/');
        const appointments = await response.json();
        
        // Filter appointments for current mentor
        const mentorId = currentUser?.id || 1;
        const mentorAppointments = appointments.filter(apt => apt.mentor_id === mentorId);
        
        const appointmentsHtml = mentorAppointments.map(appointment => `
            <div class="item-card">
                <div class="item-header">
                    <h4 class="item-title">Lịch hẹn với Student ${appointment.student_id}</h4>
                    <span class="item-status status-${appointment.status}">${appointment.status}</span>
                </div>
                <p><strong>Thời gian:</strong> ${new Date(appointment.scheduled_time).toLocaleString()}</p>
                <p><strong>Ghi chú:</strong> ${appointment.notes || 'Không có ghi chú'}</p>
            </div>
        `).join('');
        
        document.getElementById('mentorAppointmentsList').innerHTML = appointmentsHtml || '<p>Chưa có lịch hẹn nào</p>';
    } catch (error) {
        console.error('Error loading mentor appointments:', error);
    }
}

async function loadMentorFeedback() {
    try {
        const response = await apiCall('/feedback/');
        const feedbacks = await response.json();
        
        // Filter feedback for current mentor
        const mentorId = currentUser?.id || 1;
        const mentorFeedbacks = feedbacks.filter(fb => fb.mentor_id === mentorId);
        
        const feedbacksHtml = mentorFeedbacks.map(feedback => `
            <div class="item-card">
                <div class="item-header">
                    <h4 class="item-title">Đánh giá từ Student ${feedback.student_id}</h4>
                    <span class="item-status">${'⭐'.repeat(feedback.rating)}</span>
                </div>
                <p><strong>Nhận xét:</strong> ${feedback.comment}</p>
                <p><strong>Ngày:</strong> ${new Date(feedback.created_at).toLocaleDateString()}</p>
            </div>
        `).join('');
        
        document.getElementById('mentorFeedbackList').innerHTML = feedbacksHtml || '<p>Chưa có đánh giá nào</p>';
    } catch (error) {
        console.error('Error loading mentor feedback:', error);
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

// Utility functions
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
}

function showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    successElement.textContent = message;
    successElement.classList.remove('hidden');
}
