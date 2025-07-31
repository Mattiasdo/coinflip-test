// Game State
let gameState = {
    playerChoice: null,
    isFlipping: false,
    history: JSON.parse(localStorage.getItem('coinFlipHistory')) || [],
    stats: {
        total: 0,
        wins: 0,
        losses: 0
    }
};

// DOM Elements
const historyBar = document.getElementById('historyBar');
const historyToggle = document.getElementById('historyToggle');
const historyContent = document.getElementById('historyContent');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');

const coin = document.getElementById('coin');
const choiceButtons = document.querySelectorAll('.choice-btn');
const flipBtn = document.getElementById('flipBtn');
const resultDisplay = document.getElementById('resultDisplay');

const victoryOverlay = document.getElementById('victoryOverlay');
const defeatOverlay = document.getElementById('defeatOverlay');

const totalFlipsEl = document.getElementById('totalFlips');
const totalWinsEl = document.getElementById('totalWins');
const totalLossesEl = document.getElementById('totalLosses');
const winRateEl = document.getElementById('winRate');

// Initialize Game
function initGame() {
    updateStats();
    displayHistory();
    
    // Add event listeners
    historyToggle.addEventListener('click', toggleHistory);
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    choiceButtons.forEach(btn => {
        btn.addEventListener('click', selectChoice);
    });
    
    flipBtn.addEventListener('click', flipCoin);
    
    // Close overlays when clicked
    victoryOverlay.addEventListener('click', () => hideOverlay(victoryOverlay));
    defeatOverlay.addEventListener('click', () => hideOverlay(defeatOverlay));
}

// History Bar Functions
function toggleHistory() {
    historyBar.classList.toggle('open');
}

function updateStats() {
    const history = gameState.history;
    gameState.stats.total = history.length;
    gameState.stats.wins = history.filter(flip => flip.result === 'win').length;
    gameState.stats.losses = history.filter(flip => flip.result === 'loss').length;
    
    totalFlipsEl.textContent = gameState.stats.total;
    totalWinsEl.textContent = gameState.stats.wins;
    totalLossesEl.textContent = gameState.stats.losses;
    
    const winRate = gameState.stats.total > 0 
        ? Math.round((gameState.stats.wins / gameState.stats.total) * 100)
        : 0;
    winRateEl.textContent = `${winRate}%`;
}

