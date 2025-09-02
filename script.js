// Game Home Screen JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize the application
    initGameHomeScreen();
    
    // Add event listeners for game options
    setupGameInteractions();
    
    // Add smooth scrolling and animations
    setupAnimations();
    
    // Add touch interactions for mobile
    setupTouchInteractions();
});

function initGameHomeScreen() {
    console.log('Fairtrade Games Home Screen Initialized');
    
    // Preload images for better performance
    preloadImages();
    
    // Add loading animation
    showLoadingAnimation();
}

function preloadImages() {
    const imageUrls = [
        'images/Main Icon@300x.png',
        'images/OP1@300x.png',
        'images/OP2@300x.png',
        'images/OP1.1@300x.png',
        'images/OP2.2@300x.png'
    ];
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

function showLoadingAnimation() {
    // Hide loading animation after content is loaded
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 500);
}

function setupGameInteractions() {
    const gameOptions = document.querySelectorAll('.game-option');
    
    gameOptions.forEach(option => {
        // Add click event
        option.addEventListener('click', function(e) {
            e.preventDefault();
            handleGameSelection(this.id);
        });
        
        // Add keyboard navigation
        option.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleGameSelection(this.id);
            }
        });
        
        // Add focus management
        option.setAttribute('tabindex', '0');
        
        // Add hover effects with sound (optional)
        option.addEventListener('mouseenter', function() {
            addHoverEffect(this);
        });
        
        option.addEventListener('mouseleave', function() {
            removeHoverEffect(this);
        });
    });
}

function handleGameSelection(gameId) {
    // Add click animation
    const gameOption = document.getElementById(gameId);
    addClickAnimation(gameOption);
    
    // Determine which game was selected
    let gameName = '';
    let gameDescription = '';
    
    switch(gameId) {
        case 'fair-hunt':
            gameName = 'FAIR HUNT';
            gameDescription = 'Word-finding challenge';
            break;
        case 'fair-puzzle':
            gameName = 'FAIR PUZZLE';
            gameDescription = 'Puzzle assembly challenge';
            break;
        default:
            gameName = 'Unknown Game';
            gameDescription = 'Game not found';
    }
    
    // Show selection feedback
    showGameSelectionFeedback(gameName, gameDescription);
    
    // Navigate to game (placeholder for now)
    setTimeout(() => {
        navigateToGame(gameId);
    }, 1000);
}

function addClickAnimation(element) {
    element.style.transform = 'scale(0.95)';
    element.style.transition = 'transform 0.1s ease';
    
    setTimeout(() => {
        element.style.transform = '';
        element.style.transition = '';
    }, 100);
}

function addHoverEffect(element) {
    element.style.transform = 'translateY(-5px) scale(1.02)';
    element.style.boxShadow = '0 15px 40px rgba(50, 205, 50, 0.2)';
}

function removeHoverEffect(element) {
    element.style.transform = '';
    element.style.boxShadow = '';
}

function showGameSelectionFeedback(gameName, description) {
    // Create feedback overlay
    const feedback = document.createElement('div');
    feedback.className = 'game-feedback';
    feedback.innerHTML = `
        <div class="feedback-content">
            <h2>${gameName}</h2>
            <p>${description}</p>
            <div class="loading-spinner"></div>
        </div>
    `;
    
    // Add styles
    feedback.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(5px);
    `;
    
    const content = feedback.querySelector('.feedback-content');
    content.style.cssText = `
        background: linear-gradient(135deg, #1a2a3a, #2d4a6b);
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        border: 2px solid #32cd32;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;
    
    content.querySelector('h2').style.cssText = `
        color: #32cd32;
        font-size: 2rem;
        margin-bottom: 10px;
        font-weight: 700;
    `;
    
    content.querySelector('p').style.cssText = `
        color: white;
        font-size: 1.1rem;
        margin-bottom: 20px;
    `;
    
    // Add loading spinner
    const spinner = content.querySelector('.loading-spinner');
    spinner.style.cssText = `
        width: 40px;
        height: 40px;
        border: 4px solid rgba(50, 205, 50, 0.3);
        border-top: 4px solid #32cd32;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto;
    `;
    
    // Add spinner animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(feedback);
    
    // Remove feedback after delay
    setTimeout(() => {
        document.body.removeChild(feedback);
    }, 2000);
}

function navigateToGame(gameId) {
    console.log(`Navigating to ${gameId} game...`);
    
    // Navigate to the actual game pages
    if (gameId === 'fair-hunt') {
        window.location.href = 'wordsearch/ws/index.html';
    } else if (gameId === 'fair-puzzle') {
        window.location.href = 'fairpuzzle/index.html';
    } else {
        console.error('Unknown game ID:', gameId);
    }
}

function setupAnimations() {
    // Add scroll-triggered animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.game-option, .footer-icons');
    animatedElements.forEach(el => observer.observe(el));
    
    // Add CSS for animate-in class
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            animation: slideInUp 0.6s ease-out forwards;
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

function setupTouchInteractions() {
    // Add touch-specific interactions for mobile devices
    if ('ontouchstart' in window) {
        const gameOptions = document.querySelectorAll('.game-option');
        
        gameOptions.forEach(option => {
            // Add touch feedback
            option.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            option.addEventListener('touchend', function() {
                this.style.transform = '';
            });
            
            // Prevent default touch behaviors
            option.addEventListener('touchmove', function(e) {
                e.preventDefault();
            });
        });
    }
}

// Add utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize
window.addEventListener('resize', debounce(() => {
    // Recalculate any dynamic layouts if needed
    console.log('Window resized');
}, 250));

// Add service worker for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export functions for potential external use
window.FairtradeGames = {
    selectGame: handleGameSelection,
    navigateToGame: navigateToGame
};
