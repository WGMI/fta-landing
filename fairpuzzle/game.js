(() => {
  // Get player name from URL parameters
  function getPlayerName() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('name') || 'Anonymous';
  }
  
  const playerName = getPlayerName();
  
  // Fairtrade facts data
  const FAIRTRADE_FACTS = [
    {
      "keyword": "Fairtrade",
      "fact": "Fairtrade is about better prices, decent working conditions, local sustainability, and fair terms of trade for farmers and workers around the world, but particularly in lower income countries."
    },
    {
      "keyword": "Twenty",
      "fact": "Fairtrade Africa is celebrating 20 years of driving Impact through trade."
    },
    {
      "keyword": "Vision",
      "fact": "A world in which all producers can enjoy secure and sustainable livelihoods, fulfill their potential and decide on their future."
    },
    {
      "keyword": "Mission",
      "fact": "FTA's Mission: Transformative, Resilient & Impactful."
    },
    {
      "keyword": "Organizations",
      "fact": "Then & Now: Fairtrade Africa's network of Certified POs has grown by 75% over the last decade, from 404 in 2013 to 701 in 2023. *POs-Producer Organizations."
    },
    {
      "keyword": "Farmers, Workers",
      "fact": "Growing Stronger Together: The number of farmers and workers benefiting from Fairtrade Africa has increased by over 50%, now supporting over 1.4 million people!"
    },
    {
      "keyword": "Premium",
      "fact": "The Fairtrade Premium is an extra sum of money farmers and workers can invest in community, environmental or business projects of their choice."
    },
    {
      "keyword": "Future",
      "fact": "Investing in the Future: The Fairtrade Premiums earned by producers have more than quadrupled over the last decade, from €21.3M in 2013 to €90.2M in 2024!"
    },
    {
      "keyword": "Community",
      "fact": "Feeding Communities: Fairtrade invests nearly 50% of its premiums into programs that help achieve Zero Hunger for everyone."
    },
    {
      "keyword": "Projects",
      "fact": "Building a Brighter Future: A remarkable 19% of premiums are used to create projects that help end poverty and improve livelihoods."
    },
    {
      "keyword": "Jobs",
      "fact": "Great Jobs: Hired labor organizations proudly use 33% of their premiums to create Decent Work and boost economic growth!"
    },
    {
      "keyword": "Knowledge",
      "fact": "Investing in Knowledge: They are helping build a brighter future by dedicating 32% of their funds to provide Quality Education for their communities."
    },
    {
      "keyword": "Zero Hunger",
      "fact": "Food for All: For small-scale farmers, Zero Hunger is a top goal! They invest 62% of their premiums in projects that put food on the table."
    },
    {
      "keyword": "Investment",
      "fact": "Investing in Farms: Small Producer Organizations prioritize their operations, using 41% of their premium for Production costs like equipment, farm inputs, and infrastructure."
    },
    {
      "keyword": "Social",
      "fact": "Community First: Hired Labor organizations invest a massive 70% of their premiums directly into Social Investments, such as housing, health facilities, and schools."
    },
    {
      "keyword": "Benefits",
      "fact": "Direct Benefits: HL organizations ensure workers see a direct impact, using 16% of premiums for Financial Benefits like bonuses and pensions."
    },
    {
      "keyword": "Empower",
      "fact": "Empowering Workers: About 9% of the premium is used for Training and Empowerment of Workers, building skills for a better future by HL organizations."
    },
    {
      "keyword": "Members",
      "fact": "Financial Benefits: SPOs dedicate a significant portion to their members, with 21% of the premium going directly to Financial Benefits. *SPOs-Small Producer Organizations."
    },
    {
      "keyword": "Growth",
      "fact": "Growing the Business: About 18% of the premium is used by SPOs for Business & Organizational Development, helping them improve their operations and become more competitive."
    }
  ];

  // EDIT THIS LIST to match files in images/pictures/
  const IMAGES = [
    "images/pictures/1.jpg",
    "images/pictures/2.jpg",
    "images/pictures/3.jpg",
    "images/pictures/4.jpg",
    "images/pictures/5.jpg"
  ];

  const boardEl = document.getElementById('board');
  const msgEl = document.getElementById('msg');
  const finalStatsEl = document.getElementById('finalStats');
  const eyeBtn = document.getElementById('eyeBtn');
  const movesEl = document.getElementById('moves');
  const timeEl = document.getElementById('time');
  const scoreEl = document.getElementById('score');
  const guideDlg = document.getElementById('guideDlg');
  const guideImg = document.getElementById('guideImg');
  const closeDlg = document.getElementById('closeDlg');
  const resultsDlg = document.getElementById('resultsDlg');
  const completedImg = document.getElementById('completedImg');
  const finalTimeEl = document.getElementById('finalTime');
  const finalMovesEl = document.getElementById('finalMoves');
  const finalScoreEl = document.getElementById('finalScore');
  const closeResultsDlg = document.getElementById('closeResultsDlg');
  const confettiContainer = document.getElementById('confettiContainer');
  const newGameBtn = document.getElementById('newGameBtn');

  let GRID = 3; // Fixed to 3x3 grid
  let BOARD_SIZE = 460; // px (keep in sync with CSS --board-size if you change it)
  let imageURL = pickRandom(IMAGES);

  let tiles = [];          // current permutation (array of indices 0..n-1)
  let correct = [];        // target permutation [0,1,2,...]
  let firstSel = null;     // {idx, el} of first tile selection
  let moves = 0;
  let score = 200;         // starting score
  let startTime = null;
  let timerId = null;

  // Helpers
  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function now() { return performance.now(); }

  function formatTime(ms) {
    const sec = Math.floor(ms / 1000);
    const m = Math.floor(sec / 60).toString().padStart(2,'0');
    const s = (sec % 60).toString().padStart(2,'0');
    return `${m}:${s}`;
  }

  function getMoveCost(gridSize) {
    switch(gridSize) {
      case 3: return 5;  // Higher cost for 3x3 since it's easier
      case 4: return 3;
      case 5: return 2;
      case 6: return 1;
      default: return 3;
    }
  }

  function updateScore() {
    const moveCost = getMoveCost(GRID);
    score = Math.max(0, 200 - (moves * moveCost));
    scoreEl.textContent = `Score: ${score}`;
  }

  function setGridCSS(g) {
    GRID = g;
    document.documentElement.style.setProperty('--grid', String(g));
  }

  function startTimer() {
    startTime = now();
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
      const elapsed = now() - startTime;
      timeEl.textContent = `Time: ${formatTime(elapsed)}`;
    }, 200);
  }
  function stopTimer() {
    if (timerId) clearInterval(timerId);
    timerId = null;
  }

  function buildBoard() {
    boardEl.innerHTML = '';
    const n = GRID * GRID;
    correct = Array.from({length: n}, (_, i) => i);
    tiles = correct.slice();

    // Pre-create tile elements
    for (let i = 0; i < n; i++) {
      const el = document.createElement('button');
      el.className = 'tile';
      el.setAttribute('data-pos', i); // current position in grid
      el.setAttribute('data-id', i);  // original id (which piece)
      el.setAttribute('aria-label', `Tile ${i+1}`);
      positionTileBG(el, i); // set background-position for the original piece id
      boardEl.appendChild(el);
    }

    // Apply random image
    applyImage(imageURL);

    // Shuffle to a non-trivial permutation
    shuffleTiles();

    // Attach handlers
    boardEl.querySelectorAll('.tile').forEach(el => {
      el.addEventListener('click', onTileClick);
    });

    // Reset stats
    moves = 0;
    score = 200;
    movesEl.textContent = 'Moves: 0';
    timeEl.textContent = 'Time: 00:00';
    scoreEl.textContent = 'Score: 200';
    msgEl.classList.remove('show');
    startTimer();
  }

  function applyImage(url) {
    guideImg.src = url;
    boardEl.querySelectorAll('.tile').forEach((el) => {
      el.style.backgroundImage = `url("${url}")`;
    });
  }

  // For piece id i (0..n-1), set the background-position so when pieces align, the full image appears
  function positionTileBG(el, pieceId) {
    const row = Math.floor(pieceId / GRID);
    const col = pieceId % GRID;
    const tileW = BOARD_SIZE / GRID;
    const tileH = BOARD_SIZE / GRID;
    const x = -col * tileW;
    const y = -row * tileH;
    el.style.backgroundPosition = `${x}px ${y}px`;
    el.style.backgroundSize = `${BOARD_SIZE}px ${BOARD_SIZE}px`;
  }

  function shuffleTiles() {
    // Fisher-Yates on the "tiles" array (which maps board slot -> piece id)
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    // ensure not already solved
    if (arraysEqual(tiles, correct)) {
      // simple swap to create a change
      [tiles[0], tiles[1]] = [tiles[1], tiles[0]];
    }
    // reflect permutation into DOM by reordering elements
    syncDOMFromTiles();
  }

  function syncDOMFromTiles() {
    // Clear the board
    boardEl.innerHTML = '';
    
    // Rebuild the board with tiles in the correct order
    for (let pos = 0; pos < tiles.length; pos++) {
      const pieceId = tiles[pos];
      const el = document.createElement('button');
      el.className = 'tile';
      el.setAttribute('data-pos', pos);
      el.setAttribute('data-id', pieceId);
      el.setAttribute('aria-label', `Tile ${pieceId+1}`);
      positionTileBG(el, pieceId);
      el.style.backgroundImage = `url("${imageURL}")`;
      el.addEventListener('click', onTileClick);
      boardEl.appendChild(el);
    }
  }

  function onTileClick(e) {
    const el = e.currentTarget;
    const pos = parseInt(el.getAttribute('data-pos'), 10);

    if (!firstSel) {
      firstSel = { idx: pos, el };
      el.classList.add('selected');
      return;
    }

    // If the same tile is clicked again, deselect
    if (firstSel.idx === pos) {
      firstSel.el.classList.remove('selected');
      firstSel = null;
      return;
    }

    // Allow swap between any two tiles (not just adjacent ones)
    doSwap(firstSel.idx, pos);
    firstSel.el.classList.remove('selected');
    firstSel = null;

    moves++;
    movesEl.textContent = `Moves: ${moves}`;
    updateScore();

    if (checkWin()) {
      stopTimer();
      showResultsScreen();
    }
  }

  function doSwap(a, b) {
    [tiles[a], tiles[b]] = [tiles[b], tiles[a]];
    // Rebuild the DOM to match the new tile arrangement
    syncDOMFromTiles();
  }



  function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  function checkWin() {
    return arraysEqual(tiles, correct);
  }

  function createConfetti() {
    confettiContainer.innerHTML = '';
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 2 + 's';
      confettiContainer.appendChild(confetti);
    }
  }

  function getRandomFacts(count = 3) {
    const shuffled = [...FAIRTRADE_FACTS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  function getPerformanceBasedFacts(score, moves) {
    let facts = [];
    
    // Add a congratulatory message based on performance
    if (score >= 150) {
      facts.push({
        keyword: "Excellent Performance!",
        fact: "You solved the puzzle with great efficiency! Just like Fairtrade producers who work efficiently to create sustainable livelihoods."
      });
    } else if (score >= 100) {
      facts.push({
        keyword: "Good Job!",
        fact: "Well done! Your persistence in solving the puzzle mirrors the determination of Fairtrade farmers and workers."
      });
    } else {
      facts.push({
        keyword: "Keep Going!",
        fact: "Every attempt makes you better! Fairtrade producers also learn and improve through continuous effort and community support."
      });
    }
    
    // Add 2 random Fairtrade facts
    const randomFacts = getRandomFacts(2);
    facts = facts.concat(randomFacts);
    
    return facts;
  }

  function displayFacts() {
    const factsContainer = document.getElementById('factsContainer');
    if (!factsContainer) return;
    
    const facts = getPerformanceBasedFacts(score, moves);
    factsContainer.innerHTML = '';
    
    facts.forEach((fact, index) => {
      const factElement = document.createElement('div');
      factElement.className = 'fact-item';
      factElement.innerHTML = `
        <div class="fact-keyword">${fact.keyword}</div>
        <div class="fact-text">${fact.fact}</div>
        <div class="fact-footer">
          <span class="fact-number">${index + 1} of ${facts.length}</span>
        </div>
      `;
      factsContainer.appendChild(factElement);
    });
  }

  function showResultsScreen() {
    // Set the completed image
    completedImg.src = imageURL;
    
    // Set final stats
    const elapsed = timeEl.textContent.replace('Time: ', '');
    finalTimeEl.textContent = elapsed;
    finalMovesEl.textContent = moves;
    finalScoreEl.textContent = score;
    
    // Create confetti
    createConfetti();
    
    // Display facts
    displayFacts();
    
    // Save score to database
    saveScore();
    
    // Show results dialog
    if (typeof resultsDlg.showModal === 'function') {
      resultsDlg.showModal();
    } else {
      alert('Results dialog not supported in this browser.');
    }
  }
  
  async function saveScore() {
    try {
      // Use the player name from the start screen
      if (playerName.trim() === '') {
        console.log('No player name available, score not saved');
        return;
      }
      
      // Save to Supabase
      const result = await LeaderboardDB.saveScore(playerName, 'fair-puzzle', score);
      
      if (result.success) {
        console.log('Score saved successfully for', playerName);
        // You can show a success message here
      } else {
        console.error('Failed to save score:', result.error);
      }
    } catch (error) {
      console.error('Error saving score:', error);
    }
  }

  // Controls
  eyeBtn.addEventListener('click', () => {
    if (typeof guideDlg.showModal === 'function') {
      guideDlg.showModal();
    } else {
      alert('Dialog not supported in this browser.');
    }
  });
  closeDlg.addEventListener('click', () => guideDlg.close());
  closeResultsDlg.addEventListener('click', () => resultsDlg.close());
  newGameBtn.addEventListener('click', () => {
    window.location.href = '../index.html';
  });

  // Initial
  // Sync BOARD_SIZE with CSS variable if you changed it
  const cssBoard = getComputedStyle(document.documentElement).getPropertyValue('--board-size').trim();
  if (cssBoard.endsWith('px')) BOARD_SIZE = parseFloat(cssBoard);
  setGridCSS(GRID);
  buildBoard();
  

})();
