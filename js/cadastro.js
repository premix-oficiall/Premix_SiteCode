// ================================
// Variáveis globais
// ================================
let currentStep = 1;
let isLoading = false;
let emailValido = false;
let usuarioValido = false;
let contaExistente = null;

// URL base da API
const API_BASE_URL = "https://premix-sitecode1.onrender.com";

// Inicialização da página
document.addEventListener("DOMContentLoaded", function() {
    console.log("📄 Página de cadastro carregada");
    initializePage();
    setupFormValidation();
    setupAnimations();
    addFormMasks();
});

// ================================
// Inicialização e Navegação
// ================================
function initializePage() {
    console.log("🔧 Inicializando página...");
    updateTimeline();
    updateActiveNavigation();
    setupEventListeners();
    animatePageElements();
}

function updateActiveNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(".nav-tab");

    navLinks.forEach(link => {
        let linkPath = link.getAttribute("href");
        if (linkPath.startsWith("../")) linkPath = linkPath.substring(3);
        if (currentPath.includes(linkPath)) link.classList.add("active-tab");
        else link.classList.remove("active-tab");
    });
}

function setupEventListeners() {
    console.log("🎯 Configurando event listeners...");
    
    const step1Form = document.getElementById("step1Form");
    const step2Form = document.getElementById("step2Form");
    
    if (step1Form) {
        step1Form.addEventListener("submit", function(e) {
            e.preventDefault();
            console.log("➡️ Avançando para próxima etapa...");
            nextStep(1);
        });
    }
    
    if (step2Form) {
        step2Form.addEventListener("submit", handleFinalSubmission);
    }

    // Input focus effects
    const inputs = document.querySelectorAll("input");
    inputs.forEach(input => {
        input.addEventListener("focus", handleInputFocus);
        input.addEventListener("blur", handleInputBlur);
        input.addEventListener("input", handleInputChange);
    });

    // Password strength checker
    const passwordInput = document.getElementById("senha");
    if (passwordInput) passwordInput.addEventListener("input", updatePasswordStrength);

    // Plan selection
    const planInputs = document.querySelectorAll('input[name="plano"]');
    planInputs.forEach(input => input.addEventListener("change", handlePlanSelection));
    
    // 👇 VALIDAÇÃO EM TEMPO REAL
    setupRealTimeValidation();
    
    console.log("✅ Event listeners configurados");
}

