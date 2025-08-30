/**
 * @file Padaria Pão Dourado - Sistema JavaScript Moderno
 * @version 2.0
 * @description Sistema JavaScript moderno seguindo Airbnb Style Guide e melhores práticas
 * @author Padaria Pão Dourado
 * @date 2025
 */

'use strict';

// =========================================
// CONSTANTES E CONFIGURAÇÃO
// =========================================

const APP_CONFIG = {
  HEADER_OFFSET: 20,
  BACK_TO_TOP_THRESHOLD: 300,
  FEEDBACK_DURATION: 5000,
  SCROLL_DEBOUNCE_DELAY: 16, // ~60fps
  INTERSECTION_THRESHOLD: 0.1,
  ANIMATION_DELAYS: {
    CASCADE_BASE: 100,
    CASCADE_INCREMENT: 100,
  },
};

const SELECTORS = {
  header: 'header',
  navLinks: 'header nav a',
  sections: 'main section[id]',
  backToTop: '#backToTop',
  contactForm: '#contato form',
  heroImage: '.hero-image',
  productItems: '.product-item',
  formFeedback: '.form-feedback',
};

const CSS_CLASSES = {
  active: 'active',
  visible: 'visible',
  formFeedbackSuccess: 'form-feedback success',
  formFeedbackError: 'form-feedback error',
  fadeIn: 'fade-in',
  slideUp: 'slide-up',
};

const ARIA_LABELS = {
  backToTop: 'Voltar ao topo da página',
  navLink: 'Navegar para seção',
  submitForm: 'Enviar formulário de contato',
};

// =========================================
// UTILITÁRIOS
// =========================================

/**
 * Utilitários para operações comuns
 */
const Utils = {
  /**
   * Debounce function para otimizar performance
   * @param {Function} func - Função a ser debounced
   * @param {number} delay - Delay em milliseconds
   * @returns {Function} - Função debounced
   */
  debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  },

  /**
   * Throttle function para controlar frequência de execução
   * @param {Function} func - Função a ser throttled
   * @param {number} delay - Delay em milliseconds
   * @returns {Function} - Função throttled
   */
  throttle(func, delay) {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, delay);
      }
    };
  },

  /**
   * Smooth scroll para elemento específico
   * @param {HTMLElement} element - Elemento alvo
   * @param {number} offset - Offset adicional
   */
  smoothScrollTo(element, offset = 0) {
    if (!element) return;
    
    const targetPosition = element.offsetTop - offset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 800;
    let start = null;

    const animation = (currentTime) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };

    requestAnimationFrame(animation);
  },

  /**
   * Easing function para animações suaves
   * @param {number} t - Tempo atual
   * @param {number} b - Valor inicial
   * @param {number} c - Mudança no valor
   * @param {number} d - Duração
   * @returns {number} - Valor calculado
   */
  easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t -= 1;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  },

  /**
   * Sanitiza string para prevenir XSS
   * @param {string} str - String a ser sanitizada
   * @returns {string} - String sanitizada
   */
  sanitizeString(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Valida se elemento está visível na viewport
   * @param {HTMLElement} element - Elemento a ser verificado
   * @returns {boolean} - True se visível
   */
  isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  /**
   * Getter para altura dinâmica do header
   * @returns {number} - Altura do header + offset
   */
  getHeaderOffset() {
    const header = document.querySelector(SELECTORS.header);
    return header ? header.offsetHeight + APP_CONFIG.HEADER_OFFSET : APP_CONFIG.HEADER_OFFSET;
  },

  /**
   * Log de erro padronizado
   * @param {string} context - Contexto do erro
   * @param {Error} error - Objeto de erro
   */
  logError(context, error) {
    console.error(`[Padaria App] ${context}:`, error);
  },

  /**
   * Notificação para usuário
   * @param {string} message - Mensagem
   * @param {string} type - Tipo (success, error, info)
   */
  showNotification(message, type = 'info') {
    // Implementation for user notifications
    console.log(`[${type.toUpperCase()}] ${message}`);
  },
};

