/**
 * @file Service Worker para Padaria Pão Dourado
 * @version 1.0
 * @description PWA Service Worker com cache strategies e sincronização offline
 */

const CACHE_NAME = 'padaria-pao-dourado-v1';
const STATIC_CACHE = 'padaria-static-v1';
const DYNAMIC_CACHE = 'padaria-dynamic-v1';

// Recursos essenciais para cache
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/main.js',
    '/manifest.json',
    '/images/hero-image.jpg',
    '/images/pao.jpg',
    '/images/doce.jpg',
    '/images/salgado.jpg',
    // Fallbacks
    '/offline.html'
];

// Estratégias de cache
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Configurações por tipo de recurso
const RESOURCE_CONFIG = {
    images: {
        strategy: CACHE_STRATEGIES.CACHE_FIRST,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
        maxEntries: 50
    },
    static: {
        strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        maxEntries: 30
    },
    api: {
        strategy: CACHE_STRATEGIES.NETWORK_FIRST,
        maxAge: 5 * 60 * 1000, // 5 minutos
        maxEntries: 20
    }
};

/**
 * Utilitários do Service Worker
 */
class SWUtils {
    /**
     * Log estruturado para Service Worker
     */
    static log(message, data = null) {
        console.log(`[SW] ${message}`, data || '');
    }

    /**
     * Determina estratégia de cache baseada na URL
     */
    static getCacheStrategy(url) {
        if (url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
            return RESOURCE_CONFIG.images;
        }

        if (url.match(/\.(css|js|woff|woff2|ttf|eot)$/i)) {
            return RESOURCE_CONFIG.static;
        }

        if (url.includes('/api/') || url.includes('contact')) {
            return RESOURCE_CONFIG.api;
        }

        return RESOURCE_CONFIG.static;
    }

    /**
     * Limpa cache expirado
     */
    static async cleanExpiredCache(cacheName, config) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        const now = Date.now();

        const expiredKeys = [];

        for (const key of keys) {
            const response = await cache.match(key);
            if (response) {
                const cachedDate = response.headers.get('sw-cached-date');
                if (cachedDate && (now - parseInt(cachedDate)) > config.maxAge) {
                    expiredKeys.push(key);
                }
            }
        }

        // Remove entradas expiradas
        await Promise.all(expiredKeys.map(key => cache.delete(key)));

        // Controla número máximo de entradas
        const remainingKeys = keys.filter(key => !expiredKeys.includes(key));
        if (remainingKeys.length > config.maxEntries) {
            const keysToRemove = remainingKeys.slice(0, remainingKeys.length - config.maxEntries);
            await Promise.all(keysToRemove.map(key => cache.delete(key)));
        }

        if (expiredKeys.length > 0) {
            this.log(`Limpeza de cache: ${expiredKeys.length} entradas expiradas removidas`);
        }
    }

    /**
     * Adiciona headers de cache à response
     */
    static addCacheHeaders(response) {
        const newHeaders = new Headers(response.headers);
        newHeaders.set('sw-cached-date', Date.now().toString());

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    }
}

/**
 * Estratégias de cache implementadas
 */
class CacheStrategies {
    /**
     * Cache First - Prioriza cache, fallback para network
     */
    static async cacheFirst(request, cacheName) {
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        try {
            const networkResponse = await fetch(request);

            if (networkResponse.ok) {
                const cache = await caches.open(cacheName);
                const responseWithHeaders = SWUtils.addCacheHeaders(networkResponse.clone());
                await cache.put(request, responseWithHeaders);
            }

            return networkResponse;
        } catch (error) {
            SWUtils.log('Cache First falhou:', error.message);
            return new Response('Recurso não disponível offline', { status: 503 });
        }
    }

    /**
     * Network First - Prioriza network, fallback para cache
     */
    static async networkFirst(request, cacheName) {
        try {
            const networkResponse = await fetch(request);

            if (networkResponse.ok) {
                const cache = await caches.open(cacheName);
                const responseWithHeaders = SWUtils.addCacheHeaders(networkResponse.clone());
                await cache.put(request, responseWithHeaders);
            }

            return networkResponse;
        } catch (error) {
            SWUtils.log('Network First - tentando cache:', error.message);

            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
                return cachedResponse;
            }

            return new Response('Recurso não disponível', { status: 503 });
        }
    }

    /**
     * Stale While Revalidate - Retorna cache imediatamente, atualiza em background
     */
    static async staleWhileRevalidate(request, cacheName) {
        const cachedResponse = await caches.match(request);

        // Busca atualizada em background
        const networkPromise = fetch(request).then(response => {
            if (response.ok) {
                const cache = caches.open(cacheName);
                cache.then(c => {
                    const responseWithHeaders = SWUtils.addCacheHeaders(response.clone());
                    c.put(request, responseWithHeaders);
                });
            }
            return response;
        }).catch(error => {
            SWUtils.log('Stale While Revalidate - network failed:', error.message);
        });

        // Retorna cache se disponível, senão espera network
        return cachedResponse || networkPromise;
    }
}

/**
 * Event Listeners do Service Worker
 */