function displayHistory() {
    historyList.innerHTML = '';
    
    if (gameState.history.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No flips yet!</p>';
        return;
    }
    
    // Show most recent first
    const recentHistory = [...gameState.history].reverse().slice(0, 10);
    
    recentHistory.forEach(flip => {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${flip.result}`;
        
        const flipResult = flip.coinResult === 'heads' ? '👑' : '🦅';
        const resultText = flip.result === 'win' ? 'WIN' : 'LOSS';
        
        historyItem.innerHTML = `
            <span>${flipResult} ${flip.coinResult.toUpperCase()} - ${resultText}</span>
            <span style="font-size: 12px; opacity: 0.7;">${new Date(flip.timestamp).toLocaleTimeString()}</span>
        `;
        
        historyList.appendChild(historyItem);
    });
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all history?')) {
        gameState.history = [];
        localStorage.removeItem('coinFlipHistory');
        updateStats();
        displayHistory();
    }
}

function saveHistory() {
    localStorage.setItem('coinFlipHistory', JSON.stringify(gameState.history));
}

// Game Logic Functions
function selectChoice(event) {
    if (gameState.isFlipping) return;
    
    const choice = event.currentTarget.dataset.choice;
    gameState.playerChoice = choice;
    
    // Update UI
    choiceButtons.forEach(btn => btn.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    
    // Enable flip button
    flipBtn.disabled = false;
    flipBtn.querySelector('.flip-text').textContent = `Flip for ${choice.charAt(0).toUpperCase() + choice.slice(1)}!`;
}

function flipCoin() {
    if (gameState.isFlipping || !gameState.playerChoice) return;
    
    gameState.isFlipping = true;
    flipBtn.disabled = true;
    flipBtn.querySelector('.flip-text').textContent = 'Flipping...';
    
    // Generate random result
    const coinResult = Math.random() < 0.5 ? 'heads' : 'tails';
    const playerWon = gameState.playerChoice === coinResult;
    
    // Add flip animation class
    coin.className = 'coin';
    setTimeout(() => {
        coin.classList.add(`flipping-${coinResult}`);
    }, 50);
    
    // Handle result after animation
    setTimeout(() => {
        handleFlipResult(coinResult, playerWon);
    }, 2000);
}

function handleFlipResult(coinResult, playerWon) {
    // Update coin to show final result
    coin.className = 'coin';
    if (coinResult === 'tails') {
        coin.style.transform = 'rotateY(180deg)';
    } else {
        coin.style.transform = 'rotateY(0deg)';
    }
    
    // Add to history
    const flipRecord = {
        playerChoice: gameState.playerChoice,
        coinResult: coinResult,
        result: playerWon ? 'win' : 'loss',
        timestamp: Date.now()
    };
    
    gameState.history.push(flipRecord);
    saveHistory();
    updateStats();
    displayHistory();
    
    // Show result
    const resultText = playerWon 
        ? `🎉 You won! The coin landed on ${coinResult}!`
        : `😢 You lost! The coin landed on ${coinResult}.`;
    
    resultDisplay.innerHTML = `<p style="color: ${playerWon ? 'var(--success-green)' : 'var(--error-red)'}; font-weight: 600;">${resultText}</p>`;
    
    // Show overlay animation
    if (playerWon) {
        showVictoryAnimation();
    } else {
        showDefeatAnimation();
    }
    
    // Reset game state
    setTimeout(() => {
        resetGame();
    }, 3000);
}

function showVictoryAnimation() {
    victoryOverlay.classList.add('active');
    
    // Create multiple confetti elements
    const confettiContainer = victoryOverlay.querySelector('.confetti');
    confettiContainer.innerHTML = '';
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = Math.random() * 12 + 6 + 'px';
        confetti.style.height = confetti.style.width;
        confetti.style.backgroundColor = ['#FFD700', '#FF6B35', '#4ECDC4', '#95E1D3', '#F38BA8', '#00FF41', '#FF1744'][Math.floor(Math.random() * 7)];
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-20px';
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animation = `confetti-fall ${Math.random() * 2 + 2}s linear infinite`;
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.zIndex = '2001';
        confettiContainer.appendChild(confetti);
    }
    
    setTimeout(() => {
        hideOverlay(victoryOverlay);
    }, 2500);
}

function showDefeatAnimation() {
    defeatOverlay.classList.add('active');
    
    setTimeout(() => {
        hideOverlay(defeatOverlay);
    }, 2500);
}

function hideOverlay(overlay) {
    overlay.classList.remove('active');
}

function resetGame() {
    gameState.isFlipping = false;
    gameState.playerChoice = null;
    
    // Reset UI
    choiceButtons.forEach(btn => btn.classList.remove('selected'));
    flipBtn.disabled = true;
    flipBtn.querySelector('.flip-text').textContent = 'Choose First';
    resultDisplay.innerHTML = '';
    
    // Reset coin position
    coin.className = 'coin';
    coin.style.transform = 'rotateY(0deg)';
}

// Keyboard Support
document.addEventListener('keydown', (event) => {
    if (gameState.isFlipping) return;
    
    switch(event.key.toLowerCase()) {
        case 'h':
            if (!gameState.playerChoice) {
                document.querySelector('[data-choice="heads"]').click();
            }
            break;
        case 't':
            if (!gameState.playerChoice) {
                document.querySelector('[data-choice="tails"]').click();
            }
            break;
        case ' ':
        case 'enter':
            event.preventDefault();
            if (gameState.playerChoice && !gameState.isFlipping) {
                flipCoin();
            }
            break;
        case 'escape':
            if (historyBar.classList.contains('open')) {
                toggleHistory();
            }
            break;
    }
});

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', initGame);

// Add some visual feedback for interactions
document.addEventListener('click', (event) => {
    // Create ripple effect for buttons
    if (event.target.matches('button') || event.target.closest('button')) {
        const button = event.target.matches('button') ? event.target : event.target.closest('button');
        
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
});

// Add ripple effect CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    button {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);