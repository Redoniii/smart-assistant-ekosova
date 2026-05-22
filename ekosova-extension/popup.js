const input     = document.getElementById('apikey');
const saveBtn   = document.getElementById('save-btn');
const savedMsg  = document.getElementById('saved-msg');
const statusRow = document.getElementById('status-row');
const statusDot = document.getElementById('status-dot');
const statusTxt = document.getElementById('status-text');

function setStatus(hasKey) {
  if (hasKey) {
    statusRow.className = 'status-row ok';
    statusDot.className = 'dot ok';
    statusTxt.textContent = 'Çelësi API është aktiv ✓';
  } else {
    statusRow.className = 'status-row bad';
    statusDot.className = 'dot bad';
    statusTxt.textContent = 'Çelësi API nuk është vendosur';
  }
}

// Load saved key on open
chrome.storage.local.get('ekosaApiKey', (data) => {
  if (data.ekosaApiKey) {
    input.value = data.ekosaApiKey;
    setStatus(true);
  } else {
    setStatus(false);
  }
});

saveBtn.addEventListener('click', () => {
  const key = input.value.trim();
  if (!key) return;
  chrome.storage.local.set({ ekosaApiKey: key }, () => {
    setStatus(true);
    savedMsg.style.display = 'block';
    setTimeout(() => { savedMsg.style.display = 'none'; }, 2500);
  });
});
