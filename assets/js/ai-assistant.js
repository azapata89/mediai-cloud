/**
 * MediAI Cloud - ai-assistant.js
 * Simulación del asistente de IA para la plataforma
 */

// Respuestas predefinidas para diferentes temas de salud
const AI_RESPONSES = {
    // Respuestas sobre migraña
    "migraine": {
        default: `
            Las migrañas son dolores de cabeza recurrentes que típicamente se manifiestan con dolor pulsátil en un lado de la cabeza. 
            Suelen estar acompañados por náuseas, vómitos y sensibilidad a la luz y el sonido.
            
            Según los resultados de tu resonancia magnética, no se detectaron anomalías estructurales en tu cerebro que 
            puedan estar causando tus dolores de cabeza. Esto es una buena noticia, ya que descarta condiciones más serias.
            
            El diagnóstico del Dr. Ramírez de migraña sin aura parece adecuado según tus síntomas y los resultados de las pruebas.
            
            ¿Te gustaría saber más sobre los tratamientos para la migraña o cómo manejar los episodios?
        `,
        "tratamiento": `
            Para el tratamiento de la migraña, existen dos enfoques principales:
            
            1. **Tratamiento agudo** (durante un ataque):
               - Medicamentos como Sumatriptán (que te ha recetado el Dr. Ramírez)
               - Analgésicos como ibuprofeno o naproxeno
               - Descansar en un lugar oscuro y tranquilo
               
            2. **Tratamiento preventivo** (para reducir frecuencia):
               - Suplementos como el Complejo B (que estás tomando actualmente)
               - Beta-bloqueadores
               - Anticonvulsivantes
               - Cambios en el estilo de vida
               
            Es importante seguir las indicaciones del Dr. Ramírez y tomar el Sumatriptán al inicio de los síntomas para 
            mayor efectividad. También te recomendaría llevar un diario de migrañas para identificar posibles desencadenantes.
        `,
        "desencadenantes": `
            Los desencadenantes comunes de la migraña incluyen:
            
            • Estrés y ansiedad
            • Cambios en patrones de sueño
            • Ciertos alimentos como chocolate, quesos añejos, alimentos procesados
            • Alcohol, especialmente vino tinto
            • Cafeína (tanto consumo excesivo como abstinencia)
            • Cambios hormonales (especialmente en mujeres)
            • Factores ambientales como luces brillantes, olores fuertes o cambios climáticos
            
            Llevar un diario de tus migrañas y lo que hiciste/comiste antes de cada episodio puede ayudarte a 
            identificar tus desencadenantes personales. Esto te permitirá evitarlos en la medida de lo posible.
        `
    },
    
    // Respuestas sobre colesterol
    "cholesterol": {
        default: `
            Según tus últimos resultados de laboratorio del 10 de febrero de 2025, tu colesterol total es de 215 mg/dL, 
            lo cual está ligeramente por encima del nivel recomendado de menos de 200 mg/dL.
            
            Sin embargo, es importante considerar también otros valores:
            • Tu HDL (colesterol "bueno") es 55 mg/dL, lo cual es favorable (por encima de 40 mg/dL es lo recomendado)
            • Tu LDL (colesterol "malo") es 130 mg/dL, que está en el límite recomendado
            • Tus triglicéridos están en 145 mg/dL, dentro del rango normal (menos de 150 mg/dL)
            
            ¿Te gustaría saber más sobre cómo mejorar estos valores o entender mejor lo que significan?
        `,
        "significado": `
            El colesterol es una sustancia cerosa que tu cuerpo necesita para construir células sanas. Sin embargo, tener niveles 
            altos puede aumentar el riesgo de enfermedades cardíacas. Veamos lo que significan tus valores:
            
            • **Colesterol Total (215 mg/dL)**: La suma de todos los tipos de colesterol en tu sangre. Idealmente debería ser <200 mg/dL.
            
            • **HDL (55 mg/dL)**: El colesterol "bueno" que ayuda a eliminar otros tipos de colesterol. Cuanto más alto, mejor (>40 mg/dL).
            
            • **LDL (130 mg/dL)**: El colesterol "malo" que puede acumularse en las arterias. Idealmente debería ser <130 mg/dL.
            
            • **Triglicéridos (145 mg/dL)**: Otro tipo de grasa en la sangre. Idealmente <150 mg/dL.
            
            Tu perfil muestra un riesgo cardiovascular bajo a moderado. El colesterol total está ligeramente elevado, 
            pero tu HDL es saludable, lo que es muy positivo.
        `,
        "mejora": `
            Para mejorar tus niveles de colesterol, puedes considerar estos cambios en el estilo de vida:
            
            1. **Alimentación**:
               • Aumentar consumo de fibra soluble (avena, frijoles, frutas)
               • Incluir grasas saludables (aceite de oliva, aguacate, nueces)
               • Reducir grasas saturadas (carnes grasas, lácteos enteros)
               • Eliminar grasas trans (alimentos procesados)
               
            2. **Actividad física**:
               • 30 minutos de ejercicio moderado la mayoría de días
               • Incluso caminar regularmente puede ayudar
               
            3. **Otros hábitos**:
               • Mantener un peso saludable
               • Limitar el consumo de alcohol
               • No fumar
               
            Estos cambios pueden ayudar a reducir tu colesterol total y LDL mientras mantienes o aumentas tu HDL.
            
            ¿Te gustaría una recomendación más específica sobre alguno de estos aspectos?
        `,
        "tendencia": `
            Comparando tus resultados actuales (10 febrero 2025) con los anteriores (10 enero 2025):
            
            | Valor | Ene 2025 | Feb 2025 | Cambio |
            |-------|----------|----------|--------|
            | Colesterol Total | 210 mg/dL | 215 mg/dL | ↑ 5 |
            | HDL | 52 mg/dL | 55 mg/dL | ↑ 3 |
            | LDL | 128 mg/dL | 130 mg/dL | ↑ 2 |
            | Triglicéridos | 150 mg/dL | 145 mg/dL | ↓ 5 |
            
            Observo un ligero aumento en tu colesterol total y LDL, pero también hay un aumento favorable en tu HDL 
            (colesterol "bueno") y una reducción en los triglicéridos, lo cual es positivo.
            
            El aumento en el colesterol total es pequeño y no necesariamente preocupante, especialmente considerando 
            la mejora en otros valores. Sin embargo, sería bueno vigilar la tendencia en las próximas mediciones.
        `
    },
    
    // Respuestas sobre acceso a documentos
    "access": {
        default: `
            En los últimos 30 días, 4 personas han accedido a tu información médica:
            
            1. **Dr. Juan Ramírez (Neurólogo)** - Accedió a tu historial clínico y 3 documentos más el 14 de febrero desde Medellín, Colombia
            
            2. **Dra. Carmen López (Médico General)** - Vio tu resonancia magnética cerebral el 12 de febrero
            
            3. **Dr. Juan Ramírez (Neurólogo)** - Añadió anotaciones a tu informe neurológico el 10 de febrero
            
            4. **Ana Pérez (Familiar)** - Vio tus próximas citas médicas el 8 de febrero (primer acceso)
            
            Cabe destacar que se detectó un acceso desde una ubicación inusual: el Dr. Juan Ramírez accedió a tus documentos 
            desde Medellín, Colombia el 14 de febrero, mientras que sus accesos anteriores fueron desde Bogotá.
            
            ¿Deseas revisar los detalles de algún acceso específico o gestionar los permisos?
        `,
        "ubicacion_inusual": `
            El 14 de febrero de 2025, se detectó que el Dr. Juan Ramírez accedió a tu información médica desde Medellín, Colombia, 
            mientras que sus accesos anteriores fueron siempre desde Bogotá.
            
            Este cambio de ubicación activó automáticamente una alerta de seguridad. Sin embargo, esto no necesariamente 
            significa que haya ocurrido un acceso no autorizado, ya que el Dr. Ramírez podría estar de viaje o trabajando desde otra ciudad.
            
            Tienes varias opciones:
            
            1. **Confirmar que es seguro** - Si sabes que el Dr. Ramírez está en Medellín actualmente
            2. **Reportar como sospechoso** - Esto bloqueará temporalmente el acceso y notificará al equipo de seguridad
            3. **Contactar al Dr. Ramírez** - Para verificar si efectivamente fue él quien accedió a tus documentos
            
            ¿Qué te gustaría hacer al respecto?
        `,
        "compartir_doctor": `
            Para compartir tus exámenes con un nuevo médico, puedes seguir estos pasos:
            
            1. Ve a la sección "**Permisos de Acceso**" en el menú lateral
            2. Haz clic en "**Agregar persona**"
            3. Selecciona "**Médico**" como tipo de persona
            4. Completa la información del médico (nombre, correo electrónico, especialidad)
            5. Selecciona qué tipo de acceso deseas otorgar (solo lectura o permitir anotaciones)
            6. Elige los documentos específicos que deseas compartir o selecciona "Todos los documentos"
            7. Define por cuánto tiempo deseas que tenga acceso (temporal o permanente)
            8. Haz clic en "**Enviar invitación**"
            
            El médico recibirá una notificación y podrá acceder a tus documentos una vez que acepte la invitación.
            
            ¿Te gustaría que te ayude a configurar el acceso para un médico específico ahora?
        `
    },
    
    // Respuestas sobre resonancia magnética
    "mri": {
        default: `
            Según el informe de tu resonancia magnética cerebral realizada el 10 de febrero de 2025 en la Clínica San Rafael, 
            los resultados son normales.
            
            El informe indica:
            • No se observan lesiones en el parénquima cerebral
            • Sistema ventricular de tamaño normal
            • No hay evidencia de aneurismas
            • Estructuras de la fosa posterior sin alteraciones
            
            En términos sencillos, la resonancia no muestra ninguna anomalía en tu cerebro. Todos los componentes están 
            funcionando correctamente y tienen un tamaño normal, sin signos de lesiones o problemas de circulación.
            
            Estos resultados son consistentes con el diagnóstico de migraña sin aura realizado por el Dr. Juan Ramírez, 
            ya que las migrañas no suelen mostrar cambios estructurales en las imágenes cerebrales.
            
            ¿Hay algún aspecto específico de la resonancia sobre el que te gustaría saber más?
        `,
        "tecnica": `
            Tu resonancia magnética cerebral fue realizada con un equipo de alta precisión (Siemens Magnetom Avanto 3T), 
            que es uno de los estándares más avanzados para este tipo de estudios.
            
            Se utilizaron varias secuencias de imagen:
            • T1: Para ver la anatomía cerebral en detalle
            • T2: Para detectar edema, inflamación o lesiones
            • FLAIR: Especialmente útil para ver lesiones de sustancia blanca
            • DWI (Difusión): Para detectar isquemias recientes
            • ARM (Angiografía por RM): Para examinar los vasos sanguíneos cerebrales
            
            Este conjunto completo de secuencias permite una evaluación exhaustiva de todas las estructuras cerebrales 
            y los vasos sanguíneos, lo que hace que sea muy confiable para descartar patologías.
            
            La resonancia generó 120 "cortes" o imágenes de tu cerebro desde diferentes ángulos y con diferentes técnicas, 
            lo que permitió al radiólogo examinar en detalle cada área.
        `,
        "opinion_profesional": `
            El estudio fue interpretado inicialmente por el Dr. Alberto Sánchez, Radiólogo de la Clínica San Rafael, 
            quien concluyó que la resonancia magnética se encuentra dentro de límites normales, sin evidencia de lesiones estructurales.
            
            Posteriormente, el Dr. Juan Ramírez, tu Neurólogo tratante, revisó las imágenes y el informe, y compartió la siguiente opinión:
            
            "La resonancia magnética cerebral se encuentra dentro de límites normales, sin evidencia de lesiones estructurales que expliquen 
            las cefaleas. Los síntomas son compatibles con migraña sin aura. Se recomienda seguimiento clínico y tratamiento sintomático."
            
            Esta opinión respalda el diagnóstico previamente establecido de migraña sin aura y confirma que no hay 
            hallazgos preocupantes que requieran intervenciones adicionales más allá del tratamiento que ya has iniciado.
        `
    },
    
    // Respuestas genéricas y sobre la plataforma
    "general": {
        "saludar": `
            Hola, soy el asistente de IA de MediAI Cloud. Estoy aquí para ayudarte a entender tu información médica, 
            responder preguntas sobre tu salud y ayudarte a navegar por la plataforma.
            
            Puedo ayudarte con:
            • Explicar términos médicos en lenguaje sencillo
            • Analizar tendencias en tus resultados de laboratorio
            • Resumir informes médicos
            • Responder preguntas sobre medicamentos
            • Ayudar con la gestión de permisos y acceso a tu información
            
            ¿En qué puedo asistirte hoy?
        `,
        "subir_documento": `
            Para subir un nuevo documento a MediAI Cloud, sigue estos pasos:
            
            1. Ve a "**Mis Documentos**" en el menú lateral
            2. Haz clic en "**Subir Documentos**"
            3. Arrastra y suelta tu archivo en la zona indicada o haz clic para seleccionarlo desde tu dispositivo
            4. Completa la información del documento:
               • Tipo de documento (laboratorio, imagen, informe, receta)
               • Especialidad
               • Institución o proveedor
               • Fecha del documento
               • Notas adicionales (opcional)
            5. Configura las opciones de privacidad
            6. Haz clic en "**Subir Documentos**"
            
            La plataforma soporta archivos PDF, XML, DICOM (imágenes médicas), JPG y PNG con un tamaño máximo de 10MB por archivo.
            
            ¿Necesitas ayuda para subir algún documento específico?
        `,
        "fallback": `
            Gracias por tu pregunta. Para poder darte la información más precisa, necesitaría consultar más recursos 
            o tal vez necesite más contexto sobre tu consulta.
            
            Puedo ayudarte mejor si me proporcionas más detalles o reformulas tu pregunta. También puedo ayudarte con:
            
            • Explicación de tus documentos médicos
            • Información sobre tus medicamentos
            • Gestión de permisos de acceso
            • Tendencias en tus resultados de laboratorio
            • Funcionalidades de la plataforma MediAI Cloud
            
            ¿Podrías darme más detalles sobre lo que necesitas saber?
        `
    }
};

