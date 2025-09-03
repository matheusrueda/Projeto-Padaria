/**
 * PADARIA PÃO DOURADO - SISTEMA INTERATIVO HARMONIZADO
 * Sistema JavaScript otimizado com Context7 e design harmonizado
 * Funcionalidades: Tabela de preços interativa, animações, formulário de contato
 */

class PadariaHarmonizada {
    constructor() {
        this.initializeComponents();
        this.setupEventListeners();
        this.initializeAnimations();
        this.setupAccessibility();
    }

    /**
     * Inicialização de componentes principais
     */
    initializeComponents() {
        this.pricingManager = new PricingTableManager();
        this.contactManager = new ContactFormManager();
        this.animationManager = new AnimationManager();
        this.toastManager = new ToastManager();

        console.log('✅ Padaria Pão Dourado - Sistemas inicializados');
    }

    /**
     * Configuração de event listeners
     */
    setupEventListeners() {
        // Loading completo
        window.addEventListener('load', () => {
            this.hideLoading();
            this.animationManager.startScrollAnimations();
        });

        // Navegação suave
        this.setupSmoothScrolling();

        // Teclado para acessibilidade
        this.setupKeyboardNavigation();

        // Resize handler para responsividade
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 150);
        });
    }

    /**
     * Configuração de animações harmonizadas
     */
    initializeAnimations() {
        // Lazy loading para imagens
        this.setupLazyLoading();

        // Animações de scroll
        this.observeScrollElements();
    }

    /**
     * Configuração de acessibilidade aprimorada
     */
    setupAccessibility() {
        // Gerenciar preferência de movimento reduzido
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--transition-duration-300', '0ms');
            document.documentElement.style.setProperty('--transition-duration-500', '0ms');
        }

        // Melhorar foco para teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    /**
     * Navegação suave aprimorada
     */
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Atualizar navegação ativa
                    this.updateActiveNavigation(anchor.getAttribute('href'));
                }
            });
        });
    }

    /**
     * Atualizar navegação ativa
     */
    updateActiveNavigation(hash) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === hash) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Navegação por teclado
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Esc para fechar modais
            if (e.key === 'Escape') {
                this.closeAllModals();
            }

            // Enter/Space em elementos interativos
            if ((e.key === 'Enter' || e.key === ' ') && e.target.hasAttribute('role')) {
                if (['button', 'tab'].includes(e.target.getAttribute('role'))) {
                    e.preventDefault();
                    e.target.click();
                }
            }
        });
    }

    /**
     * Lazy loading para imagens
     */
    setupLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.addEventListener('load', () => {
                            img.classList.add('loaded');
                        });
                        imageObserver.unobserve(img);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback para browsers mais antigos
            images.forEach(img => {
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                });
            });
        }
    }

    /**
     * Observar elementos para animações de scroll
     */
    observeScrollElements() {
        const animatedElements = document.querySelectorAll('.animate-fade-in-up, .animate-fade-in-scale');

        if ('IntersectionObserver' in window) {
            const scrollObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-on-scroll', 'in-view');
                        scrollObserver.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.2,
                rootMargin: '0px 0px -50px 0px'
            });

            animatedElements.forEach(el => scrollObserver.observe(el));
        }
    }

    /**
     * Gerenciar resize da janela
     */
    handleResize() {
        // Reconfigurar elementos responsivos
        this.pricingManager.updateResponsiveLayout();
        this.contactManager.updateFormLayout();
    }

    /**
     * Esconder loading
     */
    hideLoading() {
        const loader = document.getElementById('page-loading');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Fechar todos os modais
     */
    closeAllModals() {
        document.querySelectorAll('.modal-overlay.show').forEach(modal => {
            modal.classList.remove('show');
        });
    }
}

/**
 * GERENCIADOR DA TABELA DE PREÇOS HARMONIZADA
 */
class PricingTableManager {
    constructor() {
        this.currentTab = 'paes';
        this.tabs = document.querySelectorAll('.pricing-tab');
        this.panels = document.querySelectorAll('.pricing-panel');

        if (this.tabs.length > 0) {
            this.initializeTabs();
        }
    }