// =========================================
// GERENCIAMENTO DE NAVEGAÇÃO
// =========================================

/**
 * Classe para gerenciar navegação e scroll
 */
class NavigationManager {
  constructor() {
    this.header = document.querySelector(SELECTORS.header);
    this.navLinks = document.querySelectorAll(SELECTORS.navLinks);
    this.sections = document.querySelectorAll(SELECTORS.sections);
    this.currentSection = '';
    this.isScrolling = false;
    
    this.init();
  }

  /**
   * Inicializa o sistema de navegação
   */
  init() {
    if (!this.header || this.navLinks.length === 0 || this.sections.length === 0) {
      Utils.logError('NavigationManager', new Error('Elementos essenciais de navegação não encontrados'));
      return;
    }

    this.setupScrollHandler();
    this.setupClickHandlers();
    this.setupKeyboardNavigation();
    this.setupIntersectionObserver();
    
    // Chama uma vez para definir estado inicial
    this.updateActiveNavigation();
  }

  /**
   * Configura o handler de scroll otimizado
   */
  setupScrollHandler() {
    const throttledScrollHandler = Utils.throttle(() => {
      this.updateActiveNavigation();
    }, APP_CONFIG.SCROLL_DEBOUNCE_DELAY);

    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
  }

  /**
   * Configura handlers de clique para navegação
   */
  setupClickHandlers() {
    this.navLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        this.handleNavClick(link);
      });
    });
  }

  /**
   * Configura navegação por teclado para acessibilidade
   */
  setupKeyboardNavigation() {
    this.navLinks.forEach((link) => {
      link.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.handleNavClick(link);
        }
      });
    });
  }

  /**
   * Configura Intersection Observer para detecção de seções visíveis
   */
  setupIntersectionObserver() {
    const observerOptions = {
      rootMargin: `-${Utils.getHeaderOffset()}px 0px -50% 0px`,
      threshold: APP_CONFIG.INTERSECTION_THRESHOLD,
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.currentSection = entry.target.id;
          this.highlightActiveLink();
        }
      });
    }, observerOptions);

    this.sections.forEach((section) => {
      this.intersectionObserver.observe(section);
    });
  }

  /**
   * Atualiza navegação ativa baseado no scroll
   */
  updateActiveNavigation() {
    let newCurrentSection = '';
    const scrollY = window.pageYOffset;
    const headerOffset = Utils.getHeaderOffset();

    this.sections.forEach((section) => {
      const sectionTop = section.offsetTop - headerOffset;
      const sectionHeight = section.offsetHeight;
      
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        newCurrentSection = section.id;
      }
    });

    if (newCurrentSection !== this.currentSection) {
      this.currentSection = newCurrentSection;
      this.highlightActiveLink();
    }
  }

  /**
   * Destaca o link ativo na navegação
   */
  highlightActiveLink() {
    this.navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      const targetId = href ? href.substring(1) : '';
      
      link.classList.toggle(CSS_CLASSES.active, targetId === this.currentSection);
      
      // Atualiza ARIA para acessibilidade
      link.setAttribute('aria-current', targetId === this.currentSection ? 'true' : 'false');
    });
  }

  /**
   * Manipula clique em link de navegação
   * @param {HTMLElement} link - Link clicado
   */
  handleNavClick(link) {
    try {
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        this.isScrolling = true;
        Utils.smoothScrollTo(targetSection, Utils.getHeaderOffset());
        
        // Foco no elemento alvo para acessibilidade
        setTimeout(() => {
          targetSection.focus({ preventScroll: true });
          this.isScrolling = false;
        }, 800);

        // Analytics tracking
        this.trackNavigation(targetId);
      }
    } catch (error) {
      Utils.logError('Navigation Click', error);
    }
  }

  /**
   * Tracking de navegação para analytics
   * @param {string} targetId - ID da seção alvo
   */
  trackNavigation(targetId) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'navigation_click', {
        event_category: 'Navigation',
        event_label: targetId,
      });
    }
  }

  /**
   * Limpa recursos quando necessário
   */
  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }
}

