// Solo Leveling Productivity App
// Data structures
let userStats = {
  level: 1,
  totalXP: 0,
  streak: 0,
  attributes: {
    strength: 0,
    charisma: 0,
    intelligence: 0,
    wisdom: 0
  }
};

let quests = [];
let journalEntries = [];
let rewards = [];
let victories = [];
let pomodoroCount = 0;

// DOM Elements
const pageLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

// Dashboard Elements
const userLevelEl = document.getElementById('user-level');
const totalXPEl = document.getElementById('total-xp');
const questsCompletedEl = document.getElementById('quests-completed');
const streakEl = document.getElementById('streak');
const questsListEl = document.getElementById('quests-list');
const strengthValueEl = document.getElementById('strength-value');
const charismaValueEl = document.getElementById('charisma-value');
const intelligenceValueEl = document.getElementById('intelligence-value');
const wisdomValueEl = document.getElementById('wisdom-value');
const strengthProgressEl = document.getElementById('strength-progress');
const charismaProgressEl = document.getElementById('charisma-progress');
const intelligenceProgressEl = document.getElementById('intelligence-progress');
const wisdomProgressEl = document.getElementById('wisdom-progress');

// Quest Form Elements
const questTitleEl = document.getElementById('quest-title');
const questAttributeEl = document.getElementById('quest-attribute');
const questXPEl = document.getElementById('quest-xp');
const addQuestBtn = document.getElementById('add-quest');

// Pomodoro Elements
const timerModeEl = document.getElementById('timer-mode');
const timerEl = document.getElementById('timer');
const startPauseBtn = document.getElementById('start-pause');
const resetTimerBtn = document.getElementById('reset-timer');
const timerProgressEl = document.getElementById('timer-progress');
const pomodoroCountEl = document.getElementById('pomodoro-count');

// Journal Elements
const journalTitleEl = document.getElementById('journal-title');
const journalContentEl = document.getElementById('journal-content');
const journalPrivateEl = document.getElementById('journal-private');
const saveJournalBtn = document.getElementById('save-journal');
const journalEntriesEl = document.getElementById('journal-entries');

// Rewards Elements
const rewardNameEl = document.getElementById('reward-name');
const rewardDescriptionEl = document.getElementById('reward-description');
const rewardXPEl = document.getElementById('reward-xp');
const createRewardBtn = document.getElementById('create-reward');
const rewardsListEl = document.getElementById('rewards-list');

// Victories Elements
const victoryTitleEl = document.getElementById('victory-title');
const victoryAttributeEl = document.getElementById('victory-attribute');
const victoryXPEl = document.getElementById('victory-xp');
const recordVictoryBtn = document.getElementById('record-victory');
const victoriesListEl = document.getElementById('victories-list');

// Progress Elements
const progressLevelEl = document.getElementById('progress-level');
const progressXPEl = document.getElementById('progress-xp');
const xpToNextEl = document.getElementById('xp-to-next');

// Timer variables
let timerInterval;
let timeLeft = 25 * 60; // 25 minutes in seconds
let isRunning = false;
let isWorkMode = true;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  updateDashboard();
  updatePomodoroDisplay();
  renderQuests();
  renderJournalEntries();
  renderRewards();
  renderVictories();
  updateProgressPage();
  
  // Set up event listeners
  setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
  // Navigation
  pageLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      showPage(page);
    });
  });
  
  // Quest Form
  addQuestBtn.addEventListener('click', addQuest);
  
  // Pomodoro Timer
  startPauseBtn.addEventListener('click', toggleTimer);
  resetTimerBtn.addEventListener('click', resetTimer);
  
  // Journal Form
  saveJournalBtn.addEventListener('click', saveJournalEntry);
  
  // Rewards Form
  createRewardBtn.addEventListener('click', createReward);
  
  // Victories Form
  recordVictoryBtn.addEventListener('click', recordVictory);
}