    initializeTabs() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.handleTabClick(e));
            tab.addEventListener('keydown', (e) => this.handleTabKeydown(e));
        });

        // Inicializar primeiro tab
        this.showTab(this.currentTab);
    }

    handleTabClick(e) {
        const tab = e.currentTarget;
        const targetPanel = tab.getAttribute('aria-controls');

        if (targetPanel) {
            this.showTab(targetPanel.replace('-panel', ''));
        }
    }

    handleTabKeydown(e) {
        const currentIndex = Array.from(this.tabs).indexOf(e.currentTarget);
        let targetIndex = currentIndex;

        switch (e.key) {
            case 'ArrowLeft':
                targetIndex = currentIndex > 0 ? currentIndex - 1 : this.tabs.length - 1;
                break;
            case 'ArrowRight':
                targetIndex = currentIndex < this.tabs.length - 1 ? currentIndex + 1 : 0;
                break;
            case 'Home':
                targetIndex = 0;
                break;
            case 'End':
                targetIndex = this.tabs.length - 1;
                break;
            default:
                return;
        }

        e.preventDefault();
        this.tabs[targetIndex].focus();
        this.tabs[targetIndex].click();
    }

    showTab(tabName) {
        // Atualizar tabs
        this.tabs.forEach(tab => {
            const isActive = tab.id === `${tabName}-tab`;
            tab.setAttribute('aria-selected', isActive.toString());
            tab.classList.toggle('active', isActive);
        });

        // Atualizar painéis com animação
        this.panels.forEach(panel => {
            const isActive = panel.id === `${tabName}-panel`;
            panel.classList.toggle('active', isActive);
            panel.setAttribute('aria-hidden', (!isActive).toString());

            if (isActive) {
                panel.setAttribute('tabindex', '0');
                // Animar itens do painel
                this.animatePanelItems(panel);
            } else {
                panel.setAttribute('tabindex', '-1');
            }
        });

        this.currentTab = tabName;

        // Analytics (se configurado)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'tab_change', {
                event_category: 'pricing',
                event_label: tabName
            });
        }
    }

    animatePanelItems(panel) {
        const items = panel.querySelectorAll('.pricing-item');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';

            setTimeout(() => {
                item.style.transition = 'all 0.3s ease-out';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    updateResponsiveLayout() {
        // Reconfigurar layout responsivo se necessário
        const isMobile = window.innerWidth < 768;

        if (isMobile && !this.mobileLayout) {
            this.setupMobileLayout();
        } else if (!isMobile && this.mobileLayout) {
            this.setupDesktopLayout();
        }
    }

    setupMobileLayout() {
        this.mobileLayout = true;
        // Configurações específicas para mobile
    }

    setupDesktopLayout() {
        this.mobileLayout = false;
        // Configurações específicas para desktop
    }
}

/**
 * GERENCIADOR DO FORMULÁRIO DE CONTATO HARMONIZADO
 */
class ContactFormManager {
    constructor() {
        this.form = document.querySelector('.form-contact');
        if (this.form) {
            this.initializeForm();
        }
    }

    initializeForm() {
        this.setupValidation();
        this.setupSubmission();
        this.setupDynamicElements();
    }

    setupValidation() {
        const inputs = this.form.querySelectorAll('.form-control');

        inputs.forEach(input => {
            // Validação em tempo real
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldErrors(input));
        });

        // Validação do form completo
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        const isRequired = field.hasAttribute('required');

        let isValid = true;
        let errorMessage = '';

        // Validação por tipo
        if (isRequired && !value) {
            isValid = false;
            errorMessage = 'Este campo é obrigatório.';
        } else if (value) {
            switch (fieldType) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Por favor, insira um e-mail válido.';
                    }
                    break;
                case 'tel':
                    const phoneRegex = /^[+]?[\s\d\-\(\)]+$/;
                    if (value && !phoneRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Por favor, insira um telefone válido.';
                    }
                    break;
            }
        }

        // Aplicar classes de validação
        field.classList.toggle('is-valid', isValid && value);
        field.classList.toggle('is-invalid', !isValid);

        // Mostrar/esconder mensagem de erro
        this.updateFieldMessage(field, errorMessage, isValid);

        return isValid;
    }

    updateFieldMessage(field, message, isValid) {
        const helpElement = document.getElementById(field.getAttribute('aria-describedby'));

        if (helpElement && !isValid && message) {
            helpElement.textContent = message;
            helpElement.classList.add('text-danger');
            helpElement.classList.remove('text-success');
        } else if (helpElement && isValid) {
            helpElement.classList.remove('text-danger');
            helpElement.classList.add('text-success');
        }
    }

    clearFieldErrors(field) {
        field.classList.remove('is-invalid', 'is-valid');
        const helpElement = document.getElementById(field.getAttribute('aria-describedby'));
        if (helpElement) {
            helpElement.classList.remove('text-danger', 'text-success');
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        // Validar todos os campos
        const inputs = this.form.querySelectorAll('.form-control');
        let formIsValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                formIsValid = false;
            }
        });

        // Validar checkbox de privacidade
        const privacyCheckbox = this.form.querySelector('#contact-privacy');
        if (!privacyCheckbox.checked) {
            formIsValid = false;
            this.showToast('Por favor, aceite nossa política de privacidade.', 'warning');
        }

        if (formIsValid) {
            this.submitForm();
        } else {
            this.showToast('Por favor, corrija os erros no formulário.', 'error');
        }
    }

    async submitForm() {
        const submitButton = this.form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        // Loading state
        submitButton.disabled = true;
        submitButton.classList.add('loading');
        submitButton.textContent = 'Enviando...';

        try {
            // Simular envio (substituir por API real)
            await this.simulateFormSubmission();

            this.showToast('Mensagem enviada com sucesso! Responderemos em breve.', 'success');
            this.form.reset();

            // Limpar classes de validação
            this.form.querySelectorAll('.form-control').forEach(input => {
                input.classList.remove('is-valid', 'is-invalid');
            });

        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            this.showToast('Erro ao enviar mensagem. Tente novamente mais tarde.', 'error');
        } finally {
            // Restaurar botão
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
            submitButton.textContent = originalText;
        }
    }

    simulateFormSubmission() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simular sucesso (90% das vezes)
                if (Math.random() > 0.1) {
                    resolve();
                } else {
                    reject(new Error('Erro simulado'));
                }
            }, 2000);
        });
    }

    setupDynamicElements() {
        // Máscara de telefone
        const phoneInput = this.form.querySelector('#contact-phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 0) {
                    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
                    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
                }
                e.target.value = value;
            });
        }
    }

    showToast(message, type) {
        if (window.padariaApp && window.padariaApp.toastManager) {
            window.padariaApp.toastManager.show(message, type);
        }
    }

    updateFormLayout() {
        // Reconfigurar layout do formulário se necessário
    }
}

