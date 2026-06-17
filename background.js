// background.js

// Helper: Check if the URL is an internal Chrome or restricted browser URL
function isInternalChromeUrl(url) {
  if (!url) return false;
  return url.startsWith('chrome://') || 
         url.startsWith('chrome-extension://') && !url.startsWith(chrome.runtime.getURL('')) ||
         url.startsWith('about:') || 
         url.startsWith('edge://');
}

// Helper: Determine if the tab should be closed because of unauthorized internal page navigation
function shouldCloseTab(url) {
  if (!url) return false;
  // Allow the default newtab and blank pages to load so they can be overridden/handled
  if (url === 'chrome://newtab/' || url === 'about:blank') return false;
  return isInternalChromeUrl(url);
}

// Helper: Evaluates tab state and redirects/closes tabs if locked
function handleTabState(tabId, url) {
  if (!url) return;

  const storageSession = chrome.storage.session || chrome.storage.local;
  storageSession.get('unlocked', (session) => {
    if (session && session.unlocked) {
      return; // Do nothing if already unlocked
    }

    // If it's already our lock page, do nothing
    if (url.startsWith(chrome.runtime.getURL('lock.html'))) {
      return;
    }

    // Close sensitive internal pages to prevent bypasses (e.g., chrome://settings)
    if (shouldCloseTab(url)) {
      chrome.tabs.remove(tabId).catch(() => {});
      return;
    }

    // Redirect standard web pages to the lock page and preserve the original URL
    const lockUrl = chrome.runtime.getURL('lock.html') + '?originalUrl=' + encodeURIComponent(url);
    chrome.tabs.update(tabId, { url: lockUrl }).catch(() => {});
  });
}

// Locks the browser session and redirects all open tabs
function lockBrowser() {
  const storageSession = chrome.storage.session || chrome.storage.local;
  storageSession.set({ unlocked: false }, () => {
    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        handleTabState(tab.id, tab.url);
      }
    });
  });
}

// Intercept events when tabs are created or updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    handleTabState(tabId, changeInfo.url);
  }
});

chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url) {
    handleTabState(tab.id, tab.url);
  }
});

// Intercept navigations early via webNavigation to avoid flashing the target page
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId === 0) { // Main frame only
    handleTabState(details.tabId, details.url);
  }
});

// Perform browser lockdown on startup
chrome.runtime.onStartup.addListener(() => {
  lockBrowser();
});

// Perform browser lockdown on installation and set default password
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('password', (data) => {
    if (!data || !data.password) {
      chrome.storage.local.set({ password: 'ganteng' }, () => {
        lockBrowser();
      });
    } else {
      lockBrowser();
    }
  });
});

// Message listener for password check, manual locking, and password updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkPassword') {
    chrome.storage.local.get('password', (data) => {
      const currentPassword = (data && data.password) || 'ganteng';
      if (message.password === currentPassword) {
        const storageSession = chrome.storage.session || chrome.storage.local;
        storageSession.set({ unlocked: true }, () => {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false });
      }
    });
    return true; // Keep response channel open for async operations
  }

  if (message.action === 'changePassword') {
    chrome.storage.local.get('password', (data) => {
      const currentPassword = (data && data.password) || 'ganteng';
      if (message.oldPassword === currentPassword) {
        chrome.storage.local.set({ password: message.newPassword }, () => {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, error: 'Password lama salah!' });
      }
    });
    return true; // Keep response channel open
  }

  if (message.action === 'lockBrowser') {
    lockBrowser();
    sendResponse({ success: true });
    return true;
  }
});
