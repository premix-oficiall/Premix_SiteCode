// Variáveis globais
let selectedRole = null;
let isAnimating = false;

// Inicialização da página
document.addEventListener("DOMContentLoaded", function() {
    initializeRoleSelection();
    setupEventListeners();
    setupAnimations();
});

// Função para inicializar a página
function initializeRoleSelection() {
    updateActiveNavigation();
    animatePageElements();
    
    // Verificar se há um role salvo no localStorage
    const savedRole = localStorage.getItem('premix_selected_role');
    if (savedRole) {
        highlightSavedRole(savedRole);
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
        if (currentPath.includes(linkPath) || currentPath.includes("role-selection")) {
            link.classList.add("active-tab");
        } else {
            link.classList.remove("active-tab");
        }
    });
}

// Função para configurar event listeners
function setupEventListeners() {
    const roleCards = document.querySelectorAll(".role-card");
    const demoButton = document.querySelector(".demo-button");
    
    // Event listeners para os cards de role
    roleCards.forEach(card => {
        card.addEventListener("click", function() {
            const role = this.getAttribute("data-role");
            selectRoleCard(role);
        });
        
        card.addEventListener("mouseenter", handleCardHover);
        card.addEventListener("mouseleave", handleCardLeave);
    });
    
    // Event listener para o botão de demo
    if (demoButton) {
        demoButton.addEventListener("click", accessDemo);
    }
    
    // Event listeners para teclado
    document.addEventListener("keydown", handleKeyboardNavigation);
}

// Função para selecionar um role
function selectRole(role) {
    if (isAnimating) return;
    
    isAnimating = true;
    selectedRole = role;
    
    // Salvar no localStorage
    localStorage.setItem('premix_selected_role', role);
    
    // Animar seleção
    animateRoleSelection(role);
    
    // Redirecionar após animação
    setTimeout(() => {
        if (role === 'manager') {
            window.location.href = 'login.html?role=manager';
        } else if (role === 'intern') {
            // Para estagiários, pode redirecionar para uma página específica ou login diferente
            window.location.href = 'download.html';
        }
    }, 1500);
}

// Função para selecionar card visualmente
function selectRoleCard(role) {
    const cards = document.querySelectorAll(".role-card");
    const selectedCard = document.querySelector(`[data-role="${role}"]`);
    
    // Remover seleção anterior
    cards.forEach(card => {
        card.classList.remove("selected");
    });
    
    // Adicionar seleção ao card atual
    selectedCard.classList.add("selected");
    
    // Feedback visual
    selectedCard.style.transform = "translateY(-15px) scale(1.02)";
    
    setTimeout(() => {
        selectedCard.style.transform = "";
    }, 300);
}

