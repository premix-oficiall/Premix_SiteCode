// Variáveis globais
let isLoading = false;

// Inicialização da página
document.addEventListener("DOMContentLoaded", function() {
    initializeLoginPage();
    setupFormValidation();
    setupAnimations();
});

// Função para inicializar a página de login
function initializeLoginPage() {
    // Marcar navegação ativa
    updateActiveNavigation();
    
    // Verificar role selecionado
    checkSelectedRole();
    
    // Setup dos event listeners
    setupEventListeners();
    
    // Animações de entrada
    animatePageElements();
}

// Função para verificar role selecionado
function checkSelectedRole() {
    const urlParams = new URLSearchParams(window.location.search);
    const roleFromUrl = urlParams.get('role');
    const savedRole = localStorage.getItem('premix_selected_role');
    
    const role = roleFromUrl || savedRole;
    
    if (role) {
        // Personalizar a página baseado no role
        personalizeLoginPage(role);
    }
}

// Função para personalizar a página de login baseado no role
function personalizeLoginPage(role) {
    const welcomeContent = document.querySelector('.welcome-content');
    const formHeader = document.querySelector('.form-header');
    
    if (role === 'manager') {
        // Personalizar para gestores
        if (formHeader) {
            formHeader.querySelector('h1').textContent = 'Área do Gestor';
            formHeader.querySelector('p').textContent = 'Acesse o painel de controle da sua empresa';
        }
        
        // Adicionar indicador visual
        addRoleIndicator('Gestor', 'fas fa-briefcase');
        
    } else if (role === 'intern') {
        // Personalizar para estagiários
        if (formHeader) {
            formHeader.querySelector('h1').textContent = 'Área do Estagiário';
            formHeader.querySelector('p').textContent = 'Acesse suas tarefas e acompanhe seu progresso';
        }
        
        // Adicionar indicador visual
        addRoleIndicator('Estagiário', 'fas fa-graduation-cap');
    }
}

// Função para adicionar indicador de role
function addRoleIndicator(roleText, iconClass) {
    const indicator = document.createElement('div');
    indicator.className = 'role-indicator';
    indicator.innerHTML = `
        <i class="${iconClass}"></i>
        <span>${roleText}</span>
    `;
    
    const formHeader = document.querySelector('.form-header');
    if (formHeader) {
        formHeader.appendChild(indicator);
    }
}

// Função para marcar navegação ativa
function updateActiveNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(".nav-tab");

    navLinks.forEach(link => {
        let linkPath = link.getAttribute("href");
        if (linkPath.startsWith("../")) {
            linkPath = linkPath.substring(3); 
        }
        if (currentPath.includes(linkPath)) {
            link.classList.add("active-tab");
        } else {
            link.classList.remove("active-tab");
        }
    });
}

// Função para configurar event listeners
function setupEventListeners() {
    const loginForm = document.getElementById("loginForm");
    const socialButtons = document.querySelectorAll(".btn-social");
    const forgotPasswordLink = document.querySelector(".forgot-password");
    
    // Form submission
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }
    
    // Social login buttons
    socialButtons.forEach(button => {
        button.addEventListener("click", handleSocialLogin);
    });
    
    // Forgot password
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", handleForgotPassword);
    }
    
    // Input focus effects
    const inputs = document.querySelectorAll("input");
    inputs.forEach(input => {
        input.addEventListener("focus", handleInputFocus);
        input.addEventListener("blur", handleInputBlur);
        input.addEventListener("input", handleInputChange);
    });
}

// Função para lidar com o login
async function handleLogin(e) {
    e.preventDefault();
    
    if (isLoading) return;
    
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    const remember = formData.get("remember");
    
    // Validação básica
    if (!validateLoginForm(email, password)) {
        return;
    }
    
    // Mostrar loading
    setLoadingState(true);
    
    try {
        // Simular chamada de API
        await simulateLogin(email, password, remember);
        
        // Sucesso
        showLoginSuccess();
        
        // Redirecionar após delay
        setTimeout(() => {
            // Aqui você redirecionaria para o dashboard
            alert("Login realizado com sucesso! Redirecionando para o dashboard...");
            // window.location.href = "/dashboard";
        }, 2000);
        
    } catch (error) {
        showLoginError(error.message);
    } finally {
        setLoadingState(false);
    }
}