/**
 * GERENCIADOR DE ANIMAÇÕES HARMONIZADAS
 */
class AnimationManager {
    constructor() {
        this.observedElements = new Set();
        this.setupScrollAnimations();
    }

    setupScrollAnimations() {
        // Configurar observer para animações de scroll
        if ('IntersectionObserver' in window) {
            this.scrollObserver = new IntersectionObserver(
                this.handleIntersection.bind(this),
                {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                }
            );
        }
    }

    startScrollAnimations() {
        const elements = document.querySelectorAll(
            '.animate-fade-in-up, .animate-fade-in-scale, .animate-on-scroll'
        );

        elements.forEach(el => {
            if (this.scrollObserver) {
                this.scrollObserver.observe(el);
            }
            this.observedElements.add(el);
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.animateElement(entry.target);
                this.scrollObserver.unobserve(entry.target);
            }
        });
    }

    animateElement(element) {
        element.classList.add('in-view');

        // Animar filhos se necessário
        const children = element.querySelectorAll('[class*="animate-"]');
        children.forEach((child, index) => {
            setTimeout(() => {
                child.classList.add('in-view');
            }, index * 100);
        });
    }
}

/**
 * GERENCIADOR DE NOTIFICAÇÕES TOAST
 */
class ToastManager {
    constructor() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.createContainer();
        }
        this.toasts = [];
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        this.container.setAttribute('role', 'alert');
        this.container.setAttribute('aria-live', 'polite');
        this.container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 5000) {
        const toast = this.createToast(message, type);
        this.container.appendChild(toast);
        this.toasts.push(toast);

        // Mostrar toast
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto remover
        setTimeout(() => {
            this.remove(toast);
        }, duration);

        // Limpar toasts antigos se muitos
        if (this.toasts.length > 5) {
            const oldToast = this.toasts.shift();
            this.remove(oldToast);
        }
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <div class="toast-header">
                ${icons[type] || icons.info} ${this.getTypeTitle(type)}
            </div>
            <div class="toast-body">${message}</div>
        `;

        // Botão de fechar
        toast.addEventListener('click', () => this.remove(toast));

        return toast;
    }

    getTypeTitle(type) {
        const titles = {
            success: 'Sucesso',
            error: 'Erro',
            warning: 'Atenção',
            info: 'Informação'
        };
        return titles[type] || titles.info;
    }

    remove(toast) {
        if (toast && toast.parentNode) {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
                this.toasts = this.toasts.filter(t => t !== toast);
            }, 300);
        }
    }
}

// Inicializar aplicação quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.padariaApp = new PadariaHarmonizada();
    });
} else {
    window.padariaApp = new PadariaHarmonizada();
}

// Exportar para uso global se necessário
window.PadariaHarmonizada = PadariaHarmonizada;
