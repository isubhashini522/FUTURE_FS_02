// ==========================================================================
// Initial Configuration & State
// ==========================================================================
let leads = [];
try {
    leads = JSON.parse(localStorage.getItem('crm_leads')) || [];
} catch (e) {
    console.error("Error parsing leads data", e);
    leads = [];
}
let currentUser = null;
let currentView = 'dashboard';
let isSignupMode = false;
let editingLeadId = null;
let activeNotesLeadId = null;

// ==========================================================================
// DOM Elements
// ==========================================================================
// Auth View Elements
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const authForm = document.getElementById('auth-form');
const authSubtitle = document.getElementById('auth-subtitle');
const confirmPasswordGroup = document.getElementById('confirm-password-group');
const authBtn = document.getElementById('auth-btn');
const toggleAuthText = document.getElementById('auth-toggle-text');
const toggleAuthLink = document.getElementById('toggle-auth');
const authAlert = document.getElementById('auth-alert');
const currentUserEmailDisplay = document.getElementById('current-user-email');
const logoutBtn = document.getElementById('logout-btn');

// View Sections
const sectionDashboard = document.getElementById('view-dashboard');
const sectionLeads = document.getElementById('view-leads');
const navItems = document.querySelectorAll('.nav-item');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const sidebar = document.getElementById('sidebar');

// Dashboard Stats
const statTotal = document.getElementById('stat-total');
const statNew = document.getElementById('stat-new');
const statContacted = document.getElementById('stat-contacted');
const statConverted = document.getElementById('stat-converted');

// Leads Table & Controls
const leadsTableBody = document.getElementById('leads-table-body');
const searchInput = document.getElementById('search-input');
const filterStatus = document.getElementById('filter-status');
const addLeadBtn = document.getElementById('add-lead-btn');

// Modals
const leadModal = document.getElementById('lead-modal');
const modalTitle = document.getElementById('modal-title');
const leadForm = document.getElementById('lead-form');
const closeModalBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
const notesModal = document.getElementById('notes-modal');
const closeNotesModalBtn = document.querySelector('.close-notes-modal');
const notesForm = document.getElementById('notes-form');
const notesHistoryList = document.getElementById('notes-history-list');

// Toast Container
const toastContainer = document.getElementById('toast-container');

// ==========================================================================
// Initialization
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // SECURITY REQUIREMENT: Force login on every visit, no auto-login.
    // Always show login page first
    showView('auth');
    
    // Initialize Event Listeners
    setupEventListeners();
});

// ==========================================================================
// Event Listeners Setup
// ==========================================================================
function setupEventListeners() {
    // Auth
    toggleAuthLink.addEventListener('click', toggleAuthMode);
    authForm.addEventListener('submit', handleAuthSubmit);
    logoutBtn.addEventListener('click', handleLogout);

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            switchDashboardView(item.dataset.view);
            // Close mobile menu on click
            if(window.innerWidth <= 768) {
                sidebar.classList.remove('show');
            }
        });
    });

    // Mobile Menu
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('show');
    });

    // Modals
    addLeadBtn.addEventListener('click', () => openLeadModal());
    closeModalBtns.forEach(btn => btn.addEventListener('click', closeLeadModal));
    closeNotesModalBtn.addEventListener('click', closeNotesModal);
    
    // Forms
    leadForm.addEventListener('submit', handleLeadSubmit);
    notesForm.addEventListener('submit', handleNoteSubmit);

    // Search and Filter
    searchInput.addEventListener('input', renderLeadsTable);
    filterStatus.addEventListener('change', renderLeadsTable);

    // Close Modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target === leadModal) closeLeadModal();
        if (e.target === notesModal) closeNotesModal();
    });
}

// ==========================================================================
// Authentication Logic
// ==========================================================================
function toggleAuthMode() {
    isSignupMode = !isSignupMode;
    authAlert.classList.add('hidden');
    authForm.reset();
    
    if (isSignupMode) {
        authSubtitle.textContent = 'Create a new admin account';
        confirmPasswordGroup.style.display = 'flex';
        authBtn.textContent = 'Sign Up';
        toggleAuthText.innerHTML = 'Already have an account? <span class="toggle-link" id="toggle-auth">Login</span>';
    } else {
        authSubtitle.textContent = 'Login to your account';
        confirmPasswordGroup.style.display = 'none';
        authBtn.textContent = 'Login';
        toggleAuthText.innerHTML = 'Don\'t have an account? <span class="toggle-link" id="toggle-auth">Sign up</span>';
    }
    document.getElementById('toggle-auth').addEventListener('click', toggleAuthMode);
}

