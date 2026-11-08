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

    function showAccessDenied() {
        const render = () => {
            document.querySelectorAll('.app-shell').forEach((element) => { element.classList.add('hidden'); });
            const notice = document.createElement('main');
            notice.className = 'auth-shell access-denied-shell';
            notice.innerHTML = '<div class="auth-card access-denied-card"><div class="access-denied-mark" aria-hidden="true">!</div><p class="eyebrow">Restricted workspace</p><h1>Page unavailable</h1><a class="btn btn-primary" href="index.html">Return to Dashboard</a></div>';
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
