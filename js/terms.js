/**
 * PREMIX - Termos de Uso
 * Sistema de Navegação e Interatividade
 * @version 2.0
 */

// ========================================
// INICIALIZAÇÃO
// ========================================
document.addEventListener("DOMContentLoaded", function() {
    console.log("📄 Página de Termos de Uso carregada - v2.0");
    
    // Inicializar funcionalidades
    initNavigation();
    initSmoothScroll();
    initScrollSpy();
    // initAnimations(); // Removido: Animações de entrada
    updateActiveNavigationTab();
    
    console.log("✅ Todas as funcionalidades inicializadas com sucesso");
});

// ========================================
// NAVEGAÇÃO ENTRE SEÇÕES
// ========================================
function initNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    
    navItems.forEach(item => {
        item.addEventListener("click", function() {
            const sectionId = this.getAttribute("data-section");
            const section = document.getElementById(sectionId);
            
            if (section) {
                // Remove active de todos os itens
                navItems.forEach(nav => nav.classList.remove("active"));
                
                // Adiciona active ao item clicado
                this.classList.add("active");
                
                // Scroll suave até a seção
                const offset = 80; // Ajuste para header fixo (reduzido)
                const elementPosition = section.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
                
                // highlightSection(section); // Removido: Efeito visual na seção
            }
        });
    });
}

// ========================================
// SCROLL SUAVE
// ========================================
function initSmoothScroll() {
    // Links de âncora
    const anchorLinks = document.querySelectorAll("a[href^=\"#\"]");
    
    anchorLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            const href = this.getAttribute("href");
            
            if (href !== "#" && href.length > 1) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const offset = 80; // Ajuste para header fixo (reduzido)
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            }
        });
    });
}