// ================================
// Verificação de Email/Usuário Existente
// ================================
async function verificarDadosExistente(tipo, valor) {
    try {
        console.log(`🔍 Verificando ${tipo}: ${valor}`);
        
        const response = await fetch(`${API_BASE_URL}/api/Gestor/verificar-${tipo}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [tipo]: valor })
        });
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        console.error(`Erro ao verificar ${tipo}:`, error);
        return { existe: false };
    }
}

// ================================
// Validação em Tempo Real
// ================================
function setupRealTimeValidation() {
    const emailInput = document.getElementById("email");
    const usuarioInput = document.getElementById("nome_chefe");
    
    if (emailInput) {
        emailInput.addEventListener("blur", async function() {
            if (this.value && isValidEmail(this.value)) {
                const resultado = await verificarDadosExistente('email', this.value);
                
                if (resultado.existe) {
                    if (resultado.gestor && !resultado.gestor.isActive) {
                        showContaExistente(resultado.gestor);
                    } else {
                        showFieldError("email", "Este email já está cadastrado");
                        emailValido = false;
                    }
                } else {
                    clearFieldError("email");
                    esconderContaExistente();
                    emailValido = true;
                }
                atualizarBotaoProximo();
            }
        });
    }
    
    if (usuarioInput) {
        usuarioInput.addEventListener("blur", async function() {
            if (this.value.trim()) {
                const resultado = await verificarDadosExistente('usuario', this.value);
                
                if (resultado.existe) {
                    showFieldError("nome_chefe", "Este nome de usuário já está em uso");
                    usuarioValido = false;
                } else {
                    clearFieldError("nome_chefe");
                    usuarioValido = true;
                }
                atualizarBotaoProximo();
            }
        });
    }
}

// ================================
// Conta Existente - Interface
// ================================
function showContaExistente(gestor) {
    contaExistente = gestor;
    
    let mensagemDiv = document.querySelector(".conta-existente");
    if (!mensagemDiv) {
        mensagemDiv = document.createElement("div");
        mensagemDiv.className = "conta-existente";
        mensagemDiv.style.background = "#e8f5e8";
        mensagemDiv.style.border = "1px solid #4caf50";
        mensagemDiv.style.borderRadius = "8px";
        mensagemDiv.style.padding = "15px";
        mensagemDiv.style.margin = "15px 0";
        mensagemDiv.style.color = "#2e7d32";
        
        const form = document.getElementById("step1Form");
        form.appendChild(mensagemDiv);
    }
    
    mensagemDiv.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
                <strong>🎯 Conta Encontrada!</strong>
                <p style="margin: 5px 0 0 0; font-size: 14px;">
                    Encontramos uma conta com este email (<strong>${gestor.email}</strong>) que ainda não foi ativada.
                </p>
            </div>
            <button type="button" id="btn-usar-conta" class="btn-continuar" 
                    style="background: #4caf50; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer;">
                Usar Esta Conta
            </button>
        </div>
    `;
    
    document.getElementById("btn-usar-conta").addEventListener("click", function() {
        usarContaExistente(gestor);
    });
    
    emailValido = true;
    atualizarBotaoProximo();
}

function esconderContaExistente() {
    contaExistente = null;
    const mensagemDiv = document.querySelector(".conta-existente");
    if (mensagemDiv) {
        mensagemDiv.remove();
    }
}

function usarContaExistente(gestor) {
    console.log("🎯 Usando conta existente:", gestor);
    
    document.getElementById("nome_chefe").value = gestor.usuario;
    document.getElementById("email").value = gestor.email;
    document.getElementById("nome_chefe").disabled = true;
    document.getElementById("email").disabled = true;
    
    const mensagemDiv = document.querySelector(".conta-existente");
    if (mensagemDiv) {
        mensagemDiv.innerHTML = `
            <div style="display: flex; align-items: center;">
                <i class="fas fa-check-circle" style="color: #4caf50; margin-right: 10px;"></i>
                <div>
                    <strong>Conta selecionada!</strong>
                    <p style="margin: 5px 0 0 0; font-size: 14px;">
                        Você está usando a conta: <strong>${gestor.usuario}</strong> (${gestor.email})
                    </p>
                </div>
            </div>
        `;
    }
    
    setTimeout(() => {
        nextStep(1);
    }, 1000);
}

function atualizarBotaoProximo() {
    const btnNext = document.querySelector(".btn-next");
    if (btnNext) {
        btnNext.disabled = !(emailValido && usuarioValido);
    }
}

// ================================
// Efeitos visuais / animações
// ================================
function handleInputFocus(event) {
    const fieldGroup = event.target.closest(".form-group");
    if (fieldGroup) fieldGroup.classList.add("focused");
}

function handleInputBlur(event) {
    const fieldGroup = event.target.closest(".form-group");
    if (fieldGroup) fieldGroup.classList.remove("focused");
}

function handleInputChange(event) {
    const input = event.target;
    const highlight = input.nextElementSibling;
    if (highlight && highlight.classList.contains("input-highlight")) {
        highlight.style.width = input.value.length > 0 ? "100%" : "0%";
    }
}

function animateStepTransition() {
    const formContainer = document.querySelector(".form-container");
    if (formContainer) {
        formContainer.classList.add("fade-out");
        setTimeout(() => {
            formContainer.classList.remove("fade-out");
            formContainer.classList.add("fade-in");
            setTimeout(() => formContainer.classList.remove("fade-in"), 300);
        }, 300);
    }
}

function setupAnimations() {}

function animatePageElements() {}

function animateSuccess() {
    const successIcon = document.querySelector(".success-icon");
    if (successIcon) successIcon.classList.add("animate__animated", "animate__bounceIn");
}

// ================================
// Controle de Etapas
// ================================
function nextStep(step) {
    if (isLoading) return;
    if (validateCurrentStep(step)) {
        console.log(`✅ Etapa ${step} validada com sucesso`);
        markStepCompleted(step);
        currentStep = step + 1;
        showStep(currentStep);
        updateTimeline();
        animateStepTransition();
    } else {
        console.log(`❌ Erro na validação da etapa ${step}`);
    }
}

function prevStep(step) {
    if (isLoading) return;
    currentStep = step - 1;
    showStep(currentStep);
    updateTimeline();
    animateStepTransition();
}

function showStep(step) {
    document.querySelectorAll(".step-content").forEach(c => c.classList.remove("active"));
    const currentStepContent = document.getElementById(`step-${step}-content`);
    if (currentStepContent) currentStepContent.classList.add("active");
}

// ================================
// Timeline
// ================================
function updateTimeline() {
    for (let i = 1; i <= 3; i++) {
        const step = document.getElementById(`step-${i}`);
        const line = document.getElementById(`line-${i}`);
        if (step) {
            step.classList.remove("active", "completed");
            if (i < currentStep) step.classList.add("completed");
            else if (i === currentStep) step.classList.add("active");
        }
        if (line) {
            line.classList.remove("active", "completed");
            if (i < currentStep) line.classList.add("completed");
            else if (i === currentStep && i < 3) line.classList.add("active");
        }
    }
}

function markStepCompleted(step) {
    const stepElement = document.getElementById(`step-${step}`);
    if (stepElement) {
        stepElement.classList.remove("active");
        stepElement.classList.add("completed");
    }
    const lineElement = document.getElementById(`line-${step}`);
    if (lineElement) lineElement.classList.add("completed");
}

// ================================
// Validação
// ================================
function validateCurrentStep(step) {
    console.log(`🔍 Validando etapa ${step}...`);
    const form = document.getElementById(`step${step}Form`);
    if (!form) {
        console.log(`❌ Formulário step${step}Form não encontrado`);
        return false;
    }
    
    const inputs = form.querySelectorAll("input[required]");
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            showFieldError(input.id, "Este campo é obrigatório");
            console.log(`❌ Campo ${input.id} está vazio`);
        } else {
            clearFieldError(input.id);
            
            if (input.type === "email" && !isValidEmail(input.value)) {
                isValid = false;
                showFieldError(input.id, "Email inválido");
                console.log(`❌ Email inválido: ${input.value}`);
            }
            
            if (input.id === "cpf" && !isValidCPF(input.value)) {
                isValid = false;
                showFieldError(input.id, "CPF inválido");
                console.log(`❌ CPF inválido: ${input.value}`);
            }
            
            if (input.id === "confirmar_senha") {
                const senhaInput = document.getElementById("senha");
                if (senhaInput && input.value !== senhaInput.value) {
                    isValid = false;
                    showFieldError(input.id, "As senhas não coincidem");
                    console.log(`❌ Senhas não coincidem`);
                }
            }
            
            if (input.id === "senha" && input.value.length < 6) {
                isValid = false;
                showFieldError(input.id, "Senha deve ter pelo menos 6 caracteres");
                console.log(`❌ Senha muito curta: ${input.value.length} caracteres`);
            }
        }
    });

    if (step === 2) {
        const selectedPlan = document.querySelector("input[name='plano']:checked");
        if (!selectedPlan) {
            isValid = false;
            showPlanError("Selecione um plano para continuar");
            console.log(`❌ Nenhum plano selecionado`);
        } else {
            clearPlanError();
            console.log(`✅ Plano selecionado: ${selectedPlan.value}`);
        }
    }
    
    console.log(`📊 Validação etapa ${step}: ${isValid ? 'APROVADA' : 'REPROVADA'}`);
    return isValid;
}

