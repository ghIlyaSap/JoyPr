const screens = {
  welcome: document.getElementById('screen-welcome'),
  weeks: document.getElementById('screen-weeks'),
  dashboard: document.getElementById('screen-dashboard'),
  pillars: document.getElementById('screen-pillars'),
  types: document.getElementById('screen-types'),
  activities: document.getElementById('screen-activities'),
  mylist: document.getElementById('screen-mylist'),
};

const overlays = {
  points: document.getElementById('overlay-points'),
  feedback: document.getElementById('overlay-feedback'),
};

const state = {
  displayName: null,
  selectedWeekId: null,
  currentPillar: null,
  currentType: null,
  goalPoints: 28,
  weeks: [
    { id: 'wk1', label: 'This week', range: 'Mar 10 – Mar 16', status: 'current', hasPlan: true },
    { id: 'wk2', label: 'Next week', range: 'Mar 17 – Mar 23', status: 'future', hasPlan: false },
    { id: 'wk3', label: 'Following week', range: 'Mar 24 – Mar 30', status: 'future', hasPlan: false },
    { id: 'wk0', label: 'Last week', range: 'Mar 03 – Mar 09', status: 'past', hasPlan: true },
  ],
  points: {
    assigned: 12,
    completed: 8,
  },
  pillars: [
    { id: 'movement', label: 'Movement', icon: '🏃', description: 'Walks, stretching, yoga', availableTypes: ['event', 'moment', 'content'] },
    { id: 'nature', label: 'Nature', icon: '🌿', description: 'Outdoors and fresh air', availableTypes: ['event', 'moment'] },
    { id: 'creativity', label: 'Creativity', icon: '🎨', description: 'Art, music, crafts', availableTypes: ['event', 'content'] },
    { id: 'connection', label: 'Connection', icon: '🤝', description: 'Friends and community', availableTypes: ['event', 'moment'] },
  ],
  activities: [
    {
      id: 'a1',
      title: 'Sunset park walk',
      description: 'A calm walk through the park to enjoy the evening light.',
      points: 5,
      area: 'Movement',
      type: 'event',
      sourceLabel: 'City events page',
      sourceUrl: 'https://example.com',
    },
    {
      id: 'a2',
      title: 'Stretching break',
      description: '10-minute guided stretching to reset your body.',
      points: 3,
      area: 'Movement',
      type: 'moment',
      sourceUrl: '',
    },
    {
      id: 'a3',
      title: 'Listen to a new album',
      description: 'Pick an album you have never heard and listen mindfully.',
      points: 4,
      area: 'Creativity',
      type: 'content',
      sourceUrl: 'https://example.com',
    },
  ],
  weekAssignments: {
    wk1: {
      assigned: [
        { id: 'a1', title: 'Sunset park walk', type: 'event', area: 'Movement', points: 5 },
        { id: 'a3', title: 'Listen to a new album', type: 'content', area: 'Creativity', points: 4 },
      ],
      completed: [
        { id: 'done1', title: 'Morning yoga', type: 'moment', area: 'Movement', points: 3, date: 'Mar 11', comment: 'Felt great!' },
      ],
    },
  },
};

function showScreen(id) {
  Object.values(screens).forEach((el) => el.classList.add('hidden'));
  screens[id].classList.remove('hidden');
}

function openOverlay(key) {
  overlays[key].classList.remove('hidden');
}

function closeOverlay(key) {
  overlays[key].classList.add('hidden');
}

function renderWelcome() {
  const name = state.displayName;
  const title = document.getElementById('welcome-title');
  const subtitle = document.getElementById('welcome-subtitle');
  const form = document.getElementById('welcome-form');
  const primary = document.getElementById('welcome-primary');
  const secondary = document.getElementById('welcome-secondary');

  if (name) {
    title.textContent = `Welcome back, ${name}!`;
    subtitle.textContent = 'Ready to plan another joyful week?';
    form.style.display = 'none';
    primary.textContent = `Continue as ${name}`;
    primary.disabled = false;
    secondary.style.display = 'inline-block';
  } else {
    title.textContent = 'Welcome!';
    subtitle.textContent = 'Plan joyful weeks and gently track what makes you feel better.';
    form.style.display = 'block';
    primary.textContent = 'Continue';
    primary.disabled = true;
    secondary.textContent = "This isn't me";
  }
}

function renderWeeks() {
  const list = document.getElementById('weeks-list');
  list.innerHTML = '';
  state.weeks.forEach((week) => {
    const card = document.createElement('button');
    card.className = `week-card ${week.status}`;
    card.innerHTML = `
      <div class="week-info">
        <span class="week-label">${week.label}</span>
        <span class="week-dates">${week.range}</span>
        <div class="week-status">
          ${week.hasPlan ? '<span class="badge">Planned</span>' : ''}
          <span>${week.status === 'current' ? 'Current week' : week.status === 'past' ? 'Past' : 'Upcoming'}</span>
        </div>
      </div>
      <span class="icon">→</span>
    `;
    card.onclick = () => {
      state.selectedWeekId = week.id;
      renderDashboard();
      showScreen('dashboard');
    };
    list.appendChild(card);
  });
}