// =========================================
// BOTÃO VOLTAR AO TOPO
// =========================================

/**
 * Classe para gerenciar o botão "Voltar ao Topo"
 */
class BackToTopButton {
  constructor() {
    this.button = document.querySelector(SELECTORS.backToTop);
    this.isVisible = false;
    
    this.init();
  }

  /**
   * Inicializa o botão "Voltar ao Topo"
   */
  init() {
    if (!this.button) {
      // Cria o botão se não existir
      this.createButton();
    }

    if (this.button) {
      this.setupEventListeners();
      this.setupAccessibility();
    }
  }

  /**
   * Cria o botão dinamicamente
   */
  createButton() {
    this.button = document.createElement('button');
    this.button.id = 'backToTop';
    this.button.className = 'back-to-top';
    this.button.innerHTML = '↑';
    this.button.setAttribute('title', ARIA_LABELS.backToTop);
    this.button.setAttribute('aria-label', ARIA_LABELS.backToTop);
    
    document.body.appendChild(this.button);
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Scroll handler otimizado
    const throttledScrollHandler = Utils.throttle(() => {
      this.handleScroll();
    }, APP_CONFIG.SCROLL_DEBOUNCE_DELAY);

    window.addEventListener('scroll', throttledScrollHandler, { passive: true });

    // Click handler
    this.button.addEventListener('click', (event) => {
      event.preventDefault();
      this.scrollToTop();
    });

    // Keyboard handler
    this.button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.scrollToTop();
      }
    });
  }

  /**
   * Configura acessibilidade
   */
  setupAccessibility() {
    this.button.setAttribute('tabindex', '0');
    this.button.setAttribute('role', 'button');
  }

  /**
   * Manipula evento de scroll para mostrar/ocultar botão
   */
  handleScroll() {
    const shouldShow = window.pageYOffset > APP_CONFIG.BACK_TO_TOP_THRESHOLD;
    
    if (shouldShow !== this.isVisible) {
      this.isVisible = shouldShow;
      this.button.classList.toggle(CSS_CLASSES.visible, shouldShow);
      
      // Atualiza acessibilidade
      this.button.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
    }
  }

  /**
   * Executa scroll suave para o topo
   */
  scrollToTop() {
    try {
      Utils.smoothScrollTo(document.body, 0);
      
      // Foco no primeiro elemento navegável
      setTimeout(() => {
        const firstFocusable = document.querySelector('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }, 800);

      // Analytics tracking
      this.trackUsage();
    } catch (error) {
      Utils.logError('Back to Top', error);
    }
  }

  /**
   * Tracking de uso para analytics
   */
  trackUsage() {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'back_to_top_click', {
        event_category: 'Navigation',
        event_label: 'Back to Top Button',
      });
    }
  }
}

// =========================================
// SISTEMA DE FORMULÁRIOS
// =========================================

/**
 * Classe para gerenciar formulários
 */
class FormManager {
  constructor() {
    this.forms = document.querySelectorAll('form');
    this.contactForm = document.querySelector(SELECTORS.contactForm);
    
    this.init();
  }

  /**
   * Inicializa o sistema de formulários
   */
  init() {
    if (this.contactForm) {
      this.setupContactForm();
    }
    
    this.setupFormValidation();
  }