function handleAuthSubmit(e) {
    e.preventDefault();
    try {
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        
        if (isSignupMode) {
            // Signup Flow
            const confirmPassword = document.getElementById('confirm-password').value;
            if (password !== confirmPassword) {
                showAuthAlert('Passwords do not match.', 'error');
                return;
            }
            
            let users = {};
            try {
                users = JSON.parse(localStorage.getItem('crm_users')) || {};
            } catch(e) {}
            
            if (users && users[email]) {
                showAuthAlert('User with this email already exists.', 'error');
                return;
            }

            if (!users || typeof users !== 'object' || Array.isArray(users)) {
                users = {};
            }

            users[email] = { password: password };
            localStorage.setItem('crm_users', JSON.stringify(users));
            
            showAuthAlert('Account created successfully! Please login.', 'success');
            setTimeout(() => { toggleAuthMode(); }, 1500);
        } else {
            // Login Flow
            let users = {};
            try {
                users = JSON.parse(localStorage.getItem('crm_users')) || {};
            } catch(e) {}
            
            if (users && typeof users === 'object' && users[email] && users[email].password === password) {
                // Success
                currentUser = email;
                currentUserEmailDisplay.textContent = email;
                showView('app');
                showToast('Welcome back!', 'success');
            } else {
                showAuthAlert('Invalid email or password.', 'error');
            }
        }
    } catch(err) {
        showAuthAlert('System Error: ' + err.message, 'error');
        console.error("Auth Error: ", err);
    }
}

function handleLogout() {
    currentUser = null;
    showView('auth');
    authForm.reset();
    showToast('Logged out successfully.', 'success');
}

function showAuthAlert(message, type) {
    authAlert.textContent = message;
    authAlert.className = `alert alert-${type}`;
    authAlert.classList.remove('hidden');
}

// ==========================================================================
// View Management
// ==========================================================================
function showView(viewName) {
    if (viewName === 'auth') {
        authView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
    } else if (viewName === 'app') {
        if (!currentUser) {
            // Prevent access to dashboard if not logged in
            showView('auth');
            return;
        }
        authView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        updateDashboardStats();
        renderLeadsTable();
        switchDashboardView('dashboard');
    }
}

function switchDashboardView(viewId) {
    currentView = viewId;
    if (viewId === 'dashboard') {
        sectionDashboard.classList.remove('hidden');
        sectionLeads.classList.add('hidden');
        updateDashboardStats();
    } else if (viewId === 'leads') {
        sectionDashboard.classList.add('hidden');
        sectionLeads.classList.remove('hidden');
        renderLeadsTable();
    }
}

// ==========================================================================
// Dashboard Statistics
// ==========================================================================
function updateDashboardStats() {
    statTotal.textContent = leads.length;
    statNew.textContent = leads.filter(l => l.status === 'New').length;
    statContacted.textContent = leads.filter(l => l.status === 'Contacted').length;
    statConverted.textContent = leads.filter(l => l.status === 'Converted').length;
}

// ==========================================================================
// Lead Management (CRUD)
// ==========================================================================
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function saveLeadsData() {
    localStorage.setItem('crm_leads', JSON.stringify(leads));
    updateDashboardStats();
    if (currentView === 'leads') {
        renderLeadsTable();
    }
}

function handleLeadSubmit(e) {
    e.preventDefault();
    
    const leadData = {
        name: document.getElementById('lead-name').value.trim(),
        email: document.getElementById('lead-email').value.trim(),
        phone: document.getElementById('lead-phone').value.trim(),
        source: document.getElementById('lead-source').value,
        status: document.getElementById('lead-status').value,
        updatedAt: new Date().toISOString()
    };

    if (editingLeadId) {
        // Update
        const index = leads.findIndex(l => l.id === editingLeadId);
        if (index !== -1) {
            leads[index] = { ...leads[index], ...leadData };
            showToast('Lead updated successfully!', 'success');
        }
    } else {
        // Create
        leadData.id = generateId();
        leadData.notes = [];
        leadData.createdAt = new Date().toISOString();
        leads.push(leadData);
        showToast('Lead added successfully!', 'success');
    }

    saveLeadsData();
    closeLeadModal();
}

function deleteLead(id) {
    if (confirm('Are you sure you want to delete this lead?')) {
        leads = leads.filter(l => l.id !== id);
        saveLeadsData();
        showToast('Lead deleted.', 'success');
    }
}