// Palabras clave para identificar temas en las preguntas
const KEYWORDS = {
    "migraine": ["migrana", "migraña", "dolor de cabeza", "cefalea", "jaqueca", "dolor cabeza"],
    "cholesterol": ["colesterol", "trigliceridos", "triglicéridos", "hdl", "ldl", "lipidos", "lípidos", "grasa en sangre"],
    "access": ["acceso", "permiso", "compartir", "ver mis datos", "quien vio", "quién vio", "compartido", "doctor", "médico", "ubicacion inusual", "ubicación inusual"],
    "mri": ["resonancia", "magnética", "cerebral", "imagen", "cerebro", "rm", "mri", "radiografia", "radiografía", "rx", "tac", "tomografia", "tomografía"],
    "general": ["hola", "ayuda", "subir", "documento", "como", "cómo", "plataforma"]
};

// Función para identificar el tema de la pregunta
function identifyTopic(question) {
    question = question.toLowerCase();
    
    // Buscar coincidencias con palabras clave
    for (const [topic, keywords] of Object.entries(KEYWORDS)) {
        for (const keyword of keywords) {
            if (question.includes(keyword)) {
                return topic;
            }
        }
    }
    
    // Si no se encuentra un tema específico, devolver general
    return "general";
}

// Función para identificar el subtema de la pregunta
function identifySubtopic(question, topic) {
    question = question.toLowerCase();
    
    // Subtemas para migraña
    if (topic === "migraine") {
        if (question.includes("tratamiento") || question.includes("medicamento") || question.includes("tratar") || question.includes("medicina")) {
            return "tratamiento";
        }
        if (question.includes("trigger") || question.includes("desencadenante") || question.includes("causa") || question.includes("provocar") || question.includes("evitar")) {
            return "desencadenantes";
        }
    }
    
    // Subtemas para colesterol
    if (topic === "cholesterol") {
        if (question.includes("significado") || question.includes("significa") || question.includes("quiere decir") || question.includes("interpretar")) {
            return "significado";
        }
        if (question.includes("mejorar") || question.includes("bajar") || question.includes("reducir") || question.includes("dieta") || question.includes("alimento")) {
            return "mejora";
        }
        if (question.includes("tendencia") || question.includes("cambio") || question.includes("evolucion") || question.includes("evolución") || question.includes("tiempo") || question.includes("anterior")) {
            return "tendencia";
        }
    }
    
    // Subtemas para acceso
    if (topic === "access") {
        if (question.includes("ubicacion inusual") || question.includes("ubicación inusual") || question.includes("medellin") || question.includes("medellín") || question.includes("alerta") || question.includes("sospechoso")) {
            return "ubicacion_inusual";
        }
        if (question.includes("compartir") || question.includes("nuevo doctor") || question.includes("nuevo médico") || question.includes("especialista") || question.includes("dar acceso")) {
            return "compartir_doctor";
        }
    }
    
    // Subtemas para resonancia magnética
    if (topic === "mri") {
        if (question.includes("técnica") || question.includes("tecnica") || question.includes("como se hizo") || question.includes("cómo se hizo") || question.includes("máquina") || question.includes("maquina") || question.includes("equipo")) {
            return "tecnica";
        }
        if (question.includes("profesional") || question.includes("doctor") || question.includes("médico") || question.includes("opinion") || question.includes("opinión") || question.includes("dijo") || question.includes("interpretacion") || question.includes("interpretación")) {
            return "opinion_profesional";
        }
    }
    
    // Subtemas generales
    if (topic === "general") {
        if (question.includes("hola") || question.includes("buenos días") || question.includes("buenos dias") || question.includes("buenas tardes") || question.includes("buenas noches") || question.includes("saludos")) {
            return "saludar";
        }
        if (question.includes("subir") || question.includes("cargar") || question.includes("añadir") || question.includes("agregar") || question.includes("nuevo documento") || question.includes("nueva imagen")) {
            return "subir_documento";
        }
    }
    
    // Si no se identifica un subtema, devolver default
    return "default";
}