  /**
   * Configura formulário de contato
   */
  setupContactForm() {
    this.contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      this.handleContactSubmit();
    });

    // Validação em tempo real
    const inputs = this.contactForm.querySelectorAll('input, textarea');
    inputs.forEach((input) => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  /**
   * Configura validação geral de formulários
   */
  setupFormValidation() {
    this.forms.forEach((form) => {
      form.addEventListener('submit', (event) => {
        if (!this.validateForm(form)) {
          event.preventDefault();
        }
      });
    });
  }

  /**
   * Manipula submissão do formulário de contato
   */
  async handleContactSubmit() {
    try {
      // Remove feedback anterior
      this.removeFeedback();
      
      // Valida formulário
      if (!this.validateForm(this.contactForm)) {
        this.showFeedback('Por favor, corrija os erros antes de enviar.', 'error');
        return;
      }

      // Simula envio (substituir por API real)
      const formData = new FormData(this.contactForm);
      const result = await this.simulateSubmission(formData);

      if (result.success) {
        this.showFeedback('Obrigado pelo seu contato! Mensagem enviada com sucesso.', 'success');
        this.contactForm.reset();
        
        // Analytics tracking
        this.trackFormSubmission('contact', 'success');
      } else {
        throw new Error(result.message || 'Erro no envio');
      }
    } catch (error) {
      Utils.logError('Form Submission', error);
      this.showFeedback('Erro ao enviar mensagem. Tente novamente mais tarde.', 'error');
      this.trackFormSubmission('contact', 'error');
    }
  }

  /**
   * Simula submissão do formulário
   * @param {FormData} formData - Dados do formulário
   * @returns {Promise<Object>} - Resultado da submissão
   */
  async simulateSubmission(formData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simula sucesso na submissão
        resolve({ success: true });
      }, 1000);
    });
  }

  /**
   * Valida formulário completo
   * @param {HTMLFormElement} form - Formulário a ser validado
   * @returns {boolean} - True se válido
   */
  validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    inputs.forEach((input) => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  /**
   * Valida campo individual
   * @param {HTMLInputElement} field - Campo a ser validado
   * @returns {boolean} - True se válido
   */
  validateField(field) {
    let isValid = true;
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name;

    // Remove erro anterior
    this.clearFieldError(field);

    // Validação de campo obrigatório
    if (field.required && !value) {
      this.showFieldError(field, 'Este campo é obrigatório.');
      isValid = false;
    } else if (value) {
      // Validações específicas por tipo
      switch (fieldType) {
        case 'email':
          if (!this.isValidEmail(value)) {
            this.showFieldError(field, 'Por favor, insira um email válido.');
            isValid = false;
          }
          break;
        case 'tel':
          if (!this.isValidPhone(value)) {
            this.showFieldError(field, 'Por favor, insira um telefone válido.');
            isValid = false;
          }
          break;
        default:
          // Validação de tamanho mínimo para textarea
          if (field.tagName === 'TEXTAREA' && value.length < 10) {
            this.showFieldError(field, 'A mensagem deve ter pelo menos 10 caracteres.');
            isValid = false;
          }
      }
    }

    return isValid;
  }

  /**
   * Valida formato de email
   * @param {string} email - Email a ser validado
   * @returns {boolean} - True se válido
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida formato de telefone brasileiro
   * @param {string} phone - Telefone a ser validado
   * @returns {boolean} - True se válido
   */
  isValidPhone(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }

  /**
   * Mostra erro em campo específico
   * @param {HTMLInputElement} field - Campo com erro
   * @param {string} message - Mensagem de erro
   */
  showFieldError(field, message) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    
    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    
    field.parentNode.appendChild(errorElement);
  }

  /**
   * Remove erro de campo específico
   * @param {HTMLInputElement} field - Campo para limpar erro
   */
  clearFieldError(field) {
    field.classList.remove('error');
    field.setAttribute('aria-invalid', 'false');
    
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
      errorElement.remove();
    }
  }

  /**
   * Mostra feedback geral do formulário
   * @param {string} message - Mensagem
   * @param {string} type - Tipo (success, error)
   */
  showFeedback(message, type = 'success') {
    this.removeFeedback();
    
    const feedbackElement = document.createElement('div');
    feedbackElement.className = `form-feedback ${type}`;
    feedbackElement.textContent = Utils.sanitizeString(message);
    feedbackElement.setAttribute('role', 'alert');
    feedbackElement.setAttribute('aria-live', 'polite');
    
    this.contactForm.insertBefore(feedbackElement, this.contactForm.firstChild);
    
    // Auto-remove feedback após tempo configurado
    if (type === 'success') {
      setTimeout(() => {
        this.removeFeedback();
      }, APP_CONFIG.FEEDBACK_DURATION);
    }
  }

  /**
   * Remove feedback existente
   */
  removeFeedback() {
    const existingFeedback = this.contactForm.querySelector(SELECTORS.formFeedback);
    if (existingFeedback) {
      existingFeedback.remove();
    }
  }

  /**
   * Tracking de submissão para analytics
   * @param {string} formType - Tipo do formulário
   * @param {string} result - Resultado (success, error)
   */
  trackFormSubmission(formType, result) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'form_submission', {
        event_category: 'Forms',
        event_label: `${formType}_${result}`,
        value: result === 'success' ? 1 : 0,
      });
    }
  }
}

