require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { Folder, Note } = require('./models');

const randomBool = (probability = 0.3) => Math.random() < probability;

const seedData = async () => {
  try {
    await connectDB();

    console.log('🗑️ Clearing existing data...');
    await Promise.all([
      Folder.deleteMany({}),
      Note.deleteMany({})
    ]);

    console.log('📁 Creating folders...');

    const folderData = [
      { name: 'Work', color: '#ef4444', icon: 'briefcase', order: 0 },
      { name: 'Personal', color: '#3b82f6', icon: 'user', order: 1 },
      { name: 'Ideas', color: '#eab308', icon: 'lightbulb', order: 2 },
      { name: 'Projects', color: '#22c55e', icon: 'folder-kanban', order: 3 },
      { name: 'Learning', color: '#8b5cf6', icon: 'graduation-cap', order: 4 },
    ];

    const folders = await Folder.insertMany(folderData);

    console.log(`✅ Created ${folders.length} folders`);

    const createNote = (title, content, tags, folderIndex) => ({
      title,
      content,
      tags,
      folderId: folders[folderIndex]._id,
      isPinned: randomBool(0.25),
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('📝 Creating 20 notes...');

    const notesData = [

  // ===== WORK =====
  createNote(
    'Sprint Planning Q1',
`# 🚀 Sprint Planning Q1

## 🎯 Objective
Deliver core authentication module before deadline.

---

### 📋 Backlog
- Implement JWT authentication
- Add refresh token logic
- Improve error handling
- Write integration tests

> ⚠ Deadline: **March 10, 2026**

## 🧠 Notes
Team velocity improved by 18% compared to last sprint.

\`\`\`js
if (user.isAuthenticated()) {
  next();
}
\`\`\`
`,
    ['meeting', 'agile', 'sprint'],
    0
  ),

  createNote(
    'System Architecture Overview',
`# 🏗 System Architecture

## Stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB

---

### 📊 Flow

Client → API Gateway → Service Layer → Database

| Layer        | Responsibility |
|-------------|---------------|
| Controller  | Handle request |
| Service     | Business logic |
| Model       | DB interaction |

> 💡 Microservice migration planned next quarter.
`,
    ['architecture', 'backend'],
    0
  ),

  createNote(
    'DevOps Checklist',
`# ⚙ DevOps Deployment

## ✅ Pre-deploy
- [x] Run tests
- [x] Build production bundle
- [ ] Update environment variables
- [ ] Backup database

## 🐳 Docker Command

\`\`\`bash
docker build -t notesys .
docker run -p 5000:5000 notesys
\`\`\`

🔥 Remember to monitor logs after deployment.
`,
    ['devops', 'docker'],
    0
  ),

  createNote(
    'Performance Audit',
`# 📈 Performance Audit

## Findings
Application load time: **1.8s**
Largest Contentful Paint: 2.3s

## Optimization Ideas
- Lazy load images
- Reduce bundle size
- Enable caching

> Result target: < 1.2s load time
`,
    ['performance'],
    0
  ),

  // ===== PERSONAL =====
  createNote(
    'Morning Routine',
`# 🌅 Morning Routine

## 🧘 Health
- 10 minutes meditation
- 20 push-ups
- Drink 1 glass of water

## 📖 Learning
Read at least **15 pages**

---

Consistency > Motivation 💪
`,
    ['habit', 'health'],
    1
  ),

  createNote(
    'Travel Plan 2026',
`# ✈ Travel Planning

## Destination Options
- Japan 🇯🇵
- Korea 🇰🇷
- Singapore 🇸🇬

## Budget Estimate

| Item | Cost |
|------|------|
| Flight | $500 |
| Hotel | $800 |
| Food | $300 |

Total: ~$1600
`,
    ['travel'],
    1
  ),

  createNote(
    'Personal Finance Overview',
`# 💰 Monthly Budget

Income: **$3000**

## Expenses
- Rent: $900
- Food: $400
- Utilities: $200
- Savings: $800

> Target savings rate: 30%
`,
    ['finance'],
    1
  ),

  createNote(
    'Reading List',
`# 📚 2026 Reading List

- Clean Code
- Deep Work
- Atomic Habits
- The Pragmatic Programmer

Goal: 1 book / month
`,
    ['books'],
    1
  ),

  // ===== IDEAS =====
  createNote(
    'Startup Idea: Micro SaaS',
`# 💡 Micro SaaS Concept

## Problem
Small teams lack affordable workflow tools.

## Solution
Subscription-based lightweight automation platform.

### Features
- Task automation
- Team collaboration
- Usage analytics

Revenue model: Freemium + Pro Plan
`,
    ['startup', 'idea'],
    2
  ),

  createNote(
    'Content Creator Plan',
`# 🎥 Developer Content Strategy

## Platforms
- YouTube
- Blog
- TikTok (short dev tips)

## Topics
- React tutorials
- Backend scaling
- Dev productivity

🔥 Goal: 10k subscribers in 1 year
`,
    ['content'],
    2
  ),

  createNote(
    'Mobile App Idea',
`# 📱 Habit Tracker App

Gamified productivity tracker.

## Core Loop
Check-in → Earn Points → Maintain Streak 🔥

## Tech Stack
- React Native
- Firebase
- MongoDB

Next Step: Wireframe MVP
`,
    ['app', 'idea'],
    2
  ),

  createNote(
    'Automation Tool Concept',
`# 🤖 Workflow Automation Tool

Trigger-based automation system.

Example:

IF new order → Send email → Update CRM

\`\`\`json
{
  "trigger": "new_order",
  "action": "send_email"
}
\`\`\`
`,
    ['automation'],
    2
  ),

  // ===== PROJECTS =====
  createNote(
    'NoteSYS Roadmap',
`# 🗺 NoteSYS Roadmap

## Phase 1 ✅
- CRUD
- Folder system
- Search

## Phase 2
- Drag & Drop
- Markdown Editor
- Export PDF

Goal: Launch v2 by Q3
`,
    ['roadmap'],
    3
  ),

  createNote(
    'Bug Tracking',
`# 🐞 Known Bugs

- Search highlighting issue
- Mobile sidebar glitch
- Tag filter inconsistency

Priority: High ⚠
`,
    ['bugfix'],
    3
  ),

  createNote(
    'UI Improvements',
`# 🎨 UI Enhancements

- Add animation transitions
- Improve card hover effects
- Better empty states

User experience first 👌
`,
    ['ui', 'ux'],
    3
  ),

  createNote(
    'API Draft',
`# 🔌 API Documentation

## Endpoints

GET /api/notes  
POST /api/notes  
DELETE /api/notes/:id  

Auth required 🔐
`,
    ['api'],
    3
  ),

  // ===== LEARNING =====
  createNote(
    'React Advanced Patterns',
`# ⚛ React Advanced Patterns

## Hooks
- useMemo
- useCallback
- useReducer

## Optimization
Avoid unnecessary re-renders.

\`\`\`js
export default React.memo(Component);
\`\`\`
`,
    ['react'],
    4
  ),

  createNote(
    'TypeScript Deep Dive',
`# 🟦 TypeScript Generics

\`\`\`ts
function identity<T>(value: T): T {
  return value;
}
\`\`\`

## Utility Types
- Partial<T>
- Pick<T, K>
- Omit<T, K>

Strong typing = fewer bugs ✨
`,
    ['typescript'],
    4
  ),

  createNote(
    'MongoDB Indexing',
`# 🍃 MongoDB Optimization

## Create Index
\`\`\`js
db.notes.createIndex({ title: 1 })
\`\`\`

Improves search performance significantly.
`,
    ['mongodb'],
    4
  ),

  createNote(
    'System Design Notes',
`# 🧠 System Design Basics

## Concepts
- Load Balancer
- Caching
- Horizontal Scaling
- Database Sharding

Think in trade-offs ⚖
`,
    ['system-design'],
    4
  ),

];

    await Note.bulkWrite(
      notesData.map(note => ({
        insertOne: { document: note }
      }))
    );

    console.log(`✅ Created ${notesData.length} notes`);

    console.log(`
🎉 Seed completed successfully!

Summary:
- Folders: ${folders.length}
- Notes: ${notesData.length}
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedData();