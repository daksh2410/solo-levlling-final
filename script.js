// Solo Leveling Productivity App with Firebase Integration
// Firebase initialization
let firebaseApp, firebaseAuth, firebaseDB, firebaseFunctions;
let unsubscribeQuests, unsubscribeJournal, unsubscribeRewards, unsubscribeVictories;

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
let currentUser = null;

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
function initializeApp() {
  // Wait for Firebase to be loaded
  if (typeof window.firebaseFunctions !== 'undefined') {
    firebaseApp = window.firebaseApp;
    firebaseAuth = window.firebaseAuth;
    firebaseDB = window.firebaseDB;
    firebaseFunctions = window.firebaseFunctions;
    
    // Set up authentication state listener
    firebaseFunctions.onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        currentUser = user;
        // Load data from Firestore
        loadFromFirestore();
      } else {
        // Sign in anonymously
        firebaseFunctions.signInAnonymously(firebaseAuth).catch((error) => {
          console.error('Anonymous sign-in error:', error);
        });
      }
      // Set up event listeners for both authenticated and unauthenticated users
      setupEventListeners();
    });
  } else {
    console.warn('Firebase not loaded, using localStorage');
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
  }
  
  // Make functions globally accessible for inline event handlers
  window.toggleQuest = toggleQuest;
  window.deleteQuest = deleteQuest;
  window.deleteJournalEntry = deleteJournalEntry;
  window.deleteReward = deleteReward;
  window.deleteVictory = deleteVictory;
}

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

async function addQuest() {
  const title = questTitleEl.value.trim();
  const attribute = questAttributeEl.value;
  const xp = parseInt(questXPEl.value);
  
  if (title && !isNaN(xp) && xp > 0) {
    if (currentUser) {
      // Save to Firestore
      try {
        const docRef = await firebaseFunctions.addDoc(
          firebaseFunctions.collection(firebaseDB, 'users', currentUser.uid, 'quests'),
          {
            title,
            attribute,
            xp,
            completed: false,
            createdAt: new Date()
          }
        );
        console.log('Quest added with ID: ', docRef.id);
      } catch (error) {
        console.error('Error adding quest: ', error);
      }
    } else {
      // Fallback to localStorage
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
    }
    
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
        <button class="complete-btn ${quest.completed ? 'completed' : ''}" data-id="${quest.id}">
          ${quest.completed ? 'Completed' : 'Complete'}
        </button>
        <button class="delete-btn" data-id="${quest.id}">Delete</button>
      </div>
    `;
    questsListEl.appendChild(questEl);
  });
  
  // Add event listeners to the buttons
  document.querySelectorAll('.quest-actions .complete-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      toggleQuest(id);
    });
  });
  
  document.querySelectorAll('.quest-actions .delete-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      deleteQuest(id);
    });
  });
}

async function toggleQuest(id) {
  if (currentUser) {
    // Update in Firestore
    try {
      const questRef = firebaseFunctions.doc(firebaseDB, 'users', currentUser.uid, 'quests', id);
      const quest = quests.find(q => q.id === id);
      
      if (quest) {
        const newCompletedStatus = !quest.completed;
        await firebaseFunctions.updateDoc(questRef, {
          completed: newCompletedStatus
        });
        
        // Update local stats
        if (newCompletedStatus) {
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
        updateProgressPage();
        saveToFirestore();
      }
    } catch (error) {
      console.error('Error updating quest: ', error);
    }
  } else {
    // Fallback to localStorage
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
}

async function deleteQuest(id) {
  if (currentUser) {
    // Delete from Firestore
    try {
      await firebaseFunctions.deleteDoc(
        firebaseFunctions.doc(firebaseDB, 'users', currentUser.uid, 'quests', id)
      );
    } catch (error) {
      console.error('Error deleting quest: ', error);
    }
  } else {
    // Fallback to localStorage
    quests = quests.filter(quest => quest.id !== id);
    renderQuests();
    saveToLocalStorage();
  }
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
        if (currentUser) {
          // Save to Firestore
          savePomodoroCount();
        } else {
          // Save to localStorage
          saveToLocalStorage();
        }
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
  
  // Save to Firebase or localStorage
  if (currentUser) {
    savePomodoroCount();
  } else {
    saveToLocalStorage();
  }
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
async function saveJournalEntry() {
  const title = journalTitleEl.value.trim();
  const content = journalContentEl.value.trim();
  
  if (title && content) {
    if (currentUser) {
      // Save to Firestore
      try {
        const docRef = await firebaseFunctions.addDoc(
          firebaseFunctions.collection(firebaseDB, 'users', currentUser.uid, 'journal'),
          {
            title,
            content,
            isPrivate: journalPrivateEl.checked,
            date: new Date().toISOString(),
            timestamp: new Date().toLocaleString()
          }
        );
        console.log('Journal entry added with ID: ', docRef.id);
      } catch (error) {
        console.error('Error adding journal entry: ', error);
      }
    } else {
      // Fallback to localStorage
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
    }
    
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
          <button class="delete-btn" data-id="${entry.id}">Delete</button>
        </div>
      </div>
      <div class="journal-entry-content">${entry.content}</div>
    `;
    journalEntriesEl.appendChild(entryEl);
  });
  
  // Add event listeners to the delete buttons
  document.querySelectorAll('.journal-entry .delete-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      deleteJournalEntry(id);
    });
  });
}

