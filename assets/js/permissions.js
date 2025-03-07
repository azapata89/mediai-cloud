/**
 * MediAI Cloud - permissions.js
 * Lógica para la gestión de permisos de acceso
 */

// Función para cargar datos de permisos y accesos
async function loadPermissionData() {
    try {
        // Cargar permisos desde JSON
        const permissionsResponse = await fetch('/data/permissions.json');
        const permissionsData = await permissionsResponse.json();
        
        // Cargar datos de médicos y otros usuarios desde JSON
        const usersResponse = await fetch('/data/users.json');
        const usersData = await usersResponse.json();
        
        // Combinar datos
        return {
            permissions: permissionsData,
            users: usersData
        };
    } catch (error) {
        console.error('Error cargando datos de permisos:', error);
        MediAI.Notifications.error('No se pudieron cargar los datos de permisos. Por favor, intenta de nuevo más tarde.');
        return { permissions: [], users: [] };
    }
}

// Función para renderizar la lista de personas con acceso
async function renderAccessList() {
    const accessListContainer = document.querySelector('table tbody');
    if (!accessListContainer) return;
    
    // Mostrar indicador de carga
    accessListContainer.innerHTML = `
        <tr>
            <td colspan="6" class="px-6 py-4 text-center">
                <i class="fas fa-spinner fa-spin mr-2"></i> Cargando datos de permisos...
            </td>
        </tr>
    `;
    
    try {
        // Cargar datos
        const data = await loadPermissionData();
        const { permissions, users } = data;
        
        // Obtener usuario actual
        const currentUser = MediAI.Auth.getCurrentUser();
        if (!currentUser) return;
        
        // Filtrar permisos relevantes para el usuario actual
        const userPermissions = permissions.filter(p => 
            (currentUser.role === 'patient' && p.patientId === currentUser.id) ||
            (currentUser.role === 'doctor' && p.doctorId === currentUser.id)
        );
        
        // Si no hay permisos, mostrar mensaje
        if (userPermissions.length === 0) {
            accessListContainer.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                        No hay permisos de acceso configurados.
                    </td>
                </tr>
            `;
            return;
        }
        
        // Limpiar contenedor
        accessListContainer.innerHTML = '';
        
        // Renderizar cada permiso
        userPermissions.forEach(permission => {
            // Buscar detalles del usuario con acceso
            let accessUser;
            if (currentUser.role === 'patient') {
                accessUser = users.find(u => u.id === permission.doctorId);
            } else {
                accessUser = users.find(u => u.id === permission.patientId);
            }
            
            if (!accessUser) return; // Usuario no encontrado
            
            // Determinar iniciales para el avatar
            const initials = (accessUser.firstName.charAt(0) + accessUser.lastName.charAt(0)).toUpperCase();
            
            // Determinar clase de color para el avatar
            let avatarClass = 'bg-medical-dark';
            if (accessUser.role === 'doctor') {
                avatarClass = accessUser.specialty === 'cardiology' ? 'bg-green-700' : 'bg-medical-dark';
            } else if (accessUser.role === 'family') {
                avatarClass = 'bg-purple-600';
            }
            
            // Determinar tipo de acceso
            let accessType = 'Médico tratante';
            let accessCapabilities = 'Lectura, anotaciones';
            
            if (accessUser.role === 'doctor') {
                if (accessUser.specialty === 'general') {
                    accessType = 'Médico general';
                    accessCapabilities = 'Solo lectura';
                } else if (accessUser.specialty) {
                    accessType = `Especialista en ${accessUser.specialty}`;
                    accessCapabilities = permission.canAnnotate ? 'Lectura, anotaciones' : 'Solo lectura';
                }
            } else if (accessUser.role === 'family') {
                accessType = 'Familiar autorizado';
                accessCapabilities = 'Solo lectura';
            } else if (accessUser.role === 'caregiver') {
                accessType = 'Cuidador autorizado';
                accessCapabilities = 'Solo lectura';
            }
            
            // Determinar documentos compartidos
            let documentsShared = 'Todos';
            let percentageShared = '100% compartido';
            
            if (permission.documentTypes && permission.documentTypes.length > 0) {
                documentsShared = permission.documentTypes.map(type => {
                    switch (type) {
                        case 'lab': return 'Resultados';
                        case 'imaging': return 'Imágenes';
                        case 'reports': return 'Informes';
                        case 'prescriptions': return 'Recetas';
                        default: return type;
                    }
                }).join(', ');
                
                // Calcular porcentaje aproximado
                const totalTypes = 4; // Total de tipos posibles
                const percentage = Math.round((permission.documentTypes.length / totalTypes) * 100);
                percentageShared = `${percentage}% compartido`;
            }
            
            // Determinar vencimiento
            let expirationText = 'Permanente';
            let expirationSubtext = 'Sin fecha de expiración';
            
            if (permission.expiresAt) {
                const expiryDate = new Date(permission.expiresAt);
                const today = new Date();
                
                if (expiryDate < today) {
                    expirationText = 'Expirado';
                    expirationSubtext = MediAI.Utils.formatDate(permission.expiresAt, 'simple');
                } else {
                    expirationText = MediAI.Utils.formatDate(permission.expiresAt, 'simple');
                    expirationSubtext = permission.autoRenew ? 'Renueva automáticamente' : 'Sin renovación';
                }
            }
            
            // Determinar estado
            let statusClass = 'bg-green-100 text-green-800';
            let statusText = 'Activo';
            
            if (permission.status === 'pending') {
                statusClass = 'bg-blue-100 text-blue-800';
                statusText = 'Pendiente';
            } else if (permission.status === 'expired' || (permission.expiresAt && new Date(permission.expiresAt) < new Date())) {
                statusClass = 'bg-gray-100 text-gray-800';
                statusText = 'Expirado';
            }
            
            // Determinar botones de acción según el estado
            let actionButtons = `
                <button class="text-medical hover:text-medical-dark mr-3" data-permission-id="${permission.id}" data-action="edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-gray-400 hover:text-gray-600" data-permission-id="${permission.id}" data-action="delete">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            
            if (permission.status === 'expired' || (permission.expiresAt && new Date(permission.expiresAt) < new Date())) {
                actionButtons = `
                    <button class="text-medical hover:text-medical-dark mr-3" data-permission-id="${permission.id}" data-action="renew">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button class="text-gray-400 hover:text-gray-600" data-permission-id="${permission.id}" data-action="delete">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                `;
            }
            
            // Crear fila
            const row = document.createElement('tr');
            row.className = permission.status === 'expired' ? 'bg-gray-50' : '';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 rounded-full ${avatarClass} flex items-center justify-center text-white font-medium">
                            ${initials}
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">
                                ${accessUser.role === 'doctor' ? 'Dr' + (accessUser.gender === 'F' ? 'a' : '') + '. ' : ''}${accessUser.firstName} ${accessUser.lastName}
                            </div>
                            <div class="text-sm text-gray-500">
                                ${accessUser.role === 'doctor' ? (accessUser.specialty || 'Medicina General') + ' • ' + (accessUser.institution || 'Independiente') : 'Familiar • ' + (accessUser.relationship || 'No especificado')}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${accessType}</div>
                    <div class="text-xs text-gray-500">${accessCapabilities}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${documentsShared}</div>
                    <div class="text-xs text-gray-500">${percentageShared}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${expirationText}</div>
                    <div class="text-xs text-gray-500">${expirationSubtext}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    ${actionButtons}
                </td>
            `;
            
            accessListContainer.appendChild(row);
        });
        
        // Añadir listeners a los botones de acción
        addActionButtonListeners();
        
    } catch (error) {
        console.error('Error renderizando lista de accesos:', error);
        accessListContainer.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-red-500">
                    <i class="fas fa-exclamation-circle mr-2"></i> 
                    Error al cargar los datos. Por favor, actualiza la página.
                </td>
            </tr>
        `;
    }
}

// Función para añadir escuchadores de eventos a los botones de acción
function addActionButtonListeners() {
    // Botones de edición
    document.querySelectorAll('[data-action="edit"]').forEach(button => {
        button.addEventListener('click', () => {
            const permissionId = button.getAttribute('data-permission-id');
            openEditModal(permissionId);
        });
    });
    
    // Botones de eliminación
    document.querySelectorAll('[data-action="delete"]').forEach(button => {
        button.addEventListener('click', () => {
            const permissionId = button.getAttribute('data-permission-id');
            confirmDeletePermission(permissionId);
        });
    });
    
    // Botones de renovación
    document.querySelectorAll('[data-action="renew"]').forEach(button => {
        button.addEventListener('click', () => {
            const permissionId = button.getAttribute('data-permission-id');
            renewPermission(permissionId);
        });
    });
}

// Función para abrir el modal de edición de permiso
function openEditModal(permissionId) {
    // En una implementación real, aquí cargaríamos los datos del permiso
    console.log(`Editar permiso con ID: ${permissionId}`);
    openAddAccessModal(); // Reutilizamos el modal de añadir acceso
}

// Función para confirmar la eliminación de un permiso
function confirmDeletePermission(permissionId) {
    if (confirm('¿Estás seguro de que deseas eliminar este permiso de acceso? Esta acción no se puede deshacer.')) {
        console.log(`Eliminando permiso con ID: ${permissionId}`);
        
        // Simular éxito después de un breve retraso
        setTimeout(() => {
            MediAI.Notifications.success('Permiso eliminado correctamente.');
            renderAccessList(); // Recargar la lista
        }, 800);
    }
}

// Función para renovar un permiso expirado
function renewPermission(permissionId) {
    console.log(`Renovando permiso con ID: ${permissionId}`);
    
    // Simular proceso de renovación
    setTimeout(() => {
        MediAI.Notifications.success('Permiso renovado correctamente por 30 días.');
        renderAccessList(); // Recargar la lista
    }, 800);
}

// Función para renderizar el historial de accesos
async function renderAccessHistory() {
    const accessHistoryContainer = document.querySelector('.divide-y.divide-gray-200');
    if (!accessHistoryContainer) return;
    
    try {
        // Cargar datos de historial de accesos
        const response = await fetch('/data/access_logs.json');
        const accessLogs = await response.json();
        
        // Obtener usuario actual
        const currentUser = MediAI.Auth.getCurrentUser();
        if (!currentUser) return;
        
        // Filtrar logs relevantes para el usuario actual
        const userLogs = accessLogs.filter(log => 
            (currentUser.role === 'patient' && log.patientId === currentUser.id) ||
            (currentUser.role === 'doctor' && log.doctorId === currentUser.id)
        );
        
        // Ordenar por fecha descendente
        userLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Tomar solo los últimos 4 registros para la vista resumida
        const recentLogs = userLogs.slice(0, 4);
        
        // Limpiar contenedor
        accessHistoryContainer.innerHTML = '';
        
        // Si no hay logs, mostrar mensaje
        if (recentLogs.length === 0) {
            accessHistoryContainer.innerHTML = `
                <div class="p-4 text-center text-gray-500">
                    No hay registros de acceso recientes.
                </div>
            `;
            return;
        }
        
        // Cargar datos de usuarios
        const usersResponse = await fetch('/data/users.json');
        const users = await usersResponse.json();
        
        // Renderizar cada log
        recentLogs.forEach(log => {
            // Buscar usuario que realizó el acceso
            let accessor;
            if (currentUser.role === 'patient') {
                accessor = users.find(u => u.id === log.doctorId);
            } else {
                accessor = users.find(u => u.id === log.patientId);
            }
            
            if (!accessor) return; // Usuario no encontrado
            
            // Formatear fecha y hora
            const date = new Date(log.timestamp);
            const formattedDate = `${date.getDate()} ${['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][date.getMonth()]}, ${date.getFullYear()}`;
            const formattedTime = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            
            // Determinar ícono según el tipo de documento
            let icon = 'fa-file-medical-alt';
            if (log.documentType === 'image') {
                icon = 'fa-file-image';
            } else if (log.documentType === 'prescription') {
                icon = 'fa-file-prescription';
            } else if (log.documentType === 'appointment') {
                icon = 'fa-calendar-check';
            }
            
            // Determinar acción realizada
            let action = 'Vio';
            if (log.action === 'edit') {
                action = 'Editó';
            } else if (log.action === 'annotate') {
                action = 'Añadió anotaciones a';
            }
            
            // Determinar mensaje según el tipo de documento
            let documentDescription = 'su historial clínico';
            if (log.documentType === 'lab') {
                documentDescription = 'sus resultados de laboratorio';
            } else if (log.documentType === 'image') {
                documentDescription = `su ${log.documentName || 'imagen médica'}`;
            } else if (log.documentType === 'report') {
                documentDescription = `su ${log.documentName || 'informe médico'}`;
            } else if (log.documentType === 'prescription') {
                documentDescription = 'su prescripción médica';
            } else if (log.documentType === 'appointment') {
                documentDescription = 'sus próximas citas médicas';
            }
            
            // Añadir indicador de múltiples documentos si es el caso
            if (log.additionalDocs > 0) {
                documentDescription += ` y ${log.additionalDocs} documento${log.additionalDocs > 1 ? 's' : ''} más`;
            }
            
            // Determinar si hay un indicador especial
            let specialIndicator = '';
            if (log.status === 'unusual_location') {
                specialIndicator = `
                    <span class="ml-2 px-2 py-0.5 rounded text-xs bg-orange-100 text-orange-800">
                        <i class="fas fa-exclamation-circle mr-1"></i>
                        Ubicación inusual
                    </span>
                `;
            } else if (log.status === 'first_access') {
                specialIndicator = `
                    <span class="ml-2 px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                        Primer acceso
                    </span>
                `;
            }
            
            // Crear elemento de log
            const logElement = document.createElement('div');
            logElement.className = 'access-log p-4 hover:cursor-pointer';
            logElement.setAttribute('data-log-id', log.id);
            logElement.innerHTML = `
                <div class="sm:flex sm:justify-between sm:items-baseline">
                    <div>
                        <div class="text-sm font-medium text-gray-900 flex items-center">
                            <span>${accessor.role === 'doctor' ? 'Dr' + (accessor.gender === 'F' ? 'a' : '') + '. ' : ''}${accessor.firstName} ${accessor.lastName}${accessor.role === 'family' ? ' (Familiar)' : ''}</span>
                            ${specialIndicator}
                        </div>
                        <div class="mt-1 flex items-center text-sm text-gray-500">
                            <i class="fas ${icon} mr-1.5 text-gray-400"></i>
                            ${action} ${documentDescription}
                        </div>
                    </div>
                    <div class="mt-2 sm:mt-0 text-right">
                        <div class="text-sm text-gray-500">${formattedDate} • ${formattedTime}</div>
                        <div class="mt-1 flex items-center justify-end text-xs text-gray-500">
                            <i class="fas fa-map-marker-alt mr-1.5 text-gray-400"></i>
                            ${log.location}
                            ${log.status === 'unusual_location' ? `
                                <span class="ml-2 text-orange-600 font-medium cursor-pointer hover:underline" data-log-id="${log.id}" data-action="report">
                                    <i class="fas fa-flag mr-0.5"></i>
                                    Reportar
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            accessHistoryContainer.appendChild(logElement);
        });
        
        // Añadir listeners a los logs
        document.querySelectorAll('.access-log').forEach(log => {
            log.addEventListener('click', () => {
                const logId = log.getAttribute('data-log-id');
                viewAccessDetails(logId);
            });
        });
        
        // Añadir listeners a los botones de reportar
        document.querySelectorAll('[data-action="report"]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Evitar que se propague al log padre
                const logId = button.getAttribute('data-log-id');
                reportUnusualAccess(logId);
            });
        });
        
    } catch (error) {
        console.error('Error renderizando historial de accesos:', error);
        if (accessHistoryContainer) {
            accessHistoryContainer.innerHTML = `
                <div class="p-4 text-center text-red-500">
                    <i class="fas fa-exclamation-circle mr-2"></i> 
                    Error al cargar el historial de accesos. Por favor, actualiza la página.
                </div>
            `;
        }
    }
}