function renderLeadsTable() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterVal = filterStatus.value;
    
    leadsTableBody.innerHTML = '';
    
    // Filter and Search
    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.name.toLowerCase().includes(searchTerm) || lead.email.toLowerCase().includes(searchTerm);
        const matchesStatus = filterVal === 'All' || lead.status === filterVal;
        return matchesSearch && matchesStatus;
    });

    if (filteredLeads.length === 0) {
        leadsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No leads found.</td></tr>`;
        return;
    }

    filteredLeads.forEach(lead => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${lead.name}</strong></td>
            <td>${lead.email}</td>
            <td>${lead.phone}</td>
            <td><span class="status-badge" style="background:#f1f5f9; color:#475569;">${lead.source}</span></td>
            <td><span class="status-badge status-${lead.status}">${lead.status}</span></td>
            <td class="actions-cell">
                <button class="icon-btn btn-notes" onclick="openNotesModal('${lead.id}')" title="Notes"><i class="fa-solid fa-clipboard-list"></i></button>
                <button class="icon-btn btn-edit" onclick="openLeadModal('${lead.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="icon-btn btn-delete" onclick="deleteLead('${lead.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        leadsTableBody.appendChild(tr);
    });
}

// ==========================================================================
// Modal Controllers
// ==========================================================================
function openLeadModal(id = null) {
    editingLeadId = id;
    leadForm.reset();
    
    if (id) {
        modalTitle.textContent = 'Edit Lead';
        const lead = leads.find(l => l.id === id);
        if (lead) {
            document.getElementById('lead-name').value = lead.name;
            document.getElementById('lead-email').value = lead.email;
            document.getElementById('lead-phone').value = lead.phone;
            document.getElementById('lead-source').value = lead.source;
            document.getElementById('lead-status').value = lead.status;
        }
    } else {
        modalTitle.textContent = 'Add New Lead';
    }
    
    leadModal.classList.remove('hidden');
}

function closeLeadModal() {
    leadModal.classList.add('hidden');
    editingLeadId = null;
    leadForm.reset();
}

// ==========================================================================
// Notes & Follow-ups
// ==========================================================================
function openNotesModal(id) {
    activeNotesLeadId = id;
    const lead = leads.find(l => l.id === id);
    if (!lead) return;
    
    document.getElementById('notes-lead-name').textContent = lead.name;
    notesForm.reset();
    renderNotesHistory(lead);
    
    notesModal.classList.remove('hidden');
}

function closeNotesModal() {
    notesModal.classList.add('hidden');
    activeNotesLeadId = null;
    notesForm.reset();
}

function renderNotesHistory(lead) {
    notesHistoryList.innerHTML = '';
    
    if (!lead.notes || lead.notes.length === 0) {
        notesHistoryList.innerHTML = '<li class="empty-notes">No notes available for this lead.</li>';
        return;
    }

    // Display newest top
    const sortedNotes = [...lead.notes].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    sortedNotes.forEach(note => {
        const dateStr = new Date(note.timestamp).toLocaleString();
        let followUpHtml = '';
        if (note.followUpDate) {
            const followUpStr = new Date(note.followUpDate).toLocaleDateString();
            followUpHtml = `<div class="note-followup"><i class="fa-regular fa-calendar"></i> Follow-up: ${followUpStr}</div>`;
        }
        
        const li = document.createElement('li');
        li.className = 'note-item';
        li.innerHTML = `
            <div class="note-header">
                <span><i class="fa-regular fa-clock"></i> ${dateStr}</span>
            </div>
            <div class="note-body">${note.text}</div>
            ${followUpHtml}
        `;
        notesHistoryList.appendChild(li);
    });
}

function handleNoteSubmit(e) {
    e.preventDefault();
    if (!activeNotesLeadId) return;

    const leadIndex = leads.findIndex(l => l.id === activeNotesLeadId);
    if (leadIndex === -1) return;

    const noteText = document.getElementById('new-note').value.trim();
    const followUpDate = document.getElementById('follow-up-date').value;

    const newNote = {
        text: noteText,
        timestamp: new Date().toISOString()
    };
    
    if (followUpDate) {
        newNote.followUpDate = followUpDate;
    }

    if (!leads[leadIndex].notes) {
        leads[leadIndex].notes = [];
    }
    
    leads[leadIndex].notes.push(newNote);
    saveLeadsData();
    
    // Auto Update Lead Status to Contacted if it was New and a note is added
    if (leads[leadIndex].status === 'New') {
        leads[leadIndex].status = 'Contacted';
        saveLeadsData();
        showToast('Lead status bumped to Contacted!', 'success');
    } else {
        showToast('Note added successfully!', 'success');
    }
    
    // Re-render
    renderNotesHistory(leads[leadIndex]);
    notesForm.reset();
}

// ==========================================================================
// Toast Notifications System
// ==========================================================================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '<i class="fa-solid fa-circle-check" style="color:var(--success)"></i>' : '<i class="fa-solid fa-circle-exclamation" style="color:var(--danger)"></i>';
    
    toast.innerHTML = `
        ${icon}
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