function getWeekPoints() {
  const weekId = state.selectedWeekId || state.weeks[0].id;
  const weekData = state.weekAssignments[weekId] || { assigned: [], completed: [] };
  const assignedPoints = weekData.assigned.reduce((sum, item) => sum + (item.points || 0), 0) + weekData.completed.reduce((s, i) => s + (i.points || 0), 0);
  const completedPoints = weekData.completed.reduce((sum, item) => sum + (item.points || 0), 0);
  return { assignedPoints, completedPoints, weekData };
}

function getStateMessage(assigned, completed) {
  const goal = state.goalPoints;
  const hasAssigned = assigned > 0;
  const hasCompleted = completed > 0;
  const allAssignedCompleted = hasAssigned && completed >= assigned;

  if (!hasAssigned && !hasCompleted) {
    return 'This week is still empty. Want to add a few ideas for movement, nature or creativity?';
  }
  if (hasAssigned && !hasCompleted) {
    if (assigned >= goal) {
      return "You've already planned enough activities to reach this week’s goal — now it’s time to complete them.";
    }
    return `You’ve planned ${assigned} points so far. You can add a bit more to get closer to the recommended ${goal}.`;
  }
  if (hasAssigned && hasCompleted && !allAssignedCompleted) {
    if (assigned >= goal) {
      return 'If you finish everything you planned, you’ll reach your weekly goal.';
    }
    return 'Even if you finish all planned activities, you might be below the recommended goal — want to add a couple more ideas?';
  }
  if (allAssignedCompleted) {
    if (completed >= goal) {
      return 'Amazing! You’ve reached (or exceeded) this week’s recommended 28 points. You can still add something just for fun if you like.';
    }
    return 'You’ve completed everything you planned, but you’re still a bit below the recommended points. Want to add a few more activities?';
  }
  return '';
}

function renderDashboard() {
  const weekId = state.selectedWeekId || state.weeks[0].id;
  state.selectedWeekId = weekId;
  const week = state.weeks.find((w) => w.id === weekId) || state.weeks[0];
  document.getElementById('dashboard-week-label').textContent = week.label;
  document.getElementById('dashboard-title').textContent = `Week ${week.range}`;
  const { assignedPoints, completedPoints } = getWeekPoints();
  document.getElementById('goal-points').textContent = state.goalPoints;
  document.getElementById('assigned-points').textContent = assignedPoints;
  document.getElementById('completed-points').textContent = completedPoints;
  document.getElementById('completed-points-text').textContent = completedPoints;
  document.getElementById('state-message').textContent = getStateMessage(assignedPoints, completedPoints);

  const percent = Math.min(100, (completedPoints / state.goalPoints) * 100 || 0);
  const circle = document.getElementById('progress-circle');
  circle.style.background = `conic-gradient(var(--primary) 0deg ${percent * 3.6}deg, #ffe0d2 ${percent * 3.6}deg 360deg)`;

  document.getElementById('pillars-progress').textContent = `Assigned: ${assignedPoints} pts, Completed: ${completedPoints} pts, Goal: ${state.goalPoints} pts`;
  document.getElementById('types-progress').textContent = `Assigned: ${assignedPoints} pts, Completed: ${completedPoints} pts, Goal: ${state.goalPoints} pts`;
  document.getElementById('activities-progress').textContent = `Assigned: ${assignedPoints} pts, Completed: ${completedPoints} pts, Goal: ${state.goalPoints} pts`;
  document.getElementById('mylist-progress').textContent = `Assigned: ${assignedPoints} pts, Completed: ${completedPoints} pts, Goal: ${state.goalPoints} pts`;

  document.getElementById('pillars-week').textContent = week.range;
  document.getElementById('types-week').textContent = week.range;
  document.getElementById('activities-week').textContent = week.range;
  document.getElementById('mylist-week').textContent = week.range;
  document.getElementById('mylist-title').textContent = `My week: ${week.range}`;
}

function renderPillars() {
  const grid = document.getElementById('pillars-grid');
  grid.innerHTML = '';
  state.pillars.forEach((pillar) => {
    const card = document.createElement('button');
    card.className = 'pillar-card';
    card.innerHTML = `
      <span class="icon">${pillar.icon}</span>
      <div>
        <div class="week-label">${pillar.label}</div>
        <div class="subtitle">${pillar.description}</div>
      </div>
    `;
    card.onclick = () => {
      state.currentPillar = pillar;
      const hasMultipleTypes = pillar.availableTypes.length > 1;
      renderTypes();
      showScreen(hasMultipleTypes ? 'types' : 'activities');
      if (!hasMultipleTypes) {
        state.currentType = pillar.availableTypes[0];
        renderActivities();
      }
    };
    grid.appendChild(card);
  });
}

