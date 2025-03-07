/**
 * MediAI Cloud - documents.js
 * Funcionalidad para la gestión de documentos médicos
 */

// Función para cargar documentos desde el servidor
async function loadDocuments() {
    try {
        const response = await fetch('/data/documents.json');
        if (!response.ok) {
            throw new Error('Error al cargar documentos');
        }
        
        const documents = await response.json();
        return documents;
    } catch (error) {
        console.error('Error cargando documentos:', error);
        MediAI.Notifications.error('No se pudieron cargar los documentos. Por favor, intenta de nuevo más tarde.');
        return [];
    }
}

// Función para filtrar documentos por parámetros
function filterDocuments(documents, filters = {}) {
    return documents.filter(doc => {
        // Filtrar por tipo de documento
        if (filters.type && filters.type !== 'all' && doc.type !== filters.type) {
            return false;
        }
        
        // Filtrar por texto de búsqueda
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const titleMatch = doc.title.toLowerCase().includes(searchLower);
            const descMatch = doc.description && doc.description.toLowerCase().includes(searchLower);
            const tagsMatch = doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchLower));
            
            if (!titleMatch && !descMatch && !tagsMatch) {
                return false;
            }
        }
        
        // Filtrar por fecha
        if (filters.dateFrom) {
            const docDate = new Date(doc.documentDate || doc.createdAt);
            const fromDate = new Date(filters.dateFrom);
            if (docDate < fromDate) {
                return false;
            }
        }
        
        if (filters.dateTo) {
            const docDate = new Date(doc.documentDate || doc.createdAt);
            const toDate = new Date(filters.dateTo);
            if (docDate > toDate) {
                return false;
            }
        }
        
        // Filtrar por institución
        if (filters.institution && doc.institution !== filters.institution) {
            return false;
        }
        
        // Filtrar por especialidad
        if (filters.specialty && doc.specialty !== filters.specialty) {
            return false;
        }
        
        // Filtrar por médico
        if (filters.physician && doc.physician !== filters.physician) {
            return false;
        }
        
        return true;
    });
}