// Navigation
function showPage(pageName) {
  // Hide all pages
  pages.forEach(page => {
    page.classList.remove('active');
  });
  
  // Show selected page
  document.getElementById(pageName).classList.add('active');
  
  // Update active nav link
  pageLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-page') === pageName) {
      link.classList.add('active');
    }
  });
}

// Dashboard Functions
function updateDashboard() {
  userLevelEl.textContent = userStats.level;
  totalXPEl.textContent = userStats.totalXP;
  streakEl.textContent = `${userStats.streak} days`;
  
  // Update attributes
  strengthValueEl.textContent = userStats.attributes.strength;
  charismaValueEl.textContent = userStats.attributes.charisma;
  intelligenceValueEl.textContent = userStats.attributes.intelligence;
  wisdomValueEl.textContent = userStats.attributes.wisdom;
  
  // Update progress bars (max 100 for display)
  strengthProgressEl.style.width = `${Math.min(100, userStats.attributes.strength)}%`;
  charismaProgressEl.style.width = `${Math.min(100, userStats.attributes.charisma)}%`;
  intelligenceProgressEl.style.width = `${Math.min(100, userStats.attributes.intelligence)}%`;
  wisdomProgressEl.style.width = `${Math.min(100, userStats.attributes.wisdom)}%`;
  
  // Update quests completed
  const completedQuests = quests.filter(quest => quest.completed).length;
  questsCompletedEl.textContent = `${completedQuests}/${quests.length}`;
}

function addQuest() {
  const title = questTitleEl.value.trim();
  const attribute = questAttributeEl.value;
  const xp = parseInt(questXPEl.value);
  
  if (title && !isNaN(xp) && xp > 0) {
    const quest = {
      id: Date.now(),
      title,
      attribute,
      xp,
      completed: false
    };
    
    quests.push(quest);
    renderQuests();
    saveToLocalStorage();
    
    // Clear form
    questTitleEl.value = '';
    questXPEl.value = '';
  }
}

function renderQuests() {
  questsListEl.innerHTML = '';
  
  if (quests.length === 0) {
    questsListEl.innerHTML = '<p class="no-data">No quests yet. Add your first quest!</p>';
    return;
  }
  
  quests.forEach(quest => {
    const questEl = document.createElement('div');
    questEl.className = `quest-item ${quest.attribute}`;
    questEl.innerHTML = `
      <div class="quest-info">
        <div class="quest-title">${quest.title}</div>
        <div class="quest-details">
          <span class="quest-badge">${getAttributeName(quest.attribute)}</span>
          <span>+${quest.xp} XP</span>
        </div>
      </div>
      <div class="quest-actions">
        <button class="${quest.completed ? 'completed' : ''}" onclick="toggleQuest(${quest.id})">
          ${quest.completed ? 'Completed' : 'Complete'}
        </button>
        <button class="delete-btn" onclick="deleteQuest(${quest.id})">Delete</button>
      </div>
    `;
    questsListEl.appendChild(questEl);
  });
}

function toggleQuest(id) {
  const quest = quests.find(q => q.id === id);
  if (quest) {
    quest.completed = !quest.completed;
    
    if (quest.completed) {
      // Add XP and attribute points
      userStats.totalXP += quest.xp;
      userStats.attributes[quest.attribute] += quest.xp;
      userStats.level = calculateLevel(userStats.totalXP);
    } else {
      // Remove XP and attribute points
      userStats.totalXP -= quest.xp;
      userStats.attributes[quest.attribute] -= quest.xp;
      userStats.level = calculateLevel(userStats.totalXP);
    }
    
    updateDashboard();
    renderQuests();
    updateProgressPage();
    saveToLocalStorage();
  }
}

function deleteQuest(id) {
  quests = quests.filter(quest => quest.id !== id);
  renderQuests();
  saveToLocalStorage();
}

function getAttributeName(attribute) {
  const names = {
    strength: 'Strength',
    charisma: 'Charisma',
    intelligence: 'Intelligence',
    wisdom: 'Wisdom'
  };
  return names[attribute] || attribute;
}