async function deleteJournalEntry(id) {
  if (currentUser) {
    // Delete from Firestore
    try {
      await firebaseFunctions.deleteDoc(
        firebaseFunctions.doc(firebaseDB, 'users', currentUser.uid, 'journal', id)
      );
    } catch (error) {
      console.error('Error deleting journal entry: ', error);
    }
  } else {
    // Fallback to localStorage
    journalEntries = journalEntries.filter(entry => entry.id !== id);
    renderJournalEntries();
    saveToLocalStorage();
  }
}

// Rewards Functions
async function createReward() {
  const name = rewardNameEl.value.trim();
  const description = rewardDescriptionEl.value.trim();
  const xp = parseInt(rewardXPEl.value);
  
  if (name && description && !isNaN(xp) && xp > 0) {
    if (currentUser) {
      // Save to Firestore
      try {
        const docRef = await firebaseFunctions.addDoc(
          firebaseFunctions.collection(firebaseDB, 'users', currentUser.uid, 'rewards'),
          {
            name,
            description,
            xpThreshold: xp,
            createdAt: new Date()
          }
        );
        console.log('Reward added with ID: ', docRef.id);
      } catch (error) {
        console.error('Error adding reward: ', error);
      }
    } else {
      // Fallback to localStorage
      const reward = {
        id: Date.now(),
        name,
        description,
        xpThreshold: xp
      };
      
      rewards.push(reward);
      renderRewards();
      saveToLocalStorage();
    }
    
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
        <button class="delete-btn" data-id="${reward.id}">Delete</button>
      </div>
    `;
    rewardsListEl.appendChild(rewardEl);
  });
  
  // Add event listeners to the delete buttons
  document.querySelectorAll('.reward-actions .delete-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      deleteReward(id);
    });
  });
}

async function deleteReward(id) {
  if (currentUser) {
    // Delete from Firestore
    try {
      await firebaseFunctions.deleteDoc(
        firebaseFunctions.doc(firebaseDB, 'users', currentUser.uid, 'rewards', id)
      );
    } catch (error) {
      console.error('Error deleting reward: ', error);
    }
  } else {
    // Fallback to localStorage
    rewards = rewards.filter(reward => reward.id !== id);
    renderRewards();
    saveToLocalStorage();
  }
}

// Victories Functions
async function recordVictory() {
  const title = victoryTitleEl.value.trim();
  const attribute = victoryAttributeEl.value;
  const xp = parseInt(victoryXPEl.value);
  
  if (title && !isNaN(xp) && xp > 0) {
    if (currentUser) {
      // Save to Firestore
      try {
        const docRef = await firebaseFunctions.addDoc(
          firebaseFunctions.collection(firebaseDB, 'users', currentUser.uid, 'victories'),
          {
            title,
            attribute,
            xp,
            date: new Date().toISOString(),
            timestamp: new Date().toLocaleDateString()
          }
        );
        console.log('Victory recorded with ID: ', docRef.id);
      } catch (error) {
        console.error('Error recording victory: ', error);
      }
    } else {
      // Fallback to localStorage
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
    }
    
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
        <button class="delete-btn" data-id="${victory.id}">Delete</button>
      </div>
      <div class="victory-details">
        <span class="victory-attribute ${victory.attribute}-badge">${getAttributeName(victory.attribute)}</span>
        <div class="victory-xp">+${victory.xp} XP</div>
      </div>
    `;
    victoriesListEl.appendChild(victoryEl);
  });
  
  // Add event listeners to the delete buttons
  document.querySelectorAll('.victory-card .delete-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      deleteVictory(id);
    });
  });
}