// Función para renderizar la lista de documentos
async function renderDocumentList(containerId, filters = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Mostrar estado de carga
    container.innerHTML = `
        <div class="flex justify-center items-center p-8">
            <i class="fas fa-spinner fa-spin text-medical text-2xl mr-3"></i>
            <span class="text-gray-600">Cargando documentos...</span>
        </div>
    `;
    
    try {
        // Obtener documentos
        const allDocuments = await loadDocuments();
        
        // Obtener usuario actual
        const currentUser = MediAI.Auth.getCurrentUser();
        if (!currentUser) {
            throw new Error('Usuario no autenticado');
        }
        
        // Filtrar documentos por paciente o por permisos si es médico
        let userDocuments;
        
        if (currentUser.role === 'patient') {
            userDocuments = allDocuments.filter(doc => doc.patientId === currentUser.id);
        } else if (currentUser.role === 'doctor') {
            // Para médicos, necesitamos verificar permisos
            // En una implementación real, esto se haría en el backend
            // Aquí simulamos con una llamada a los datos de permisos
            
            const permissionsResponse = await fetch('/data/permissions.json');
            const permissions = await permissionsResponse.json();
            
            // Filtrar permisos para este médico
            const doctorPermissions = permissions.filter(p => 
                p.doctorId === currentUser.id && 
                p.status === 'active' && 
                p.canView === true
            );
            
            // Obtener IDs de pacientes a los que tiene acceso
            const accessiblePatientIds = doctorPermissions.map(p => p.patientId);
            
            // Filtrar documentos a los que tiene acceso
            userDocuments = allDocuments.filter(doc => {
                // Verificar si tiene acceso al paciente
                if (!accessiblePatientIds.includes(doc.patientId)) {
                    return false;
                }
                
                // Verificar restricciones por tipo de documento
                const patientPermission = doctorPermissions.find(p => p.patientId === doc.patientId);
                if (patientPermission.documentTypes && patientPermission.documentTypes.length > 0) {
                    return patientPermission.documentTypes.includes(doc.type);
                }
                
                return true;
            });
        } else {
            // Otros roles (admin, familiar, etc.)
            userDocuments = [];
        }
        
        // Aplicar filtros adicionales
        const filteredDocuments = filterDocuments(userDocuments, filters);
        
        // Ordenar documentos (por defecto, más recientes primero)
        filteredDocuments.sort((a, b) => {
            const dateA = new Date(a.documentDate || a.createdAt);
            const dateB = new Date(b.documentDate || b.createdAt);
            return dateB - dateA;
        });
        
        // Verificar si hay documentos
        if (filteredDocuments.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-gray-400 mb-3">
                        <i class="fas fa-file-medical text-5xl"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-900 mb-1">No hay documentos</h3>
                    <p class="text-gray-500">No se encontraron documentos con los criterios seleccionados.</p>
                    <button id="clearFiltersBtn" class="mt-4 px-4 py-2 bg-medical text-white rounded-md hover:bg-medical-dark">
                        Limpiar filtros
                    </button>
                </div>
            `;
            
            // Listener para botón de limpiar filtros
            const clearFiltersBtn = document.getElementById('clearFiltersBtn');
            if (clearFiltersBtn) {
                clearFiltersBtn.addEventListener('click', () => {
                    // Limpiar filtros y volver a cargar
                    const filterInputs = document.querySelectorAll('[data-filter]');
                    filterInputs.forEach(input => {
                        if (input.type === 'checkbox') {
                            input.checked = false;
                        } else if (input.tagName === 'SELECT') {
                            input.value = '';
                        } else {
                            input.value = '';
                        }
                    });
                    
                    // Recargar documentos sin filtros
                    renderDocumentList(containerId, {});
                });
            }
            
            return;
        }
        
        // Limpiar contenedor
        container.innerHTML = '';
        
        // Función para obtener ícono según tipo de documento
        function getDocumentIcon(type) {
            switch (type) {
                case 'lab':
                    return '<i class="fas fa-vial"></i>';
                case 'imaging':
                    return '<i class="fas fa-file-image"></i>';
                case 'report':
                    return '<i class="fas fa-file-alt"></i>';
                case 'prescription':
                    return '<i class="fas fa-file-prescription"></i>';
                default:
                    return '<i class="fas fa-file-medical"></i>';
            }
        }
        
        // Función para obtener color según tipo de documento
        function getDocumentColor(type) {
            switch (type) {
                case 'lab':
                    return 'bg-red-100 text-red-500';
                case 'imaging':
                    return 'bg-blue-100 text-blue-500';
                case 'report':
                    return 'bg-green-100 text-green-500';
                case 'prescription':
                    return 'bg-yellow-100 text-yellow-500';
                default:
                    return 'bg-gray-100 text-gray-500';
            }
        }
        
        // Función para obtener nombre legible del tipo de documento
        function getDocumentTypeName(type) {
            switch (type) {
                case 'lab':
                    return 'Laboratorio';
                case 'imaging':
                    return 'Imagen';
                case 'report':
                    return 'Informe';
                case 'prescription':
                    return 'Receta';
                default:
                    return 'Documento';
            }
        }
        
        // Renderizar cada documento
        filteredDocuments.forEach(doc => {
            const iconClass = getDocumentColor(doc.type);
            const typeName = getDocumentTypeName(doc.type);
            const date = new Date(doc.documentDate || doc.createdAt);
            const formattedDate = MediAI.Utils.formatDate(date, 'simple');
            
            // Crear elemento de documento
            const docElement = document.createElement('div');
            docElement.className = 'document-item bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer';
            docElement.setAttribute('data-document-id', doc.id);
            
            // Determinar si el documento tiene previsualización de imagen
            const hasPreview = doc.type === 'imaging' || doc.thumbnailPath;
            
            // Estructura HTML del documento
            docElement.innerHTML = `
                <div class="flex flex-col h-full">
                    ${hasPreview ? `
                        <div class="h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                            <img src="${doc.thumbnailPath || 'https://via.placeholder.com/400x300?text=Imagen+médica'}" 
                                 alt="${doc.title}" class="h-full w-full object-cover">
                        </div>
                    ` : ''}
                    <div class="p-4 flex-1 flex flex-col">
                        <div class="flex items-start justify-between">
                            <div class="flex items-center">
                                <div class="w-10 h-10 rounded-md ${iconClass} flex items-center justify-center">
                                    ${getDocumentIcon(doc.type)}
                                </div>
                                <div class="ml-3">
                                    <h3 class="text-sm font-medium text-gray-900 truncate-2">${doc.title}</h3>
                                    <p class="text-xs text-gray-500 mt-0.5">${doc.institution}</p>
                                </div>
                            </div>
                            <span class="text-xs px-2 py-1 rounded-full ${iconClass.replace('bg-', 'bg-opacity-20 bg-')}">
                                ${typeName}
                            </span>
                        </div>
                        ${doc.description ? `
                            <p class="mt-2 text-xs text-gray-600 truncate-2">${doc.description}</p>
                        ` : ''}
                        <div class="mt-auto pt-3 flex justify-between items-center text-xs text-gray-500">
                            <span>${formattedDate}</span>
                            <div class="flex space-x-2">
                                ${doc.annotations && doc.annotations.length > 0 ? `
                                    <span title="${doc.annotations.length} anotaciones">
                                        <i class="fas fa-comment-medical"></i> ${doc.annotations.length}
                                    </span>
                                ` : ''}
                                ${doc.physician ? `
                                    <span title="Dr. ${doc.physician.replace('d_', '')}">
                                        <i class="fas fa-user-md"></i>
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Añadir evento de clic para ver detalles
            docElement.addEventListener('click', () => {
                viewDocument(doc.id);
            });
            
            container.appendChild(docElement);
        });
        
    } catch (error) {
        console.error('Error al renderizar documentos:', error);
        container.innerHTML = `
            <div class="text-center py-8">
                <div class="text-red-400 mb-3">
                    <i class="fas fa-exclamation-circle text-5xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-1">Error al cargar documentos</h3>
                <p class="text-gray-500">No se pudieron cargar los documentos. Por favor, intenta de nuevo.</p>
                <button id="retryBtn" class="mt-4 px-4 py-2 bg-medical text-white rounded-md hover:bg-medical-dark">
                    Reintentar
                </button>
            </div>
        `;
        
        // Listener para botón de reintentar
        const retryBtn = document.getElementById('retryBtn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                renderDocumentList(containerId, filters);
            });
        }
    }
}

// Función para ver un documento específico
async function viewDocument(documentId) {
    console.log('Ver documento:', documentId);
    
    try {
        // Cargar documentos
        const documents = await loadDocuments();
        
        // Buscar el documento específico
        const document = documents.find(doc => doc.id === documentId);
        
        if (!document) {
            throw new Error('Documento no encontrado');
        }
        
        // En una implementación real, aquí redigiríamos a la página del visor de documentos
        // o abriríamos un modal con el contenido
        window.location.href = `/views/documents/view.html?id=${documentId}`;
        
    } catch (error) {
        console.error('Error al ver documento:', error);
        MediAI.Notifications.error('No se pudo cargar el documento. Por favor, intenta de nuevo más tarde.');
    }
}

// Función para renderizar los detalles de un documento en el visor
async function renderDocumentViewer() {
    const urlParams = new URLSearchParams(window.location.search);
    const documentId = urlParams.get('id');
    
    if (!documentId) {
        MediAI.Notifications.error('ID de documento no especificado');
        return;
    }
    
    // Elementos del visor
    const documentTitle = document.querySelector('h1');
    const documentMetadata = document.querySelector('.text-gray-600');
    const pdfViewer = document.getElementById('pdfViewer');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    
    if (!documentTitle || !documentMetadata || !pdfViewer) return;
    
    try {
        // Cargar documentos
        const documents = await loadDocuments();
        
        // Buscar el documento específico
        const document = documents.find(doc => doc.id === documentId);
        
        if (!document) {
            throw new Error('Documento no encontrado');
        }
        
        // Actualizar título y metadatos
        documentTitle.textContent = document.title;
        
        // Formatear fecha
        const date = new Date(document.documentDate || document.createdAt);
        const formattedDate = MediAI.Utils.formatDate(date, 'simple');
        
        // Buscar nombre del médico (en una implementación real, esto se haría en el backend)
        let physicianName = '';
        if (document.physician) {
            try {
                const usersResponse = await fetch('/data/users.json');
                const users = await usersResponse.json();
                const physician = users.find(u => u.id === document.physician);
                if (physician) {
                    physicianName = `${physician.role === 'doctor' ? 'Dr' + (physician.gender === 'F' ? 'a' : '') + '. ' : ''}${physician.firstName} ${physician.lastName}`;
                }
            } catch (error) {
                console.error('Error al cargar información del médico:', error);
                physicianName = document.physician;
            }
        }
        
        documentMetadata.textContent = `${document.institution} | ${physicianName || 'No especificado'} | ${formattedDate}`;
        
        // Actualizar visor según el tipo de documento
        if (document.type === 'imaging') {
            // Imagen médica (DICOM o similar)
            pdfViewer.innerHTML = `<img src="${document.thumbnailPath || 'https://via.placeholder.com/800x1200?text=Imagen+médica'}" alt="${document.title}" class="max-w-full h-auto">`;
            
            // Actualizar contador de páginas
            if (currentPageSpan && totalPagesSpan) {
                // Para imágenes, simulamos "cortes" o "vistas"
                currentPageSpan.textContent = '1';
                totalPagesSpan.textContent = document.metadata && document.metadata.slices ? document.metadata.slices : '1';
            }
            
        } else if (document.type === 'lab' || document.type === 'report' || document.type === 'prescription') {
            // Documentos tipo PDF
            // En una implementación real, usaríamos PDF.js para renderizar el PDF
            pdfViewer.innerHTML = `<img src="https://via.placeholder.com/800x1200?text=${document.title}" alt="${document.title}" class="max-w-full h-auto">`;
            
            // Actualizar contador de páginas
            if (currentPageSpan && totalPagesSpan) {
                currentPageSpan.textContent = '1';
                totalPagesSpan.textContent = '5'; // Simulamos 5 páginas para documentos tipo PDF
            }
        } else {
            // Otros tipos de documentos
            pdfViewer.innerHTML = `<div class="flex items-center justify-center h-full bg-gray-200 text-gray-500">No hay visualizador disponible para este tipo de documento</div>`;
            
            // Actualizar contador de páginas
            if (currentPageSpan && totalPagesSpan) {
                currentPageSpan.textContent = '0';
                totalPagesSpan.textContent = '0';
            }
        }
        
        // Cargar miniaturas relacionadas
        await loadRelatedDocuments(document);
        
    } catch (error) {
        console.error('Error al renderizar visor de documentos:', error);
        
        if (pdfViewer) {
            pdfViewer.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full bg-gray-200 text-gray-500 p-6">
                    <i class="fas fa-exclamation-circle text-red-500 text-4xl mb-3"></i>
                    <p class="text-lg font-medium text-gray-700">Error al cargar el documento</p>
                    <p class="text-sm text-gray-600 mt-1">No se pudo cargar el documento solicitado. Por favor, intenta de nuevo más tarde.</p>
                    <button id="backToDocuments" class="mt-4 px-4 py-2 bg-medical text-white rounded-md hover:bg-medical-dark">
                        Volver a documentos
                    </button>
                </div>
            `;
            
            const backButton = document.getElementById('backToDocuments');
            if (backButton) {
                backButton.addEventListener('click', () => {
                    window.history.back();
                });
            }
        }
    }
}

// Función para cargar documentos relacionados
async function loadRelatedDocuments(currentDocument) {
    const thumbnailsContainer = document.querySelector('.space-y-2');
    if (!thumbnailsContainer) return;
    
    try {
        // Cargar documentos
        const documents = await loadDocuments();
        
        // Filtrar documentos del mismo paciente y tipo similar
        const relatedDocuments = documents.filter(doc => 
            doc.patientId === currentDocument.patientId && 
            doc.id !== currentDocument.id &&
            (doc.type === currentDocument.type || 
             (currentDocument.type === 'lab' && doc.type === 'report') ||
             (currentDocument.type === 'report' && doc.type === 'lab') ||
             (currentDocument.type === 'imaging' && doc.type === 'report'))
        );
        
        // Ordenar por fecha (más recientes primero)
        relatedDocuments.sort((a, b) => {
            const dateA = new Date(a.documentDate || a.createdAt);
            const dateB = new Date(b.documentDate || b.createdAt);
            return dateB - dateA;
        });
        
        // Obtener los 5 más recientes
        const recentRelated = relatedDocuments.slice(0, 5);
        
        // Función para obtener ícono según tipo de documento
        function getDocumentIcon(type) {
            switch (type) {
                case 'lab':
                    return 'fa-vial';
                case 'imaging':
                    return 'fa-file-image';
                case 'report':
                    return 'fa-file-alt';
                case 'prescription':
                    return 'fa-file-prescription';
                default:
                    return 'fa-file-medical';
            }
        }
        
        // Función para obtener color según tipo de documento
        function getDocumentColor(type) {
            switch (type) {
                case 'lab':
                    return 'bg-red-100 text-red-500';
                case 'imaging':
                    return 'bg-blue-100 text-blue-500';
                case 'report':
                    return 'bg-green-100 text-green-500';
                case 'prescription':
                    return 'bg-yellow-100 text-yellow-500';
                default:
                    return 'bg-gray-100 text-gray-500';
            }
        }
        
        // Limpiar contenedor
        thumbnailsContainer.innerHTML = '';
        
        // Añadir el documento actual como activo
        const currentDocIcon = getDocumentColor(currentDocument.type);
        const currentDocIconClass = getDocumentIcon(currentDocument.type);
        const currentDate = new Date(currentDocument.documentDate || currentDocument.createdAt);
        const formattedCurrentDate = MediAI.Utils.formatDate(currentDate, 'simple');
        
        const currentDocElement = document.createElement('div');
        currentDocElement.className = 'thumbnail active flex items-center p-2 border rounded-md cursor-pointer';
        currentDocElement.innerHTML = `
            <div class="w-10 h-10 flex-shrink-0 rounded ${currentDocIcon}  flex items-center justify-center">
                <i class="fas ${currentDocIconClass}"></i>
            </div>
            <div class="ml-3 overflow-hidden">
                <p class="text-sm font-medium text-gray-900 truncate">
                    ${currentDocument.title}
                </p>
                <p class="text-xs text-gray-500 truncate">
                    ${formattedCurrentDate}
                </p>
            </div>
        `;
        thumbnailsContainer.appendChild(currentDocElement);
        
        // Añadir documentos relacionados
        recentRelated.forEach(doc => {
            const iconColor = getDocumentColor(doc.type);
            const iconClass = getDocumentIcon(doc.type);
            const date = new Date(doc.documentDate || doc.createdAt);
            const formattedDate = MediAI.Utils.formatDate(date, 'simple');
            
            const docElement = document.createElement('div');
            docElement.className = 'thumbnail flex items-center p-2 border rounded-md cursor-pointer hover:bg-gray-50';
            docElement.setAttribute('data-document-id', doc.id);
            docElement.innerHTML = `
                <div class="w-10 h-10 flex-shrink-0 rounded ${iconColor} flex items-center justify-center">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="ml-3 overflow-hidden">
                    <p class="text-sm font-medium text-gray-900 truncate">
                        ${doc.title}
                    </p>
                    <p class="text-xs text-gray-500 truncate">
                        ${formattedDate}
                    </p>
                </div>
            `;
            
            // Añadir evento de clic para cambiar de documento
            docElement.addEventListener('click', () => {
                window.location.href = `/views/documents/view.html?id=${doc.id}`;
            });
            
            thumbnailsContainer.appendChild(docElement);
        });
        
    } catch (error) {
        console.error('Error al cargar documentos relacionados:', error);
        if (thumbnailsContainer) {
            thumbnailsContainer.innerHTML = `
                <div class="p-3 text-center text-sm text-gray-500">
                    <i class="fas fa-exclamation-circle mr-1"></i>
                    Error al cargar documentos relacionados
                </div>
            `;
        }
    }
}

// Función para manejar la carga de documentos
function initDocumentUpload() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const selectedFiles = document.getElementById('selectedFiles');
    const fileList = document.getElementById('fileList');
    const uploadButton = document.getElementById('uploadButton');
    
    if (!dropzone || !fileInput) return;
    
    // Manejar clic en el dropzone
    dropzone.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Prevenir comportamiento por defecto de eventos de arrastrar y soltar
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });
    
    // Añadir clase cuando se arrastra sobre el dropzone
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
            dropzone.classList.add('dropzone-active');
        }, false);
    });
    
    // Remover clase cuando se deja de arrastrar sobre el dropzone
    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => {
            dropzone.classList.remove('dropzone-active');
        }, false);
    });
    
    // Manejar archivos soltados
    dropzone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
    
    // Manejar selección de archivos mediante el input
    fileInput.addEventListener('change', () => {
        const files = fileInput.files;
        handleFiles(files);
    });
    
    // Función para manejar archivos
    function handleFiles(files) {
        if (files.length > 0) {
            uploadButton.disabled = false;
            selectedFiles.classList.remove('hidden');
            
            // Limpiar lista previa
            fileList.innerHTML = '';
            
            // Añadir cada archivo a la lista
            Array.from(files).forEach(file => {
                const fileItem = createFileItem(file);
                fileList.appendChild(fileItem);
            });
        }
    }
    
    // Función para crear elemento de archivo
    function createFileItem(file) {
        // Crear elemento de lista
        const li = document.createElement('li');
        li.className = 'py-3 flex justify-between items-center';
        
        // Determinar tipo de ícono según la extensión
        let iconClass = 'fa-file';
        let iconColor = 'text-gray-500';
        
        if (file.name.endsWith('.pdf')) {
            iconClass = 'fa-file-pdf';
            iconColor = 'text-red-500';
        } else if (file.name.endsWith('.xml')) {
            iconClass = 'fa-file-code';
            iconColor = 'text-yellow-500';
        } else if (['.jpg', '.jpeg', '.png', '.gif', '.dcm'].some(ext => file.name.toLowerCase().endsWith(ext))) {
            iconClass = 'fa-file-image';
            iconColor = 'text-blue-500';
        } else if (['.doc', '.docx'].some(ext => file.name.toLowerCase().endsWith(ext))) {
            iconClass = 'fa-file-word';
            iconColor = 'text-blue-600';
        }
        
        // Formatear tamaño
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        
        li.innerHTML = `
            <div class="flex items-center">
                <span class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ${iconColor}">
                    <i class="fas ${iconClass}"></i>
                </span>
                <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">${file.name}</p>
                    <p class="text-sm text-gray-500">${sizeInMB} MB</p>
                </div>
            </div>
            <div>
                <button type="button" class="text-gray-400 hover:text-red-500 remove-file">
                    <i class="fas fa-times-circle"></i>
                </button>
            </div>
        `;
        
        // Añadir evento para remover archivo
        const removeButton = li.querySelector('.remove-file');
        removeButton.addEventListener('click', () => {
            li.remove();
            if (fileList.children.length === 0) {
                uploadButton.disabled = true;
                selectedFiles.classList.add('hidden');
            }
        });
        
        return li;
    }
    
    // Manejar envío de formulario
    const documentForm = document.querySelector('form');
    if (documentForm) {
        documentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Aquí iría la lógica para enviar los archivos al servidor
            // En esta implementación simulada, solo mostramos un mensaje de éxito
            
            uploadButton.disabled = true;
            uploadButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Subiendo...';
            
            setTimeout(() => {
                MediAI.Notifications.success('Documentos cargados exitosamente.');
                
                // Simular redirección a la lista de documentos
                setTimeout(() => {
                    window.location.href = '/views/documents/view.html';
                }, 1000);
            }, 2000);
        });
    }
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    MediAI.Auth.requireAuthentication();
    
    // Determinar en qué página estamos
    const path = window.location.pathname;
    
    if (path.includes('/documents/view.html')) {
        // Inicializar visor de documentos
        renderDocumentViewer();
        
        // Inicializar controles de navegación PDF
        initPDFNavigation();
    } else if (path.includes('/documents/upload.html')) {
        // Inicializar carga de documentos
        initDocumentUpload();
    } else {
        // En otras páginas, como el dashboard, podríamos tener listas de documentos
        const documentLists = document.querySelectorAll('[data-document-list]');
        documentLists.forEach(list => {
            // Obtener ID del contenedor y filtros (si existen)
            const containerId = list.id;
            const filterData = list.getAttribute('data-filters');
            
            let filters = {};
            if (filterData) {
                try {
                    filters = JSON.parse(filterData);
                } catch (error) {
                    console.error('Error parseando filtros:', error);
                }
            }
            
            // Renderizar lista de documentos
            renderDocumentList(containerId, filters);
        });
    }
});