function calculateLevel(xp) {
  // Simple level calculation: level = sqrt(xp / 100) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

// Pomodoro Timer Functions
function toggleTimer() {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  isRunning = true;
  startPauseBtn.textContent = 'Pause';
  
  timerInterval = setInterval(() => {
    timeLeft--;
    updatePomodoroDisplay();
    
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      startPauseBtn.textContent = 'Start';
      
      // Timer completed
      if (isWorkMode) {
        // Work session completed
        pomodoroCount++;
        pomodoroCountEl.textContent = pomodoroCount;
        isWorkMode = false;
        timeLeft = 5 * 60; // 5 minutes break
        timerModeEl.textContent = 'Break Time';
        // In a real app, you might play a sound or show a notification here
      } else {
        // Break completed
        isWorkMode = true;
        timeLeft = 25 * 60; // 25 minutes work
        timerModeEl.textContent = 'Work Time';
      }
      
      updatePomodoroDisplay();
    }
  }, 1000);
}

function pauseTimer() {
  isRunning = false;
  startPauseBtn.textContent = 'Start';
  clearInterval(timerInterval);
}

function resetTimer() {
  pauseTimer();
  isWorkMode = true;
  timeLeft = 25 * 60;
  timerModeEl.textContent = 'Work Time';
  updatePomodoroDisplay();
}

function updatePomodoroDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  // Update progress bar
  const totalTime = isWorkMode ? 25 * 60 : 5 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  timerProgressEl.style.width = `${progress}%`;
}

// Journal Functions
function saveJournalEntry() {
  const title = journalTitleEl.value.trim();
  const content = journalContentEl.value.trim();
  
  if (title && content) {
    const entry = {
      id: Date.now(),
      title,
      content,
      isPrivate: journalPrivateEl.checked,
      date: new Date().toISOString(),
      timestamp: new Date().toLocaleString()
    };
    
    journalEntries.unshift(entry); // Add to beginning
    renderJournalEntries();
    saveToLocalStorage();
    
    // Clear form
    journalTitleEl.value = '';
    journalContentEl.value = '';
    journalPrivateEl.checked = false;
  }
}

function renderJournalEntries() {
  journalEntriesEl.innerHTML = '';
  
  if (journalEntries.length === 0) {
    journalEntriesEl.innerHTML = '<p class="no-data">No journal entries yet. Start writing!</p>';
    return;
  }
  
  journalEntries.forEach(entry => {
    const entryEl = document.createElement('div');
    entryEl.className = 'journal-entry';
    entryEl.innerHTML = `
      <div class="journal-entry-header">
        <div>
          <div class="journal-entry-title">${entry.title}</div>
          <div class="journal-entry-date">${entry.timestamp}</div>
        </div>
        <div>
          ${entry.isPrivate ? '<span class="private-badge">Private</span>' : ''}
          <button onclick="deleteJournalEntry(${entry.id})">Delete</button>
        </div>
      </div>
      <div class="journal-entry-content">${entry.content}</div>
    `;
    journalEntriesEl.appendChild(entryEl);
  });
}

function deleteJournalEntry(id) {
  journalEntries = journalEntries.filter(entry => entry.id !== id);
  renderJournalEntries();
  saveToLocalStorage();
}

// Rewards Functions
function createReward() {
  const name = rewardNameEl.value.trim();
  const description = rewardDescriptionEl.value.trim();
  const xp = parseInt(rewardXPEl.value);
  
  if (name && description && !isNaN(xp) && xp > 0) {
    const reward = {
      id: Date.now(),
      name,
      description,
      xpThreshold: xp
    };
    
    rewards.push(reward);
    renderRewards();
    saveToLocalStorage();
    
    // Clear form
    rewardNameEl.value = '';
    rewardDescriptionEl.value = '';
    rewardXPEl.value = '';
  }
}