// Instalação
self.addEventListener('install', (event) => {
    SWUtils.log('Service Worker instalando...');

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                SWUtils.log('Cache criado, adicionando recursos estáticos');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                SWUtils.log('Recursos estáticos cacheados com sucesso');
                return self.skipWaiting();
            })
            .catch(error => {
                SWUtils.log('Erro durante instalação:', error);
            })
    );
});

// Ativação
self.addEventListener('activate', (event) => {
    SWUtils.log('Service Worker ativando...');

    event.waitUntil(
        Promise.all([
            // Remove caches antigos
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (![STATIC_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
                            SWUtils.log(`Removendo cache antigo: ${cacheName}`);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),

            // Assume controle imediatamente
            self.clients.claim()
        ])
            .then(() => {
                SWUtils.log('Service Worker ativo e controlando as páginas');
            })
            .catch(error => {
                SWUtils.log('Erro durante ativação:', error);
            })
    );
});

// Intercepta requisições
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignora requisições não-GET
    if (request.method !== 'GET') {
        return;
    }

    // Ignora requisições externas (exceto fontes do Google)
    if (url.origin !== self.location.origin && !url.host.includes('fonts.g')) {
        return;
    }

    const config = SWUtils.getCacheStrategy(request.url);
    const cacheName = url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)
        ? DYNAMIC_CACHE
        : STATIC_CACHE;

    let strategyPromise;

    switch (config.strategy) {
        case CACHE_STRATEGIES.CACHE_FIRST:
            strategyPromise = CacheStrategies.cacheFirst(request, cacheName);
            break;

        case CACHE_STRATEGIES.NETWORK_FIRST:
            strategyPromise = CacheStrategies.networkFirst(request, cacheName);
            break;

        case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
        default:
            strategyPromise = CacheStrategies.staleWhileRevalidate(request, cacheName);
            break;
    }

    event.respondWith(strategyPromise);
});

// Background Sync para formulários
self.addEventListener('sync', (event) => {
    SWUtils.log('Background Sync triggered:', event.tag);

    if (event.tag === 'contact-form') {
        event.waitUntil(syncContactForm());
    }
});

/**
 * Sincroniza formulário de contato quando conexão for restaurada
 */
async function syncContactForm() {
    try {
        // Recupera dados salvos no IndexedDB (implementação simplificada)
        const pendingForms = await getPendingForms();

        for (const formData of pendingForms) {
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    await removePendingForm(formData.id);
                    SWUtils.log('Formulário sincronizado com sucesso');

                    // Notifica cliente sobre sucesso
                    self.clients.matchAll().then(clients => {
                        clients.forEach(client => {
                            client.postMessage({
                                type: 'SYNC_SUCCESS',
                                data: { formId: formData.id }
                            });
                        });
                    });
                }
            } catch (error) {
                SWUtils.log('Erro ao sincronizar formulário:', error);
            }
        }
    } catch (error) {
        SWUtils.log('Erro no Background Sync:', error);
    }
}

/**
 * Funções auxiliares para IndexedDB (implementação simplificada)
 */
async function getPendingForms() {
    // Implementação simplificada - em produção usar IndexedDB
    return [];
}

async function removePendingForm(formId) {
    // Implementação simplificada - em produção usar IndexedDB
    SWUtils.log(`Removendo formulário pendente: ${formId}`);
}

// Push notifications
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/images/icon-192.png',
        badge: '/images/icon-192.png',
        tag: 'padaria-notification',
        requireInteraction: true,
        actions: [
            {
                action: 'view',
                title: 'Ver detalhes',
                icon: '/images/icon-192.png'
            },
            {
                action: 'close',
                title: 'Fechar'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Padaria Pão Dourado', options)
    );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            self.clients.matchAll().then(clients => {
                // Foca na aba existente ou abre nova
                const client = clients.find(c => c.visibilityState === 'visible');
                if (client) {
                    return client.focus();
                }
                return self.clients.openWindow('/');
            })
        );
    }
});

// Limpeza periódica de cache
self.addEventListener('message', async (event) => {
    if (event.data?.type === 'CLEANUP_CACHE') {
        SWUtils.log('Iniciando limpeza de cache...');

        await Promise.all([
            SWUtils.cleanExpiredCache(STATIC_CACHE, RESOURCE_CONFIG.static),
            SWUtils.cleanExpiredCache(DYNAMIC_CACHE, RESOURCE_CONFIG.images)
        ]);

        event.ports[0]?.postMessage({ success: true });
    }
});

// Página offline
async function handleOfflinePage() {
    try {
        return await caches.match('/offline.html');
    } catch {
        return new Response(
            `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Padaria Pão Dourado - Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #8B4513; }
          </style>
        </head>
        <body>
          <h1>🍞 Padaria Pão Dourado</h1>
          <p>Você está offline. Verifique sua conexão com a internet.</p>
          <button onclick="window.location.reload()">Tentar novamente</button>
        </body>
      </html>
      `,
            { headers: { 'Content-Type': 'text/html' } }
        );
    }
}

SWUtils.log('Service Worker carregado e pronto!');