function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    if (!field) {
        console.log(`❌ Campo ${fieldName} não encontrado para mostrar erro`);
        return;
    }
    
    const fieldGroup = field.closest(".form-group");
    if (!fieldGroup) {
        console.log(`❌ FieldGroup não encontrado para ${fieldName}`);
        return;
    }
    
    field.classList.add("error");
    const existingError = fieldGroup.querySelector(".error-message");
    if (existingError) existingError.remove();
    
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    fieldGroup.appendChild(errorDiv);
    
    console.log(`⚠️ Erro mostrado para ${fieldName}: ${message}`);
}

function clearFieldError(fieldName) {
    const field = document.getElementById(fieldName);
    if (!field) {
        console.log(`⚠️ Campo ${fieldName} não encontrado`);
        return;
    }
    
    const fieldGroup = field.closest(".form-group");
    if (!fieldGroup) {
        console.log(`⚠️ FieldGroup não encontrado para ${fieldName}`);
        return;
    }
    
    field.classList.remove("error");
    const errorMessage = fieldGroup.querySelector(".error-message");
    if (errorMessage) errorMessage.remove();
    
    console.log(`✅ Erro limpo para ${fieldName}`);
}

function showPlanError(message) {
    let errorDiv = document.querySelector(".plan-error");
    if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.className = "plan-error error-message";
        const pricingGrid = document.querySelector(".pricing-grid");
        if (pricingGrid && pricingGrid.parentNode) {
            pricingGrid.parentNode.insertBefore(errorDiv, pricingGrid.nextSibling);
        } else {
            console.log("❌ Pricing grid não encontrado para mostrar erro de plano");
            return;
        }
    }
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
}

