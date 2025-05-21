// Score Capture and Leaderboard Management Script for Mushroom Dash
// This script handles score tracking, leaderboard updates, and contest entry management

// Configuration
const GAME_CONFIG = {
  weeklyResetDay: 1, // Monday
  weeklyResetHour: 0, // Midnight UTC
  maxLeaderboardEntries: 100,
  topWinnerCount: 3,
  pointValues: {
    brain: 5,      // Lion's Mane collectible
    heart: 5,      // Reishi collectible
    energy: 5,     // Cordyceps collectible
    chocolate: 15  // KINOKO chocolate bar
  },
  powerUpDuration: 5000, // milliseconds
  gameDuration: 45000    // 45 seconds default
};

// Local Storage Keys
const STORAGE_KEYS = {
  currentScore: 'kinoko_current_score',
  highScore: 'kinoko_high_score',
  playerName: 'kinoko_player_name',
  playerEmail: 'kinoko_player_email',
  contestEntries: 'kinoko_contest_entries',
  lastPlayed: 'kinoko_last_played'
};

// Score Management
class ScoreManager {
  constructor() {
    this.currentScore = 0;
    this.itemsCollected = {
      brain: 0,
      heart: 0,
      energy: 0,
      chocolate: 0
    };
    this.comboMultiplier = 1;
    this.loadSavedScore();
  }

  // Reset score for new game
  resetScore() {
    this.currentScore = 0;
    this.itemsCollected = {
      brain: 0,
      heart: 0,
      energy: 0,
      chocolate: 0
    };
    this.comboMultiplier = 1;
    this.saveCurrentScore();
  }

  // Add points for collected item
  addPoints(itemType) {
    if (GAME_CONFIG.pointValues[itemType]) {
      const points = GAME_CONFIG.pointValues[itemType] * this.comboMultiplier;
      this.currentScore += points;
      this.itemsCollected[itemType]++;
      
      // Increase combo if chocolate collected
      if (itemType === 'chocolate') {
        this.comboMultiplier += 0.5;
      }
      
      this.saveCurrentScore();
      return points;
    }
    return 0;
  }

  // Handle power-up activation
  activatePowerUp(characterType) {
    switch(characterType) {
      case 'leo': // Lion's Mane - Focus power
        // Double points for brain collectibles
        return 'focus';
      case 'remi': // Reishi - Shield power
        // Protect from next obstacle hit
        return 'shield';
      case 'spora': // Cordyceps - Energy power
        // Double points for all collectibles
        this.comboMultiplier *= 2;
        return 'energy';
      default:
        return null;
    }
  }

  // End power-up effect
  deactivatePowerUp(powerUpType) {
    if (powerUpType === 'energy') {
      this.comboMultiplier /= 2;
    }
  }

  // Handle obstacle collision
  handleObstacleHit() {
    this.comboMultiplier = 1;
  }

  // Save current score to local storage
  saveCurrentScore() {
    localStorage.setItem(STORAGE_KEYS.currentScore, this.currentScore.toString());
    localStorage.setItem('kinoko_items_collected', JSON.stringify(this.itemsCollected));
    
    // Update high score if needed
    const highScore = parseInt(localStorage.getItem(STORAGE_KEYS.highScore) || '0');
    if (this.currentScore > highScore) {
      localStorage.setItem(STORAGE_KEYS.highScore, this.currentScore.toString());
    }
  }

  // Load saved score from local storage
  loadSavedScore() {
    const savedScore = localStorage.getItem(STORAGE_KEYS.currentScore);
    if (savedScore) {
      this.currentScore = parseInt(savedScore);
    }
    
    const savedItems = localStorage.getItem('kinoko_items_collected');
    if (savedItems) {
      try {
        this.itemsCollected = JSON.parse(savedItems);
      } catch (e) {
        console.error('Error parsing saved items:', e);
      }
    }
  }

  // Get final score and stats
  getFinalScore() {
    return {
      score: this.currentScore,
      items: this.itemsCollected,
      highScore: parseInt(localStorage.getItem(STORAGE_KEYS.highScore) || '0')
    };
  }

  getHighScore() {
    return parseInt(localStorage.getItem(STORAGE_KEYS.highScore) || '0');
  }
}

// Leaderboard Management
class LeaderboardManager {
  constructor() {
    this.leaderboardData = [];
    this.loadLeaderboard();
  }

  // Load leaderboard data from server
  async loadLeaderboard() {
    try {
      // In a real implementation, this would be an API call
      // For demo purposes, we'll use mock data if no server data exists
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        this.leaderboardData = await response.json();
      } else {
        // Mock data for demo
        this.leaderboardData = [
          { name: "Praby", score: 5500 },
          { name: "Auer", score: 5220 },
          { name: "John", score: 4820 },
          { name: "Alice", score: 3540 },
          { name: "Tonm", score: 2380 }
        ];
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      // Use mock data as fallback
      this.leaderboardData = [
        { name: "Praby", score: 5500 },
        { name: "Auer", score: 5220 },
        { name: "John", score: 4820 },
        { name: "Alice", score: 3540 },
        { name: "Tonm", score: 2380 }
      ];
    }
  }