// Función principal para generar respuestas del asistente IA
function generateAIResponse(question) {
    // Primero identificamos el tema general de la pregunta
    const topic = identifyTopic(question);
    
    // Luego identificamos el subtema específico
    const subtopic = identifySubtopic(question, topic);
    
    // Obtenemos la respuesta correspondiente
    let response;
    
    try {
        // Intentar obtener la respuesta específica del subtema
        response = AI_RESPONSES[topic][subtopic];
    } catch (error) {
        // Si no existe el subtema, intentar con la respuesta default del tema
        try {
            response = AI_RESPONSES[topic]["default"];
        } catch (error) {
            // Si no existe el tema, usar respuesta genérica
            response = AI_RESPONSES["general"]["fallback"];
        }
    }
    
    // Si no se encontró una respuesta específica, usar fallback
    if (!response) {
        response = AI_RESPONSES["general"]["fallback"];
    }
    
    return response.trim();
}

// Función para formatear la respuesta como HTML para el chat
function formatAIResponseHTML(response, includeAvatar = true) {
    const avatar = includeAvatar ? `
        <div class="flex-shrink-0 w-8 h-8 rounded-full bg-medical flex items-center justify-center text-white">
            <i class="fas fa-robot"></i>
        </div>
    ` : '';
    
    return `
        <div class="flex items-start space-x-3 ai-message">
            ${avatar}
            <div class="flex-1 bg-gray-50 rounded-lg p-4 shadow-sm">
                ${response.replace(/\n/g, '<br>')}
            </div>
        </div>
    `;
}

