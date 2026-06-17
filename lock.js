// lock.js

const urlParams = new URLSearchParams(window.location.search);
const originalUrl = urlParams.get('originalUrl');

// DOM Elements
const lockCard = document.getElementById('lock-card');
const lockForm = document.getElementById('lock-form');
const passwordInput = document.getElementById('password-input');
const togglePasswordBtn = document.getElementById('toggle-password');
const eyeIcon = document.getElementById('eye-icon');
const errorMessage = document.getElementById('error-message');
const lockBtn = document.getElementById('lock-btn');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchSection = document.getElementById('search-section');
const topBar = document.getElementById('unlocked-top-bar');

// Initialize view state on load
document.addEventListener('DOMContentLoaded', () => {
  // Start Clock and Date immediately
  updateClockAndDate();
  setInterval(updateClockAndDate, 1000);

  // Verify session lock state
  const storageSession = chrome.storage.session || chrome.storage.local;
  storageSession.get('unlocked', (session) => {
    const isUnlocked = !!(session && session.unlocked);
    updateLockerState(isUnlocked);
  });
});

// Helper: Transitions elements between locked and unlocked views
function updateLockerState(isUnlocked) {
  if (isUnlocked) {
    if (originalUrl) {
      // Redirect to original page
      window.location.href = originalUrl;
    } else {
      // Transition to simple unlocked search dashboard
      lockCard.classList.remove('active');
      errorMessage.classList.remove('visible');
      
      // Delay showing search elements slightly for smooth transition
      setTimeout(() => {
        searchSection.classList.add('active');
        topBar.classList.add('active');
        searchInput.focus();
      }, 200);
    }
  } else {
    // Transition to locked state
    searchSection.classList.remove('active');
    topBar.classList.remove('active');
    
    setTimeout(() => {
      lockCard.classList.add('active');
      passwordInput.value = '';
      passwordInput.focus();
    }, 100);
  }
}

// Toggle password visibility
togglePasswordBtn.addEventListener('click', () => {
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    // Change eye icon paths to closed eye SVG
    eyeIcon.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    `;
  } else {
    passwordInput.type = 'password';
    // Restore open eye SVG
    eyeIcon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    `;
  }
});

// Handle password submission locally from chrome.storage.local
lockForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const password = passwordInput.value;

  // Retrieve current password directly from shared storage
  chrome.storage.local.get('password', (data) => {
    const currentPassword = (data && data.password) || 'ganteng';
    if (password === currentPassword) {
      // Write the unlock state directly to session storage
      const storageSession = chrome.storage.session || chrome.storage.local;
      storageSession.set({ unlocked: true }, () => {
        updateLockerState(true);
      });
    } else {
      // Shake animation and warning on invalid password
      errorMessage.classList.add('visible');
      lockCard.classList.add('shake');
      
      passwordInput.value = '';
      passwordInput.focus();

      setTimeout(() => {
        lockCard.classList.remove('shake');
      }, 400);
    }
  });
});

// Synchronize lock state changes from storage updates in real-time
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.unlocked) {
    updateLockerState(changes.unlocked.newValue);
  }
});

// Manual locking button
lockBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'lockBrowser' });
});

// Dashboard: Handle search bar
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    // If it's a URL pattern, navigate. Otherwise search on Google.
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
    if (urlPattern.test(query)) {
      const targetUrl = query.startsWith('http') ? query : 'https://' + query;
      window.location.href = targetUrl;
    } else {
      window.location.href = 'https://www.google.com/search?q=' + encodeURIComponent(query);
    }
  }
});

// Dashboard: Clock, Date, and Greeting in Indonesian with Dynamic Themes
function updateClockAndDate() {
  const now = new Date();

  // 1. Clock (HH:MM:SS)
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;

  // 2. Date in Indonesian
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = days[now.getDay()];
  const dayNum = now.getDate();
  const monthName = months[now.getMonth()];
  const year = now.getFullYear();

  document.getElementById('date').textContent = `${dayName}, ${dayNum} ${monthName} ${year}`;

  // 3. Dynamic Theme Class based on hour
  const hour = now.getHours();
  let themeClass = 'theme-malam'; // Default to night

  if (hour >= 4 && hour < 11) {
    themeClass = 'theme-pagi';
  } else if (hour >= 11 && hour < 15) {
    themeClass = 'theme-siang';
  } else if (hour >= 15 && hour < 18.5) {
    themeClass = 'theme-sore';
  } else {
    themeClass = 'theme-malam';
  }

  // Swap dynamic classes on body element to update ambient theme blobs and color states
  if (!document.body.classList.contains(themeClass)) {
    document.body.classList.remove('theme-pagi', 'theme-siang', 'theme-sore', 'theme-malam');
    document.body.classList.add(themeClass);
  }
}
