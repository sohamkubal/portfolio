// Password strength frontend logic + optional HIBP k-anonymity check
const pw = document.getElementById('password');
const meterBar = document.getElementById('meterBar');
const statusText = document.getElementById('statusText');
const suggestionsList = document.getElementById('suggestionsList');
const toggleBtn = document.getElementById('toggleShow');
const checkBreachBtn = document.getElementById('checkBreach');
const breachResult = document.getElementById('breachResult');

const COMMON_PATTERNS = [
  /\bpassword\b/i,
  /\b1234\b/,
  /(.)\1{3,}/, // repeated char sequences
  /qwerty/i,
  /admin/i
];

function scorePassword(s) {
  const reasons = [];
  let score = 0;
  const len = s.length;

  if (len === 0) return {score:0,reasons:['Enter a password'], level:'zero'};
  if (len >= 12) { score += 35; }
  else if (len >= 8) { score += 18; }
  else { score += 6; reasons.push('Use at least 8–12 characters'); }

  const hasLower = /[a-z]/.test(s);
  const hasUpper = /[A-Z]/.test(s);
  const hasDigit = /\d/.test(s);
  const hasSymbol = /[^A-Za-z0-9]/.test(s);
  const classes = [hasLower,hasUpper,hasDigit,hasSymbol].filter(Boolean).length;
  score += classes * 15;
  if (classes < 3) reasons.push('Use mixed classes: upper, lower, digits and symbols (3+ types)');

  if (COMMON_PATTERNS.some(p => p.test(s))) {
    score -= 15;
    reasons.push('Avoid common words or repeated sequences');
  }

  if (/^\d+$/.test(s)) {
    score -= 8;
    reasons.push('Avoid only numbers');
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  if (score === 0) return {score,reasons,level:'zero'};
  if (score < 50) return {score,reasons,level:'weak'};
  if (score < 80) return {score,reasons,level:'ok'};
  return {score,reasons,level:'strong'};
}

function updateUI() {
  const val = pw.value.trim();
  const r = scorePassword(val);

  meterBar.style.width = r.score + '%';
  meterBar.className = 'meter-bar ' + (r.level === 'zero' ? 'zero' : r.level);

  if (r.level === 'zero') statusText.textContent = 'Enter a password to test';
  else if (r.level === 'weak') statusText.textContent = 'Weak password';
  else if (r.level === 'ok') statusText.textContent = 'Moderate';
  else statusText.textContent = 'Strong password';

  suggestionsList.innerHTML = '';
  if (r.reasons.length) {
    r.reasons.forEach(t => {
      const li = document.createElement('li'); li.textContent = t; suggestionsList.appendChild(li);
    });
  } else {
    const li = document.createElement('li'); li.textContent = 'Nice — looks strong. Consider length if you need higher entropy.'; suggestionsList.appendChild(li);
  }

  breachResult.textContent = '';
}

async function sha1Hex(str) {
  const enc = new TextEncoder();
  const data = enc.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const bytes = new Uint8Array(hashBuffer);
  return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('').toUpperCase();
}

async function checkBreach(password) {
  try {
    breachResult.textContent = 'Checking…';
    const sha1 = await sha1Hex(password);
    const prefix = sha1.slice(0,5);
    const suffix = sha1.slice(5);
    const res = await fetch('https://api.pwnedpasswords.com/range/' + prefix);
    if (!res.ok) throw new Error('Network/Rate limit');
    const text = await res.text();
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      const [hashSuffix,count] = line.split(':');
      if (!hashSuffix) continue;
      if (hashSuffix.toUpperCase() === suffix) {
        breachResult.innerHTML = `⚠️ Found in breaches <strong>${count}</strong> times — change it.`;
        return;
      }
    }
    breachResult.innerHTML = '✅ Not found in HIBP (privacy-safe check).';
  } catch (err) {
    breachResult.textContent = 'Could not check (network/CORS/rate).';
    console.warn('checkBreach error', err);
  }
}

pw.addEventListener('input', updateUI);
toggleBtn.addEventListener('click', () => {
  if (pw.type === 'password') {
    pw.type = 'text'; toggleBtn.textContent = 'HIDE';
  } else {
    pw.type = 'password'; toggleBtn.textContent = 'SHOW';
  }
});
checkBreachBtn.addEventListener('click', async () => {
  const v = pw.value.trim();
  if (!v) { breachResult.textContent = 'Enter a password first.'; return; }
  await checkBreach(v);
});

// init
updateUI();
