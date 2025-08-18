// Atualizando para detectar a altura do header
document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('header');
    const sections = document.querySelectorAll('main section[id]');
    const navLinks = document.querySelectorAll('header nav a');
    const backToTop = document.getElementById('backToTop');

    // Falta tratamento de erros para casos onde elementos não existam
    if (!header || sections.length === 0) return;

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

        // Lógica para o botão "voltar ao topo"
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
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

// Adicionar ao main.js
document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.querySelector('#contato form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Simulação de envio (substituir por código real)
            const formFeedback = document.createElement('div');
            formFeedback.className = 'form-feedback success';
            formFeedback.textContent = 'Mensagem enviada com sucesso!';

            // Limpar feedback anterior se existir
            const oldFeedback = contactForm.querySelector('.form-feedback');
            if (oldFeedback) oldFeedback.remove();

            contactForm.appendChild(formFeedback);
            contactForm.reset();
        });
    }

    // Código do botão voltar ao topo
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        // Adicionar comportamento de clique
        backToTop.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
