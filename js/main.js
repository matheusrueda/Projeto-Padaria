// Atualizando para detectar a altura do header
document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('header');
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('header nav a');

    // Calcula o offset necessário considerando a altura do header
    const getOffset = () => header.offsetHeight + 20; // 20px de margem extra

    window.addEventListener('scroll', function () {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - getOffset()) {
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

    // Ajuste suave ao clicar nos links do menu
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            const offsetPosition = targetSection.offsetTop - getOffset() + 5;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });
});