// Función para ver detalles de un acceso
function viewAccessDetails(logId) {
    console.log(`Ver detalles del acceso con ID: ${logId}`);
    
    // Aquí abriríamos un modal con detalles completos del acceso
    // También podría incluir opciones como reportar acceso sospechoso
    
    MediAI.Notifications.info('Funcionalidad de ver detalles de acceso en desarrollo.');
}

// Función para reportar un acceso inusual
function reportUnusualAccess(logId) {
    console.log(`Reportando acceso inusual con ID: ${logId}`);
    
    if (confirm('¿Deseas reportar este acceso como sospechoso? Se notificará al equipo de seguridad para su revisión.')) {
        // Simular proceso de reporte
        setTimeout(() => {
            MediAI.Notifications.success('Acceso reportado correctamente. Nuestro equipo de seguridad lo revisará a la brevedad.');
        }, 800);
    }
}

// Función para inicializar el modal de añadir acceso
function initAddAccessModal() {
    const addAccessBtn = document.getElementById('addAccessBtn');
    const addAccessModal = document.getElementById('addAccessModal');
    const closeModal = document.getElementById('closeModal');
    const cancelAddAccess = document.getElementById('cancelAddAccess');
    
    if (!addAccessBtn || !addAccessModal) return;
    
    // Abrir modal
    addAccessBtn.addEventListener('click', openAddAccessModal);
    
    // Cerrar modal
    if (closeModal) {
        closeModal.addEventListener('click', closeAddAccessModal);
    }
    
    if (cancelAddAccess) {
        cancelAddAccess.addEventListener('click', closeAddAccessModal);
    }
    
    // Cerrar modal al hacer clic fuera
    addAccessModal.addEventListener('click', (e) => {
        if (e.target === addAccessModal) {
            closeAddAccessModal();
        }
    });
    
    // Mostrar/ocultar documentos específicos
    const shareSpecific = document.getElementById('share-specific');
    const shareAll = document.getElementById('share-all');
    const specificDocs = document.getElementById('specific-docs');
    
    if (shareSpecific && shareAll && specificDocs) {
        shareSpecific.addEventListener('change', () => {
            if (shareSpecific.checked) {
                specificDocs.classList.remove('hidden');
            }
        });
        
        shareAll.addEventListener('change', () => {
            if (shareAll.checked) {
                specificDocs.classList.add('hidden');
            }
        });
    }
    
    // Mostrar/ocultar periodo de acceso
    const accessLimited = document.getElementById('access-limited');
    const accessPermanent = document.getElementById('access-permanent');
    const accessPeriod = document.getElementById('access-period');
    
    if (accessLimited && accessPermanent && accessPeriod) {
        accessLimited.addEventListener('change', () => {
            if (accessLimited.checked) {
                accessPeriod.classList.remove('hidden');
            }
        });
        
        accessPermanent.addEventListener('change', () => {
            if (accessPermanent.checked) {
                accessPeriod.classList.add('hidden');
            }
        });
    }
    
    // Inicializar selección de tipo de persona
    initPersonTypeSelection();
}

