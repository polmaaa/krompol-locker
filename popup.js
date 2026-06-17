// popup.js

const statusBadge = document.getElementById('status-badge');
const statusText = document.getElementById('status-text');
const statusIcon = document.getElementById('status-icon');
const lockedActions = document.getElementById('locked-actions');
const unlockedActions = document.getElementById('unlocked-actions');
const popupLockForm = document.getElementById('popup-lock-form');
const popupPasswordInput = document.getElementById('popup-password-input');
const popupError = document.getElementById('popup-error');
const popupLockBtn = document.getElementById('popup-lock-btn');

// Accordion Elements
const accordionToggle = document.getElementById('accordion-toggle');
const accordionPanel = document.getElementById('accordion-panel');
const chevronIcon = document.getElementById('chevron-icon');
const changePwForm = document.getElementById('change-pw-form');
const oldPasswordInput = document.getElementById('old-password');
const newPasswordInput = document.getElementById('new-password');
const confirmPasswordInput = document.getElementById('confirm-password');
const changePwFeedback = document.getElementById('change-pw-feedback');

// Fetch and apply the current lock state when the popup is opened
document.addEventListener('DOMContentLoaded', () => {
  const storageSession = chrome.storage.session || chrome.storage.local;
  storageSession.get('unlocked', (session) => {
    const isUnlocked = !!(session && session.unlocked);
    updatePopupUI(isUnlocked);
    if (!isUnlocked) {
      popupPasswordInput.focus();
    }
  });
});

// Helper: Dynamically updates the popup elements, badges, and view states
function updatePopupUI(isUnlocked) {
  if (isUnlocked) {
    statusBadge.className = 'status-badge unlocked';
    statusText.textContent = 'Terbuka';
    
    // Unlocked SVG icon (open lock)
    statusIcon.innerHTML = `
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0"></path>
    `;
    
    lockedActions.classList.remove('active');
    unlockedActions.classList.add('active');
    popupError.classList.remove('visible');
    popupPasswordInput.value = '';
  } else {
    statusBadge.className = 'status-badge locked';
    statusText.textContent = 'Terkunci';
    
    // Locked SVG icon (closed lock)
    statusIcon.innerHTML = `
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    `;
    
    unlockedActions.classList.remove('active');
    lockedActions.classList.add('active');
    
    // Collapse change password accordion if it was open
    accordionPanel.classList.remove('show');
    chevronIcon.classList.remove('rotate');
    clearChangePasswordForm();
  }
}

// Helper: Reset password fields and feedback states
function clearChangePasswordForm() {
  oldPasswordInput.value = '';
  newPasswordInput.value = '';
  confirmPasswordInput.value = '';
  changePwFeedback.className = 'feedback-text';
  changePwFeedback.textContent = '';
}

// Toggle accordion display for changing password
accordionToggle.addEventListener('click', () => {
  accordionPanel.classList.toggle('show');
  chevronIcon.classList.toggle('rotate');
  if (!accordionPanel.classList.contains('show')) {
    clearChangePasswordForm();
  }
});

// Process password updates locally via chrome.storage.local
changePwForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const oldPassword = oldPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Client-side match check
  if (newPassword !== confirmPassword) {
    changePwFeedback.className = 'feedback-text error';
    changePwFeedback.textContent = 'Konfirmasi kata sandi baru tidak sesuai!';
    return;
  }

  // Fetch the current password directly from storage to verify the old password
  chrome.storage.local.get('password', (data) => {
    if (chrome.runtime.lastError) {
      changePwFeedback.className = 'feedback-text error';
      changePwFeedback.textContent = 'Kesalahan akses penyimpanan: ' + chrome.runtime.lastError.message;
      return;
    }

    const currentPassword = (data && data.password) || 'ganteng';
    if (oldPassword === currentPassword) {
      // Write the new password directly to local storage
      chrome.storage.local.set({ password: newPassword }, () => {
        if (chrome.runtime.lastError) {
          changePwFeedback.className = 'feedback-text error';
          changePwFeedback.textContent = 'Gagal menyimpan sandi baru: ' + chrome.runtime.lastError.message;
        } else {
          changePwFeedback.className = 'feedback-text success';
          changePwFeedback.textContent = 'Kata sandi berhasil diperbarui!';
          oldPasswordInput.value = '';
          newPasswordInput.value = '';
          confirmPasswordInput.value = '';
        }
      });
    } else {
      changePwFeedback.className = 'feedback-text error';
      changePwFeedback.textContent = 'Kata sandi lama salah!';
    }
  });
});

// Handle unlock action inside the popup form locally via chrome.storage.local
popupLockForm.addEventListener('submit', () => {
  const password = popupPasswordInput.value;

  // Retrieve current password directly from storage to verify
  chrome.storage.local.get('password', (data) => {
    const currentPassword = (data && data.password) || 'ganteng';
    if (password === currentPassword) {
      // Set unlocked status directly in session storage
      const storageSession = chrome.storage.session || chrome.storage.local;
      storageSession.set({ unlocked: true }, () => {
        updatePopupUI(true);
      });
    } else {
      popupError.classList.add('visible');
      popupPasswordInput.value = '';
      popupPasswordInput.focus();
    }
  });
});

// Handle manual lock button inside the popup
popupLockBtn.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'lockBrowser' }, () => {
    updatePopupUI(false);
  });
});

// Listen to session state changes from external tabs and sync popup state in real-time
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.unlocked) {
    updatePopupUI(changes.unlocked.newValue);
    if (!changes.unlocked.newValue) {
      setTimeout(() => {
        popupPasswordInput.focus();
      }, 50);
    }
  }
});
