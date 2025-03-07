# MediAI Cloud

![MediAI Cloud](https://via.placeholder.com/800x200?text=MediAI+Cloud)

## 📋 Descripción del Proyecto

MediAI Cloud es una plataforma SaaS para la gestión y consulta de información médica que permite a pacientes y médicos recibir, almacenar, clasificar y acceder a información clínica desde diversos formatos, con un asistente de IA para interpretar y explicar los datos de salud al paciente.

Este repositorio contiene un prototipo funcional desarrollado con HTML, CSS y JavaScript, diseñado para demostrar las principales funcionalidades y la experiencia de usuario de la plataforma.

## 🎯 Público Objetivo

- **Pacientes:** Pueden almacenar y consultar su historial médico en un solo lugar.
- **Médicos y Especialistas:** Pueden acceder a la información médica de sus pacientes con autorización expresa.
- **Instituciones de Salud:** Pueden unificar y gestionar la información médica de los pacientes.

## ✨ Características Principales

- 📄 **Recepción y Gestión de Información Médica**
  - Soporte para múltiples formatos (PDF, XML, DICOM, etc.)
  - Clasificación automática de documentos
  - Almacenamiento seguro en la nube

- 🤖 **Asistente de IA para Explicación Médica**
  - Consultas en lenguaje natural
  - Explicación de términos médicos en lenguaje claro
  - Análisis y resumen de datos médicos

- 🔒 **Acceso Seguro y Controlado por el Paciente**
  - Control total sobre quién puede acceder a su información
  - Gestión de permisos para médicos y especialistas
  - Auditoría de accesos

## 🛠️ Tecnologías Utilizadas

- **Frontend:**
  - HTML5
  - CSS3 (Tailwind CSS)
  - JavaScript (Vanilla JS)
  - Font Awesome (para iconos)

- **Simulación de Backend:**
  - Datos estáticos en JSON
  - Almacenamiento local del navegador

## 📁 Estructura del Proyecto

```
mediai-cloud/
├── assets/
│   ├── css/
│   │   ├── tailwind.css        # Importar CDN de Tailwind
│   │   └── custom.css          # Estilos personalizados
│   ├── js/
│   │   ├── main.js             # Funciones globales
│   │   ├── auth.js             # Lógica de autenticación
│   │   ├── dashboard.js        # Funcionalidad del dashboard
│   │   ├── documents.js        # Manejo de documentos
│   │   ├── ai-assistant.js     # Simulación del asistente IA
│   │   └── permissions.js      # Control de acceso
│   └── img/                    # Imágenes e iconos
├── views/
│   ├── index.html              # Landing page
│   ├── auth/
│   │   ├── login.html          # Página de inicio de sesión
│   │   └── register.html       # Página de registro
│   ├── dashboard/
│   │   ├── patient.html        # Dashboard del paciente
│   │   └── doctor.html         # Dashboard del médico
│   ├── documents/
│   │   ├── upload.html         # Interfaz de carga de documentos
│   │   └── view.html           # Visualizador de documentos
│   ├── ai-assistant/
│   │   └── chat.html           # Interfaz de chat con IA
│   └── permissions/
│       └── access-control.html # Gestión de permisos
└── data/                       # Datos de muestra en JSON
    ├── users.json              # Usuarios de prueba
    ├── documents.json          # Documentos médicos de muestra
    └── conversations.json      # Conversaciones simuladas con IA
```

## ⚙️ Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/mediai-cloud.git
   cd mediai-cloud
   ```

2. **Abrir el proyecto:**
   - Puedes abrir los archivos HTML directamente en tu navegador.
   - Para una mejor experiencia, utiliza un servidor local:

   ```bash
   # Usando Python (desde la raíz del proyecto)
   python -m http.server 8000  # Python 3
   # o
   python -m SimpleHTTPServer 8000  # Python 2
   ```

   - O utiliza una extensión como "Live Server" si estás usando VS Code.

3. **Acceder a la aplicación:**
   - Abre tu navegador y navega a `http://localhost:8000` (o el puerto que hayas configurado).

## 🚀 Uso del Prototipo

### Para Pacientes:
1. Accede a la página principal y haz clic en "Iniciar Sesión" o "Registrarse".
2. Utiliza las credenciales de prueba (o crea una nueva cuenta):
   - Email: `paciente@ejemplo.com`
   - Contraseña: `password123`
3. Explora el dashboard, sube documentos médicos, consulta al asistente IA, y gestiona permisos.

### Para Médicos:
1. Accede a la página principal y haz clic en "Iniciar Sesión" o "Registrarse".
2. Selecciona "Médico" al registrarte o utiliza las credenciales de prueba:
   - Email: `doctor@ejemplo.com`
   - Contraseña: `password123`
3. Explora el dashboard médico, visualiza pacientes, accede a documentos autorizados.

## 📝 Notas sobre el Prototipo

- Este es un prototipo funcional con fines demostrativos.
- No se conecta a un backend real; utiliza datos simulados y almacenamiento local.
- Las funcionalidades del asistente IA son simuladas mediante respuestas predefinidas.
- Para una implementación completa, se requeriría un backend con Laravel, PostgreSQL y servicios de IA como se detalla en la especificación del proyecto.

## 🤝 Contribución

Si deseas contribuir a este proyecto:

1. Haz un fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Realiza tus cambios y haz commit (`git commit -m 'Agrega nueva característica'`)
4. Sube tus cambios (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo [MIT License](LICENSE).

## 📞 Contacto

Para más información sobre este proyecto, puedes contactar:
- Email: contacto@mediaicloud.com
- Sitio web: [www.mediaicloud.com](https://www.mediaicloud.com)

---

© 2025 MediAI Cloud. Todos los derechos reservados.