// Função para validar formulário de login
function validateLoginForm(email, password) {
    let isValid = true;
    
    // Validar email
    if (!email || !isValidEmail(email)) {
        showFieldError("email", "Email inválido");
        isValid = false;
    } else {
        clearFieldError("email");
    }
    
    // Validar senha
    if (!password || password.length < 6) {
        showFieldError("password", "Senha deve ter pelo menos 6 caracteres");
        isValid = false;
    } else {
        clearFieldError("password");
    }
    
    return isValid;
}

// Função para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Função para simular login
function simulateLogin(email, password, remember) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simular diferentes cenários
            if (email === "demo@premix.com" && password === "demo123") {
                resolve({ success: true, user: { email, name: "Usuário Demo" } });
            } else if (email === "admin@premix.com" && password === "admin123") {
                resolve({ success: true, user: { email, name: "Administrador" } });
            } else {
                reject(new Error("Email ou senha incorretos"));
            }
        }, 1500);
    });
}

// Função para mostrar estado de loading
function setLoadingState(loading) {
    isLoading = loading;
    const loginBtn = document.querySelector(".btn-login");
    
    if (loading) {
        loginBtn.innerHTML = `
            <div class="loading-spinner"></div>
            <span>Entrando...</span>
        `;
        loginBtn.disabled = true;
        loginBtn.style.opacity = "0.7";
    } else {
        loginBtn.innerHTML = `
            <span>Entrar</span>
            <i class="fas fa-arrow-right"></i>
        `;
        loginBtn.disabled = false;
        loginBtn.style.opacity = "1";
    }
}

// Função para mostrar sucesso do login
function showLoginSuccess() {
    const loginBtn = document.querySelector(".btn-login");
    loginBtn.innerHTML = `
        <i class="fas fa-check"></i>
        <span>Sucesso!</span>
    `;
    loginBtn.style.background = "linear-gradient(135deg, #4caf50, #45a049)";
}

