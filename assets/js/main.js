/**
 * MediAI Cloud - main.js
 * Funciones globales compartidas por todas las páginas
 */

// Configuración global
const CONFIG = {
    apiBaseUrl: 'https://api.mediaicloud.com/v1',  // Simulado - sin backend real
    storageKeys: {
        authToken: 'mediaicloud_auth_token',
        userData: 'mediaicloud_user_data',
        lastLogin: 'mediaicloud_last_login'
    },
    userRoles: {
        PATIENT: 'patient',
        DOCTOR: 'doctor',
        ADMIN: 'admin'
    }
};

// Útiles para manipulación del DOM
const DOM = {
    /**
     * Obtiene un elemento del DOM por ID
     * @param {string} id - ID del elemento
     * @returns {HTMLElement|null}
     */
    getById: (id) => document.getElementById(id),
    
    /**
     * Obtiene elementos del DOM por selector
     * @param {string} selector - Selector CSS
     * @returns {NodeList}
     */
    getAll: (selector) => document.querySelectorAll(selector),
    
    /**
     * Crea un elemento HTML
     * @param {string} tag - Etiqueta HTML
     * @param {Object} attributes - Atributos para el elemento
     * @param {string} textContent - Contenido de texto
     * @returns {HTMLElement}
     */
    createElement: (tag, attributes = {}, textContent = '') => {
        const element = document.createElement(tag);
        
        // Asignar atributos
        Object.keys(attributes).forEach(key => {
            element.setAttribute(key, attributes[key]);
        });
        
        // Asignar contenido de texto si existe
        if (textContent) {
            element.textContent = textContent;
        }
        
        return element;
    }
};

// Funciones de utilidad
const Utils = {
    /**
     * Formatea una fecha
     * @param {string|Date} date - Fecha a formatear
     * @param {string} format - Formato deseado (simple, full, time)
     * @returns {string}
     */
    formatDate: (date, format = 'simple') => {
        const dateObj = date instanceof Date ? date : new Date(date);
        
        if (isNaN(dateObj.getTime())) {
            return 'Fecha inválida';
        }
        
        const options = {
            simple: { day: '2-digit', month: 'short', year: 'numeric' },
            full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' }
        };
        
        return dateObj.toLocaleDateString('es-ES', options[format] || options.simple);
    },
    
    /**
     * Genera un ID único
     * @returns {string}
     */
    generateId: () => {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    },
    
    /**
     * Almacena datos en localStorage
     * @param {string} key - Clave
     * @param {any} value - Valor a almacenar
     */
    storeData: (key, value) => {
        try {
            const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
            localStorage.setItem(key, serializedValue);
        } catch (e) {
            console.error('Error almacenando datos:', e);
        }
    },
    
    /**
     * Recupera datos de localStorage
     * @param {string} key - Clave
     * @param {boolean} parseJson - Si debería parsearse como JSON
     * @returns {any}
     */
    retrieveData: (key, parseJson = true) => {
        try {
            const value = localStorage.getItem(key);
            
            if (!value) return null;
            
            return parseJson ? JSON.parse(value) : value;
        } catch (e) {
            console.error('Error recuperando datos:', e);
            return null;
        }
    },
    
    /**
     * Elimina datos de localStorage
     * @param {string} key - Clave
     */
    removeData: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error eliminando datos:', e);
        }
    }
};

// Funciones para notificaciones
const Notifications = {
    /**
     * Muestra una notificación
     * @param {string} message - Mensaje
     * @param {string} type - Tipo (success, error, warning, info)
     * @param {number} duration - Duración en ms
     */
    show: (message, type = 'info', duration = 5000) => {
        // Crear elemento de notificación
        const notification = DOM.createElement('div', {
            class: `notification notification-${type} flex items-center p-4 rounded-lg shadow-lg fixed top-4 right-4 max-w-md z-50`
        });
        
        // Añadir ícono según el tipo
        let icon;
        switch (type) {
            case 'success':
                icon = 'fa-check-circle';
                notification.classList.add('bg-green-100', 'text-green-800', 'border-l-4', 'border-green-500');
                break;
            case 'error':
                icon = 'fa-exclamation-circle';
                notification.classList.add('bg-red-100', 'text-red-800', 'border-l-4', 'border-red-500');
                break;
            case 'warning':
                icon = 'fa-exclamation-triangle';
                notification.classList.add('bg-yellow-100', 'text-yellow-800', 'border-l-4', 'border-yellow-500');
                break;
            default:
                icon = 'fa-info-circle';
                notification.classList.add('bg-blue-100', 'text-blue-800', 'border-l-4', 'border-blue-500');
        }
        
        // Estructura interna
        notification.innerHTML = `
            <div class="flex-shrink-0 mr-3">
                <i class="fas ${icon}"></i>
            </div>
            <div class="flex-1">
                ${message}
            </div>
            <div class="ml-3 flex-shrink-0 cursor-pointer notification-close">
                <i class="fas fa-times"></i>
            </div>
        `;
        
        // Agregar al DOM
        document.body.appendChild(notification);
        
        // Configurar botón para cerrar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-eliminar después de la duración
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    },
    
    // Métodos de conveniencia
    success: (message, duration) => Notifications.show(message, 'success', duration),
    error: (message, duration) => Notifications.show(message, 'error', duration),
    warning: (message, duration) => Notifications.show(message, 'warning', duration),
    info: (message, duration) => Notifications.show(message, 'info', duration)
};