  // Submit score to leaderboard
  async submitScore(name, score, email = null) {
    // Validate inputs
    if (!name || typeof score !== 'number' || score <= 0) {
      return { success: false, message: 'Invalid score submission' };
    }

    try {
      // In a real implementation, this would be an API call
      // For demo purposes, we'll just update local data
      const submission = {
        name,
        score,
        timestamp: new Date().toISOString()
      };
      
      if (email) {
        submission.email = email;
      }
      
      // Store player info for future games
      localStorage.setItem(STORAGE_KEYS.playerName, name);
      if (email) {
        localStorage.setItem(STORAGE_KEYS.playerEmail, email);
      }
      
      // Add to local leaderboard for immediate feedback
      this.leaderboardData.push(submission);
      this.leaderboardData.sort((a, b) => b.score - a.score);
      this.leaderboardData = this.leaderboardData.slice(0, GAME_CONFIG.maxLeaderboardEntries);
      
      return { 
        success: true, 
        rank: this.getPlayerRank(score),
        isTopWinner: this.isTopWinner(score)
      };
    } catch (error) {
      console.error('Error submitting score:', error);
      return { success: false, message: 'Failed to submit score' };
    }
  }

  // Get player's rank on leaderboard
  getPlayerRank(score) {
    return this.leaderboardData.findIndex(entry => entry.score <= score) + 1;
  }

  // Check if score qualifies for weekly prize
  isTopWinner(score) {
    const topScores = [...this.leaderboardData]
      .sort((a, b) => b.score - a.score)
      .slice(0, GAME_CONFIG.topWinnerCount);
    
    return topScores.some(entry => entry.score <= score);
  }

  // Get top N scores for display
  getTopScores(count = 5) {
    return this.leaderboardData
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }
}

// Contest Entry Management
class ContestManager {
  constructor() {
    this.entries = 0;
    this.loadEntries();
  }

  // Load saved entries
  loadEntries() {
    const savedEntries = localStorage.getItem(STORAGE_KEYS.contestEntries);
    if (savedEntries) {
      const entriesData = JSON.parse(savedEntries);
      
      // Check if entries are from current week
      const now = new Date();
      const lastUpdated = new Date(entriesData.timestamp);
      const daysSinceUpdate = Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24));
      
      // Reset if more than a week has passed
      if (daysSinceUpdate < 7) {
        this.entries = entriesData.count;
      } else {
        this.resetEntries();
      }
    }
  }

  // Save entries to storage
  saveEntries() {
    const entriesData = {
      count: this.entries,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.contestEntries, JSON.stringify(entriesData));
  }

  // Reset entries (weekly)
  resetEntries() {
    this.entries = 0;
    this.saveEntries();
  }

  // Add entry from gameplay
  addGameplayEntry(score) {
    // One entry per game played
    this.entries++;
    this.saveEntries();
    return this.entries;
  }

  // Add entry from social share
  addSocialShareEntry(platform) {
    // Validate platform
    if (['instagram', 'tiktok', 'twitter'].includes(platform)) {
      this.entries++;
      this.saveEntries();
      return this.entries;
    }
    return this.entries;
  }

  // Get total entries
  getEntries() {
    return this.entries;
  }
}

// Form Handling for Contest Entry
class ContestForm {
  constructor(formElement) {
    this.form = formElement;
    this.setupListeners();
  }

  // Set up form submission handler
  setupListeners() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }

  // Handle form submission
  async handleSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(this.form);
    const contestEntry = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || null,
      address: formData.get('address'),
      newsletter: formData.get('newsletter') === 'on',
      termsAccepted: formData.get('terms') === 'on',
      score: parseInt(localStorage.getItem(STORAGE_KEYS.currentScore) || '0'),
      entries: new ContestManager().getEntries(),
      timestamp: new Date().toISOString()
    };
    
    // Validate required fields
    if (!contestEntry.name || !contestEntry.email || !contestEntry.address || !contestEntry.termsAccepted) {
      this.showError('Please fill in all required fields and accept the terms.');
      return;
    }
    
    try {
      // In a real implementation, this would be an API call
      // For demo purposes, we'll just log the data
      console.log('Contest entry submitted:', contestEntry);
      
      // Store user info for convenience
      localStorage.setItem(STORAGE_KEYS.playerName, contestEntry.name);
      localStorage.setItem(STORAGE_KEYS.playerEmail, contestEntry.email);
      
      this.showSuccess('Your entry has been submitted! Good luck!');
      this.form.reset();
    } catch (error) {
      console.error('Error submitting contest entry:', error);
      this.showError('Failed to submit your entry. Please try again.');
    }
  }

  // Show error message
  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    
    this.form.appendChild(errorElement);
    setTimeout(() => {
      errorElement.remove();
    }, 5000);
  }

  // Show success message
  showSuccess(message) {
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.textContent = message;
    
    this.form.appendChild(successElement);
    setTimeout(() => {
      successElement.remove();
    }, 5000);
  }
}