// =========================================
// SISTEMA DE ANIMAÇÕES E EFEITOS
// =========================================

/**
 * Classe para gerenciar animações e efeitos visuais
 */
class AnimationManager {
  constructor() {
    this.observedElements = [];
    this.init();
  }

  /**
   * Inicializa sistema de animações
   */
  init() {
    this.setupScrollAnimations();
    this.setupHoverEffects();
    this.setupImageOptimization();
  }

  /**
   * Configura animações de scroll
   */
  setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('section, .product-item, .hero-image');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add(CSS_CLASSES.fadeIn);
          }, index * APP_CONFIG.ANIMATION_DELAYS.CASCADE_INCREMENT);
          
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    });

    animatedElements.forEach((element) => {
      observer.observe(element);
    });
  }

  /**
   * Configura efeitos de hover
   */
  setupHoverEffects() {
    const productItems = document.querySelectorAll(SELECTORS.productItems);
    
    productItems.forEach((item) => {
      item.addEventListener('mouseenter', () => {
        this.animateProductItem(item, 'enter');
      });
      
      item.addEventListener('mouseleave', () => {
        this.animateProductItem(item, 'leave');
      });
    });
  }

  /**
   * Anima item de produto
   * @param {HTMLElement} item - Item do produto
   * @param {string} direction - Direção da animação
   */
  animateProductItem(item, direction) {
    const image = item.querySelector('img');
    if (!image) return;

    if (direction === 'enter') {
      image.style.transform = 'scale(1.05)';
      item.style.transform = 'translateY(-4px)';
    } else {
      image.style.transform = 'scale(1)';
      item.style.transform = 'translateY(0)';
    }
  }

  /**
   * Configura otimização de imagens
   */
  setupImageOptimization() {
    const images = document.querySelectorAll('img');
    
    // Lazy loading para imagens
    if ('loading' in HTMLImageElement.prototype) {
      images.forEach((img) => {
        img.loading = 'lazy';
      });
    } else {
      // Polyfill para browsers antigos
      this.setupIntersectionObserverForImages();
    }
  }

  /**
   * Polyfill para lazy loading em browsers antigos
   */
  setupIntersectionObserverForImages() {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

// =========================================
// SISTEMA DE PERFORMANCE
// =========================================

/**
 * Classe para otimizações de performance
 */
class PerformanceManager {
  constructor() {
    this.metrics = {};
    this.init();
  }

  /**
   * Inicializa monitoramento de performance
   */
  init() {
    this.measurePageLoad();
    this.setupResourceHints();
    this.monitorWebVitals();
  }

  /**
   * Mede tempo de carregamento da página
   */
  measurePageLoad() {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
        console.log(`Page loaded in ${this.metrics.loadTime}ms`);
      }
    });
  }

  /**
   * Configura resource hints para otimização
   */
  setupResourceHints() {
    // Preload critical resources
    const criticalImages = [
      '/images/hero-image.jpg',
      '/images/logo.png',
    ];

    criticalImages.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  /**
   * Monitora Web Vitals
   */
  monitorWebVitals() {
    // Simplified Web Vitals monitoring
    if ('PerformanceObserver' in window) {
      // Monitor Largest Contentful Paint (LCP)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor First Input Delay (FID)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
        });
      }).observe({ entryTypes: ['first-input'] });
    }
  }

  /**
   * Relatório de métricas
   */
  getMetrics() {
    return this.metrics;
  }
}

