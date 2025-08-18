/**
 * @file Script principal para a interatividade do site da Padaria Pão Dourado.
 * @summary Este arquivo lida com a navegação ativa, scroll suave, botão "voltar ao topo" e feedback do formulário de contato.
 * @description O código é executado após o carregamento completo do DOM para garantir que todos os elementos estejam disponíveis.
 */

document.addEventListener('DOMContentLoaded', function () {
    // =========================================================================
    // Seletores de Elementos com Verificação de Existência
    // =========================================================================
    const header = document.querySelector('header');
    const navLinks = document.querySelectorAll('header nav a');
    const sections = document.querySelectorAll('main section[id]');
    const backToTopButton = document.getElementById('backToTop');
    const contactForm = document.querySelector('#contato form');

    // Se os elementos essenciais de navegação não existirem, o script de navegação não é executado.
    if (header && navLinks.length > 0 && sections.length > 0) {
        setupNavigation();
    }

    // Configura o botão "Voltar ao Topo" se ele existir.
    if (backToTopButton) {
        setupBackToTopButton(backToTopButton);
    }

    // Configura o formulário de contato se ele existir.
    if (contactForm) {
        setupContactForm(contactForm);
    }

    // =========================================================================
    // Funções de Configuração
    // =========================================================================

    /**
     * Configura a lógica de navegação, incluindo o realce de link ativo no scroll
     * e o comportamento de rolagem suave ao clicar nos links do menu.
     */
    function setupNavigation() {
        // Calcula o offset dinamicamente com base na altura do header.
        const getHeaderOffset = () => header.offsetHeight + 20; // 20px de margem.

        // Evento de scroll para atualizar o link ativo no menu.
        window.addEventListener('scroll', () => {
            let currentSectionId = '';
            const scrollYPosition = window.scrollY;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (scrollYPosition >= sectionTop - getHeaderOffset()) {
                    currentSectionId = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                // Verifica se o href do link corresponde à seção atual.
                if (link.getAttribute('href').substring(1) === currentSectionId) {
                    link.classList.add('active');
                }
            });
        });

        // Adiciona o evento de clique para a rolagem suave.
        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    const offsetPosition = targetSection.offsetTop - getHeaderOffset() + 5;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * Configura a visibilidade e a funcionalidade do botão "Voltar ao Topo".
     * @param {HTMLElement} button - O elemento do botão.
     */
    function setupBackToTopButton(button) {
        // Mostra ou esconde o botão com base na posição de rolagem.
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                button.classList.add('visible');
            } else {
                button.classList.remove('visible');
            }
        });

        // Adiciona o evento de clique para rolar a página para o topo.
        button.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /**
     * Configura o formulário de contato para fornecer um feedback de sucesso.
     * @param {HTMLFormElement} form - O elemento do formulário.
     */
    function setupContactForm(form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // NOTA: Esta é uma simulação. Para um funcionamento real, é necessário
            // implementar um backend (servidor) para processar os dados do formulário.
            // Exemplo: enviar os dados para uma API que envia um email.

            // Remove feedback anterior, se houver.
            const existingFeedback = form.querySelector('.form-feedback');
            if (existingFeedback) {
                existingFeedback.remove();
            }

            // Cria e exibe uma mensagem de sucesso.
            const formFeedback = document.createElement('div');
            formFeedback.className = 'form-feedback success'; // Classe para estilização.
            formFeedback.textContent = 'Obrigado pelo seu contato! Mensagem enviada com sucesso.';
            form.appendChild(formFeedback);

            // Limpa o formulário após o envio.
            form.reset();

            // Remove a mensagem de feedback após alguns segundos.
            setTimeout(() => {
                formFeedback.remove();
            }, 5000); // 5 segundos.
        });
    }
});
