/* eKosova Smart Assist — Bridge Script
   Injected as a content script into localhost (the agent dashboard).
   Polls chrome.storage.local for new tickets and writes them into
   the page's localStorage so the React app picks them up. */
(function () {
  'use strict';

  const STORAGE_KEY = 'ekosova_support_requests';
  const PENDING_KEY = 'ekosova_pending_tickets';

  function flush() {
    chrome.storage.local.get([PENDING_KEY], function (result) {
      const pending = result[PENDING_KEY];
      if (!pending || pending.length === 0) return;

      try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const existingIds = new Set(existing.map(function (r) { return r.id; }));
        const fresh = pending.filter(function (t) { return !existingIds.has(t.id); });
        if (fresh.length === 0) {
          chrome.storage.local.remove(PENDING_KEY);
          return;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify([...fresh, ...existing]));
        chrome.storage.local.remove(PENDING_KEY);

        // Tell the React app to re-read localStorage
        window.postMessage({ type: 'EKOSOVA_NEW_TICKET', count: fresh.length }, '*');
      } catch (e) { /* silent */ }
    });
  }

  // Flush on load, then poll every 2 seconds
  flush();
  setInterval(flush, 2000);
})();