async function deleteVictory(id) {
  if (currentUser) {
    // Delete from Firestore
    try {
      await firebaseFunctions.deleteDoc(
        firebaseFunctions.doc(firebaseDB, 'users', currentUser.uid, 'victories', id)
      );
    } catch (error) {
      console.error('Error deleting victory: ', error);
    }
  } else {
    // Fallback to localStorage
    victories = victories.filter(victory => victory.id !== id);
    renderVictories();
    saveToLocalStorage();
  }
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

// Firestore Functions
async function loadFromFirestore() {
  if (!currentUser) return;
  
  try {
    // Load user stats
    const statsQuery = firebaseFunctions.query(
      firebaseFunctions.collection(firebaseDB, 'users', currentUser.uid, 'stats'),
      firebaseFunctions.orderBy('timestamp', 'desc'),
      firebaseFunctions.limit(1)
    );
    
    const statsSnapshot = await firebaseFunctions.getDocs(statsQuery);
    if (!statsSnapshot.empty) {
      userStats = statsSnapshot.docs[0].data();
    }
    
    // Load pomodoro count
    const pomodoroDoc = await firebaseFunctions.getDoc(
      firebaseFunctions.doc(firebaseDB, 'users', currentUser.uid, 'stats', 'pomodoro')
    );
    
    if (pomodoroDoc.exists()) {
      pomodoroCount = pomodoroDoc.data().count;
      pomodoroCountEl.textContent = pomodoroCount;
    }
    
    // Set up real-time listeners for all collections
    setupRealtimeListeners();
    
    // Update UI
    updateDashboard();
    updatePomodoroDisplay();
    updateProgressPage();
    
    // Set up event listeners
    setupEventListeners();
  } catch (error) {
    console.error('Error loading data from Firestore:', error);
    // Fallback to localStorage
    loadFromLocalStorage();
  }
}

function setupRealtimeListeners() {
  if (!currentUser) return;
  
  // Quests listener
  const questsQuery = firebaseFunctions.collection(firebaseDB, 'users', currentUser.uid, 'quests');
  unsubscribeQuests = firebaseFunctions.onSnapshot(questsQuery, (snapshot) => {
    quests = [];
    snapshot.forEach((doc) => {
      quests.push({ id: doc.id, ...doc.data() });
    });
    renderQuests();
  });
  
  // Journal entries listener
  const journalQuery = firebaseFunctions.collection(firebaseDB, 'users', currentUser.uid, 'journal');
  unsubscribeJournal = firebaseFunctions.onSnapshot(journalQuery, (snapshot) => {
    journalEntries = [];
    snapshot.forEach((doc) => {
      journalEntries.push({ id: doc.id, ...doc.data() });
    });
    // Sort by timestamp (newest first)
    journalEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderJournalEntries();
  });
  
  // Rewards listener
  const rewardsQuery = firebaseFunctions.collection(firebaseDB, 'users', currentUser.uid, 'rewards');
  unsubscribeRewards = firebaseFunctions.onSnapshot(rewardsQuery, (snapshot) => {
    rewards = [];
    snapshot.forEach((doc) => {
      rewards.push({ id: doc.id, ...doc.data() });
    });
    renderRewards();
  });
  
  // Victories listener
  const victoriesQuery = firebaseFunctions.collection(firebaseDB, 'users', currentUser.uid, 'victories');
  unsubscribeVictories = firebaseFunctions.onSnapshot(victoriesQuery, (snapshot) => {
    victories = [];
    snapshot.forEach((doc) => {
      victories.push({ id: doc.id, ...doc.data() });
    });
    // Sort by timestamp (newest first)
    victories.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderVictories();
  });
}

async function saveToFirestore() {
  if (!currentUser) return;
  
  try {
    // Save user stats
    const statsRef = firebaseFunctions.doc(firebaseDB, 'users', currentUser.uid, 'stats', 'current');
    await firebaseFunctions.setDoc(statsRef, {
      ...userStats,
      timestamp: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving to Firestore:', error);
  }
}

async function savePomodoroCount() {
  if (!currentUser) return;
  
  try {
    // Save pomodoro count
    const pomodoroRef = firebaseFunctions.doc(firebaseDB, 'users', currentUser.uid, 'stats', 'pomodoro');
    await firebaseFunctions.setDoc(pomodoroRef, {
      count: pomodoroCount,
      timestamp: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving pomodoro count to Firestore:', error);
  }
}

// Local Storage Functions (fallback)
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