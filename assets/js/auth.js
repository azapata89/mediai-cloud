/**
 * MediAI Cloud - auth.js
 * Funcionalidad para autenticación y registro
 */

// Función para simular la autenticación de usuarios
async function simulateAuthentication(email, password) {
    return new Promise((resolve, reject) => {
        // Simular retraso de red
        setTimeout(async () => {
            try {
                // Obtener usuarios de prueba del archivo JSON
                const response = await fetch('/data/users.json');
                const users = await response.json();
                
                // Buscar usuario por email
                const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
                
                // Verificar si el usuario existe y la contraseña coincide
                if (user && user.password === password) {
                    // Simular token JWT
                    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
                                 btoa(JSON.stringify({ userId: user.id, role: user.role })) + 
                                 '.simulatedSignature';
                    
                    // Omitir información sensible como la contraseña
                    const { password: _, ...userData } = user;
                    
                    resolve({
                        success: true,
                        token,
                        user: userData
                    });
                } else {
                    reject({
                        success: false,
                        message: 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.'
                    });
                }
            } catch (error) {
                console.error('Error en autenticación:', error);
                reject({
                    success: false,
                    message: 'Error en el servidor. Por favor, intenta de nuevo más tarde.'
                });
            }
        }, 800); // Simular latencia de red
    });
}

// Función para simular el registro de usuarios
async function simulateRegistration(userData) {
    return new Promise((resolve, reject) => {
        // Simular retraso de red
        setTimeout(async () => {
            try {
                // Obtener usuarios existentes
                const response = await fetch('/data/users.json');
                const users = await response.json();
                
                // Verificar si el email ya está en uso
                const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
                
                if (existingUser) {
                    reject({
                        success: false,
                        message: 'Este correo electrónico ya está registrado. Por favor, use otro o inicie sesión.'
                    });
                    return;
                }
                
                // Simulamos un ID para el nuevo usuario
                const newUser = {
                    ...userData,
                    id: `user_${Date.now()}`
                };
                
                // En una implementación real, aquí se guardaría el usuario en la base de datos
                
                // Simular token JWT
                const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + 
                             btoa(JSON.stringify({ userId: newUser.id, role: newUser.role })) + 
                             '.simulatedSignature';
                
                // Omitir información sensible como la contraseña
                const { password: _, ...newUserData } = newUser;
                
                resolve({
                    success: true,
                    token,
                    user: newUserData
                });
            } catch (error) {
                console.error('Error en registro:', error);
                reject({
                    success: false,
                    message: 'Error en el servidor. Por favor, intenta de nuevo más tarde.'
                });
            }
        }, 1000); // Simular latencia de red
    });
}

// Inicializar el formulario de inicio de sesión
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitButton = loginForm.querySelector('button[type="submit"]');
        
        // Validación básica del formulario
        if (!email || !password) {
            MediAI.Notifications.error('Por favor completa todos los campos.');
            return;
        }
        
        // Desactivar botón durante la autenticación
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Iniciando sesión...';
        
        try {
            // Intentar autenticar al usuario
            const result = await simulateAuthentication(email, password);
            
            // Guardar token y datos del usuario
            MediAI.Utils.storeData(MediAI.CONFIG.storageKeys.authToken, result.token);
            MediAI.Utils.storeData(MediAI.CONFIG.storageKeys.userData, result.user);
            MediAI.Utils.storeData(MediAI.CONFIG.storageKeys.lastLogin, new Date().toISOString());
            
            // Mostrar mensaje de éxito
            MediAI.Notifications.success('Inicio de sesión exitoso. Redirigiendo...');
            
            // Redirigir según el rol
            setTimeout(() => {
                if (result.user.role === 'doctor') {
                    window.location.href = '../dashboard/doctor.html';
                } else {
                    window.location.href = '../views/dashboard/patient.html';
                }
            }, 1000);
        } catch (error) {
            // Mostrar mensaje de error
            MediAI.Notifications.error(error.message || 'Error al iniciar sesión. Inténtalo de nuevo.');
            
            // Reactivar botón
            submitButton.disabled = false;
            submitButton.innerHTML = 'Iniciar sesión';
        }
    });
    
    // Funcionalidad para mostrar/ocultar contraseña
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Cambiar el ícono
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }
}