// Verificación de autenticación
const Auth = {
    /**
     * Verifica si el usuario está autenticado
     * @returns {boolean}
     */
    isAuthenticated: () => {
        const token = Utils.retrieveData(CONFIG.storageKeys.authToken, false);
        return !!token;
    },
    
    /**
     * Obtiene los datos del usuario actual
     * @returns {Object|null}
     */
    getCurrentUser: () => {
        return Utils.retrieveData(CONFIG.storageKeys.userData);
    },
    
    /**
     * Redirige al usuario a la página de inicio de sesión si no está autenticado
     */
    requireAuthentication: () => {
        if (!Auth.isAuthenticated()) {
            window.location.href = '/views/auth/login.html';
        }
    },
    
    /**
     * Cierra la sesión del usuario
     */
    logout: () => {
        Utils.removeData(CONFIG.storageKeys.authToken);
        Utils.removeData(CONFIG.storageKeys.userData);
        window.location.href = '/views/auth/login.html';
    }
};

// Funciones para interacción con el sidebar y el menú de usuario
function initializeNavigation() {
    // Toggle para el sidebar en móvil
    const sidebarToggle = DOM.getById('sidebar-toggle');
    const sidebar = DOM.getById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
        });
        
        // Cerrar sidebar en móvil al hacer clic fuera de él
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 1024 && sidebar && !sidebar.contains(e.target) && e.target !== sidebarToggle) {
                if (!sidebar.classList.contains('hidden')) {
                    sidebar.classList.add('hidden');
                }
            }
        });
    }
    
    // Toggle para el menú de usuario
    const userMenuButton = DOM.getById('user-menu-button');
    const userMenu = DOM.getById('user-menu');
    
    if (userMenuButton && userMenu) {
        userMenuButton.addEventListener('click', () => {
            userMenu.classList.toggle('hidden');
        });
        
        // Cerrar menú de usuario al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (userMenu && !userMenuButton.contains(e.target) && !userMenu.contains(e.target)) {
                if (!userMenu.classList.contains('hidden')) {
                    userMenu.classList.add('hidden');
                }
            }
        });
    }
    
    // Listener para botón de cierre de sesión
    const logoutBtn = DOM.getById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logout();
        });
    }
}

// Cargar los datos del usuario actual en elementos de la interfaz
function loadUserData() {
    const user = Auth.getCurrentUser();
    
    if (!user) return;
    
    // Actualizar iniciales del usuario
    const userInitials = DOM.getAll('.user-initials');
    userInitials.forEach(el => {
        // Generar iniciales a partir del nombre
        const initials = user.firstName.charAt(0) + user.lastName.charAt(0);
        el.textContent = initials;
    });
    
    // Actualizar nombre del usuario
    const userNames = DOM.getAll('.user-name');
    userNames.forEach(el => {
        el.textContent = `${user.firstName} ${user.lastName}`;
    });
    
    // Actualizar rol del usuario si existe
    const userRoles = DOM.getAll('.user-role');
    userRoles.forEach(el => {
        // Formatear el rol para mostrarlo
        let roleDisplay = '';
        if (user.role === CONFIG.userRoles.PATIENT) {
            roleDisplay = 'Paciente';
        } else if (user.role === CONFIG.userRoles.DOCTOR) {
            roleDisplay = `Dr${user.gender === 'F' ? 'a' : ''}.`;
        }
        
        el.textContent = roleDisplay;
    });
}

// Inicializar asistente de IA
function initializeAIAssistant() {
    const aiAssistantBtn = DOM.getById('aiAssistantBtn');
    const aiPanel = DOM.getById('aiPanel');
    const closeAiPanel = DOM.getById('closeAiPanel');
    
    if (aiAssistantBtn && aiPanel) {
        aiAssistantBtn.addEventListener('click', () => {
            aiPanel.classList.toggle('hidden');
        });
        
        if (closeAiPanel) {
            closeAiPanel.addEventListener('click', () => {
                aiPanel.classList.add('hidden');
            });
        }
    }
}

// Inicializar componentes cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    loadUserData();
    initializeAIAssistant();
    
    // Verificar autenticación en páginas protegidas
    const isAuthPage = window.location.pathname.includes('/auth/');
    if (!isAuthPage) {
        Auth.requireAuthentication();
    }
    
    // Preguntar antes de salir si hay cambios sin guardar
    window.addEventListener('beforeunload', (e) => {
        if (window.hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = '';
            return '';
        }
    });
});

// Exportar utilidades para usar en otros scripts
window.MediAI = {
    CONFIG,
    DOM,
    Utils,
    Notifications,
    Auth
};