// Función para inicializar la navegación del PDF
function initPDFNavigation() {
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    
    if (!prevPageBtn || !nextPageBtn || !currentPageSpan || !totalPagesSpan) return;
    
    // Simulación de navegación por páginas
    let currentPage = parseInt(currentPageSpan.textContent);
    const totalPages = parseInt(totalPagesSpan.textContent);
    
    function updatePageControls() {
        currentPageSpan.textContent = currentPage;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    }
    
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updatePageControls();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updatePageControls();
        }
    });
    
    // Inicializar controles de zoom
    const zoomOutBtn = document.getElementById('zoomOut');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomLevelSelect = document.getElementById('zoomLevel');
    const pdfViewer = document.getElementById('pdfViewer');
    
    if (zoomOutBtn && zoomInBtn && zoomLevelSelect && pdfViewer) {
        zoomOutBtn.addEventListener('click', () => {
            const currentIndex = zoomLevelSelect.selectedIndex;
            if (currentIndex > 0) {
                zoomLevelSelect.selectedIndex = currentIndex - 1;
                applyZoom();
            }
        });
        
        zoomInBtn.addEventListener('click', () => {
            const currentIndex = zoomLevelSelect.selectedIndex;
            if (currentIndex < zoomLevelSelect.options.length - 1) {
                zoomLevelSelect.selectedIndex = currentIndex + 1;
                applyZoom();
            }
        });
        
        zoomLevelSelect.addEventListener('change', applyZoom);
        
        function applyZoom() {
            const zoomFactor = parseFloat(zoomLevelSelect.value);
            pdfViewer.style.transform = `scale(${zoomFactor})`;
            pdfViewer.style.transformOrigin = 'top center';
        }
        
        // Inicializar botón de rotación
        const rotateBtn = document.getElementById('rotateBtn');
        if (rotateBtn) {
            let rotation = 0;
            
            rotateBtn.addEventListener('click', () => {
                rotation = (rotation + 90) % 360;
                pdfViewer.style.transform = `scale(${parseFloat(zoomLevelSelect.value)}) rotate(${rotation}deg)`;
            });
        }
        
        // Inicializar botón de pantalla completa
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const pdfContainer = document.querySelector('.pdf-container');
        
        if (fullscreenBtn && pdfContainer) {
            fullscreenBtn.addEventListener('click', () => {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                } else {
                    pdfContainer.requestFullscreen();
                    fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                }
            });
        }
    }
}