// Social Sharing
class SocialShare {
  constructor(scoreManager) {
    this.scoreManager = scoreManager;
    this.contestManager = new ContestManager();
  }

  // Generate share message
  generateShareMessage() {
    const scoreData = this.scoreManager.getFinalScore();
    return `I scored ${scoreData.score} points in Mushroom Dash! 🍄💥 Can you beat my score? Play now at KinokoChocolate.com #KINOKO #MushroomDash`;
  }

  // Generate share image (would be implemented with canvas in a real game)
  generateShareImage() {
    // In a real implementation, this would create a canvas with the game results
    // For demo purposes, we'll just return a placeholder URL
    return '/assets/share-image-placeholder.jpg';
  }

  // Share to Instagram
  shareToInstagram() {
    const message = this.generateShareMessage();
    // In a real implementation, this would use the Instagram API or deep linking
    // For demo purposes, we'll just open a new window
    window.open(`https://www.instagram.com/`, '_blank');
    this.contestManager.addSocialShareEntry('instagram');
    return true;
  }

  // Share to TikTok
  shareToTikTok() {
    const message = this.generateShareMessage();
    // In a real implementation, this would use the TikTok API or deep linking
    // For demo purposes, we'll just open a new window
    window.open(`https://www.tiktok.com/`, '_blank');
    this.contestManager.addSocialShareEntry('tiktok');
    return true;
  }

  // Share to Twitter
  shareToTwitter() {
    const message = this.generateShareMessage();
    // In a real implementation, this would use the Twitter API or deep linking
    // For demo purposes, we'll just open a new window with the pre-populated message
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, '_blank');
    this.contestManager.addSocialShareEntry('twitter');
    return true;
  }

  // Copy share link to clipboard
  copyShareLink() {
    const message = this.generateShareMessage();
    const shareUrl = `https://kinokochocolate.com/mushroom-dash?ref=share`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(`${message}\n\n${shareUrl}`).then(() => {
      alert('Share link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
    
    return true;
  }
}

// Game Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Initialize managers
  const scoreManager = new ScoreManager();
  const leaderboardManager = new LeaderboardManager();
  const contestManager = new ContestManager();
  const socialShare = new SocialShare(scoreManager);
  
  // Set up contest form if it exists on the page
  const contestForm = document.getElementById('contest-entry-form');
  if (contestForm) {
    new ContestForm(contestForm);
  }
  
  // Set up social share buttons
  const setupShareButtons = () => {
    const instagramBtn = document.getElementById('share-instagram');
    const tiktokBtn = document.getElementById('share-tiktok');
    const twitterBtn = document.getElementById('share-twitter');
    const copyLinkBtn = document.getElementById('share-copy-link');
    
    if (instagramBtn) {
      instagramBtn.addEventListener('click', () => socialShare.shareToInstagram());
    }
    
    if (tiktokBtn) {
      tiktokBtn.addEventListener('click', () => socialShare.shareToTikTok());
    }
    
    if (twitterBtn) {
      twitterBtn.addEventListener('click', () => socialShare.shareToTwitter());
    }
    
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => socialShare.copyShareLink());
    }
  };
  
  setupShareButtons();
  
  // Example of updating leaderboard display
  const updateLeaderboardDisplay = () => {
    const leaderboardElement = document.getElementById('leaderboard-list');
    if (!leaderboardElement) return;
    
    const topScores = leaderboardManager.getTopScores(5);
    leaderboardElement.innerHTML = '';
    
    topScores.forEach((entry, index) => {
      const listItem = document.createElement('div');
      listItem.className = 'leaderboard-item';
      listItem.innerHTML = `
        <div class="rank">${index + 1}</div>
        <div class="name">${entry.name}</div>
        <div class="score">${entry.score}</div>
      `;
      leaderboardElement.appendChild(listItem);
    });
  };
  
  // Call this when the leaderboard screen is shown
  // updateLeaderboardDisplay();
  
  // Example of updating score display during gameplay
  const updateScoreDisplay = () => {
    const scoreElement = document.getElementById('score-display');
    if (scoreElement) {
      scoreElement.textContent = scoreManager.currentScore;
    }
  };
  
  // This would be called whenever the score changes during gameplay
  // updateScoreDisplay();
  
  console.log('Mushroom Dash score and contest scripts initialized');
});