// Função para destacar role salvo
function highlightSavedRole(role) {
    const savedCard = document.querySelector(`[data-role="${role}"]`);
    if (savedCard) {
        savedCard.classList.add("selected");
        
        // Mostrar indicador de seleção anterior
        const indicator = document.createElement("div");
        indicator.className = "saved-indicator";
        indicator.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Última seleção</span>
        `;
        savedCard.appendChild(indicator);
    }
}

// Função para animar seleção de role
function animateRoleSelection(role) {
    const selectedCard = document.querySelector(`[data-role="${role}"]`);
    const otherCard = document.querySelector(`[data-role="${role === 'manager' ? 'intern' : 'manager'}"]`);
    
    // Animar card selecionado
    selectedCard.style.transition = "all 0.8s ease";
    selectedCard.style.transform = "scale(1.1)";
    selectedCard.style.zIndex = "10";
    
    // Animar card não selecionado
    otherCard.style.transition = "all 0.8s ease";
    otherCard.style.opacity = "0.3";
    otherCard.style.transform = "scale(0.9)";
    
    // Mostrar feedback de sucesso
    showSelectionFeedback(role);
}

// Função para mostrar feedback de seleção
function showSelectionFeedback(role) {
    const feedback = document.createElement("div");
    feedback.className = "selection-feedback";
    
    const roleText = role === 'manager' ? 'Gestor' : 'Estagiário';
    feedback.innerHTML = `
        <div class="feedback-icon">
            <i class="fas fa-check"></i>
        </div>
        <div class="feedback-text">
            <h3>Perfeito!</h3>
            <p>Redirecionando para a área de ${roleText}...</p>
        </div>
    `;
    
    document.body.appendChild(feedback);
    
    // Animar entrada
    setTimeout(() => {
        feedback.classList.add("show");
    }, 100);
    
    // Remover após redirecionamento
    setTimeout(() => {
        feedback.remove();
    }, 2000);
}

// Função para lidar com hover nos cards
function handleCardHover(e) {
    if (isAnimating) return;
    
    const card = e.currentTarget;
    const icon = card.querySelector(".role-icon");
    const features = card.querySelectorAll(".feature");
    
    // Animar ícone
    icon.style.transform = "scale(1.1) rotate(5deg)";
    
    // Animar features com delay escalonado
    features.forEach((feature, index) => {
        setTimeout(() => {
            feature.style.transform = "translateX(10px)";
            feature.style.color = "#fbca48";
        }, index * 100);
    });
}

// Função para lidar com mouse leave nos cards
function handleCardLeave(e) {
    if (isAnimating) return;
    
    const card = e.currentTarget;
    const icon = card.querySelector(".role-icon");
    const features = card.querySelectorAll(".feature");
    
    // Resetar ícone
    icon.style.transform = "";
    
    // Resetar features
    features.forEach(feature => {
        feature.style.transform = "";
        feature.style.color = "";
    });
}

// Função para navegação por teclado
function handleKeyboardNavigation(e) {
    if (isAnimating) return;
    
    switch(e.key) {
        case '1':
            selectRole('manager');
            break;
        case '2':
            selectRole('intern');
            break;
        case 'ArrowLeft':
            selectRoleCard('manager');
            break;
        case 'ArrowRight':
            selectRoleCard('intern');
            break;
        case 'Enter':
            if (selectedRole) {
                selectRole(selectedRole);
            }
            break;
        case 'Escape':
            // Limpar seleção
            document.querySelectorAll(".role-card").forEach(card => {
                card.classList.remove("selected");
            });
            selectedRole = null;
            break;
    }
}

// Função para acessar demo
function accessDemo() {
    // Mostrar modal de demo ou redirecionar
    const demoModal = createDemoModal();
    document.body.appendChild(demoModal);
    
    setTimeout(() => {
        demoModal.classList.add("show");
    }, 100);
}

// Função para criar modal de demo
function createDemoModal() {
    const modal = document.createElement("div");
    modal.className = "demo-modal";
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeDemoModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>Demonstração do PremiX</h3>
                <button class="close-button" onclick="closeDemoModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="demo-options">
                    <div class="demo-option" onclick="startDemo('manager')">
                        <div class="demo-icon">
                            <i class="fas fa-briefcase"></i>
                        </div>
                        <h4>Demo para Gestores</h4>
                        <p>Veja o dashboard executivo e ferramentas de gestão</p>
                    </div>
                    <div class="demo-option" onclick="startDemo('intern')">
                        <div class="demo-icon">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <h4>Demo para Estagiários</h4>
                        <p>Explore as tarefas e sistema de recompensas</p>
                    </div>
                </div>
                <div class="demo-info">
                    <p><i class="fas fa-info-circle"></i> A demonstração não requer cadastro e mostra todas as funcionalidades principais.</p>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

// Função para fechar modal de demo
function closeDemoModal() {
    const modal = document.querySelector(".demo-modal");
    if (modal) {
        modal.classList.remove("show");
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Função para iniciar demo
function startDemo(role) {
    closeDemoModal();
    
    // Salvar que é uma demo
    localStorage.setItem('premix_demo_mode', 'true');
    localStorage.setItem('premix_demo_role', role);
    
    // Redirecionar para demo
    window.location.href = `demo.html?role=${role}`;
}

// Função para configurar animações
function setupAnimations() {
    // Adicionar CSS para animações dinâmicas
    if (!document.querySelector("#role-selection-animations")) {
        const style = document.createElement("style");
        style.id = "role-selection-animations";
        style.textContent = `
            .selection-feedback {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(26, 26, 26, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 16px;
                padding: 30px;
                border: 2px solid #fbca48;
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 20px;
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
                transition: all 0.4s ease;
            }
            
            .selection-feedback.show {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            
            .feedback-icon {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #fbca48, #f39c12);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                color: #000;
                animation: checkPulse 1s ease-in-out infinite;
            }
            
            @keyframes checkPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            .feedback-text h3 {
                color: #fbca48;
                font-size: 1.5rem;
                margin-bottom: 8px;
            }
            
            .feedback-text p {
                color: #ccc;
                font-size: 1rem;
            }
            
            .saved-indicator {
                position: absolute;
                top: 15px;
                right: 15px;
                background: rgba(76, 175, 80, 0.9);
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 6px;
                animation: fadeInScale 0.5s ease-out;
            }
            
            @keyframes fadeInScale {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            .demo-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .demo-modal.show {
                opacity: 1;
            }
            
            .modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
            }
            
            .modal-content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(26, 26, 26, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 16px;
                border: 1px solid rgba(251, 202, 72, 0.2);
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 30px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .modal-header h3 {
                color: #fbca48;
                font-size: 1.5rem;
                font-weight: 600;
            }
            
            .close-button {
                background: none;
                border: none;
                color: #ccc;
                font-size: 20px;
                cursor: pointer;
                padding: 5px;
                transition: color 0.3s ease;
            }
            
            .close-button:hover {
                color: #fbca48;
            }
            
            .modal-body {
                padding: 30px;
            }
            
            .demo-options {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .demo-option {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .demo-option:hover {
                border-color: #fbca48;
                background: rgba(251, 202, 72, 0.1);
                transform: translateY(-2px);
            }
            
            .demo-option .demo-icon {
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #fbca48, #f39c12);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                color: #000;
                margin: 0 auto 15px;
            }
            
            .demo-option h4 {
                color: #fff;
                font-size: 1.2rem;
                margin-bottom: 8px;
            }
            
            .demo-option p {
                color: #ccc;
                font-size: 0.9rem;
                line-height: 1.4;
            }
            
            .demo-info {
                background: rgba(251, 202, 72, 0.1);
                border: 1px solid rgba(251, 202, 72, 0.2);
                border-radius: 8px;
                padding: 15px;
                text-align: center;
            }
            
            .demo-info p {
                color: #fbca48;
                font-size: 0.9rem;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            @media (max-width: 768px) {
                .demo-options {
                    grid-template-columns: 1fr;
                }
                
                .modal-content {
                    width: 95%;
                    margin: 20px;
                }
                
                .modal-header, .modal-body {
                    padding: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Função para animar elementos da página
function animatePageElements() {
    // Animar cards com delay escalonado
    const cards = document.querySelectorAll(".role-card");
    const additionalElements = document.querySelectorAll(".additional-info, .demo-section");
    
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
        }, index * 200 + 800);
    });
    
    additionalElements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = "1";
            element.style.transform = "translateY(0)";
        }, index * 200 + 1400);
    });
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

// Função para limpar dados salvos (útil para desenvolvimento)
function clearSavedData() {
    localStorage.removeItem('premix_selected_role');
    localStorage.removeItem('premix_demo_mode');
    localStorage.removeItem('premix_demo_role');
    location.reload();
}

// Expor função globalmente para debug
window.clearSavedData = clearSavedData;