// Función para manejar el envío de mensajes en el chat
function handleChatSubmit(e) {
    if (e) e.preventDefault();
    
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('chatMessages');
    const typingIndicator = document.getElementById('typingIndicator');
    
    if (!chatForm || !messageInput || !chatMessages) return;
    
    const message = messageInput.value.trim();
    if (!message) return;
    
    // Agregar mensaje del usuario
    const userMessage = `
        <div class="flex items-start justify-end space-x-3">
            <div class="flex-1 bg-medical-light bg-opacity-10 rounded-lg p-4 shadow-sm">
                <p class="text-gray-800">
                    ${message}
                </p>
            </div>
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-medical-light flex items-center justify-center text-white">
                <span class="font-medium">MP</span>
            </div>
        </div>
    `;
    
    chatMessages.insertAdjacentHTML('beforeend', userMessage);
    messageInput.value = '';
    
    // Mostrar indicador de escritura
    if (typingIndicator) {
        typingIndicator.classList.remove('hidden');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Simular tiempo de respuesta
    setTimeout(() => {
        // Ocultar indicador de escritura
        if (typingIndicator) {
            typingIndicator.classList.add('hidden');
        }
        
        // Generar respuesta de la IA
        const aiResponse = generateAIResponse(message);
        const formattedResponse = formatAIResponseHTML(aiResponse);
        
        chatMessages.insertAdjacentHTML('beforeend', formattedResponse);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Guardar la conversación en el historial (simulado)
        saveConversationHistory(message, aiResponse);
    }, 1500);
}

// Función para guardar el historial de conversación (simulado)
function saveConversationHistory(userMessage, aiResponse) {
    // En una implementación real, aquí se guardaría la conversación en una base de datos
    console.log('Guardando conversación:', { userMessage, aiResponse });
    
    try {
        // Intentar obtener el historial existente
        let conversations = JSON.parse(localStorage.getItem('mediaicloud_conversations') || '[]');
        
        // Añadir la nueva conversación
        conversations.push({
            id: `conv_${Date.now()}`,
            userId: MediAI.Auth.getCurrentUser()?.id || 'guest',
            userMessage,
            aiResponse,
            timestamp: new Date().toISOString()
        });
        
        // Limitar a las 50 conversaciones más recientes
        if (conversations.length > 50) {
            conversations = conversations.slice(-50);
        }
        
        // Guardar el historial actualizado
        localStorage.setItem('mediaicloud_conversations', JSON.stringify(conversations));
    } catch (error) {
        console.error('Error guardando historial de conversación:', error);
    }
}

// Función para cargar el historial de conversación (simulado)
function loadConversationHistory() {
    try {
        return JSON.parse(localStorage.getItem('mediaicloud_conversations') || '[]');
    } catch (error) {
        console.error('Error cargando historial de conversación:', error);
        return [];
    }
}

// Función para inicializar los botones de sugerencia
function initSuggestionButtons() {
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const messageInput = document.getElementById('messageInput');
            if (messageInput) {
                messageInput.value = btn.textContent.trim();
                messageInput.focus();
            }
        });
    });
}

