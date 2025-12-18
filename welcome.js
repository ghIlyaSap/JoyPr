const nameInput = document.getElementById('display-name');
const heroTitle = document.getElementById('hero-title');
const heroBody = document.getElementById('hero-body');
const ctaName = document.getElementById('cta-name');
const continueBtn = document.getElementById('continue-btn');
const switchBtn = document.getElementById('switch-mode');
const clearBtn = document.getElementById('clear-name');
const formWrap = document.getElementById('name-form');

let hasStoredName = false;

function loadName() {
  const saved = localStorage.getItem('displayName');
  hasStoredName = !!saved;
  const name = saved || '';
  nameInput.value = name;
  updateCopy(name);
  continueBtn.disabled = !name;
}

function updateCopy(name) {
  if (name) {
    heroTitle.textContent = `Welcome back, ${name}`;
    heroBody.textContent = 'We saved your joyful week planner. Continue where you left off or update your name.';
    ctaName.textContent = name;
    switchBtn.textContent = "This isn't me";
    formWrap.querySelector('.card__label').textContent = 'Prefer a different name?';
  } else {
    heroTitle.textContent = 'Welcome!';
    heroBody.textContent = 'Plan joyful weeks and gently track what makes you feel better.';
    ctaName.textContent = 'Add your name to get started';
    switchBtn.textContent = 'Use a saved name instead';
    formWrap.querySelector('.card__label').textContent = 'What should we call you?';
  }
}

nameInput.addEventListener('input', () => {
  const value = nameInput.value.trim();
  continueBtn.disabled = value.length === 0;
  updateCopy(value);
});

continueBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (!name) return;
  localStorage.setItem('displayName', name);
  window.location.href = 'index.html';
});

switchBtn.addEventListener('click', () => {
  if (hasStoredName && nameInput.value.trim()) {
    nameInput.value = '';
    localStorage.removeItem('displayName');
    updateCopy('');
    continueBtn.disabled = true;
  } else {
    loadName();
  }
});

clearBtn.addEventListener('click', () => {
  nameInput.value = '';
  continueBtn.disabled = true;
  updateCopy('');
  localStorage.removeItem('displayName');
});

loadName();