function clearPlanError() {
    const errorDiv = document.querySelector(".plan-error");
    if (errorDiv) errorDiv.style.display = "none";
}

// ================================
// Validações auxiliares
// ================================
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidCPF(cpf) {
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(cpf.charAt(i)) * (10 - i);
    let digit1 = 11 - (sum % 11);
    if (digit1 > 9) digit1 = 0;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(cpf.charAt(i)) * (11 - i);
    let digit2 = 11 - (sum % 11);
    if (digit2 > 9) digit2 = 0;
    return digit1 === parseInt(cpf.charAt(9)) && digit2 === parseInt(cpf.charAt(10));
}

// ================================
// Máscara CPF
// ================================
function addFormMasks() {
    const cpfInput = document.getElementById("cpf");
    if (cpfInput) {
        cpfInput.addEventListener("input", function() {
            let value = this.value.replace(/\D/g, "");
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d)/, "$1.$2");
            value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            this.value = value;
        });
    }
}

// ================================
// Toggle Senha
// ================================
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) {
        console.log(`❌ Campo ${fieldId} não encontrado para toggle`);
        return;
    }
    
    const toggle = field.parentNode.querySelector(".password-toggle i");
    if (field.type === "password") {
        field.type = "text";
        toggle.className = "fas fa-eye-slash";
    } else {
        field.type = "password";
        toggle.className = "fas fa-eye";
    }
}

// ================================
// Força da senha
// ================================
function updatePasswordStrength() {
    const passwordInput = document.getElementById("senha");
    if (!passwordInput) return;
    
    const password = passwordInput.value;
    const strengthBar = document.querySelector(".strength-fill");
    const strengthText = document.querySelector(".strength-text");
    
    if (!strengthBar || !strengthText) return;
    
    let strength = 0;
    let strengthLabel = "Muito fraca";
    if (password.length >= 6) strength += 20;
    if (password.length >= 8) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;
    
    if (strength >= 80) strengthLabel = "Muito forte";
    else if (strength >= 60) strengthLabel = "Forte";
    else if (strength >= 40) strengthLabel = "Média";
    else if (strength >= 20) strengthLabel = "Fraca";
    
    strengthBar.style.width = `${strength}%`;
    strengthText.textContent = strengthLabel;
    
    if (strength >= 60) strengthBar.style.background = "#4caf50";
    else if (strength >= 40) strengthBar.style.background = "#ff9800";
    else strengthBar.style.background = "#f44336";
}