// Función para inicializar el asistente IA flotante
function initFloatingAssistant() {
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
    
    // Determinar en qué página estamos
    const path = window.location.pathname;
    
    if (path.includes('/ai-assistant/chat.html')) {
        // Inicializar formulario de chat
        const chatForm = document.getElementById('chatForm');
        if (chatForm) {
            chatForm.addEventListener('submit', handleChatSubmit);
        }
        
        // Inicializar botones de sugerencia
        initSuggestionButtons();
        
        // Inicializar pestañas de conversación
        const conversationTabs = document.querySelectorAll('.conversation-tab');
        conversationTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                conversationTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // En una implementación real, aquí cargaríamos la conversación correspondiente
            });
        });
        
        // Inicializar botones de nueva conversación e info
        const newChatBtn = document.getElementById('newChatBtn');
        const infoBtn = document.getElementById('infoBtn');
        
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => {
                if (confirm('¿Deseas iniciar una nueva conversación? La conversación actual se guardará en tu historial.')) {
                    // En una implementación real, aquí guardaríamos la conversación actual y crearíamos una nueva
                    const chatMessages = document.getElementById('chatMessages');
                    if (chatMessages) {
                        // Limpiar todos los mensajes excepto el de bienvenida inicial
                        const welcomeMessage = chatMessages.querySelector('.ai-message');
                        chatMessages.innerHTML = '';
                        if (welcomeMessage) {
                            chatMessages.appendChild(welcomeMessage);
                        }
                    }
                }
            });
        }
        
        if (infoBtn) {
            infoBtn.addEventListener('click', () => {
                alert('El Asistente IA de MediAI Cloud analiza tu historial médico para ofrecerte respuestas personalizadas y comprensibles sobre tu salud. Toda la información es confidencial y segura.');
            });
        }
    } else {
        // En otras páginas, inicializar el asistente flotante
        initFloatingAssistant();
    }
});