// ========================================
// SCROLL SPY - Atualiza navegação baseado no scroll
// ========================================
function initScrollSpy() {
    const sections = document.querySelectorAll(".terms-section");
    const navItems = document.querySelectorAll(".nav-item");
    
    const observerOptions = {
        root: null,
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                
                // Atualiza navegação
                navItems.forEach(item => {
                    if (item.getAttribute("data-section") === sectionId) {
                        navItems.forEach(nav => nav.classList.remove("active"));
                        item.classList.add("active");
                    }
                });
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// ========================================
// ANIMAÇÕES DE ENTRADA (Removido)
// ========================================
/*
function initAnimations() {
    const animatedElements = document.querySelectorAll(".terms-section, .protected-item, .feature-list li, .liability-list li");
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";
                }, index * 50);
                
                animationObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });
    
    animatedElements.forEach(element => {
        element.style.opacity = "0";
        element.style.transform = "translateY(20px)";
        element.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        animationObserver.observe(element);
    });
}
*/

// ========================================
// HIGHLIGHT DE SEÇÃO (Removido)
// ========================================
/*
function highlightSection(section) {
    const previousHighlight = document.querySelector(".section-highlight");
    if (previousHighlight) {
        previousHighlight.classList.remove("section-highlight");
    }
    
    section.classList.add("section-highlight");
    
    setTimeout(() => {
        section.classList.remove("section-highlight");
    }, 1500);
}

const style = document.createElement("style");
style.textContent = `
    .section-highlight {
        animation: sectionPulse 1.5s ease;
    }
    
    @keyframes sectionPulse {
        0%, 100% {
            background: rgba(26, 26, 26, 0.6);
        }
        50% {
            background: rgba(251, 202, 72, 0.1);
        }
    }
`;
document.head.appendChild(style);
*/

// ========================================
// ATUALIZAÇÃO DE NAVEGAÇÃO ATIVA (Header)
// ========================================
// ========================================
// ATUALIZAÇÃO DE NAVEGAÇÃO ATIVA (Header)
// ========================================
function updateActiveNavigationTab() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(".nav-tab");

    navLinks.forEach(link => {
        let linkPath = link.getAttribute("href");
        
        // Ajusta o caminho para corresponder ao formato relativo
        if (linkPath.startsWith("../")) {
            linkPath = linkPath.substring(3);
        }
        
        // Verifica se o caminho atual inclui o link
        if (currentPath.includes(linkPath)) {
            link.classList.add("active-tab");
        } else {
            link.classList.remove("active-tab");
        }
    });

    // Removendo a injeção de estilo inline no link do footer para que o CSS cuide disso
    if (currentPath.includes("terms.html")) {
        const termsFooterLink = document.querySelector(".footer-links a[href=\"terms.html\"]");
        if (termsFooterLink) {
            // ANULADO: termsFooterLink.style.color = "#fbca48";
            // Adicionamos uma classe simples, se necessário, mas para este caso, o CSS padrão do footer deve funcionar.
            // Para garantir que o link não seja afetado pelo CSS do .active-tab do header:
            termsFooterLink.classList.add("footer-no-highlight");
        }
    }
}

// ========================================
// SCROLL TO TOP - Botão flutuante (opcional)
// ========================================
function initScrollToTop() {
    // Criar botão
    const scrollBtn = document.createElement("button");
    scrollBtn.innerHTML = "<i class=\"fas fa-arrow-up\"></i>";
    scrollBtn.className = "scroll-to-top";
    scrollBtn.setAttribute("aria-label", "Voltar ao topo");
    document.body.appendChild(scrollBtn);
    
    // Estilo do botão
    const btnStyle = document.createElement("style");
    btnStyle.textContent = `
        .scroll-to-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #fbca48 0%, #f39c12 100%);
            border: none;
            border-radius: 50%;
            color: #000;
            font-size: 1.2rem;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 0 5px 15px rgba(251, 202, 72, 0.3);
        }
        
        .scroll-to-top.visible {
            opacity: 1;
            visibility: visible;
        }
        
        .scroll-to-top:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(251, 202, 72, 0.4);
        }
        
        @media (max-width: 768px) {
            .scroll-to-top {
                width: 45px;
                height: 45px;
                bottom: 20px;
                right: 20px;
                font-size: 1rem;
            }
        }
    `;
    document.head.appendChild(btnStyle);
    
    // Mostrar/ocultar baseado no scroll
    window.addEventListener("scroll", () => {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add("visible");
        } else {
            scrollBtn.classList.remove("visible");
        }
    });
    
    // Ação de clique
    scrollBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

// Inicializar scroll to top
initScrollToTop();

// ========================================
// PROGRESS BAR DE LEITURA (Removido)
// ========================================
/*
function initReadingProgress() {
    const progressBar = document.createElement("div");
    progressBar.className = "reading-progress";
    document.body.appendChild(progressBar);
    
    const progressStyle = document.createElement("style");
    progressStyle.textContent = `
        .reading-progress {
            position: fixed;
            top: 60px;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #fbca48 0%, #f39c12 100%);
            z-index: 1001;
            transition: width 0.1s ease;
            box-shadow: 0 2px 5px rgba(251, 202, 72, 0.5);
        }
    `;
    document.head.appendChild(progressStyle);
    
    window.addEventListener("scroll", () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrolled = window.pageYOffset;
        const progress = (scrolled / documentHeight) * 100;
        
        progressBar.style.width = progress + "%";
    });
}

initReadingProgress();
*/

// ========================================
// ACESSIBILIDADE - Navegação por teclado
// ========================================
document.addEventListener("keydown", function(e) {
    // Atalho: Ctrl/Cmd + Home = Voltar ao topo
    if ((e.ctrlKey || e.metaKey) && e.key === "Home") {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
});

// ========================================
// ANALYTICS E TRACKING (opcional)
// ========================================
function trackSectionView(sectionId) {
    // Implementar tracking de visualização de seções
    console.log(`📊 Seção visualizada: ${sectionId}`);
    
    // Exemplo: Google Analytics
    // if (typeof gtag !== "undefined") {
    //     gtag("event", "section_view", {
    //         "section_id": sectionId
    //     });
    // }
}

// ========================================
// PRINT FRIENDLY
// ========================================
window.addEventListener("beforeprint", function() {
    console.log("🖨️ Preparando página para impressão...");
    // Expandir todas as seções se necessário
});

window.addEventListener("afterprint", function() {
    console.log("✅ Impressão concluída");
});

// ========================================
// PERFORMANCE MONITORING
// ========================================
if ("PerformanceObserver" in window) {
    const perfObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === "navigation") {
                console.log(`⚡ Tempo de carregamento: ${entry.loadEventEnd - entry.fetchStart}ms`);
            }
        }
    });
    
    perfObserver.observe({ entryTypes: ["navigation"] });
}

// ========================================
// EXPORT
// ========================================
// Exportar funções úteis para uso externo se necessário
window.PremiXTerms = {
    scrollToSection: function(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offset = 80; // Ajustado
            const elementPosition = section.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    },
    
    getCurrentSection: function() {
        const activeNav = document.querySelector(".nav-item.active");
        return activeNav ? activeNav.getAttribute("data-section") : null;
    }
};

console.log("🚀 PremiX Terms v2.0 - Sistema totalmente carregado!");

