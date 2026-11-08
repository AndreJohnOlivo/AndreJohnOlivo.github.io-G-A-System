(() => {
    const requiredRoles = {
        '/attendance.html': ['Program Head', 'Faculty'],
        '/grades.html': ['Program Head', 'Faculty'],
        '/reports.html': ['Program Head', 'Faculty'],
        '/students.html': ['Program Head'],
        '/faculty.html': ['Program Head']
    };
    const roles = requiredRoles[window.location.pathname];
    if (!roles) return;

    function showAccessDenied(role) {
        const render = () => {
            document.querySelectorAll('.app-shell').forEach((element) => { element.classList.add('hidden'); });
            const notice = document.createElement('main');
            notice.className = 'auth-shell';
            notice.innerHTML = `<div class="auth-card"><p class="eyebrow">UCC Academic Portal</p><h1>Access restricted</h1><p class="auth-intro">Your ${role || 'current'} account does not have permission to open this page.</p><a class="btn btn-primary" href="index.html">Return to Dashboard</a></div>`;
            document.body.appendChild(notice);
        };
        if (document.body) render();
        else window.addEventListener('DOMContentLoaded', render, { once: true });
    }

    const token = sessionStorage.getItem('uccAccessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    fetch('/api/session', { headers, credentials: 'same-origin' })
        .then((response) => response.json().then((result) => ({ response, result })))
        .then(({ response, result }) => {
            const role = result.session?.role;
            if (!response.ok || !role) {
                throw new Error('Invalid session.');
            }
            if (!roles.includes(role)) {
                showAccessDenied(role);
                return;
            }
            document.querySelectorAll('.nav-admin').forEach((item) => { item.classList.toggle('hidden', role !== 'Program Head'); });
        })
        .catch(() => {
            sessionStorage.removeItem('uccAccessRole');
            sessionStorage.removeItem('uccAccessToken');
            sessionStorage.removeItem('currentStudentName');
            window.location.replace('index.html?message=Please%20sign%20in%20to%20continue.');
        });
})();
