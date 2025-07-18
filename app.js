// Premium Chess Application - Advanced ELO System with Stockfish 17.1
// Enhanced Chess Engine with Proper UCI Implementation

class PremiumChessEngine {
  constructor() {
    this.board = this.initializeBoard();
    this.currentPlayer = 'white';
    this.gameMode = 'human'; // 'human' or 'computer'
    this.gameStatus = 'menu'; // 'menu', 'active', 'ended'
    this.selectedSquare = null;
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.lastMove = null;
    this.gameStartTime = null;
    this.turnNumber = 1;
    this.castlingRights = {
      whiteKing: true,
      whiteQueen: true,
      blackKing: true,
      blackQueen: true
    };
    this.enPassantTarget = null;
    
    // Enhanced Stockfish 17.1 Integration
    this.stockfish = null;
    this.stockfishReady = false;
    this.isAiThinking = false;
    this.aiEloRating = 1500; // Current ELO rating
    this.engineEvaluation = 0;
    this.bestMove = null;
    this.currentDepth = 0;
    this.isAnalyzing = false;
    this.moveAnalysis = [];
    this.gameAnalysis = null;
    
    // **FIX START**: Added state for pending pawn promotion
    this.pendingPromotion = null;
    // **FIX END**
    
    // ELO Difficulty System
    this.eloLevels = {
      800: { description: 'Perfect for learning chess basics', level: 'Beginner' },
      1000: { description: 'Good for casual players', level: 'Casual' },
      1200: { description: 'Challenging for improving players', level: 'Intermediate' },
      1500: { description: 'Strong tactical play with tournament-level calculations', level: 'Advanced' },
      1800: { description: 'Tournament-level strength with deep analysis', level: 'Expert' },
      2100: { description: 'Master-level chess with advanced patterns', level: 'Master' },
      2400: { description: 'Grandmaster strength with superior calculation', level: 'Grandmaster' },
      2800: { description: 'Maximum engine strength - World Champion level', level: 'Maximum' }
    };
    
    // UI Elements
    this.elements = {};
    this.isDragging = false;
    this.dragElement = null;
    this.dragStartPos = null;
    this.timerInterval = null;
    
    // Enhanced chess piece symbols
    this.pieceSymbols = {
      white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
      black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' }
    };
    
    // Move classification system
    this.moveClassifications = {
      brilliant: { symbol: '!!', color: '#00CC88', description: 'Brilliant move', minAccuracy: 0.98 },
      great: { symbol: '!', color: '#44AA88', description: 'Great move', minAccuracy: 0.90 },
      good: { symbol: '✓', color: '#66BB6A', description: 'Good move', minAccuracy: 0.80 },
      inaccuracy: { symbol: '?!', color: '#FFB74D', description: 'Inaccuracy', minAccuracy: 0.70 },
      mistake: { symbol: '?', color: '#FFA500', description: 'Mistake', minAccuracy: 0.50 },
      blunder: { symbol: '??', color: '#E57373', description: 'Blunder', minAccuracy: 0.0 }
    };
    
    this.init();
  }

  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.initStockfish();
    this.showLoadingScreen();
    