// Función para abrir el modal de añadir acceso
function openAddAccessModal() {
    const addAccessModal = document.getElementById('addAccessModal');
    if (addAccessModal) {
        addAccessModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

// Función para cerrar el modal de añadir acceso
function closeAddAccessModal() {
    const addAccessModal = document.getElementById('addAccessModal');
    if (addAccessModal) {
        addAccessModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// Función para inicializar la selección de tipo de persona
function initPersonTypeSelection() {
    const personTypeRadios = document.querySelectorAll('input[name="personType"]');
    const doctorFields = document.getElementById('doctor-fields');
    
    if (!personTypeRadios.length || !doctorFields) return;
    
    personTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            // Mostrar/ocultar campos específicos según el tipo de persona
            if (radio.value === 'doctor') {
                doctorFields.classList.remove('hidden');
            } else {
                doctorFields.classList.add('hidden');
            }
            
            // Actualizar apariencia de las opciones
            personTypeRadios.forEach(r => {
                const label = r.closest('label');
                if (label) {
                    if (r.checked) {
                        label.classList.add('bg-medical-light', 'bg-opacity-10', 'border-medical');
                    } else {
                        label.classList.remove('bg-medical-light', 'bg-opacity-10', 'border-medical');
                    }
                }
            });
        });
    });
}

// Función para inicializar el panel del asistente IA
function initAIAssistantPanel() {
    const aiAssistantBtn = document.getElementById('aiAssistantBtn');
    const aiPanel = document.getElementById('aiPanel');
    const closeAiPanel = document.getElementById('closeAiPanel');
    
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

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    MediAI.Auth.requireAuthentication();
    
    // Cargar datos
    renderAccessList();
    renderAccessHistory();
    
    // Inicializar componentes
    initAddAccessModal();
    initAIAssistantPanel();
    
    // Inicializar toggles de configuración
    document.querySelectorAll('.permission-toggle').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const settingName = e.target.id;
            const isEnabled = e.target.checked;
            
            console.log(`Configuración "${settingName}" cambiada a: ${isEnabled}`);
            
            // Mostrar notificación
            MediAI.Notifications.success(`Configuración actualizada correctamente.`);
        });
    });
});