// Inicializar el formulario de registro
function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;
    
    // Mostrar/ocultar campos específicos según el tipo de usuario
    const userTypeRadios = document.querySelectorAll('input[name="userType"]');
    const specialtyField = document.getElementById('specialtyField');
    
    if (userTypeRadios.length && specialtyField) {
        userTypeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'doctor') {
                    specialtyField.classList.remove('hidden');
                } else {
                    specialtyField.classList.add('hidden');
                }
            });
        });
    }
    
    // Manejar envío del formulario
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Recopilar datos del formulario
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        const userType = document.querySelector('input[name="userType"]:checked').value;
        const terms = document.getElementById('terms').checked;
        
        let specialty = null;
        if (userType === 'doctor') {
            specialty = document.getElementById('specialty').value;
        }
        
        const submitButton = registerForm.querySelector('button[type="submit"]');
        
        // Validación de datos
        if (!firstName || !lastName || !email || !password) {
            MediAI.Notifications.error('Por favor completa todos los campos obligatorios.');
            return;
        }
        
        if (password !== passwordConfirm) {
            MediAI.Notifications.error('Las contraseñas no coinciden.');
            return;
        }
        
        if (password.length < 8) {
            MediAI.Notifications.error('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        
        if (!terms) {
            MediAI.Notifications.error('Debes aceptar los términos de servicio y políticas de privacidad.');
            return;
        }
        
        // Desactivar botón durante el registro
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Creando cuenta...';
        
        try {
            // Preparar datos del usuario
            const userData = {
                firstName,
                lastName,
                email,
                password, // En una implementación real se haría hash de la contraseña
                role: userType,
                createdAt: new Date().toISOString()
            };
            
            // Agregar datos específicos según el tipo de usuario
            if (userType === 'doctor' && specialty) {
                userData.specialty = specialty;
            }
            
            // Intentar registrar al usuario
            const result = await simulateRegistration(userData);
            
            // Guardar token y datos del usuario
            MediAI.Utils.storeData(MediAI.CONFIG.storageKeys.authToken, result.token);
            MediAI.Utils.storeData(MediAI.CONFIG.storageKeys.userData, result.user);
            MediAI.Utils.storeData(MediAI.CONFIG.storageKeys.lastLogin, new Date().toISOString());
            
            // Mostrar mensaje de éxito
            MediAI.Notifications.success('¡Cuenta creada con éxito! Redirigiendo...');
            
            // Redirigir según el rol
            setTimeout(() => {
                if (result.user.role === 'doctor') {
                    window.location.href = '../dashboard/doctor.html';
                } else {
                    window.location.href = '../views/dashboard/patient.html';
                }
            }, 1500);
        } catch (error) {
            // Mostrar mensaje de error
            MediAI.Notifications.error(error.message || 'Error al crear la cuenta. Inténtalo de nuevo.');
            
            // Reactivar botón
            submitButton.disabled = false;
            submitButton.innerHTML = 'Crear cuenta';
        }
    });
    
    // Funcionalidad para mostrar/ocultar contraseña
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Cambiar el ícono
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }
}

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    initLoginForm();
    initRegisterForm();
    
    // Si el usuario ya está autenticado y está en una página de auth, redirigir
    const isAuthPage = window.location.pathname.includes('/auth/');
    if (isAuthPage && MediAI.Auth.isAuthenticated()) {
        const user = MediAI.Auth.getCurrentUser();
        if (user) {
            if (user.role === 'doctor') {
                window.location.href = '../dashboard/doctor.html';
            } else {
                window.location.href = '../views/dashboard/patient.html';
            }
        }
    }
});