// Função para mostrar erro de login
function showLoginError(message) {
    // Criar ou atualizar mensagem de erro
    let errorDiv = document.querySelector(".login-error");
    
    if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.className = "login-error";
        const form = document.querySelector(".login-form");
        form.insertBefore(errorDiv, form.firstChild);
    }
    
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
    `;
    errorDiv.style.display = "flex";
    
    // Remover após 5 segundos
    setTimeout(() => {
        if (errorDiv) {
            errorDiv.style.display = "none";
        }
    }, 5000);
}

// Função para mostrar erro em campo específico
function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const fieldGroup = field.closest(".form-group");
    
    // Adicionar classe de erro
    field.classList.add("error");
    
    // Remover mensagem de erro existente
    const existingError = fieldGroup.querySelector(".error-message");
    if (existingError) {
        existingError.remove();
    }
    
    // Adicionar nova mensagem de erro
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    fieldGroup.appendChild(errorDiv);
}

// Função para limpar erro de campo
function clearFieldError(fieldName) {
    const field = document.getElementById(fieldName);
    const fieldGroup = field.closest(".form-group");
    
    field.classList.remove("error");
    
    const errorMessage = fieldGroup.querySelector(".error-message");
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Função para lidar com login social
function handleSocialLogin(e) {
    e.preventDefault();
    const provider = e.currentTarget.classList.contains("btn-google") ? "Google" : "Microsoft";
    
    // Simular login social
    alert(`Login com ${provider} será implementado em breve!`);
}

// Função para lidar com esqueci a senha
function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = prompt("Digite seu email para recuperação de senha:");
    
    if (email && isValidEmail(email)) {
        alert(`Instruções de recuperação enviadas para ${email}`);
    } else if (email) {
        alert("Email inválido. Tente novamente.");
    }
}

// Função para toggle de senha
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const toggle = field.parentNode.querySelector(".password-toggle i");
    
    if (field.type === "password") {
        field.type = "text";
        toggle.className = "fas fa-eye-slash";
    } else {
        field.type = "password";
        toggle.className = "fas fa-eye";
    }
}

// Função para lidar com foco nos inputs
function handleInputFocus(e) {
    const fieldGroup = e.target.closest(".form-group");
    fieldGroup.classList.add("focused");
    
    // Limpar erros ao focar
    clearFieldError(e.target.id);
}

// Função para lidar com blur nos inputs
function handleInputBlur(e) {
    const fieldGroup = e.target.closest(".form-group");
    fieldGroup.classList.remove("focused");
}

// Função para lidar com mudanças nos inputs
function handleInputChange(e) {
    // Limpar erros ao digitar
    if (e.target.classList.contains("error")) {
        clearFieldError(e.target.id);
    }
}

// Função para configurar validação de formulário
function setupFormValidation() {
    const inputs = document.querySelectorAll("input[required]");
    
    inputs.forEach(input => {
        input.addEventListener("invalid", function(e) {
            e.preventDefault();
            const fieldName = this.id;
            let message = "Este campo é obrigatório";
            
            if (this.type === "email") {
                message = "Digite um email válido";
            }
            
            showFieldError(fieldName, message);
        });
    });
}

// Função para configurar animações
function setupAnimations() {
    // Adicionar CSS para loading spinner
    if (!document.querySelector("#loading-spinner-styles")) {
        const style = document.createElement("style");
        style.id = "loading-spinner-styles";
        style.textContent = `
            .loading-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid rgba(0,0,0,0.3);
                border-top: 2px solid #000;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .login-error {
                display: none;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                background: rgba(244, 67, 54, 0.1);
                border: 1px solid #f44336;
                border-radius: 8px;
                color: #f44336;
                font-size: 14px;
                margin-bottom: 20px;
                animation: slideInDown 0.3s ease-out;
            }
            
            @keyframes slideInDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .form-group.focused .input-highlight {
                width: 100%;
            }
        `;
        document.head.appendChild(style);
    }
}

// Função para animar elementos da página
function animatePageElements() {
    // Animar elementos com delay escalonado
    const animatedElements = document.querySelectorAll(".feature-item, .stat, .form-group");
    
    animatedElements.forEach((element, index) => {
        element.style.opacity = "0";
        element.style.transform = "translateY(20px)";
        element.style.transition = "all 0.6s ease";
        
        setTimeout(() => {
            element.style.opacity = "1";
            element.style.transform = "translateY(0)";
        }, index * 100 + 500);
    });
}

// Função para acessar demo
function accessDemo() {
    // Preencher campos com dados de demo
    document.getElementById("email").value = "demo@premix.com";
    document.getElementById("password").value = "demo123";
    
    // Focar no botão de login
    const loginBtn = document.querySelector(".btn-login");
    loginBtn.scrollIntoView({ behavior: "smooth", block: "center" });
    
    // Destacar o botão
    loginBtn.style.animation = "pulse 1s ease-in-out 3";
    
    // Mostrar dica
    setTimeout(() => {
        alert("Dados de demonstração preenchidos! Clique em 'Entrar' para acessar.");
    }, 500);
}

// Função para detectar tema do sistema
function detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-theme');
    }
}

// Event listeners adicionais
window.addEventListener('resize', function() {
    // Ajustar layout em mudanças de orientação
    if (window.innerHeight < 600) {
        document.body.classList.add('compact-mode');
    } else {
        document.body.classList.remove('compact-mode');
    }
});

// Detectar tema do sistema na inicialização
detectSystemTheme();