// ================================
// Seleção do Plano
// ================================
function handlePlanSelection(e) {
    const selectedCard = e.target.closest(".pricing-card");
    if (!selectedCard) return;
    
    const allCards = document.querySelectorAll(".pricing-card");
    allCards.forEach(card => card.classList.remove("selected"));
    selectedCard.classList.add("selected");
    clearPlanError();
    selectedCard.style.transform = "scale(1.02)";
    setTimeout(() => { selectedCard.style.transform = ""; }, 200);
}

// ================================
// Coleta de Dados
// ================================
function collectFormData() {
    const nomeChefe = document.getElementById("nome_chefe");
    const email = document.getElementById("email");
    const senha = document.getElementById("senha");
    const cpf = document.getElementById("cpf");
    
    if (!nomeChefe || !email || !senha || !cpf) {
        console.log("❌ Campos do formulário não encontrados");
        return null;
    }
    
    const cpfRaw = cpf.value.replace(/\D/g, '');
    
    const formData = {
        usuario: nomeChefe.value,
        email: email.value,
        senha: senha.value,
        cpf: cpfRaw
    };
    
    console.log("📦 Dados coletados do formulário:", formData);
    return formData;
}

// ================================
// API chamadas
// ================================
async function registerGestor(data) {
    console.log("🚀 Iniciando registro do gestor...");
    console.log("📤 Enviando para API:", data);
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/Gestor/register`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(data),
        });
        
        console.log("📥 Status da resposta:", response.status);
        
        const result = await response.json();
        console.log("📨 Resposta completa da API:", result);
        
        if (!response.ok) {
            console.error("❌ Erro na API:", result.message);
            throw new Error(result.message || "Erro ao registrar gestor.");
        }
        
        console.log("✅ Registro realizado com sucesso!");
        return result;
        
    } catch (error) {
        console.error("💥 Erro na requisição:", error);
        throw error;
    }
}

async function criarPagamentoExistente(gestorId, plano) {
    console.log("💰 Criando pagamento para conta existente...");
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/payments/create-existing`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                gestorId: gestorId,
                plano: plano
            })
        });

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || "Erro ao criar pagamento");
        }

        return result;
        
    } catch (error) {
        console.error("💥 Erro ao criar pagamento existente:", error);
        throw error;
    }
}

// ================================
// Submissão Final - CORRIGIDA
// ================================
async function handleFinalSubmission(e) {
    e.preventDefault();
    console.log("🎯 Iniciando fluxo de pagamento...");
    
    if (isLoading) {
        console.log("⏳ Submissão já em andamento...");
        return;
    }
    
    if (!validateCurrentStep(2)) {
        console.log("❌ Validação da etapa 2 falhou");
        return;
    }
    
    setLoadingState(true);
    
    try {
        const planoInput = document.querySelector("input[name='plano']:checked");
        if (!planoInput) throw new Error("Nenhum plano selecionado");
        const plano = planoInput.value;

        let gestorId;
        let paymentData;

        if (contaExistente) {
            // FLUXO CONTA EXISTENTE
            console.log("🔄 Usando conta existente para pagamento...");
            gestorId = contaExistente._id;
            
            paymentData = await criarPagamentoExistente(gestorId, plano);
            console.log("✅ Pagamento para conta existente criado:", paymentData);
            
        } else {
            // FLUXO NORMAL - NOVA CONTA
            console.log("🔄 Criando nova conta + pagamento...");
            const formData = collectFormData();
            if (!formData) {
                throw new Error("Erro ao coletar dados do formulário");
            }
            
            const gestorResult = await registerGestor({
                usuario: formData.usuario,
                email: formData.email,
                senha: formData.senha,
                cpf: formData.cpf
            });

            console.log("✅ Nova conta registrada:", gestorResult);
            gestorId = gestorResult.gestor?._id;
            if (!gestorId) throw new Error("ID do gestor não retornado");

            // CORREÇÃO CRÍTICA: paymentResponse estava indefinido
            const paymentResponse = await fetch(`${API_BASE_URL}/api/payments/create-preference`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    gestorId: gestorId,
                    plano: plano
                })
            });

            paymentData = await paymentResponse.json();
            
            if (!paymentData.success) {
                throw new Error(paymentData.error || "Erro ao criar pagamento");
            }

            console.log("✅ Pagamento para nova conta criado:", paymentData);
        }

        // REDIRECIONA PARA MERCADO PAGO
        console.log("➡️ Redirecionando para Mercado Pago...");
        
        const checkoutUrl = paymentData.sandbox_init_point || paymentData.init_point;
        if (!checkoutUrl) {
            throw new Error("URL de checkout não encontrada");
        }
        
        window.location.href = checkoutUrl;

    } catch (error) {
        console.error("💥 ERRO NO FLUXO:", error);
        showRegistrationError(error.message);
        setLoadingState(false);
    }
}