function renderRewards() {
  rewardsListEl.innerHTML = '';
  
  if (rewards.length === 0) {
    rewardsListEl.innerHTML = '<p class="no-data">No rewards created yet. Create your first reward!</p>';
    return;
  }
  
  rewards.forEach(reward => {
    const rewardEl = document.createElement('div');
    rewardEl.className = 'reward-card';
    rewardEl.innerHTML = `
      <div class="reward-card-header">
        <div class="reward-title">${reward.name}</div>
        <div class="reward-xp">${reward.xpThreshold} XP</div>
      </div>
      <div class="reward-description">${reward.description}</div>
      <div class="reward-actions">
        <button onclick="deleteReward(${reward.id})">Delete</button>
      </div>
    `;
    rewardsListEl.appendChild(rewardEl);
  });
}

function deleteReward(id) {
  rewards = rewards.filter(reward => reward.id !== id);
  renderRewards();
  saveToLocalStorage();
}

// Victories Functions
function recordVictory() {
  const title = victoryTitleEl.value.trim();
  const attribute = victoryAttributeEl.value;
  const xp = parseInt(victoryXPEl.value);
  
  if (title && !isNaN(xp) && xp > 0) {
    const victory = {
      id: Date.now(),
      title,
      attribute,
      xp,
      date: new Date().toISOString(),
      timestamp: new Date().toLocaleDateString()
    };
    
    victories.unshift(victory); // Add to beginning
    renderVictories();
    saveToLocalStorage();
    
    // Clear form
    victoryTitleEl.value = '';
    victoryXPEl.value = '';
  }
}

function renderVictories() {
  victoriesListEl.innerHTML = '';
  
  if (victories.length === 0) {
    victoriesListEl.innerHTML = '<p class="no-data">No victories recorded yet. Achieve something great!</p>';
    return;
  }
  
  victories.forEach(victory => {
    const victoryEl = document.createElement('div');
    victoryEl.className = 'victory-card';
    victoryEl.innerHTML = `
      <div class="victory-card-header">
        <div>
          <div class="victory-title">${victory.title}</div>
          <div class="victory-date">${victory.timestamp}</div>
        </div>
        <button onclick="deleteVictory(${victory.id})">Delete</button>
      </div>
      <div class="victory-details">
        <span class="victory-attribute ${victory.attribute}-badge">${getAttributeName(victory.attribute)}</span>
        <div class="victory-xp">+${victory.xp} XP</div>
      </div>
    `;
    victoriesListEl.appendChild(victoryEl);
  });
}

function deleteVictory(id) {
  victories = victories.filter(victory => victory.id !== id);
  renderVictories();
  saveToLocalStorage();
}

// Progress Page Functions
function updateProgressPage() {
  progressLevelEl.textContent = userStats.level;
  progressXPEl.textContent = userStats.totalXP;
  xpToNextEl.textContent = calculateXPToNextLevel(userStats.totalXP);
}

function calculateXPToNextLevel(currentXP) {
  const currentLevel = calculateLevel(currentXP);
  const nextLevelXP = Math.pow(currentLevel, 2) * 100;
  return nextLevelXP - currentXP;
}

// Local Storage Functions
function saveToLocalStorage() {
  const data = {
    userStats,
    quests,
    journalEntries,
    rewards,
    victories,
    pomodoroCount
  };
  localStorage.setItem('soloLevelingApp', JSON.stringify(data));
}

function loadFromLocalStorage() {
  const data = localStorage.getItem('soloLevelingApp');
  if (data) {
    const parsed = JSON.parse(data);
    userStats = parsed.userStats || userStats;
    quests = parsed.quests || quests;
    journalEntries = parsed.journalEntries || journalEntries;
    rewards = parsed.rewards || rewards;
    victories = parsed.victories || victories;
    pomodoroCount = parsed.pomodoroCount || pomodoroCount;
    
    // Update pomodoro count display
    pomodoroCountEl.textContent = pomodoroCount;
  }
}