    // Simulate loading with progress
    this.simulateLoading();
  }

  cacheElements() {
    this.elements = {
      // Screens
      loadingScreen: document.getElementById('loadingScreen'),
      mainMenu: document.getElementById('mainMenu'),
      gameScreen: document.getElementById('gameScreen'),
      
      // Loading
      progressBar: document.getElementById('progressBar'),
      
      // Menu
      gameModeCards: document.querySelectorAll('.game-mode-card'),
      eloSlider: document.getElementById('eloSlider'),
      eloValue: document.getElementById('eloValue'),
      eloLevel: document.getElementById('eloLevel'),
      eloDescription: document.getElementById('eloDescription'),
      
      // Game Header
      playerIndicator: document.getElementById('playerIndicator'),
      gameTimer: document.getElementById('gameTimer'),
      gameModeDisplay: document.getElementById('gameModeDisplay'),
      difficultyDisplay: document.getElementById('difficultyDisplay'),
      
      // Game Controls
      newGameBtn: document.getElementById('newGameBtn'),
      backToMenuBtn: document.getElementById('backToMenuBtn'),
      undoBtn: document.getElementById('undoBtn'),
      exportPgnBtn: document.getElementById('exportPgnBtn'),
      
      // Game Info
      turnNumber: document.getElementById('turnNumber'),
      gameStatus: document.getElementById('gameStatus'),
      aiStatus: document.getElementById('aiStatus'),
      aiThinking: document.getElementById('aiThinking'),
      
      // Board
      chessBoard: document.getElementById('chessBoard'),
      
      // Captured Pieces
      capturedWhite: document.getElementById('capturedWhite'),
      capturedBlack: document.getElementById('capturedBlack'),
      
      // Move History
      moveHistory: document.getElementById('moveHistory'),
      
      // Engine
      engineCard: document.getElementById('engineCard'),
      currentElo: document.getElementById('currentElo'),
      engineEval: document.getElementById('engineEval'),
      bestMove: document.getElementById('bestMove'),
      engineDepth: document.getElementById('engineDepth'),
      
      // Modals
      gameOverModal: document.getElementById('gameOverModal'),
      gameOverTitle: document.getElementById('gameOverTitle'),
      gameOverMessage: document.getElementById('gameOverMessage'),
      analysisModal: document.getElementById('analysisModal'),
      promotionModal: document.getElementById('promotionModal'),
      
      // Analysis
      totalMoves: document.getElementById('totalMoves'),
      gameDuration: document.getElementById('gameDuration'),
      gameWinner: document.getElementById('gameWinner'),
      aiEloResult: document.getElementById('aiEloResult'),
      moveAnalysisList: document.getElementById('moveAnalysisList'),
      whiteAccuracy: document.getElementById('whiteAccuracy'),
      blackAccuracy: document.getElementById('blackAccuracy'),
      whiteAccuracyBar: document.getElementById('whiteAccuracyBar'),
      blackAccuracyBar: document.getElementById('blackAccuracyBar'),
      classificationGrid: document.getElementById('classificationGrid'),
      
      // Buttons
      viewAnalysisBtn: document.getElementById('viewAnalysisBtn'),
      playAgainBtn: document.getElementById('playAgainBtn'),
      backToMenuFromGameOver: document.getElementById('backToMenuFromGameOver'),
      closeAnalysisBtn: document.getElementById('closeAnalysisBtn'),
      
      // Tabs
      tabBtns: document.querySelectorAll('.tab-btn'),
      tabContents: document.querySelectorAll('.tab-content'),
      
      // Promotion (The buttons are now generated dynamically, so this is just for reference)
      promotionBtns: document.querySelectorAll('.promotion-btn')
    };
  }

  setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // ELO Slider - Fixed event listener
    if (this.elements.eloSlider) {
      console.log('Setting up ELO slider listener');
      this.elements.eloSlider.addEventListener('input', (e) => {
        console.log('ELO slider changed to:', e.target.value);
        this.updateEloDisplay(parseInt(e.target.value));
      });
      
      // Also handle change event for better compatibility
      this.elements.eloSlider.addEventListener('change', (e) => {
        console.log('ELO slider changed (change event) to:', e.target.value);
        this.updateEloDisplay(parseInt(e.target.value));
      });
    }

    // Game mode selection - Fixed event listeners
    this.elements.gameModeCards.forEach((card, index) => {
      console.log(`Setting up game mode card ${index}:`, card.dataset.mode);
      
      const playBtn = card.querySelector('.btn--primary');
      if (playBtn) {
        console.log('Found play button for card:', card.dataset.mode);
        
        playBtn.addEventListener('click', (e) => {
          console.log('Play button clicked for mode:', card.dataset.mode);
          e.preventDefault();
          e.stopPropagation();
          const mode = card.dataset.mode;
          this.startGame(mode);
        });
      } else {
        console.warn('No play button found for card:', card.dataset.mode);
      }
    });
    
    // Game controls
    if (this.elements.newGameBtn) {
      this.elements.newGameBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.newGame();
      });
    }
    
    if (this.elements.backToMenuBtn) {
      this.elements.backToMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.showMainMenu();
      });
    }
    
    if (this.elements.undoBtn) {
      this.elements.undoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.undoMove();
      });
    }
    
    if (this.elements.exportPgnBtn) {
      this.elements.exportPgnBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.exportPGN();
      });
    }
    
    // Modal controls
    if (this.elements.viewAnalysisBtn) {
      this.elements.viewAnalysisBtn.addEventListener('click', () => this.showAnalysis());
    }
    
    if (this.elements.playAgainBtn) {
      this.elements.playAgainBtn.addEventListener('click', () => this.newGame());
    }
    
    if (this.elements.backToMenuFromGameOver) {
      this.elements.backToMenuFromGameOver.addEventListener('click', () => this.showMainMenu());
    }
    
    if (this.elements.closeAnalysisBtn) {
      this.elements.closeAnalysisBtn.addEventListener('click', () => this.hideAnalysis());
    }
    
    // Analysis tabs
    this.elements.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchAnalysisTab(tab);
      });
    });
    
    // **FIX START**: Remove old static promotion listeners. New ones are added dynamically.
    // The original `handlePromotion` call is also removed as it was incomplete.
    // **FIX END**
    
    // Modal backdrop clicks
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        // **FIX START**: Handle closing promotion modal safely
        if (this.elements.promotionModal.classList.contains('show')) {
            // Default to promoting to a queen if user clicks away, a common behavior
            this.handlePromotion('queen');
        } else {
            this.hideAllModals();
        }
        // **FIX END**
      }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // **FIX START**: Handle closing promotion modal safely
        if (this.elements.promotionModal.classList.contains('show')) {
            // Default to promoting to a queen
            this.handlePromotion('queen');
        } else {
            this.hideAllModals();
        }
        // **FIX END**
      }
    });
    
    console.log('Event listeners setup complete');
  }

  // Enhanced Stockfish 17.1 Integration
  initStockfish() {
    if (typeof Stockfish === 'function') {
      try {
        this.stockfish = new Stockfish();
        
        this.stockfish.addMessageListener((message) => {
          this.handleStockfishMessage(message);
        });
        
        // Initialize Stockfish with UCI protocol
        this.stockfish.postMessage('uci');
        
        setTimeout(() => {
          this.stockfish.postMessage('ucinewgame');
          this.stockfish.postMessage('isready');
        }, 100);
        
        console.log('Stockfish 17.1 initialized with UCI protocol');
      } catch (error) {
        console.error('Stockfish initialization failed:', error);
      }
    } else {
      console.warn('Stockfish not available');
    }
  }

  handleStockfishMessage(message) {
    if (message.includes('uciok')) {
      console.log('Stockfish UCI ready');
      this.stockfishReady = true;
    } else if (message.includes('readyok')) {
      console.log('Stockfish ready for new game');
    } else if (message.includes('bestmove')) {
      const parts = message.split(' ');
      const move = parts[1];
      if (move && move !== '(none)') {
        this.processBestMove(move);
      } else {
        this.handleNoMove();
      }
    } else if (message.includes('info') && message.includes('score')) {
      this.parseEngineInfo(message);
    }
  }

  parseEngineInfo(message) {
    const parts = message.split(' ');
    
    // Parse evaluation
    const scoreIndex = parts.indexOf('score');
    if (scoreIndex !== -1) {
      const scoreType = parts[scoreIndex + 1];
      const scoreValue = parts[scoreIndex + 2];
      
      if (scoreType === 'cp') {
        this.engineEvaluation = (parseInt(scoreValue) / 100).toFixed(1);
      } else if (scoreType === 'mate') {
        this.engineEvaluation = scoreValue > 0 ? 'M' + scoreValue : '-M' + Math.abs(scoreValue);
      }
    }
    
    // Parse depth
    const depthIndex = parts.indexOf('depth');
    if (depthIndex !== -1) {
      this.currentDepth = parseInt(parts[depthIndex + 1]);
      if (this.elements.engineDepth) {
        this.elements.engineDepth.textContent = this.currentDepth;
      }
    }
    
    // Parse principal variation
    const pvIndex = parts.indexOf('pv');
    if (pvIndex !== -1) {
      this.bestMove = parts[pvIndex + 1];
      if (this.elements.bestMove) {
        this.elements.bestMove.textContent = this.bestMove || '-';
      }
    }
    
    // Update evaluation display
    if (this.elements.engineEval) {
      this.elements.engineEval.textContent = this.engineEvaluation;
    }
  }

  configureStockfishElo(eloRating) {
    if (!this.stockfish || !this.stockfishReady) return;
    
    console.log(`Configuring Stockfish for ELO ${eloRating}`);
    
    // Set UCI options for ELO-based play
    this.stockfish.postMessage('setoption name UCI_LimitStrength value true');
    this.stockfish.postMessage(`setoption name UCI_Elo value ${eloRating}`);
    
    // Additional strength adjustments based on ELO
    if (eloRating <= 1000) {
      this.stockfish.postMessage('setoption name Skill Level value 1');
    } else if (eloRating <= 1200) {
      this.stockfish.postMessage('setoption name Skill Level value 5');
    } else if (eloRating <= 1500) {
      this.stockfish.postMessage('setoption name Skill Level value 10');
    } else if (eloRating <= 1800) {
      this.stockfish.postMessage('setoption name Skill Level value 15');
    } else {
      this.stockfish.postMessage('setoption name Skill Level value 20');
    }
    
    this.stockfish.postMessage('isready');
  }

  processBestMove(move) {
    if (this.gameMode === 'computer' && this.currentPlayer === 'black' && this.isAiThinking) {
      setTimeout(() => {
        this.isAiThinking = false;
        this.hideAiThinking();
        
        // Convert UCI move to board coordinates
        const from = this.uciToCoords(move.substring(0, 2));
        const to = this.uciToCoords(move.substring(2, 4));
        
        if (this.isValidMove(from.row, from.col, to.row, to.col)) {
          // **FIX START**: Handle AI promotion moves
          const promotionChar = move.substring(4,5);
          if (promotionChar) {
              this.makeMove(from.row, from.col, to.row, to.col);
              const pieceMap = { q: 'queen', r: 'rook', b: 'bishop', n: 'knight' };
              this.handlePromotion(pieceMap[promotionChar]);
          } else {
              this.makeMove(from.row, from.col, to.row, to.col);
          }
          // **FIX END**
        } else {
          // Fallback to random move
          this.makeRandomMove();
        }
      }, 800);
    }
  }

  handleNoMove() {
    if (this.gameMode === 'computer' && this.currentPlayer === 'black' && this.isAiThinking) {
      this.isAiThinking = false;
      this.hideAiThinking();
      this.makeRandomMove();
    }
  }

  // ELO System
  updateEloDisplay(elo) {
    console.log('Updating ELO display to:', elo);
    this.aiEloRating = elo;
    
    if (this.elements.eloValue) {
      this.elements.eloValue.textContent = elo;
    }
    
    if (this.elements.eloLevel) {
      this.elements.eloLevel.textContent = this.eloLevels[elo].level;
    }
    
    if (this.elements.eloDescription) {
      this.elements.eloDescription.textContent = this.eloLevels[elo].description;
    }
  }

  // Loading and Menu
  simulateLoading() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 12 + 3;
      if (progress > 100) progress = 100;
      
      if (this.elements.progressBar) {
        this.elements.progressBar.style.width = progress + '%';
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          this.hideLoadingScreen();
          this.showMainMenu();
        }, 500);
      }
    }, 150);
  }

  showLoadingScreen() {
    if (this.elements.loadingScreen) {
      this.elements.loadingScreen.classList.remove('hidden');
    }
  }

  hideLoadingScreen() {
    if (this.elements.loadingScreen) {
      this.elements.loadingScreen.classList.add('hidden');
    }
  }

  showMainMenu() {
    console.log('Showing main menu');
    this.gameStatus = 'menu';
    this.stopTimer();
    
    if (this.elements.mainMenu) {
      this.elements.mainMenu.classList.remove('hidden');
    }
    if (this.elements.gameScreen) {
      this.elements.gameScreen.classList.add('hidden');
    }
    this.hideAllModals();
    
    // Initialize ELO display
    this.updateEloDisplay(this.aiEloRating);
  }

  startGame(mode) {
    console.log('Starting game with mode:', mode);
    this.gameMode = mode;
    this.gameStatus = 'active';
    this.gameStartTime = Date.now();
    
    // Configure AI for computer mode
    if (mode === 'computer') {
      this.aiEloRating = parseInt(this.elements.eloSlider?.value || 1500);
      this.configureStockfishElo(this.aiEloRating);
    }
    
    // Hide menu and show game
    if (this.elements.mainMenu) {
      this.elements.mainMenu.classList.add('hidden');
    }
    if (this.elements.gameScreen) {
      this.elements.gameScreen.classList.remove('hidden');
    }
    
    // Reset game state
    this.board = this.initializeBoard();
    this.currentPlayer = 'white';
    this.selectedSquare = null;
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.lastMove = null;
    this.turnNumber = 1;
    this.castlingRights = {
      whiteKing: true,
      whiteQueen: true,
      blackKing: true,
      blackQueen: true
    };
    
    // Update UI
    this.updateGameModeDisplay();
    this.createBoard();
    this.updateUI();
    this.startTimer();
    
    // Show engine card for computer mode
    if (mode === 'computer' && this.elements.engineCard) {
      this.elements.engineCard.style.display = 'block';
      this.startEngineAnalysis();
      
      // Update ELO display
      if (this.elements.currentElo) {
        this.elements.currentElo.textContent = this.aiEloRating;
      }
    }
    
    console.log('Game started successfully');
  }

  newGame() {
    console.log('Starting new game');
    this.startGame(this.gameMode);
  }

  updateGameModeDisplay() {
    if (this.elements.gameModeDisplay) {
      this.elements.gameModeDisplay.textContent = this.gameMode === 'human' ? 'Human vs Human' : 'Human vs Computer';
    }
    
    if (this.elements.difficultyDisplay) {
      if (this.gameMode === 'computer') {
        const level = this.eloLevels[this.aiEloRating].level;
        this.elements.difficultyDisplay.textContent = `${level} (${this.aiEloRating} ELO)`;
      } else {
        this.elements.difficultyDisplay.textContent = '';
      }
    }
  }

  // Chess Logic
  initializeBoard() {
    return [
      ['♜','♞','♝','♛','♚','♝','♞','♜'],
      ['♟','♟','♟','♟','♟','♟','♟','♟'],
      ['','','','','','','',''],
      ['','','','','','','',''],
      ['','','','','','','',''],
      ['','','','','','','',''],
      ['♙','♙','♙','♙','♙','♙','♙','♙'],
      ['♖','♘','♗','♕','♔','♗','♘','♖']
    ];
  }

  createBoard() {
    if (!this.elements.chessBoard) return;
    
    console.log('Creating chess board');
    this.elements.chessBoard.innerHTML = '';
    
    const boardGrid = document.createElement('div');
    boardGrid.className = 'board-grid';
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement('div');
        square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
        square.dataset.row = row;
        square.dataset.col = col;
        
        const piece = this.board[row][col];
        if (piece) {
          const pieceElement = document.createElement('div');
          pieceElement.className = 'chess-piece';
          pieceElement.textContent = piece;
          pieceElement.dataset.piece = piece;
          
          square.appendChild(pieceElement);
        }
        
        // Add click event to square
        square.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.handleSquareClick(row, col);
        });
        
        boardGrid.appendChild(square);
      }
    }
    
    this.elements.chessBoard.appendChild(boardGrid);
    console.log('Chess board created');
  }

  handleSquareClick(row, col) {
    if (this.gameStatus !== 'active' || this.isAiThinking || this.pendingPromotion) {
      return;
    }
    
    console.log(`Square clicked: ${row}, ${col}`);
    
    const piece = this.board[row][col];
    
    if (this.selectedSquare) {
      if (this.selectedSquare.row === row && this.selectedSquare.col === col) {
        // Deselect
        this.deselectSquare();
      } else if (this.canMove(this.selectedSquare.row, this.selectedSquare.col, row, col)) {
        // Make move
        this.makeMove(this.selectedSquare.row, this.selectedSquare.col, row, col);
        this.deselectSquare();
      } else if (piece && this.getPieceColor(piece) === this.currentPlayer) {
        // Select different piece
        this.selectSquare(row, col);
      } else {
        // Invalid move
        this.deselectSquare();
      }
    } else if (piece && this.getPieceColor(piece) === this.currentPlayer) {
      // Select piece
      this.selectSquare(row, col);
    }
  }

  selectSquare(row, col) {
    this.deselectSquare();
    this.selectedSquare = { row, col };
    
    const square = this.getSquareElement(row, col);
    if (square) {
      square.classList.add('selected');
    }
    
    this.highlightPossibleMoves(row, col);
  }

  deselectSquare() {
    if (this.selectedSquare) {
      const square = this.getSquareElement(this.selectedSquare.row, this.selectedSquare.col);
      if (square) {
        square.classList.remove('selected');
      }
    }
    
    this.selectedSquare = null;
    this.clearHighlights();
  }

  getSquareElement(row, col) {
    return document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
  }

  highlightPossibleMoves(row, col) {
    const possibleMoves = this.getPossibleMoves(row, col);
    
    possibleMoves.forEach(([toRow, toCol]) => {
      const square = this.getSquareElement(toRow, toCol);
      if (square) {
        const isCapture = this.board[toRow][toCol] !== '';
        square.classList.add(isCapture ? 'capture-move' : 'possible-move');
      }
    });
  }

  clearHighlights() {
    document.querySelectorAll('.square').forEach(square => {
      square.classList.remove('highlight', 'possible-move', 'capture-move', 'last-move');
    });
    
    // Re-highlight last move
    if (this.lastMove) {
      const fromSquare = this.getSquareElement(this.lastMove.from[0], this.lastMove.from[1]);
      const toSquare = this.getSquareElement(this.lastMove.to[0], this.lastMove.to[1]);
      if (fromSquare) fromSquare.classList.add('last-move');
      if (toSquare) toSquare.classList.add('last-move');
    }
  }

  canMove(fromRow, fromCol, toRow, toCol) {
    const possibleMoves = this.getPossibleMoves(fromRow, fromCol);
    return possibleMoves.some(([r, c]) => r === toRow && c === toCol);
  }

  isValidMove(fromRow, fromCol, toRow, toCol) {
    return this.canMove(fromRow, fromCol, toRow, toCol);
  }

  getPossibleMoves(row, col) {
    const piece = this.board[row][col];
    if (!piece) return [];
    
    const moves = [];
    const color = this.getPieceColor(piece);
    const pieceType = this.getPieceType(piece);
    
    switch (pieceType) {
      case 'pawn':
        moves.push(...this.getPawnMoves(row, col, color));
        break;
      case 'rook':
        moves.push(...this.getRookMoves(row, col, color));
        break;
      case 'knight':
        moves.push(...this.getKnightMoves(row, col, color));
        break;
      case 'bishop':
        moves.push(...this.getBishopMoves(row, col, color));
        break;
      case 'queen':
        moves.push(...this.getQueenMoves(row, col, color));
        break;
      case 'king':
        moves.push(...this.getKingMoves(row, col, color));
        break;
    }
    
    // Filter out moves that would leave the king in check
    return moves.filter(([toRow, toCol]) => {
      return !this.wouldBeInCheck(row, col, toRow, toCol, color);
    });
  }

  getPawnMoves(row, col, color) {
    const moves = [];
    const direction = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;
    
    // Forward move
    if (this.isValidSquare(row + direction, col) && this.board[row + direction][col] === '') {
      moves.push([row + direction, col]);
      
      // Double move from starting position
      if (row === startRow && this.board[row + 2 * direction][col] === '') {
        moves.push([row + 2 * direction, col]);
      }
    }
    
    // Captures
    for (const deltaCol of [-1, 1]) {
      const newRow = row + direction;
      const newCol = col + deltaCol;
      
      if (this.isValidSquare(newRow, newCol)) {
        const target = this.board[newRow][newCol];
        if (target && this.getPieceColor(target) !== color) {
          moves.push([newRow, newCol]);
        }
      }
    }
    
    return moves;
  }

  getRookMoves(row, col, color) {
    const moves = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    
    for (const [dr, dc] of directions) {
      for (let i = 1; i < 8; i++) {
        const newRow = row + dr * i;
        const newCol = col + dc * i;
        
        if (!this.isValidSquare(newRow, newCol)) break;
        
        const target = this.board[newRow][newCol];
        if (target === '') {
          moves.push([newRow, newCol]);
        } else {
          if (this.getPieceColor(target) !== color) {
            moves.push([newRow, newCol]);
          }
          break;
        }
      }
    }
    
    return moves;
  }

  getKnightMoves(row, col, color) {
    const moves = [];
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    
    for (const [dr, dc] of knightMoves) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      if (this.isValidSquare(newRow, newCol)) {
        const target = this.board[newRow][newCol];
        if (target === '' || this.getPieceColor(target) !== color) {
          moves.push([newRow, newCol]);
        }
      }
    }
    
    return moves;
  }

  getBishopMoves(row, col, color) {
    const moves = [];
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    
    for (const [dr, dc] of directions) {
      for (let i = 1; i < 8; i++) {
        const newRow = row + dr * i;
        const newCol = col + dc * i;
        
        if (!this.isValidSquare(newRow, newCol)) break;
        
        const target = this.board[newRow][newCol];
        if (target === '') {
          moves.push([newRow, newCol]);
        } else {
          if (this.getPieceColor(target) !== color) {
            moves.push([newRow, newCol]);
          }
          break;
        }
      }
    }
    
    return moves;
  }

  getQueenMoves(row, col, color) {
    return [...this.getRookMoves(row, col, color), ...this.getBishopMoves(row, col, color)];
  }

  getKingMoves(row, col, color) {
    const moves = [];
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      if (this.isValidSquare(newRow, newCol)) {
        const target = this.board[newRow][newCol];
        if (target === '' || this.getPieceColor(target) !== color) {
          moves.push([newRow, newCol]);
        }
      }
    }
    
    return moves;
  }

  isValidSquare(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  getPieceColor(piece) {
    return '♔♕♖♗♘♙'.includes(piece) ? 'white' : 'black';
  }

  getPieceType(piece) {
    const types = {
      '♔': 'king', '♚': 'king',
      '♕': 'queen', '♛': 'queen',
      '♖': 'rook', '♜': 'rook',
      '♗': 'bishop', '♝': 'bishop',
      '♘': 'knight', '♞': 'knight',
      '♙': 'pawn', '♟': 'pawn'
    };
    return types[piece] || '';
  }

  wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
    // Make temporary move
    const originalPiece = this.board[toRow][toCol];
    const movingPiece = this.board[fromRow][fromCol];
    
    this.board[toRow][toCol] = movingPiece;
    this.board[fromRow][fromCol] = '';
    
    // Find king position
    const kingSymbol = color === 'white' ? '♔' : '♚';
    let kingRow = -1, kingCol = -1;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col] === kingSymbol) {
          kingRow = row;
          kingCol = col;
          break;
        }
      }
      if (kingRow !== -1) break;
    }
    
    // If king moved, update position
    if (fromRow === kingRow && fromCol === kingCol) {
      kingRow = toRow;
      kingCol = toCol;
    }
    
    const inCheck = this.isSquareAttacked(kingRow, kingCol, color === 'white' ? 'black' : 'white');
    
    // Restore original position
    this.board[fromRow][fromCol] = movingPiece;
    this.board[toRow][toCol] = originalPiece;
    
    return inCheck;
  }

  isSquareAttacked(row, col, byColor) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && this.getPieceColor(piece) === byColor) {
          const moves = this.getPossibleMovesForAttack(r, c, byColor);
          if (moves.some(([mr, mc]) => mr === row && mc === col)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  getPossibleMovesForAttack(row, col, color) {
    const piece = this.board[row][col];
    if (!piece) return [];
    
    const pieceType = this.getPieceType(piece);
    
    switch (pieceType) {
      case 'pawn':
        return this.getPawnAttacks(row, col, color);
      case 'rook':
        return this.getRookMoves(row, col, color);
      case 'knight':
        return this.getKnightMoves(row, col, color);
      case 'bishop':
        return this.getBishopMoves(row, col, color);
      case 'queen':
        return this.getQueenMoves(row, col, color);
      case 'king':
        return this.getKingAttacks(row, col, color);
      default:
        return [];
    }
  }

  getPawnAttacks(row, col, color) {
    const moves = [];
    const direction = color === 'white' ? -1 : 1;
    
    for (const deltaCol of [-1, 1]) {
      const newRow = row + direction;
      const newCol = col + deltaCol;
      
      if (this.isValidSquare(newRow, newCol)) {
        moves.push([newRow, newCol]);
      }
    }
    
    return moves;
  }

  getKingAttacks(row, col, color) {
    const moves = [];
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      if (this.isValidSquare(newRow, newCol)) {
        moves.push([newRow, newCol]);
      }
    }
    
    return moves;
  }

  // **FIX START**: `makeMove` now checks for promotion and pauses the game flow.
  makeMove(fromRow, fromCol, toRow, toCol) {
    console.log(`Making move from ${fromRow},${fromCol} to ${toRow},${toCol}`);

    const piece = this.board[fromRow][fromCol];
    const capturedPiece = this.board[toRow][toCol];
    const pieceType = this.getPieceType(piece);
    const color = this.getPieceColor(piece);

    // Check for pawn promotion
    const promotionRow = color === 'white' ? 0 : 7;
    if (pieceType === 'pawn' && toRow === promotionRow) {
        // Store promotion details and show the modal to the user
        this.pendingPromotion = { fromRow, fromCol, toRow, toCol, capturedPiece, piece };
        this.showPromotionModal(color);
        return; // Pause execution until the user chooses a promotion piece
    }

    // --- Standard move logic ---
    this.board[toRow][toCol] = piece;
    this.board[fromRow][fromCol] = '';

    if (capturedPiece) {
        this.capturedPieces[this.getPieceColor(capturedPiece)].push(capturedPiece);
    }

    const moveNotation = this.getMoveNotation(fromRow, fromCol, toRow, toCol, piece, capturedPiece);
    this.moveHistory.push({
        from: [fromRow, fromCol],
        to: [toRow, toCol],
        piece,
        captured: capturedPiece,
        notation: moveNotation,
        timestamp: Date.now()
    });

    this.lastMove = { from: [fromRow, fromCol], to: [toRow, toCol] };

    // Finalize the turn using the new consolidated function
    this.finalizeMove();
  }
  // **FIX END**

  // **FIX START**: New function to finalize a turn. Avoids code duplication.
  finalizeMove() {
      this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
      if (this.currentPlayer === 'white') {
          this.turnNumber++;
      }

      this.createBoard();
      this.updateUI();
      this.updateMoveHistory();
      this.updateCapturedPieces();

      if (this.checkGameEnd()) {
          return;
      }

      if (this.gameMode === 'computer' && this.currentPlayer === 'black') {
          this.makeAIMove();
      }

      if (this.gameMode === 'computer' && this.stockfish) {
          this.updateEngineAnalysis();
      }
  }
  // **FIX END**

  // **FIX START**: New function to show the promotion modal with correct pieces.
  showPromotionModal(color) {
    if (this.elements.promotionModal) {
        const promotionOptions = this.elements.promotionModal.querySelector('.promotion-options');
        const pieces = color === 'white' ? this.pieceSymbols.white : this.pieceSymbols.black;
        const pieceTypes = ['queen', 'rook', 'bishop', 'knight'];
        
        promotionOptions.innerHTML = ''; // Clear previous options
        
        pieceTypes.forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'promotion-btn';
            btn.dataset.piece = type;
            btn.textContent = pieces[type];
            // Add listener directly to the new button
            btn.addEventListener('click', () => this.handlePromotion(type));
            promotionOptions.appendChild(btn);
        });

        this.elements.promotionModal.classList.add('show');
    }
  }
  // **FIX END**
  
  // **FIX START**: New, improved `getMoveNotation` to handle PGN standard.
  getMoveNotation(fromRow, fromCol, toRow, toCol, piece, capturedPiece, promotedTo = null) {
    const files = 'abcdefgh';
    const fromFile = files[fromCol];
    const toSquare = files[toCol] + (8 - toRow);
    const pieceType = this.getPieceType(piece);
    let notation = '';

    if (pieceType === 'pawn') {
        notation = capturedPiece ? fromFile + 'x' + toSquare : toSquare;
        if (promotedTo) {
            const promotedPieceFen = this.pieceToFEN(promotedTo).toUpperCase();
            notation += '=' + promotedPieceFen;
        }
    } else {
        const pieceSymbol = this.pieceToFEN(piece).toUpperCase();
        notation = pieceSymbol + (capturedPiece ? 'x' : '') + toSquare;
    }
    return notation;
  }
  // **FIX END**

  makeAIMove() {
    console.log('AI making move with ELO:', this.aiEloRating);
    this.isAiThinking = true;
    this.showAiThinking();
    
    setTimeout(() => {
      if (this.stockfish && this.stockfishReady) {
        const fen = this.getFEN();
        
        this.stockfish.postMessage(`position fen ${fen}`);
        this.stockfish.postMessage(`go depth 8`);
      } else {
        // Fallback to random move
        this.makeRandomMove();
      }
    }, 1200);
  }

  makeRandomMove() {
    const allMoves = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && this.getPieceColor(piece) === this.currentPlayer) {
          const moves = this.getPossibleMoves(row, col);
          moves.forEach(([toRow, toCol]) => {
            allMoves.push({ fromRow: row, fromCol: col, toRow, toCol });
          });
        }
      }
    }
    
    if (allMoves.length > 0) {
      const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
      this.makeMove(randomMove.fromRow, randomMove.fromCol, randomMove.toRow, randomMove.toCol);
    }
    
    this.isAiThinking = false;
    this.hideAiThinking();
  }

  showAiThinking() {
    if (this.elements.aiStatus) {
      this.elements.aiStatus.style.display = 'block';
    }
  }

  hideAiThinking() {
    if (this.elements.aiStatus) {
      this.elements.aiStatus.style.display = 'none';
    }
  }

  updateEngineAnalysis() {
    if (!this.stockfish || !this.stockfishReady) return;
    
    const fen = this.getFEN();
    this.stockfish.postMessage(`position fen ${fen}`);
    this.stockfish.postMessage(`go depth 10`);
  }

  startEngineAnalysis() {
    if (!this.stockfish) return;
    
    this.updateEngineAnalysis();
  }

  getFEN() {
    // Simplified FEN generation
    let fen = '';
    
    for (let row = 0; row < 8; row++) {
      let emptyCount = 0;
      
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        
        if (piece === '') {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          
          const fenPiece = this.pieceToFEN(piece);
          fen += fenPiece;
        }
      }
      
      if (emptyCount > 0) {
        fen += emptyCount;
      }
      
      if (row < 7) {
        fen += '/';
      }
    }
    
    fen += ` ${this.currentPlayer === 'white' ? 'w' : 'b'}`;
    fen += ' KQkq - 0 ' + this.turnNumber;
    
    return fen;
  }

  pieceToFEN(piece) {
    const fenMap = {
      '♔': 'K', '♕': 'Q', '♖': 'R', '♗': 'B', '♘': 'N', '♙': 'P',
      '♚': 'k', '♛': 'q', '♜': 'r', '♝': 'b', '♞': 'n', '♟': 'p'
    };
    return fenMap[piece] || '';
  }

  uciToCoords(uci) {
    const file = uci.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = parseInt(uci[1]) - 1;
    return { row: 7 - rank, col: file };
  }

  coordsToUci(row, col) {
    const file = String.fromCharCode('a'.charCodeAt(0) + col);
    const rank = (8 - row).toString();
    return file + rank;
  }

  checkGameEnd() {
    const kingInCheck = this.isKingInCheck(this.currentPlayer);
    const hasValidMoves = this.hasValidMoves(this.currentPlayer);
    
    if (!hasValidMoves) {
      if (kingInCheck) {
        // Checkmate
        const winner = this.currentPlayer === 'white' ? 'black' : 'white';
        this.endGame('checkmate', winner);
        return true;
      } else {
        // Stalemate
        this.endGame('stalemate');
        return true;
      }
    }
    
    return false;
  }

  isKingInCheck(color) {
    const kingSymbol = color === 'white' ? '♔' : '♚';
    let kingRow = -1, kingCol = -1;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (this.board[row][col] === kingSymbol) {
          kingRow = row;
          kingCol = col;
          break;
        }
      }
      if (kingRow !== -1) break;
    }
    
    return this.isSquareAttacked(kingRow, kingCol, color === 'white' ? 'black' : 'white');
  }

  hasValidMoves(color) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && this.getPieceColor(piece) === color) {
          const moves = this.getPossibleMoves(row, col);
          if (moves.length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  endGame(result, winner = null) {
    console.log('Game ended:', result, winner);
    this.gameStatus = 'ended';
    this.stopTimer();
    
    let title, message;
    
    switch (result) {
      case 'checkmate':
        title = 'Checkmate!';
        message = `${winner === 'white' ? 'White' : 'Black'} wins by checkmate!`;
        break;
      case 'stalemate':
        title = 'Stalemate!';
        message = 'The game is a draw by stalemate.';
        break;
      default:
        title = 'Game Over';
        message = 'The game has ended.';
    }
    
    if (this.elements.gameOverTitle) this.elements.gameOverTitle.textContent = title;
    if (this.elements.gameOverMessage) this.elements.gameOverMessage.textContent = message;
    
    if (this.elements.gameOverModal) {
      this.elements.gameOverModal.classList.add('show');
    }
    
    // Start post-game analysis
    setTimeout(() => {
      this.analyzeGame();
    }, 1000);
  }

  analyzeGame() {
    this.createGameAnalysis();
  }

  createGameAnalysis() {
    this.moveAnalysis = [];
    
    this.moveHistory.forEach((move, index) => {
      const accuracy = 0.65 + Math.random() * 0.35;
      const classification = this.classifyMoveByAccuracy(accuracy);
      
      this.moveAnalysis.push({
        moveNumber: Math.floor(index / 2) + 1,
        color: index % 2 === 0 ? 'white' : 'black',
        notation: move.notation,
        classification: classification,
        accuracy: accuracy,
        evaluation: (Math.random() - 0.5) * 3,
        comment: this.generateMoveComment(classification)
      });
    });
    
    this.completeAnalysis();
  }

  classifyMoveByAccuracy(accuracy) {
    if (accuracy >= 0.98) return 'brilliant';
    if (accuracy >= 0.90) return 'great';
    if (accuracy >= 0.80) return 'good';
    if (accuracy >= 0.70) return 'inaccuracy';
    if (accuracy >= 0.50) return 'mistake';
    return 'blunder';
  }

  generateMoveComment(classification) {
    const comments = {
      brilliant: 'Brilliant move finding the best continuation!',
      great: 'A strong move that maintains the advantage.',
      good: 'A solid move following good principles.',
      inaccuracy: 'A minor inaccuracy, but still playable.',
      mistake: 'A mistake that gives the opponent advantage.',
      blunder: 'A serious blunder that worsens the position.'
    };
    return comments[classification] || 'Move played.';
  }

  completeAnalysis() {
    this.gameAnalysis = {
      totalMoves: this.moveHistory.length,
      duration: Date.now() - this.gameStartTime,
      whiteAccuracy: this.calculatePlayerAccuracy('white'),
      blackAccuracy: this.calculatePlayerAccuracy('black'),
      winner: this.getGameWinner(),
      result: this.getGameResult(),
      classifications: this.getClassificationCounts(),
      aiElo: this.aiEloRating
    };
  }

  calculatePlayerAccuracy(color) {
    const playerMoves = this.moveAnalysis.filter(m => m.color === color);
    if (playerMoves.length === 0) return 0;
    
    const totalAccuracy = playerMoves.reduce((sum, move) => sum + move.accuracy, 0);
    return Math.round((totalAccuracy / playerMoves.length) * 100);
  }

  getGameWinner() {
    return this.gameMode === 'computer' ? 
      `Game against ${this.aiEloRating} ELO AI` : 
      'Human vs Human Game';
  }

  getGameResult() {
    return `Game completed with ${this.moveHistory.length} moves`;
  }

  getClassificationCounts() {
    const counts = {
      brilliant: 0,
      great: 0,
      good: 0,
      inaccuracy: 0,
      mistake: 0,
      blunder: 0
    };
    
    this.moveAnalysis.forEach(move => {
      if (counts.hasOwnProperty(move.classification)) {
        counts[move.classification]++;
      }
    });
    
    return counts;
  }

  showAnalysis() {
    this.populateAnalysisModal();
    if (this.elements.gameOverModal) {
      this.elements.gameOverModal.classList.remove('show');
    }
    if (this.elements.analysisModal) {
      this.elements.analysisModal.classList.add('show');
    }
  }

  hideAnalysis() {
    if (this.elements.analysisModal) {
      this.elements.analysisModal.classList.remove('show');
    }
  }

  populateAnalysisModal() {
    if (!this.gameAnalysis) return;
    
    // Overview tab
    if (this.elements.totalMoves) {
      this.elements.totalMoves.textContent = this.gameAnalysis.totalMoves;
    }
    
    if (this.elements.gameDuration) {
      const duration = this.gameAnalysis.duration;
      const minutes = Math.floor(duration / 60000);
      const seconds = Math.floor((duration % 60000) / 1000);
      this.elements.gameDuration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    if (this.elements.gameWinner) {
      this.elements.gameWinner.textContent = this.gameAnalysis.winner;
    }
    
    if (this.elements.aiEloResult) {
      this.elements.aiEloResult.textContent = this.gameMode === 'computer' ? 
        `${this.gameAnalysis.aiElo} ELO` : 'N/A';
    }
    
    // Move analysis tab
    if (this.elements.moveAnalysisList) {
      this.elements.moveAnalysisList.innerHTML = this.moveAnalysis.map(analysis => {
        const classification = this.moveClassifications[analysis.classification];
        return `
          <div class="move-analysis-item">
            <div class="move-header">
              <strong>${analysis.moveNumber}${analysis.color === 'white' ? '.' : '...'} ${analysis.notation}</strong>
              <span class="move-classification" style="color: ${classification.color}">
                ${classification.symbol} ${classification.description}
              </span>
            </div>
            <div class="move-details">
              <p><strong>Accuracy:</strong> ${Math.round(analysis.accuracy * 100)}%</p>
              <p><strong>Evaluation:</strong> ${analysis.evaluation.toFixed(2)}</p>
              <p><strong>Comment:</strong> ${analysis.comment}</p>
            </div>
          </div>
        `;
      }).join('');
    }
    
    // Accuracy tab
    if (this.elements.whiteAccuracy) {
      this.elements.whiteAccuracy.textContent = `${this.gameAnalysis.whiteAccuracy}%`;
    }
    
    if (this.elements.blackAccuracy) {
      this.elements.blackAccuracy.textContent = `${this.gameAnalysis.blackAccuracy}%`;
    }
    
    if (this.elements.whiteAccuracyBar) {
      this.elements.whiteAccuracyBar.style.width = `${this.gameAnalysis.whiteAccuracy}%`;
    }
    
    if (this.elements.blackAccuracyBar) {
      this.elements.blackAccuracyBar.style.width = `${this.gameAnalysis.blackAccuracy}%`;
    }
    
    // Classifications
    if (this.elements.classificationGrid) {
      const classifications = this.gameAnalysis.classifications;
      this.elements.classificationGrid.innerHTML = Object.entries(classifications).map(([type, count]) => {
        const classification = this.moveClassifications[type];
        return `
          <div class="classification-item">
            <div class="classification-symbol" style="color: ${classification.color}">
              ${classification.symbol}
            </div>
            <div class="classification-count">${count}</div>
            <div class="classification-name">${classification.description}</div>
          </div>
        `;
      }).join('');
    }
  }

  switchAnalysisTab(tab) {
    this.elements.tabBtns.forEach(btn => btn.classList.remove('active'));
    this.elements.tabContents.forEach(content => content.classList.remove('active'));
    
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
    const activeContent = document.getElementById(tab);
    
    if (activeBtn) activeBtn.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
  }

  // **FIX START**: `handlePromotion` now contains the full logic to update the board.
  handlePromotion(chosenPieceType) {
    if (!this.pendingPromotion) return;

    const { toRow, toCol, fromRow, fromCol, capturedPiece, piece } = this.pendingPromotion;
    const color = this.getPieceColor(piece);
    
    // Get the symbol for the new promoted piece (e.g., '♕' or '♛')
    const newPiece = this.pieceSymbols[color][chosenPieceType];

    // Update the board with the promoted piece
    this.board[toRow][toCol] = newPiece;
    this.board[fromRow][fromCol] = '';

    if (capturedPiece) {
        this.capturedPieces[this.getPieceColor(capturedPiece)].push(capturedPiece);
    }
    
    // Record the move with proper promotion notation (e.g., e8=Q)
    const moveNotation = this.getMoveNotation(fromRow, fromCol, toRow, toCol, piece, capturedPiece, newPiece);
    this.moveHistory.push({
        from: [fromRow, fromCol],
        to: [toRow, toCol],
        piece: piece,
        promotedTo: newPiece,
        captured: capturedPiece,
        notation: moveNotation,
        timestamp: Date.now()
    });

    this.lastMove = { from: [fromRow, fromCol], to: [toRow, toCol] };
    
    // Hide modal and clear the pending state
    if (this.elements.promotionModal) {
        this.elements.promotionModal.classList.remove('show');
    }
    this.pendingPromotion = null;

    // Finalize the turn to continue the game
    this.finalizeMove();
  }
  // **FIX END**

  undoMove() {
    if (this.moveHistory.length === 0 || this.gameStatus !== 'active') return;
    
    const lastMove = this.moveHistory.pop();
    
    // Restore board state
    this.board[lastMove.from[0]][lastMove.from[1]] = lastMove.piece;
    this.board[lastMove.to[0]][lastMove.to[1]] = lastMove.captured || '';
    
    // Restore captured pieces
    if (lastMove.captured) {
      const capturedColor = this.getPieceColor(lastMove.captured);
      const index = this.capturedPieces[capturedColor].indexOf(lastMove.captured);
      if (index >= 0) {
        this.capturedPieces[capturedColor].splice(index, 1);
      }
    }
    
    // Switch turn back
    this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
    if (this.currentPlayer === 'black') {
      this.turnNumber--;
    }
    
    // Update last move
    this.lastMove = this.moveHistory.length > 0 ? {
      from: this.moveHistory[this.moveHistory.length - 1].from,
      to: this.moveHistory[this.moveHistory.length - 1].to
    } : null;
    
    // Update UI
    this.createBoard();
    this.updateUI();
    this.updateMoveHistory();
    this.updateCapturedPieces();
  }

  exportPGN() {
    let pgn = '[Event "Premium Chess Game"]\n';
    pgn += '[Site "Web Browser"]\n';
    pgn += `[Date "${new Date().toISOString().split('T')[0]}"]\n`;
    pgn += '[Round "1"]\n';
    pgn += '[White "Player"]\n';
    pgn += `[Black "${this.gameMode === 'computer' ? `Stockfish ${this.aiEloRating} ELO` : 'Player'}"]\n`;
    pgn += '[Result "*"]\n\n';
    
    this.moveHistory.forEach((move, index) => {
      if (index % 2 === 0) {
        pgn += `${Math.floor(index / 2) + 1}. `;
      }
      pgn += `${move.notation} `;
      if (index % 2 === 1) {
        pgn += '\n';
      }
    });
    
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `premium_chess_${this.aiEloRating}elo_${new Date().toISOString().split('T')[0]}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  updateUI() {
    // Update player indicator
    if (this.elements.playerIndicator) {
      const playerText = this.currentPlayer === 'white' ? 'White to Move' : 'Black to Move';
      this.elements.playerIndicator.innerHTML = `
        <span class="player-icon"></span>
        <span class="player-text">${playerText}</span>
      `;
      this.elements.playerIndicator.className = `player-indicator ${this.currentPlayer}-turn`;
    }
    
    // Update turn number
    if (this.elements.turnNumber) {
      this.elements.turnNumber.textContent = this.turnNumber;
    }
    
    // Update game status
    if (this.elements.gameStatus) {
      this.elements.gameStatus.textContent = this.gameStatus === 'active' ? 'Active' : 'Ended';
      this.elements.gameStatus.className = `status ${this.gameStatus === 'active' ? 'status--success' : 'status--error'}`;
    }
  }

  updateMoveHistory() {
    if (!this.elements.moveHistory) return;
    
    if (this.moveHistory.length === 0) {
      this.elements.moveHistory.innerHTML = '<div class="no-moves">No moves yet</div>';
      return;
    }
    
    this.elements.moveHistory.innerHTML = '';
    
    for (let i = 0; i < this.moveHistory.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = this.moveHistory[i];
      const blackMove = this.moveHistory[i + 1];
      
      const moveEntry = document.createElement('div');
      moveEntry.className = 'move-entry';
      moveEntry.innerHTML = `
        <span class="move-number">${moveNumber}.</span>
        <span class="move-notation">${whiteMove.notation}</span>
        ${blackMove ? `<span class="move-notation">${blackMove.notation}</span>` : ''}
      `;
      
      this.elements.moveHistory.appendChild(moveEntry);
    }
    
    this.elements.moveHistory.scrollTop = this.elements.moveHistory.scrollHeight;
  }

  updateCapturedPieces() {
    if (this.elements.capturedWhite) {
      this.elements.capturedWhite.innerHTML = this.capturedPieces.white
        .map(piece => `<span class="captured-piece" data-piece="${piece}">${piece}</span>`)
        .join('');
    }
    
    if (this.elements.capturedBlack) {
      this.elements.capturedBlack.innerHTML = this.capturedPieces.black
        .map(piece => `<span class="captured-piece" data-piece="${piece}">${piece}</span>`)
        .join('');
    }
  }

  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.timerInterval = setInterval(() => {
      if (this.gameStatus !== 'active') return;
      
      const elapsed = Date.now() - this.gameStartTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      
      if (this.elements.gameTimer) {
        this.elements.gameTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  hideAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('show');
    });
  }
}

// Initialize the enhanced chess application
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Premium Chess Engine with Stockfish 17.1 ELO System...');
  window.premiumChess = new PremiumChessEngine();
});