// ================================
// Estado de Loading
// ================================
function setLoadingState(loading) {
    isLoading = loading;
    const submitBtn = document.querySelector(".btn-submit");
    if (!submitBtn) {
        console.log("❌ Botão de submit não encontrado");
        return;
    }
    
    if (loading) {
        console.log("⏳ Ativando estado de loading...");
        submitBtn.innerHTML = `<div class="loading-spinner"></div><span>Processando...</span>`;
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";
    } else {
        console.log("✅ Desativando estado de loading...");
        submitBtn.innerHTML = `<span>Finalizar Cadastro</span><i class="fas fa-check"></i>`;
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
    }
}

// ================================
// Erro de Registro
// ================================
function showRegistrationError(message) {
    console.error("🚨 Mostrando erro para usuário:", message);
    
    let errorDiv = document.querySelector(".registration-error");
    if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.className = "registration-error error-message";
        const form = document.getElementById("step2Form");
        if (form) {
            form.insertBefore(errorDiv, form.firstChild);
        } else {
            console.log("❌ Formulário step2Form não encontrado para mostrar erro");
            return;
        }
    }
    
    if (message.includes("email") || message.includes("usuário") || message.includes("CPF")) {
        errorDiv.style.background = "#fff3cd";
        errorDiv.style.color = "#856404";
        errorDiv.style.border = "1px solid #ffeaa7";
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle" style="color: #856404;"></i><span>${message}</span>`;
    } else {
        errorDiv.style.background = "#f8d7da";
        errorDiv.style.color = "#721c24";
        errorDiv.style.border = "1px solid #f5c6cb";
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: #721c24;"></i><span>${message}</span>`;
    }
    
    errorDiv.style.display = "flex";
    errorDiv.style.alignItems = "center";
    errorDiv.style.padding = "12px 16px";
    errorDiv.style.borderRadius = "8px";
    errorDiv.style.marginBottom = "20px";
    errorDiv.style.fontWeight = "500";
    
    setTimeout(() => { 
        if (errorDiv) {
            errorDiv.style.display = "none";
            console.log("🧹 Erro removido da tela");
        }
    }, 7000);
}

// ================================
// Extra
// ================================
function setupFormValidation() {
    console.log("✅ Validação de formulário configurada");
}

// Teste rápido da API
console.log("🧪 Para testar a API, execute no console: testarAPI()");

function testarAPI() {
    console.log("🧪 Testando API diretamente...");
    fetch(`${API_BASE_URL}/api/Gestor/register`,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            usuario: "testeconsole",
            senha: "123456",
            cpf: "11122233344",
            email: "teste@console.com"
        })
    })
    .then(r => r.json())
    .then(result => console.log("✅ Teste API:", result))
    .catch(error => console.error("❌ Teste API:", error));
}