// =========================================
// SISTEMA PRINCIPAL DA APLICAÇÃO
// =========================================

/**
 * Classe principal da aplicação
 */
class PadariaApp {
  constructor() {
    this.modules = {};
    this.isInitialized = false;
  }

  /**
   * Inicializa toda a aplicação
   */
  async init() {
    try {
      console.log('🍞 Inicializando Padaria Pão Dourado App...');
      
      // Inicializa módulos principais
      this.modules.navigation = new NavigationManager();
      this.modules.backToTop = new BackToTopButton();
      this.modules.forms = new FormManager();
      this.modules.animations = new AnimationManager();
      this.modules.performance = new PerformanceManager();
      
      // Configura service worker se disponível
      await this.setupServiceWorker();
      
      // Configura theme switcher
      this.setupThemeManager();
      
      // Marca como inicializado
      this.isInitialized = true;
      
      console.log('✅ Padaria App inicializada com sucesso!');
      
      // Dispatch evento customizado
      window.dispatchEvent(new CustomEvent('padariaAppReady', {
        detail: { app: this }
      }));
      
    } catch (error) {
      Utils.logError('App Initialization', error);
      console.error('❌ Erro na inicialização da aplicação:', error);
    }
  }

  /**
   * Configura Service Worker para PWA
   */
  async setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registrado:', registration);
      } catch (error) {
        console.log('Service Worker não pôde ser registrado:', error);
      }
    }
  }

  /**
   * Configura gerenciador de tema
   */
  setupThemeManager() {
    // Detecta preferência do usuário
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Aplica tema inicial
    this.setTheme(prefersDark.matches ? 'dark' : 'light');
    
    // Escuta mudanças na preferência
    prefersDark.addEventListener('change', (e) => {
      this.setTheme(e.matches ? 'dark' : 'light');
    });
  }

  /**
   * Define tema da aplicação
   * @param {string} theme - Tema (light, dark)
   */
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme-preference', theme);
  }

  /**
   * Obtém instância de módulo específico
   * @param {string} moduleName - Nome do módulo
   * @returns {Object} - Instância do módulo
   */
  getModule(moduleName) {
    return this.modules[moduleName];
  }

  /**
   * Verifica se app está inicializada
   * @returns {boolean} - Status de inicialização
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Limpa recursos quando necessário
   */
  destroy() {
    Object.values(this.modules).forEach((module) => {
      if (module.destroy && typeof module.destroy === 'function') {
        module.destroy();
      }
    });
    
    this.modules = {};
    this.isInitialized = false;
  }
}

// =========================================
// INICIALIZAÇÃO
// =========================================

/**
 * Função principal de inicialização
 */
const initApp = () => {
  // Verifica se DOM está pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
    return;
  }

  // Cria e inicializa aplicação
  window.PadariaApp = new PadariaApp();
  window.PadariaApp.init();
};

// Auto-inicialização
initApp();

// =========================================
// EXPORTS E API PÚBLICA
// =========================================

// Expõe utilitários globalmente para uso externo
window.PadariaUtils = Utils;

// Event listeners para casos especiais
window.addEventListener('error', (event) => {
  Utils.logError('Global Error', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  Utils.logError('Unhandled Promise Rejection', event.reason);
});

// Previne zoom em inputs em dispositivos iOS
document.addEventListener('touchstart', () => {
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (viewportMeta) {
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  }
});
