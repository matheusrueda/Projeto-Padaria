// Adicionar ao main.js
document.addEventListener('DOMContentLoaded', function () {
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('nav a');

    window.addEventListener('scroll', function () {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });
});