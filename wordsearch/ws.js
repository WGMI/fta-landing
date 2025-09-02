(() => {
  // Get player name from URL parameters
  function getPlayerName() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('name') || 'Anonymous';
  }
  
  const playerName = getPlayerName();
  let gameStartTime = null;
  
  // Config
  const RAW_WORDS = [
    "Fairtrade","Twenty","Vision","Mission","Organizations","Farmers","Premium",
    "Future","Community","Projects","Jobs","Knowledge","ZeroHunger","Investment",
    "Social","Benefits","Empower","Members","Growth"
  ];

  // Fairtrade facts data
  const FAIRTRADE_FACTS = {
    "FAIRTRADE": {
      "keyword": "Fairtrade",
      "fact": "Fairtrade is about better prices, decent working conditions, local sustainability, and fair terms of trade for farmers and workers around the world, but particularly in lower income countries."
    },
    "TWENTY": {
      "keyword": "Twenty",
      "fact": "Fairtrade Africa is celebrating 20 years of driving Impact through trade."
    },
    "VISION": {
      "keyword": "Vision",
      "fact": "A world in which all producers can enjoy secure and sustainable livelihoods, fulfill their potential and decide on their future."
    },
    "MISSION": {
      "keyword": "Mission",
      "fact": "FTA's Mission: Transformative, Resilient & Impactful."
    },
    "ORGANIZATIONS": {
      "keyword": "Organizations",
      "fact": "Then & Now: Fairtrade Africa's network of Certified POs has grown by 75% over the last decade, from 404 in 2013 to 701 in 2023. *POs-Producer Organizations."
    },
    "FARMERS": {
      "keyword": "Farmers, Workers",
      "fact": "Growing Stronger Together: The number of farmers and workers benefiting from Fairtrade Africa has increased by over 50%, now supporting over 1.4 million people!"
    },
    "PREMIUM": {
      "keyword": "Premium",
      "fact": "The Fairtrade Premium is an extra sum of money farmers and workers can invest in community, environmental or business projects of their choice."
    },
    "FUTURE": {
      "keyword": "Future",
      "fact": "Investing in the Future: The Fairtrade Premiums earned by producers have more than quadrupled over the last decade, from €21.3M in 2013 to €90.2M in 2024!"
    },
    "COMMUNITY": {
      "keyword": "Community",
      "fact": "Feeding Communities: Fairtrade invests nearly 50% of its premiums into programs that help achieve Zero Hunger for everyone."
    },
    "PROJECTS": {
      "keyword": "Projects",
      "fact": "Building a Brighter Future: A remarkable 19% of premiums are used to create projects that help end poverty and improve livelihoods."
    },
    "JOBS": {
      "keyword": "Jobs",
      "fact": "Great Jobs: Hired labor organizations proudly use 33% of their premiums to create Decent Work and boost economic growth!"
    },
    "KNOWLEDGE": {
      "keyword": "Knowledge",
      "fact": "Investing in Knowledge: They are helping build a brighter future by dedicating 32% of their funds to provide Quality Education for their communities."
    },
    "ZEROHUNGER": {
      "keyword": "Zero Hunger",
      "fact": "Food for All: For small-scale farmers, Zero Hunger is a top goal! They invest 62% of their premiums in projects that put food on the table."
    },
    "INVESTMENT": {
      "keyword": "Investment",
      "fact": "Investing in Farms: Small Producer Organizations prioritize their operations, using 41% of their premium for Production costs like equipment, farm inputs, and infrastructure."
    },
    "SOCIAL": {
      "keyword": "Social",
      "fact": "Community First: Hired Labor organizations invest a massive 70% of their premiums directly into Social Investments, such as housing, health facilities, and schools."
    },
    "BENEFITS": {
      "keyword": "Benefits",
      "fact": "Direct Benefits: HL organizations ensure workers see a direct impact, using 16% of premiums for Financial Benefits like bonuses and pensions."
    },
    "EMPOWER": {
      "keyword": "Empower",
      "fact": "Empowering Workers: About 9% of the premium is used for Training and Empowerment of Workers, building skills for a better future by HL organizations."
    },
    "MEMBERS": {
      "keyword": "Members",
      "fact": "Financial Benefits: SPOs dedicate a significant portion to their members, with 21% of the premium going directly to Financial Benefits. *SPOs-Small Producer Organizations."
    },
    "GROWTH": {
      "keyword": "Growth",
      "fact": "Growing the Business: About 18% of the premium is used by SPOs for Business & Organizational Development, helping them improve their operations and become more competitive."
    }
  };
  const TIME_LIMIT_MS = 3 * 60 * 1000;
  const GRID_SIZE = 12;           // 12x12 for a 3-minute round
  const WORDS_PER_ROUND = 9;      // suggested: 8–10
  const DRAG_THRESHOLD = 6;       // px to decide tap vs drag

  // Utilities
  const up = s => s.toUpperCase().replace(/\s+/g,'');
  const pad2 = n => String(n).padStart(2,'0');
  const rand = n => Math.floor(Math.random()*n);
  const directions = [
    {dx: 1,  dy: 0}, {dx: -1, dy: 0},
    {dx: 0,  dy: 1}, {dx: 0,  dy: -1},
    {dx: 1,  dy: 1}, {dx: 1,  dy: -1},
    {dx: -1, dy: 1}, {dx: -1, dy: -1}
  ];

  // Balanced random word picker (excludes words longer than grid side)
  function pickBalancedSubset(words, n, maxLen) {
    const cleaned = words
      .map(w => ({display:w, target:up(w)}))
      .filter(w => w.target.length <= maxLen); // drops "Organizations" on 12x12

    const short = cleaned.filter(w => w.target.length <= 5);
    const med   = cleaned.filter(w => w.target.length >= 6 && w.target.length <= 7);
    const long  = cleaned.filter(w => w.target.length >= 8);

    const shuffle = a => { for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
    const take = (arr, k) => shuffle([...arr]).slice(0, Math.min(k, arr.length));

    const pick = [
      ...take(long, Math.min(2, n)),
      ...take(med, Math.min(4, Math.max(0, n-2))),
    ];
    const remaining = n - pick.length;
    const pool = short.length ? short : med.concat(long);
    return [...pick, ...take(pool, remaining)];
  }

  // Grid helpers
  function makeEmptyGrid(n){ return Array.from({length:n}, ()=> Array(n).fill(null)); }
  function inBounds(r,c,n=GRID_SIZE){ return r>=0 && r<n && c>=0 && c<n; }
  function canPlace(grid, word, r, c, dx, dy){
    for(let i=0;i<word.length;i++){
      const rr = r + dy*i, cc = c + dx*i;
      if(!inBounds(rr,cc,GRID_SIZE)) return false;
      if(grid[rr][cc] !== null && grid[rr][cc] !== word[i]) return false;
    }
    return true;
  }
  function placeWord(grid, word){
    for(let attempt=0; attempt<400; attempt++){
      const dir = directions[rand(directions.length)];
      const maxStartC = dir.dx === 1 ? GRID_SIZE - word.length : dir.dx === -1 ? GRID_SIZE - 1 : GRID_SIZE - 1;
      const minStartC = dir.dx === -1 ? word.length - 1 : 0;
      const maxStartR = dir.dy === 1 ? GRID_SIZE - word.length : dir.dy === -1 ? GRID_SIZE - 1 : GRID_SIZE - 1;
      const minStartR = dir.dy === -1 ? word.length - 1 : 0;

      const r0 = Math.floor(Math.random()*(maxStartR - minStartR + 1)) + minStartR;
      const c0 = Math.floor(Math.random()*(maxStartC - minStartC + 1)) + minStartC;

      if(canPlace(grid, word, r0, c0, dir.dx, dir.dy)){
        for(let i=0;i<word.length;i++){
          grid[r0 + dir.dy*i][c0 + dir.dx*i] = word[i];
        }
        return true;
      }
    }
    return false;
  }
  function fillRandom(grid){
    for(let r=0;r<GRID_SIZE;r++){
      for(let c=0;c<GRID_SIZE;c++){
        if(!grid[r][c]) grid[r][c] = String.fromCharCode(65 + rand(26));
      }
    }
  }

  // DOM refs (these IDs exist in ws.html)
  const gridEl = document.getElementById('grid');
  const wordListEl = document.getElementById('wordList');
  const timerEl = document.getElementById('timer');
  const progressEl = document.getElementById('progress');
  const scoreDisplayEl = document.getElementById('score-display');
  const overlayEl = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayMsg = document.getElementById('overlayMsg');
  const restartBtn = document.getElementById('restartBtn');
  const playAgainBtn = document.getElementById('playAgain');

  // State
  let words = [];                 // {display, target, found}
  let foundTargets = new Set();
  let gridLetters = [];           // 2D chars
  let cellEls = [];               // 2D elements

  // Drag selection (preview-based)
  let isPointerDown = false;
  let dragging = false;
  let dragStartEl = null;
  let startCell = null;           // {r,c} for drag
  let lastPreview = [];           // path for drag
  let startXY = {x:0,y:0};

  // Tap-by-tile selection
  let tapPath = [];               // array of {r,c}
  let tapDir = null;              // {dx,dy} once locked

  // Timer / flow
  let timerId = null;
  let endAt = 0;
  let gameOver = false;

  // Rendering
  function buildGridDom(){
    gridEl.style.setProperty('--size', GRID_SIZE);
    gridEl.innerHTML = '';
    cellEls = Array.from({length:GRID_SIZE}, ()=> Array(GRID_SIZE).fill(null));
    for(let r=0;r<GRID_SIZE;r++){
      for(let c=0;c<GRID_SIZE;c++){
        const el = document.createElement('div');
        el.className = 'cell';
        el.textContent = gridLetters[r][c];
        el.dataset.r = r;
        el.dataset.c = c;
        gridEl.appendChild(el);
        cellEls[r][c] = el;
      }
    }
  }
  function buildWordList(){
    wordListEl.innerHTML = '';
    for(const w of words){
      const chip = document.createElement('span');
      chip.className = 'word';
      chip.dataset.target = w.target;
      chip.textContent = w.display;
      wordListEl.appendChild(chip);
    }
  }

  // Helpers
  function updateProgress(){ 
    progressEl.textContent = `${foundTargets.size} / ${words.length}`; 
    updateScoreDisplay();
  }
  
  function updateScoreDisplay() {
    if (foundTargets.size === words.length) {
      // Game completed, show final score
      const finalScore = calculateScore();
      //scoreDisplayEl.textContent = `Final Score: ${finalScore}`;
      // scoreDisplayEl.style.display = 'inline-block';
    } else {
      // Show potential score based on current progress
      const potentialScore = calculatePotentialScore();
      //scoreDisplayEl.textContent = `Potential Score: ${potentialScore}`;
      // scoreDisplayEl.style.display = 'inline-block';
    }
  }
  
  function calculatePotentialScore() {
    if (!gameStartTime) return 0;
    
    const timeTaken = Date.now() - gameStartTime;
    const timeInSeconds = timeTaken / 1000;
    
    // Base score: 1000 points
    let score = 1000;
    
    // Time bonus: faster completion = more points
    const maxTimeBonus = 500;
    const minTimeBonus = 50;
    const maxTime = 180; // 3 minutes in seconds
    const minTime = 30;  // 30 seconds
    
    let timeBonus;
    if (timeInSeconds <= minTime) {
      timeBonus = maxTimeBonus;
    } else if (timeInSeconds >= maxTime) {
      timeBonus = minTimeBonus;
    } else {
      // Linear interpolation between min and max time bonus
      const timeRatio = (maxTime - timeInSeconds) / (maxTime - minTime);
      timeBonus = minTimeBonus + (maxTimeBonus - minTimeBonus) * timeRatio;
    }
    
    score += Math.round(timeBonus);
    
    // Word length bonus: longer words = more points
    const wordLengthBonus = words.reduce((total, word) => {
      return total + (word.target.length * 10);
    }, 0);
    
    score += wordLengthBonus;
    
    return score;
  }
  function clearDragPreview(){
    for(const p of lastPreview){ cellEls[p.r][p.c].classList.remove('selecting'); }
    lastPreview = [];
  }
  function clearTapSelection(){
    for(const p of tapPath){ cellEls[p.r][p.c].classList.remove('selecting'); }
    tapPath = [];
    tapDir = null;
  }
  function computePath(sr,sc,er,ec){
    const dr = er - sr, dc = ec - sc;
    let stepr=0, stepc=0, steps=0;
    if(dr === 0 && dc !== 0){ stepr=0; stepc=Math.sign(dc); steps=Math.abs(dc)+1; }
    else if(dc === 0 && dr !== 0){ stepr=Math.sign(dr); stepc=0; steps=Math.abs(dr)+1; }
    else if(Math.abs(dr) === Math.abs(dc) && dr !== 0){ stepr=Math.sign(dr); stepc=Math.sign(dc); steps=Math.abs(dr)+1; }
    else return null;
    const out = [];
    for(let i=0;i<steps;i++){
      const rr = sr + stepr*i, cc = sc + stepc*i;
      if(!inBounds(rr,cc,GRID_SIZE)) return null;
      out.push({r:rr,c:cc});
    }
    return out;
  }
  function lettersFromPath(path){ return path.map(p => gridLetters[p.r][p.c]).join(''); }

  function markWordFound(target, path){
    if(foundTargets.has(target)) return;
    foundTargets.add(target);
    for(const {r,c} of path){
      cellEls[r][c].classList.remove('selecting');
      cellEls[r][c].classList.add('locked');
    }
    const chip = [...wordListEl.children].find(el => el.dataset.target === target);
    if(chip) chip.classList.add('found');
    updateProgress();
    if(foundTargets.size === words.length) endGame(true);
  }

  // Tap-by-tile logic
  function handleTapCell(el){
    if(gameOver) return;
    const r = Number(el.dataset.r), c = Number(el.dataset.c);

    // Undo step if tapping the previous cell
    if(tapPath.length >= 2){
      const prev = tapPath[tapPath.length - 2];
      const cur  = tapPath[tapPath.length - 1];
      if(prev.r === r && prev.c === c){
        // remove last
        cellEls[cur.r][cur.c].classList.remove('selecting');
        tapPath.pop();
        if(tapPath.length < 2) tapDir = null;
        return;
      }
    }

    if(tapPath.length === 0){
      tapPath = [{r,c}];
      cellEls[r][c].classList.add('selecting');
      return;
    }

    const last = tapPath[tapPath.length - 1];
    const dr = r - last.r, dc = c - last.c;
    const stepDy = Math.sign(dr), stepDx = Math.sign(dc);
    const adjacent = Math.abs(dr) <= 1 && Math.abs(dc) <= 1 && !(dr === 0 && dc === 0);

    if(!adjacent){
      // invalid jump: start fresh from this cell
      clearTapSelection();
      tapPath = [{r,c}];
      cellEls[r][c].classList.add('selecting');
      return;
    }

    if(tapPath.length === 1){
      // lock direction at second tile
      tapDir = {dx: stepDx, dy: stepDy};
    } else {
      // must follow locked direction and be exactly one step
      if(!tapDir || stepDx !== tapDir.dx || stepDy !== tapDir.dy){
        clearTapSelection();
        tapPath = [{r,c}];
        cellEls[r][c].classList.add('selecting');
        return;
      }
    }

    // extend path
    tapPath.push({r,c});
    cellEls[r][c].classList.add('selecting');

    // check for a word on each extension
    const word = lettersFromPath(tapPath);
    const rev  = word.split('').reverse().join('');
    const match = words.find(w => !w.found && (w.target === word || w.target === rev));
    if(match){
      match.found = true;
      markWordFound(match.target, tapPath);
      clearTapSelection(); // reset for next word
    }
  }

  // Timer & flow
  function timeLoop(){
    const msLeft = Math.max(0, endAt - Date.now());
    const sLeft = Math.floor(msLeft / 1000);
    const m = Math.floor(sLeft / 60), s = sLeft % 60;
    timerEl.textContent = `${pad2(m)}:${pad2(s)}`;
    if(msLeft <= 0) endGame(false);
  }
  function startTimer(){
    clearInterval(timerId);
    gameStartTime = Date.now(); // Record when the game starts
    endAt = Date.now() + TIME_LIMIT_MS;
    timerId = setInterval(timeLoop, 250);
    timeLoop();
  }
  function setInteractivity(enabled){
    gridEl.style.pointerEvents = enabled ? 'auto' : 'none';
    restartBtn.disabled = !enabled;
    [...gridEl.children].forEach(c => c.classList.toggle('dimmed', !enabled));
  }
  function getFactsForFoundWords() {
    const foundWords = words.filter(word => word.found);
    const facts = [];
    
    foundWords.forEach(word => {
      const factKey = word.target.toUpperCase();
      if (FAIRTRADE_FACTS[factKey]) {
        facts.push(FAIRTRADE_FACTS[factKey]);
      }
    });
    
    return facts;
  }
  
  function displayFacts() {
    const factsSection = document.getElementById('factsSection');
    const factsContainer = document.getElementById('factsContainer');
    
    if (!factsSection || !factsContainer) {
      console.error('Facts elements not found');
      return;
    }
    
    const facts = getFactsForFoundWords();
    
    if (facts.length === 0) {
      factsSection.style.display = 'none';
      return;
    }
    
    factsContainer.innerHTML = '';
    
    facts.forEach((fact, index) => {
      const factElement = document.createElement('div');
      factElement.className = 'fact-item';
      factElement.innerHTML = `
        <div class="fact-keyword">${fact.keyword}</div>
        <div class="fact-text">${fact.fact}</div>
      `;
      factsContainer.appendChild(factElement);
    });
    
    factsSection.style.display = 'block';
  }

  function endGame(won){
    if(gameOver) return;
    gameOver = true;
    clearInterval(timerId);
    setInteractivity(false);
    // clear any in-progress tap highlights
    clearDragPreview();
    clearTapSelection();
    
    // Calculate and save score
    if (won) {
      const score = calculateScore();
      saveScore(score);
      // Display facts for found words
      displayFacts();
    } else {
      // Hide facts section if player didn't win
      const factsSection = document.getElementById('factsSection');
      if (factsSection) {
        factsSection.style.display = 'none';
      }
    }
    
    overlayTitle.textContent = won ? 'You found them all! 🎉' : "Time's up!";
    overlayMsg.textContent = won
      ? 'Awesome spotting. Fancy a fresh challenge?'
      : 'Great effort. Try again?';
    overlayEl.classList.add('active');
  }
  
  function calculateScore() {
    if (!gameStartTime) return 0;
    
    const timeTaken = Date.now() - gameStartTime;
    const timeInSeconds = timeTaken / 1000;
    
    // Base score: 1000 points
    let score = 1000;
    
    // Time bonus: faster completion = more points
    // Maximum time bonus: 500 points for completing in under 30 seconds
    // Minimum time bonus: 50 points for completing in 3 minutes
    const maxTimeBonus = 500;
    const minTimeBonus = 50;
    const maxTime = 180; // 3 minutes in seconds
    const minTime = 30;  // 30 seconds
    
    let timeBonus;
    if (timeInSeconds <= minTime) {
      timeBonus = maxTimeBonus;
    } else if (timeInSeconds >= maxTime) {
      timeBonus = minTimeBonus;
    } else {
      // Linear interpolation between min and max time bonus
      const timeRatio = (maxTime - timeInSeconds) / (maxTime - minTime);
      timeBonus = minTimeBonus + (maxTimeBonus - minTimeBonus) * timeRatio;
    }
    
    score += Math.round(timeBonus);
    
    // Word length bonus: longer words = more points
    const wordLengthBonus = words.reduce((total, word) => {
      return total + (word.target.length * 10);
    }, 0);
    
    score += wordLengthBonus;
    
    return score;
  }
  
  async function saveScore(score) {
    try {
      if (playerName.trim() === '') {
        console.log('No player name available, score not saved');
        return;
      }
      
      // Save to Supabase
      const result = await LeaderboardDB.saveScore(playerName, 'fair-hunt', score);
      
      if (result.success) {
        console.log('Score saved successfully for', playerName, ':', score);
        // You can show a success message here
      } else {
        console.error('Failed to save score:', result.error);
      }
    } catch (error) {
      console.error('Error saving score:', error);
    }
  }

  function initGame(){
    gameOver = false;
    foundTargets.clear();
    clearDragPreview();
    clearTapSelection();

    // Hide facts section for new game
    const factsSection = document.getElementById('factsSection');
    if (factsSection) {
      factsSection.style.display = 'none';
    }

    // Pick words, build puzzle
    words = pickBalancedSubset(RAW_WORDS, WORDS_PER_ROUND, GRID_SIZE);
    const grid = makeEmptyGrid(GRID_SIZE);
    const sorted = [...words].sort((a,b)=> b.target.length - a.target.length);
    for(const w of sorted){
      if(!placeWord(grid, w.target)){
        // If a placement fails (rare), restart building the round
        return initGame();
      }
    }
    fillRandom(grid);
    gridLetters = grid;

    // Render & start
    buildGridDom();
    buildWordList();
    updateProgress();
    startTimer();
    setInteractivity(true);
    overlayEl.classList.remove('active');
    
    // Show score display
    scoreDisplayEl.style.display = 'inline-block';
  }

  // Pointer interactions with drag threshold
  gridEl.addEventListener('pointerdown', (e) => {
    if(gameOver) return;
    const t = e.target;
    if(!t.classList.contains('cell')) return;
    isPointerDown = true;
    dragging = false;
    dragStartEl = t;
    startXY = { x: e.clientX, y: e.clientY };
    // do NOT add selecting class yet (wait until drag confirmed)
  });

  gridEl.addEventListener('pointermove', (e) => {
    if(!isPointerDown || gameOver) return;
    const dx = e.clientX - startXY.x;
    const dy = e.clientY - startXY.y;
    if(!dragging && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)){
      // Start drag selection
      dragging = true;
      startCell = { r: Number(dragStartEl.dataset.r), c: Number(dragStartEl.dataset.c) };
      dragStartEl.classList.add('selecting');
      lastPreview = [startCell];
    }
    if(dragging){
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if(!el || !el.classList || !el.classList.contains('cell')) return;
      // preview path from startCell to current cell
      const er = Number(el.dataset.r), ec = Number(el.dataset.c);
      const path = computePath(startCell.r, startCell.c, er, ec);
      clearDragPreview();
      if(!path) return;
      lastPreview = path;
      for(const p of path){ cellEls[p.r][p.c].classList.add('selecting'); }
    }
  });

  const endPointer = (e) => {
    if(!isPointerDown) return;
    isPointerDown = false;

    if(dragging){
      dragging = false;
      // finalize drag selection
      if(!startCell || lastPreview.length === 0){ clearDragPreview(); return; }
      const word = lettersFromPath(lastPreview);
      const rev = word.split('').reverse().join('');
      const match = words.find(w => !w.found && (w.target === word || w.target === rev));
      if(match){
        match.found = true;
        markWordFound(match.target, lastPreview);
      }
      clearDragPreview();
      startCell = null;
    } else {
      // treat as a TAP step
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if(el && el.classList && el.classList.contains('cell')){
        handleTapCell(el);
      }
    }
  };
  gridEl.addEventListener('pointerup', endPointer);
  gridEl.addEventListener('pointercancel', endPointer);

  // Controls
  restartBtn.addEventListener('click', initGame);
  //Back to fta-landing page
  playAgainBtn.addEventListener('click', () => {
    window.location.href = '../index.html';
  });

  // Boot
  initGame();
})();