function renderTypes() {
  const wrap = document.getElementById('type-chips');
  wrap.innerHTML = '';
  (state.currentPillar?.availableTypes || []).forEach((type) => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.textContent = type === 'event' ? 'Events' : type === 'moment' ? 'Small moments' : 'Home content';
    chip.onclick = () => {
      state.currentType = type;
      renderActivities();
      showScreen('activities');
    };
    wrap.appendChild(chip);
  });
}

function renderActivities() {
  const list = document.getElementById('activity-cards');
  list.innerHTML = '';
  document.getElementById('activities-area').textContent = state.currentPillar?.label || 'Area';
  const filtered = state.activities.filter((a) => a.area === state.currentPillar?.label && a.type === state.currentType);
  filtered.forEach((activity) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-header">
        <div>
          <div class="week-label">${activity.title}</div>
          <div class="subtitle">${activity.description}</div>
        </div>
        <div class="points">+${activity.points}</div>
      </div>
      <div class="tags">
        <span class="tag-pill">${activity.area}</span>
        <span class="tag-pill">${activity.type}</span>
      </div>
      ${activity.sourceUrl ? `<a class="link-out" href="${activity.sourceUrl}" target="_blank" rel="noreferrer">${activity.sourceLabel || 'Open source'} ↗</a>` : ''}
      <div class="card-actions">
        <button class="btn primary">Add to my week</button>
        <button class="btn secondary" data-feedback>I've already done this</button>
      </div>
    `;
    card.querySelector('[data-feedback]').onclick = () => openOverlay('feedback');
    list.appendChild(card);
  });
}

function renderMyList() {
  const { weekData } = getWeekPoints();
  const assignedWrap = document.getElementById('mylist-assigned');
  const completedWrap = document.getElementById('mylist-completed');
  assignedWrap.innerHTML = '';
  completedWrap.innerHTML = '';

  weekData.assigned.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-header">
        <div>
          <div class="week-label">${item.title}</div>
          <div class="subtitle">${item.area} • ${item.type}</div>
        </div>
        <div class="points">+${item.points}</div>
      </div>
      <div class="card-actions">
        <button class="btn primary" data-feedback>Mark as done</button>
      </div>
    `;
    card.querySelector('[data-feedback]').onclick = () => openOverlay('feedback');
    assignedWrap.appendChild(card);
  });

  weekData.completed.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-header">
        <div>
          <div class="week-label">${item.title}</div>
          <div class="subtitle">${item.area} • ${item.type}</div>
        </div>
        <div class="points">+${item.points}</div>
      </div>
      <div class="tags">
        <span class="tag-pill">Completed on ${item.date}</span>
        ${item.comment ? `<span class="tag-pill">${item.comment}</span>` : ''}
      </div>
      <div class="card-actions">
        <button class="btn secondary" data-feedback>Edit comment</button>
      </div>
    `;
    card.querySelector('[data-feedback]').onclick = () => openOverlay('feedback');
    completedWrap.appendChild(card);
  });
}

function bindNavigation() {
  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-nav');
      showScreen(target);
    });
  });
  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => closeOverlay(btn.getAttribute('data-close').replace('overlay-', '')));
  });
}

function setupWelcomeForm() {
  const input = document.getElementById('display-name');
  const primary = document.getElementById('welcome-primary');
  const secondary = document.getElementById('welcome-secondary');
  input.addEventListener('input', () => {
    primary.disabled = input.value.trim().length < 1;
  });
  primary.addEventListener('click', () => {
    const name = state.displayName || input.value.trim();
    if (!name) return;
    state.displayName = name;
    renderDashboard();
    showScreen('weeks');
  });
  secondary.addEventListener('click', () => {
    state.displayName = null;
    input.value = '';
    renderWelcome();
  });
}

function setupDashboardActions() {
  document.getElementById('cta-discover').onclick = () => { renderPillars(); showScreen('pillars'); };
  document.getElementById('nav-discover').onclick = () => { renderPillars(); showScreen('pillars'); };
  document.getElementById('cta-list').onclick = () => { renderMyList(); showScreen('mylist'); };
  document.getElementById('nav-mylist').onclick = () => { renderMyList(); showScreen('mylist'); };
  document.getElementById('cta-points').onclick = () => openOverlay('points');
  document.getElementById('week-picker').onclick = () => showScreen('weeks');
}

function setupFeedbackForm() {
  document.getElementById('feedback-submit').onclick = () => {
    const text = document.getElementById('feedback-text');
    if (text.value.trim().length < 1) return;
    text.value = '';
    closeOverlay('feedback');
  };
}

function init() {
  renderWelcome();
  renderWeeks();
  renderDashboard();
  bindNavigation();
  setupWelcomeForm();
  setupDashboardActions();
  setupFeedbackForm();
}

init();
