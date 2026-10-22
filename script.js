(() => {
  const $ = id => document.getElementById(id);
  const hack = $('hack'), term = $('term');
  const BACK_LIMIT = 10; // number of back-swipes/back-presses absorbed before back finally works
  const EXIT_URL = ''; // optional: e.g. 'https://www.google.com' to redirect after ESC. Empty = plain blank page.
  let alive = true, timers = [], raf = [], actx = null, osc = null, tapCount = 0, tapTimer = null;

  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const hex = n => Array.from({length: n}, () => rnd(0, 15).toString(16)).join('');
  const pick = a => a[rnd(0, a.length - 1)];
  const sleep = ms => new Promise(r => timers.push(setTimeout(r, ms)));
  const every = (fn, ms) => timers.push(setInterval(fn, ms));
  const pad = n => String(n).padStart(2, '0');

  const ip = `${rnd(11,223)}.${rnd(0,255)}.${rnd(0,255)}.${rnd(2,254)}`;
  const attacker = `${rnd(11,223)}.${rnd(0,255)}.${rnd(0,255)}.${rnd(2,254)}`;
  const ua = navigator.userAgent, isAndroid = /Android/i.test(ua), isIOS = /iPhone|iPad|iPod/i.test(ua), phone = isAndroid || isIOS;
  const host = isIOS ? 'iPhone' : isAndroid ? 'Galaxy-' + hex(4).toUpperCase() : 'DESKTOP-' + hex(7).toUpperCase();
  const user = phone ? 'u0_a' + rnd(100, 399) : pick(['User', 'Admin', 'Owner', 'Home']);
  const sid = '0x' + hex(8).toUpperCase();
  $('sess').textContent = 'SESSION ' + sid;
  $('wid').textContent = `ID: ${sid}  ·  HOST: ${host}  ·  IP: ${ip}`;

  /* ---------- clock ---------- */
  every(() => {
    const d = new Date();
    $('clock').textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    $('camtime').textContent = d.toISOString().replace('T', ' ').slice(0, 19);
  }, 1000);

  /* ---------- matrix ---------- */
  const mc = $('matrix'), mx = mc.getContext('2d');
  const glyphs = 'アイウエオカキクケコ0123456789ABCDEF$#@%<>'.split('');
  let drops = [];
  function size() { mc.width = innerWidth; mc.height = innerHeight; drops = Array(Math.floor(mc.width / 16)).fill(1); }
  function rain() {
    if (!alive) return;
    mx.fillStyle = 'rgba(0,0,0,.09)'; mx.fillRect(0, 0, mc.width, mc.height);
    mx.fillStyle = '#19ff7a'; mx.font = '16px monospace';
    drops.forEach((y, i) => {
      mx.fillText(pick(glyphs), i * 16, y * 16);
      if (y * 16 > mc.height && Math.random() > .975) drops[i] = 0;
      drops[i]++;
    });
    raf.push(requestAnimationFrame(rain));
  }

  /* ---------- fake webcam static ---------- */
  const cc = $('cam'), cx = cc.getContext('2d');
  function cam() {
    if (!alive) return;
    const w = cc.width = cc.clientWidth || 300, h = cc.height = cc.clientHeight || 150;
    const img = cx.createImageData(w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = rnd(10, 90);
      img.data[i] = v * .6; img.data[i+1] = v; img.data[i+2] = v * .7; img.data[i+3] = 255;
    }
    cx.putImageData(img, 0, 0);
    cx.fillStyle = 'rgba(25,255,122,.25)'; cx.fillRect(0, (Date.now() / 8) % h, w, 3);
    setTimeout(() => raf.push(requestAnimationFrame(cam)), 90);
  }

  /* ---------- network graph ---------- */
  const nc = $('net'), nx = nc.getContext('2d');
  let pts = Array(60).fill(30);
  function net() {
    if (!alive) return;
    const w = nc.width = nc.clientWidth || 300, h = nc.height = nc.clientHeight || 80;
    pts.push(Math.max(5, Math.min(95, pts[pts.length - 1] + rnd(-18, 18)))); pts.shift();
    nx.strokeStyle = '#19ff7a'; nx.lineWidth = 2; nx.beginPath();
    pts.forEach((p, i) => { const x = i / (pts.length - 1) * w, y = h - p / 100 * h; i ? nx.lineTo(x, y) : nx.moveTo(x, y); });
    nx.stroke();
    $('kbps').textContent = Math.round(pts[pts.length - 1] * 38) + ' KB/s';
    setTimeout(() => raf.push(requestAnimationFrame(net)), 200);
  }

  /* ---------- counters + file encryption list ---------- */
  let pk = 0, cr = 0, up = 0, fc = 0;
  every(() => {
    pk += rnd(40, 900); up += Math.random() * 3.2;
    if (Math.random() < .25) cr++;
    $('s1').textContent = 'PKTS: ' + pk.toLocaleString();
    $('s2').textContent = 'CREDS: ' + cr;
    $('s3').textContent = 'UPLOAD: ' + up.toFixed(1) + ' MB';
  }, 400);
  const dirs = ['Documents', 'Pictures', 'Downloads', 'Desktop', 'Videos', 'Music'];
  const names = ['IMG_', 'Screenshot_', 'Resume_', 'School_', 'Project_', 'Scan_', 'VID_', 'Notes_', 'Receipt_'];
  const exts = ['.jpg', '.png', '.docx', '.pdf', '.xlsx', '.mp4', '.txt', '.pptx'];
  const flist = $('flist');
  every(() => {
    const d = document.createElement('div');
    d.className = 'done';
    const base = isIOS ? '/var/mobile/Media/' : isAndroid ? '/storage/emulated/0/' : null;
    d.textContent = base
      ? base + pick(['DCIM/Camera', 'Pictures', 'Download', 'Documents', 'Movies', 'WhatsApp/Media', 'Messenger']) + '/' + pick(names) + rnd(100, 9999) + pick(exts) + '.locked'
      : 'C:\\Users\\' + user + '\\' + pick(dirs) + '\\' + pick(names) + rnd(100, 9999) + pick(exts) + '.locked';
    flist.appendChild(d);
    while (flist.children.length > 14) flist.removeChild(flist.firstChild);
    fc++; $('fcount').textContent = fc;
  }, 160);

  /* ---------- terminal ---------- */
  function line(text, cls) {
    const d = document.createElement('div');
    if (cls) d.className = cls;
    d.textContent = text;
    term.appendChild(d);
    while (term.children.length > 70) term.removeChild(term.firstChild);
  }
  async function type(cmd, prompt) {
    const d = document.createElement('div'); d.className = 'c';
    term.appendChild(d);
    d.textContent = prompt;
    for (const ch of cmd) { if (!alive) return; d.textContent += ch; await sleep(rnd(15, 55)); }
    await sleep(250);
  }
  async function out(lines, gap = 90) {
    for (const [t, c] of lines) { if (!alive) return; line(t, c); await sleep(gap + rnd(0, 60)); }
  }
  async function storyPC() {
    const P = 'root@kali:~# ', M = 'meterpreter > ';
    await type(`nmap -sS -Pn -p- --min-rate 5000 ${ip}`, P);
    await out([
      ['Starting Nmap 7.94 ( https://nmap.org ) at ' + new Date().toString().slice(0, 24)],
      [`Nmap scan report for ${ip}`], ['Host is up (0.0' + rnd(11, 89) + 's latency).'],
      ['PORT      STATE SERVICE'], ['135/tcp   open  msrpc'], ['139/tcp   open  netbios-ssn'],
      ['445/tcp   open  microsoft-ds', 'w'], ['3389/tcp  open  ms-wbt-server', 'w'],
      ['Nmap done: 1 IP address (1 host up) scanned in 11.82 seconds'],
    ]);
    await type('msfconsole -q -x "use exploit/windows/smb/ms17_010_eternalblue"', P);
    await out([
      [`[*] Started reverse TCP handler on ${attacker}:4444`, 'b'],
      [`[*] ${ip}:445 - Connecting to target for exploitation.`, 'b'],
      [`[+] ${ip}:445 - Host is likely VULNERABLE to MS17-010!`, 'w'],
      [`[*] ${ip}:445 - Sending exploit packet 1/3 ...`, 'b'],
      [`[*] ${ip}:445 - Sending final SMBv1 buffer (${rnd(12000, 17000)} bytes)`, 'b'],
      ['[*] Sending stage (200774 bytes) to ' + ip, 'b'],
      [`[*] Meterpreter session 1 opened (${attacker}:4444 -> ${ip}:${rnd(49152, 65000)})`, 'e'],
    ], 220);
    await type('sysinfo', M);
    await out([
      [`Computer        : ${host}`], [`OS              : ${navigator.platform || 'Windows'} (Build ${rnd(19041, 22631)})`],
      ['Architecture    : x64'], ['Meterpreter     : x64/windows'],
    ]);
    await type('getsystem', M);
    await out([['...got system via technique 1 (Named Pipe Impersonation).', 'e']]);
    await type('hashdump', M);
    await out([
      [`Administrator:500:aad3b435b51404eeaad3b435b51404ee:${hex(32)}:::`],
      [`${user}:1001:aad3b435b51404eeaad3b435b51404ee:${hex(32)}:::`],
      [`Guest:501:aad3b435b51404eeaad3b435b51404ee:${hex(32)}:::`],
    ], 200);
    await type('run post/windows/gather/enum_chrome', M);
    await out([
      ['[*] Extracting saved credentials ...', 'b'], ['[+] facebook.com  → ********', 'w'],
      ['[+] accounts.google.com → ********', 'w'], ['[+] gcash.com → ********', 'w'],
      ['[+] instagram.com → ********', 'w'], ['[+] Cookies: ' + rnd(300, 900) + ' sessions copied', 'e'],
    ], 230);
    await type('webcam_stream', M);
    await out([['[*] Starting...', 'b'], ['[*] Preparing player...', 'b'], ['[+] Webcam stream active → see CAM 01', 'e']], 250);
    await type('keyscan_start', M);
    await out([['Starting the keystroke sniffer ...'], ['[+] Keylogger running.', 'e']]);
    await type('upload /root/payload/encrypt.exe C:\\Windows\\Temp\\', M);
    await out([['[*] Uploading : encrypt.exe -> C:\\Windows\\Temp\\encrypt.exe', 'b'], ['[*] Uploaded 1.21 MiB of 1.21 MiB (100.0%)', 'b'], ['[*] Completed', 'b']]);
    await type('execute -f encrypt.exe -H', M);
    await out([['Process ' + rnd(1000, 9999) + ' created.', 'e'], ['[!] Encrypting user files ...', 'e']]);
    // endless realistic noise
    while (alive) {
      const r = Math.random();
      if (r < .3) line(`[*] exfil ${hex(8)}.dat → ${attacker}:443 (${rnd(80, 2400)} KB)`, 'b');
      else if (r < .5) line(`[+] ${pick(['Chrome','Edge','Messenger','Telegram','Viber','Outlook'])} session token captured`, 'w');
      else if (r < .6) line(`[!] AV process ${pick(['MsMpEng','avgsvc','mbam'])}.exe terminated`, 'e');
      else line(`${hex(8)} ${hex(8)} ${hex(8)} ${hex(8)}  ${hex(16)}`);
      await sleep(rnd(120, 420));
    }
  }

  async function storyPhone() {
    const P = 'root@kali:~# ', M = 'meterpreter > ';
    const osName = isIOS ? 'iOS 17.' + rnd(0, 6) : 'Android 1' + rnd(2, 4);
    await type(`nmap -sS -Pn -p 5555,8080,62078 --min-rate 5000 ${ip}`, P);
    await out([
      ['Starting Nmap 7.94 ( https://nmap.org ) at ' + new Date().toString().slice(0, 24)],
      [`Nmap scan report for ${ip}`], ['Host is up (0.0' + rnd(11, 89) + 's latency).'],
      ['PORT      STATE SERVICE'], ['5555/tcp  open  adb', 'w'], ['8080/tcp  open  http-proxy'], ['62078/tcp open  iphone-sync', 'w'],
      ['Nmap done: 1 IP address (1 host up) scanned in 9.41 seconds'],
    ]);
    await type(isIOS ? 'msfconsole -q -x "use exploit/apple_ios/browser/webkit_inject"' : 'msfconsole -q -x "use exploit/android/adb/adb_server_exec"', P);
    await out([
      [`[*] Started reverse TCP handler on ${attacker}:4444`, 'b'],
      [`[*] ${ip}:5555 - Connecting to target for exploitation.`, 'b'],
      [`[+] ${ip}:5555 - Device is VULNERABLE (unpatched ${osName})`, 'w'],
      [`[*] Sending stage (${rnd(60000, 90000)} bytes) to ${ip}`, 'b'],
      [`[*] Meterpreter session 1 opened (${attacker}:4444 -> ${ip}:${rnd(49152, 65000)})`, 'e'],
    ], 220);
    await type('sysinfo', M);
    await out([[`Computer     : ${host}`], [`OS           : ${osName} - Linux 5.15 (aarch64)`], ['Meterpreter  : dalvik/' + (isIOS ? 'ios' : 'android')]]);
    await type('getuid', M);
    await out([['Server username: ' + user, 'e']]);
    await type('dump_contacts', M);
    await out([['[*] Fetching ' + rnd(120, 640) + ' contact entries', 'b'], ['[+] Contacts saved to /root/loot/contacts_' + hex(4) + '.txt', 'e']]);
    await type('dump_sms', M);
    await out([['[*] Fetching ' + rnd(800, 6000) + ' sms messages', 'b'], ['[+] SMS saved (OTP codes included)', 'w'], ['[+] SMS saved to /root/loot/sms_' + hex(4) + '.txt', 'e']]);
    await type('run post/multi/gather/saved_credentials', M);
    await out([
      ['[*] Extracting saved credentials ...', 'b'], ['[+] facebook.com  → ********', 'w'], ['[+] accounts.google.com → ********', 'w'],
      ['[+] gcash.com → ********', 'w'], ['[+] instagram.com → ********', 'w'], ['[+] Cookies: ' + rnd(300, 900) + ' sessions copied', 'e'],
    ], 230);
    await type('geolocate', M);
    await out([[`[+] Current location: ${(10 + Math.random() * 3).toFixed(5)}, ${(122 + Math.random() * 3).toFixed(5)}`, 'e']]);
    await type('webcam_stream -i 1', M);
    await out([['[*] Starting...', 'b'], ['[+] Front camera stream active → see CAM 01', 'e']], 250);
    await type('record_mic -d 30', M);
    await out([['[*] Starting...', 'b'], ['[+] Microphone recording in progress', 'e']]);
    await type('upload /root/payload/encrypt.apk /sdcard/.cache/', M);
    await out([['[*] Uploading : encrypt.apk -> /sdcard/.cache/encrypt.apk', 'b'], ['[*] Completed', 'b']]);
    await type('shell -c "nohup ./encrypt &"', M);
    await out([['Process ' + rnd(1000, 9999) + ' created.', 'e'], ['[!] Encrypting user files ...', 'e']]);
    while (alive) {
      const r = Math.random();
      if (r < .3) line(`[*] exfil ${hex(8)}.jpg → ${attacker}:443 (${rnd(80, 2400)} KB)`, 'b');
      else if (r < .5) line(`[+] ${pick(['Chrome','Messenger','Telegram','Viber','GCash','WhatsApp'])} session token captured`, 'w');
      else if (r < .6) line(`[!] security service ${pick(['gms.security','knox.agent','defender'])} terminated`, 'e');
      else line(`${hex(8)} ${hex(8)} ${hex(8)} ${hex(8)}  ${hex(16)}`);
      await sleep(rnd(120, 420));
    }
  }
  const story = phone ? storyPhone : storyPC;

  /* ---------- sound ---------- */
  function sound() {
    try {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      osc = actx.createOscillator(); const g = actx.createGain(); g.gain.value = .035;
      osc.type = 'sawtooth'; osc.connect(g).connect(actx.destination); osc.start();
      let hi = false; every(() => osc.frequency.value = (hi = !hi) ? 900 : 650, 500);
    } catch (e) {}
  }

  /* ---------- glitch effects + warning ---------- */
  function effects() {
    every(() => { hack.classList.add('shake'); setTimeout(() => hack.classList.remove('shake'), 250); }, rnd(5000, 8000));
    every(() => { hack.classList.add('invert'); setTimeout(() => hack.classList.remove('invert'), 90); }, 9000);
    timers.push(setTimeout(() => $('warn').classList.remove('hidden'), 22000));
  }

  /* ---------- back-button lock (absorbs BACK_LIMIT back-swipes) ---------- */
  let trapArmed = false;
  function armTrap() {
    if (trapArmed || !alive) return;
    trapArmed = true;
    try { for (let i = 0; i < BACK_LIMIT; i++) history.pushState({ lock: i }, '', location.href); } catch (e) {}
  }
  window.addEventListener('popstate', () => {
    if (!alive || !trapArmed) return;
    line('[!] ACCESS DENIED - session locked by remote operator', 'e');
    hack.classList.add('shake'); setTimeout(() => hack.classList.remove('shake'), 250);
  });
  // armTrap() runs from goFull() on the first real tap (Chrome ignores history entries made without a gesture)

  /* ---------- fullscreen on first interaction ---------- */
  // NOTE: on phones, only 'click' / 'touchend' / 'pointerup' count as a valid user gesture
  // for the Fullscreen API ('touchstart' / 'pointerdown' do NOT), so we listen to those.
  let fsDone = false, fsPending = false;
  function goFull() {
    armTrap();
    if (fsDone || fsPending || !alive) return;
    const el = document.documentElement;
    const rf = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (!actx) sound();
    if (!rf) return;
    fsPending = true;
    try {
      const p = rf.call(el, { navigationUI: 'hide' });
      if (p && p.then) p.then(() => { fsDone = true; fsPending = false; lockLandscape(); })
                        .catch(() => { fsPending = false; });   // retry on next tap
      else { fsDone = true; fsPending = false; lockLandscape(); }
    } catch (e) { fsPending = false; }
  }
  function lockLandscape() {
    try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {}); } catch (e) {}
  }
  ['click', 'touchend', 'pointerup', 'keydown'].forEach(ev => document.addEventListener(ev, goFull, { passive: true }));

  /* ---------- exit (secret) ---------- */
  function stop() {
    if (!alive) return;
    alive = false;
    timers.forEach(t => { clearTimeout(t); clearInterval(t); });
    raf.forEach(cancelAnimationFrame);
    try { osc && osc.stop(); actx && actx.close(); } catch (e) {}
    if (document.fullscreenElement || document.webkitFullscreenElement)
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    try { screen.orientation && screen.orientation.unlock && screen.orientation.unlock(); } catch (e) {}
    hack.classList.add('hidden');
    document.body.style.background = '#fff';
    if (EXIT_URL) location.href = EXIT_URL;
  }
  document.addEventListener('keydown', e => { if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'x') stop(); }); // secret exit for the prankster (laptop)
  // if the victim swipes out of fullscreen, DON'T stop - just re-enter on the next tap
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(ev =>
    document.addEventListener(ev, () => { if (!document.fullscreenElement && !document.webkitFullscreenElement) { fsDone = false; fsPending = false; } }));
  $('tapZone').addEventListener('click', () => {
    tapCount++; clearTimeout(tapTimer); tapTimer = setTimeout(() => tapCount = 0, 2500);
    if (tapCount >= 5) { tapCount = 0; stop(); }
  });

  /* ---------- go ---------- */
  size(); window.addEventListener('resize', size);
  rain(); cam(); net(); effects(); story();
})();
