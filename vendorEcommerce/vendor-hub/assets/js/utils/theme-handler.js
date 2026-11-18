// assets/js/utils/theme-handler.js

export const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleUI(savedTheme);
};

export const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggleUI(newTheme);
};

function updateThemeToggleUI(theme) {
    const buttons = document.querySelectorAll('#theme-toggle, .theme-toggle-btn');
    buttons.forEach(btn => {
        btn.innerHTML = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    });
}
