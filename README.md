# Solo Leveling Productivity Web App

A gamified productivity web application inspired by the Solo Leveling manhwa/anime series. Users can level up by completing daily quests, track their progress, and visualize their personal growth over time.

## Features

### Core Features

- **Daily Quests & XP System**
  - Create, edit, and delete daily quests
  - Assign XP rewards for completing quests
  - Quests categorized by four main attributes: Strength, Charisma, Intelligence, Wisdom
  - Dashboard overview of all stats and quests

- **Pomodoro Timer**
  - Customizable work/rest intervals (25 min work / 5 min break)
  - Track completed pomodoros

- **Journal**
  - Daily notes with timestamp
  - Option to mark entries as private or public

- **Rewards System**
  - Create rewards unlocked by reaching XP thresholds

- **Hall of Shadows**
  - Record "victories" or completed major goals
  - Display with date, attribute gained, and XP

- **Progress Visualization**
  - Visualize XP gained and attribute growth
  - Level progression system

### Gamification Elements

- Level system based on accumulated XP
- Attribute points increase as quests for that attribute are completed
- Streak tracking for daily consistency

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Styling**: Custom CSS with futuristic Solo Leveling theme
- **Fonts**: Orbitron and Roboto Mono for tech-inspired look
- **Persistence**: LocalStorage for data persistence

## Project Structure

```
.
├── index.html          # Main HTML file
├── styles.css          # Custom styling
├── script.js           # Application logic
└── README.md           # This file
```

## Design Principles

The app follows these design principles based on user preferences:

1. **Dark Theme**: Uses a dark color scheme inspired by Solo Leveling aesthetics
2. **Futuristic UI**: Employs Orbitron font for a tech-inspired look
3. **Responsive Design**: Works on mobile and desktop devices
4. **Simple Architecture**: Built with vanilla HTML, CSS, and JavaScript
5. **Glassmorphism Effects**: Subtle transparency and blur effects for depth
6. **Attribute-Based System**: Four core attributes (Strength, Charisma, Intelligence, Wisdom)

## How to Use

1. Open `index.html` in a web browser
2. Start by adding quests in the Dashboard
3. Complete quests to earn XP and level up
4. Use the Pomodoro Timer for focused work sessions
5. Record your thoughts in the Journal
6. Create rewards for motivation
7. Document major achievements in the Hall of Shadows
8. Track your progress over time

## Data Persistence

All data is stored in the browser's LocalStorage, so your progress will be saved between sessions.

## Customization

You can customize the theme by modifying the CSS variables in `styles.css`:

```css
:root {
  --solo-dark: #0f172a;
  --solo-card: #1e293b;
  --solo-border: #334155;
  --solo-primary: #60a5fa;
  --solo-secondary: #93c5fd;
  --strength-color: #ef4444;
  --charisma-color: #8b5cf6;
  --intelligence-color: #06b6d4;
  --wisdom-color: #10b981;
}
```

## Future Enhancements

Planned improvements:
- Firebase integration for cross-device sync
- Notification system for reminders
- Friend leaderboard functionality
- Customizable themes
- Data export/import features