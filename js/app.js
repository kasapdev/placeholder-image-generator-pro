/* =====================================================================
   Placeholder Image Generator Pro — app.js
   Generates placeholder images entirely via <canvas>. Zero network
   calls, zero dependencies. Classic script (no modules).
   Depends on window.WUS (core.js).
   ===================================================================== */
(function () {
  'use strict';

  var WUS = window.WUS;
  var STORE_KEY = 'placeholderimg.state';

  /* ----------------------------- DOM refs ---------------------------- */
  var canvas = document.getElementById('previewCanvas');
  var ctx = canvas.getContext('2d');

  var dimsBadge = document.getElementById('dimsBadge');

  var presetRow = document.getElementById('presetRow');
  var widthInput = document.getElementById('widthInput');
  var heightInput = document.getElementById('heightInput');

  var bgTypeSolid = document.getElementById('bgTypeSolid');
  var bgTypeGradient = document.getElementById('bgTypeGradient');
  var solidControls = document.getElementById('solidControls');
  var gradientControls = document.getElementById('gradientControls');
  var solidColor = document.getElementById('solidColor');
  var gradColor1 = document.getElementById('gradColor1');
  var gradColor2 = document.getElementById('gradColor2');
  var gradAngle = document.getElementById('gradAngle');
  var gradAngleNumber = document.getElementById('gradAngleNumber');
  var gradAngleLabel = document.getElementById('gradAngleLabel');

  var textInput = document.getElementById('textInput');
  var textAutoToggle = document.getElementById('textAutoToggle');
  var fontFamily = document.getElementById('fontFamily');
  var fontSize = document.getElementById('fontSize');
  var fontAutoFit = document.getElementById('fontAutoFit');
  var textColor = document.getElementById('textColor');

  var patternSelect = document.getElementById('patternSelect');
  var patternControls = document.getElementById('patternControls');
  var patternColor = document.getElementById('patternColor');
  var patternOpacity = document.getElementById('patternOpacity');
  var patternOpacityLabel = document.getElementById('patternOpacityLabel');
  var patternDensity = document.getElementById('patternDensity');
  var patternDensityLabel = document.getElementById('patternDensityLabel');
  var btnShuffleNoise = document.getElementById('btnShuffleNoise');

  var btnDownload = document.getElementById('btnDownload');
  var btnResetAll = document.getElementById('btnResetAll');

  var imgSnippetEl = document.getElementById('imgSnippet');
  var cssSnippetEl = document.getElementById('cssSnippet');
  var btnCopyImg = document.getElementById('btnCopyImg');
  var btnCopyCss = document.getElementById('btnCopyCss');

  /* ----------------------------- Defaults ----------------------------- */
  var DEFAULT_STATE = {
    width: 300,
    height: 200,
    bgType: 'solid',
    bgColor1: '#6366f1',
    gradColor1: '#6366f1',
    gradColor2: '#d946ef',
    gradAngle: 135,
    text: '300 × 200',
    textManual: false,
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: 28,
    fontAutoFit: true,
    textColor: '#ffffff',
    pattern: 'none',
    patternColor: '#ffffff',
    patternOpacity: 25,
    patternDensity: 50,
    noiseSeed: 1
  };

  var state = {};

  /* Last generated outputs, kept in full (untruncated) for copy/download. */
  var lastDataUrl = '';
  var lastImgTag = '';
  var lastCssSnippet = '';

  /* ============================= HELPERS ============================== */
  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

  function computeAutoText() {
    return state.width + ' × ' + state.height;
  }

  /* Deterministic PRNG so noise dot positions stay stable while unrelated
     controls change, and only move when dimensions/density/seed change. */
  function mulberry32(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function mapRange(v, inMin, inMax, outMin, outMax) {
    var t = (v - inMin) / (inMax - inMin);
    return outMin + t * (outMax - outMin);
  }

  function humanBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / (1024 * 1024)).toFixed(2) + ' MB';
  }

  /* Approximate decoded byte size of a base64 data URL without an async
     Blob round-trip. */
  function approxDataUrlBytes(dataUrl) {
    var idx = dataUrl.indexOf('base64,');
    if (idx < 0) return dataUrl.length;
    var b64 = dataUrl.slice(idx + 7);
    var len = b64.length;
    var padding = 0;
    if (b64.slice(-2) === '==') padding = 2;
    else if (b64.slice(-1) === '=') padding = 1;
    return Math.max(0, Math.floor((len * 3) / 4) - padding);
  }

  /* Truncate a long data URI for display only; copy always uses the full
     untruncated string kept in lastImgTag. */
  function truncateDataUrl(url, keep) {
    if (url.length <= keep * 2 + 24) return url;
    return url.slice(0, keep) + '…' + url.slice(-16);
  }

  /* ============================= DRAWING =============================== */
  function drawBackground(w, h) {
    if (state.bgType === 'gradient') {
      var angleRad = (state.gradAngle * Math.PI) / 180;
      var cx = w / 2, cy = h / 2;
      var len = Math.sqrt(w * w + h * h) / 2;
      // CSS linear-gradient angle convention: 0deg = to top, clockwise.
      var dx = Math.sin(angleRad) * len;
      var dy = -Math.cos(angleRad) * len;
      var grad = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
      grad.addColorStop(0, state.gradColor1);
      grad.addColorStop(1, state.gradColor2);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = state.bgColor1;
    }
    ctx.fillRect(0, 0, w, h);
  }

  function drawPattern(w, h) {
    if (state.pattern === 'none') return;
    ctx.save();
    ctx.globalAlpha = state.patternOpacity / 100;
    ctx.fillStyle = state.patternColor;
    ctx.strokeStyle = state.patternColor;

    if (state.pattern === 'stripes') {
      var spacing = mapRange(state.patternDensity, 1, 100, 64, 8);
      var stripeWidth = spacing / 2;
      var diag = Math.sqrt(w * w + h * h);
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(Math.PI / 4);
      for (var x = -diag; x < diag; x += spacing) {
        ctx.fillRect(x, -diag, stripeWidth, diag * 2);
      }
      ctx.restore();
    } else if (state.pattern === 'grid') {
      var step = mapRange(state.patternDensity, 1, 100, 90, 12);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var gx = 0; gx <= w; gx += step) {
        ctx.moveTo(Math.round(gx) + 0.5, 0);
        ctx.lineTo(Math.round(gx) + 0.5, h);
      }
      for (var gy = 0; gy <= h; gy += step) {
        ctx.moveTo(0, Math.round(gy) + 0.5);
        ctx.lineTo(w, Math.round(gy) + 0.5);
      }
      ctx.stroke();
    } else if (state.pattern === 'noise') {
      var rand = mulberry32(state.noiseSeed);
      var count = Math.round(((w * h) / 5500) * (state.patternDensity / 50));
      count = clamp(count, 0, 20000);
      for (var i = 0; i < count; i++) {
        var rx = rand() * w;
        var ry = rand() * h;
        var rr = 0.5 + rand() * 2.2;
        ctx.beginPath();
        ctx.arc(rx, ry, rr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawText(w, h) {
    var text = state.text || '';
    if (!text) return;
    ctx.save();
    ctx.fillStyle = state.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    var size = clamp(Number(state.fontSize) || 28, 8, 400);
    if (state.fontAutoFit) {
      var maxWidth = w * 0.86;
      var startSize = clamp(Math.round(h * 0.5), 8, 400);
      ctx.font = startSize + 'px ' + state.fontFamily;
      var measured = ctx.measureText(text).width;
      if (measured > maxWidth && measured > 0) {
        size = Math.max(8, Math.floor(startSize * (maxWidth / measured)));
      } else {
        size = startSize;
      }
    }
    ctx.font = size + 'px ' + state.fontFamily;
    ctx.fillText(text, w / 2, h / 2, w * 0.94);
    ctx.restore();
  }

  function render() {
    var w = state.width, h = state.height;
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    drawBackground(w, h);
    drawPattern(w, h);
    drawText(w, h);
    updateOutputs();
  }

  /* ============================= OUTPUTS =============================== */
  function updateOutputs() {
    var dataUrl = canvas.toDataURL('image/png');
    lastDataUrl = dataUrl;

    var bytes = approxDataUrlBytes(dataUrl);
    dimsBadge.textContent = state.width + ' × ' + state.height + ' · ' + humanBytes(bytes);

    var altText = WUS.escapeHtml(state.text || 'placeholder');
    lastImgTag = '<img src="' + dataUrl + '" width="' + state.width + '" height="' + state.height + '" alt="' + altText + '">';
    var displayTag = '<img src="' + truncateDataUrl(dataUrl, 48) + '" width="' + state.width + '" height="' + state.height + '" alt="' + altText + '">';
    imgSnippetEl.textContent = displayTag + '\n\n/* Data URI truncated for display — Copy grabs the full snippet (' + humanBytes(bytes) + '). */';

    var cssBg = state.bgType === 'gradient'
      ? 'linear-gradient(' + state.gradAngle + 'deg, ' + state.gradColor1 + ', ' + state.gradColor2 + ')'
      : state.bgColor1;
    lastCssSnippet =
      '.placeholder {\n' +
      '  width: ' + state.width + 'px;\n' +
      '  height: ' + state.height + 'px;\n' +
      '  background: ' + cssBg + ';\n' +
      '}';
    cssSnippetEl.textContent = lastCssSnippet;

    persistDebounced();
  }

  /* ============================ UI <-> STATE ============================ */
  function updatePresetActiveState() {
    var btns = presetRow.querySelectorAll('.preset-btn');
    for (var i = 0; i < btns.length; i++) {
      var b = btns[i];
      var match = Number(b.dataset.w) === state.width && Number(b.dataset.h) === state.height;
      b.classList.toggle('is-active', match);
    }
  }

  function syncAutoText() {
    if (!state.textManual) {
      state.text = computeAutoText();
      textInput.value = state.text;
    }
  }

  function applyStateToInputs() {
    widthInput.value = state.width;
    heightInput.value = state.height;
    updatePresetActiveState();

    bgTypeSolid.classList.toggle('is-active', state.bgType === 'solid');
    bgTypeSolid.setAttribute('aria-selected', String(state.bgType === 'solid'));
    bgTypeGradient.classList.toggle('is-active', state.bgType === 'gradient');
    bgTypeGradient.setAttribute('aria-selected', String(state.bgType === 'gradient'));
    solidControls.hidden = state.bgType !== 'solid';
    gradientControls.hidden = state.bgType !== 'gradient';
    solidColor.value = state.bgColor1;
    gradColor1.value = state.gradColor1;
    gradColor2.value = state.gradColor2;
    gradAngle.value = state.gradAngle;
    gradAngleNumber.value = state.gradAngle;
    gradAngleLabel.textContent = state.gradAngle + '°';

    textInput.value = state.text;
    textAutoToggle.checked = !state.textManual;
    fontFamily.value = state.fontFamily;
    fontSize.value = state.fontSize;
    fontSize.disabled = !!state.fontAutoFit;
    fontAutoFit.checked = !!state.fontAutoFit;
    textColor.value = state.textColor;

    patternSelect.value = state.pattern;
    patternControls.hidden = state.pattern === 'none';
    btnShuffleNoise.hidden = state.pattern !== 'noise';
    patternColor.value = state.patternColor;
    patternOpacity.value = state.patternOpacity;
    patternOpacityLabel.textContent = state.patternOpacity + '%';
    patternDensity.value = state.patternDensity;
    patternDensityLabel.textContent = state.patternDensity + '%';
  }

  /* ============================== EVENTS ================================ */
  presetRow.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.preset-btn') : null;
    if (!btn) return;
    state.width = Number(btn.dataset.w);
    state.height = Number(btn.dataset.h);
    widthInput.value = state.width;
    heightInput.value = state.height;
    updatePresetActiveState();
    syncAutoText();
    render();
    persist();
  });

  function onDimInput() {
    var wv = parseInt(widthInput.value, 10);
    var hv = parseInt(heightInput.value, 10);
    if (!isNaN(wv) && wv > 0) state.width = Math.min(4096, wv);
    if (!isNaN(hv) && hv > 0) state.height = Math.min(4096, hv);
    updatePresetActiveState();
    syncAutoText();
    render();
    persistDebounced();
  }
  widthInput.addEventListener('input', onDimInput);
  heightInput.addEventListener('input', onDimInput);
  widthInput.addEventListener('change', function () { widthInput.value = state.width; });
  heightInput.addEventListener('change', function () { heightInput.value = state.height; });

  function setBgType(type) {
    state.bgType = type;
    bgTypeSolid.classList.toggle('is-active', type === 'solid');
    bgTypeSolid.setAttribute('aria-selected', String(type === 'solid'));
    bgTypeGradient.classList.toggle('is-active', type === 'gradient');
    bgTypeGradient.setAttribute('aria-selected', String(type === 'gradient'));
    solidControls.hidden = type !== 'solid';
    gradientControls.hidden = type !== 'gradient';
    render();
    persist();
  }
  bgTypeSolid.addEventListener('click', function () { setBgType('solid'); });
  bgTypeGradient.addEventListener('click', function () { setBgType('gradient'); });

  solidColor.addEventListener('input', function () { state.bgColor1 = solidColor.value; render(); persistDebounced(); });
  gradColor1.addEventListener('input', function () { state.gradColor1 = gradColor1.value; render(); persistDebounced(); });
  gradColor2.addEventListener('input', function () { state.gradColor2 = gradColor2.value; render(); persistDebounced(); });

  function syncAngle(v) {
    v = clamp(parseInt(v, 10) || 0, 0, 360);
    state.gradAngle = v;
    gradAngle.value = v;
    gradAngleNumber.value = v;
    gradAngleLabel.textContent = v + '°';
    render();
    persistDebounced();
  }
  gradAngle.addEventListener('input', function () { syncAngle(gradAngle.value); });
  gradAngleNumber.addEventListener('input', function () { syncAngle(gradAngleNumber.value); });

  textInput.addEventListener('input', function () {
    state.text = textInput.value;
    if (state.text !== computeAutoText()) {
      state.textManual = true;
      textAutoToggle.checked = false;
    } else {
      state.textManual = false;
      textAutoToggle.checked = true;
    }
    render();
    persistDebounced();
  });

  textAutoToggle.addEventListener('change', function () {
    state.textManual = !textAutoToggle.checked;
    if (!state.textManual) {
      state.text = computeAutoText();
      textInput.value = state.text;
    }
    render();
    persist();
  });

  fontFamily.addEventListener('change', function () { state.fontFamily = fontFamily.value; render(); persist(); });

  fontSize.addEventListener('input', function () {
    if (state.fontAutoFit) return;
    state.fontSize = clamp(parseInt(fontSize.value, 10) || 28, 8, 400);
    render();
    persistDebounced();
  });

  fontAutoFit.addEventListener('change', function () {
    state.fontAutoFit = fontAutoFit.checked;
    fontSize.disabled = state.fontAutoFit;
    render();
    persist();
  });

  textColor.addEventListener('input', function () { state.textColor = textColor.value; render(); persistDebounced(); });

  patternSelect.addEventListener('change', function () {
    state.pattern = patternSelect.value;
    patternControls.hidden = state.pattern === 'none';
    btnShuffleNoise.hidden = state.pattern !== 'noise';
    render();
    persist();
  });

  patternColor.addEventListener('input', function () { state.patternColor = patternColor.value; render(); persistDebounced(); });
  patternOpacity.addEventListener('input', function () {
    state.patternOpacity = Number(patternOpacity.value);
    patternOpacityLabel.textContent = state.patternOpacity + '%';
    render();
    persistDebounced();
  });
  patternDensity.addEventListener('input', function () {
    state.patternDensity = Number(patternDensity.value);
    patternDensityLabel.textContent = state.patternDensity + '%';
    render();
    persistDebounced();
  });

  function shuffleNoise() {
    state.noiseSeed = Math.floor(Math.random() * 2147483647) || 1;
    render();
    persist();
    WUS.toast('Noise pattern shuffled');
  }
  btnShuffleNoise.addEventListener('click', shuffleNoise);

  function downloadPng() {
    canvas.toBlob(function (blob) {
      if (!blob) { WUS.toast('Could not generate PNG', 'error'); return; }
      var name = 'placeholder-' + state.width + 'x' + state.height + '-' + Date.now() + '.png';
      WUS.download(name, blob, 'image/png');
      WUS.toast('Downloaded ' + name);
    }, 'image/png');
  }
  btnDownload.addEventListener('click', downloadPng);

  function resetAll() {
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    state.noiseSeed = Math.floor(Math.random() * 2147483647) || 1;
    applyStateToInputs();
    render();
    WUS.store.remove(STORE_KEY);
    WUS.toast('Reset to defaults');
  }
  btnResetAll.addEventListener('click', resetAll);

  btnCopyImg.addEventListener('click', function () {
    if (!lastImgTag) { WUS.toast('Nothing to copy yet', 'error'); return; }
    WUS.copy(lastImgTag, '<img> tag copied to clipboard');
  });
  btnCopyCss.addEventListener('click', function () {
    if (!lastCssSnippet) { WUS.toast('Nothing to copy yet', 'error'); return; }
    WUS.copy(lastCssSnippet, 'CSS snippet copied to clipboard');
  });

  /* ============================ PERSISTENCE ============================ */
  function persist() {
    WUS.store.set(STORE_KEY, state);
  }
  var persistDebounced = WUS.debounce(persist, 400);

  function restore() {
    var saved = WUS.store.get(STORE_KEY, null);
    state = Object.assign({}, DEFAULT_STATE, saved || {});
    if (!state.noiseSeed) state.noiseSeed = 1;
    state.width = clamp(Number(state.width) || DEFAULT_STATE.width, 1, 4096);
    state.height = clamp(Number(state.height) || DEFAULT_STATE.height, 1, 4096);
    applyStateToInputs();
    render();
  }

  /* =========================== SHORTCUTS HELP =========================== */
  var helpBackdrop = document.getElementById('helpBackdrop');
  var helpClose = document.getElementById('helpClose');
  var shortcutRows = document.getElementById('shortcutRows');

  var SHORTCUTS = [
    { keys: ['mod', 'S'], desc: 'Download PNG' },
    { keys: ['mod', 'Shift', 'R'], desc: 'Shuffle noise pattern' },
    { keys: ['?'], desc: 'Show this help' },
    { keys: ['Esc'], desc: 'Close dialog' }
  ];

  function buildShortcutTable() {
    var html = '';
    SHORTCUTS.forEach(function (s) {
      var kbds = s.keys.map(function (k) { return '<kbd>' + WUS.escapeHtml(k) + '</kbd>'; }).join('');
      html += '<tr><td>' + WUS.escapeHtml(s.desc) + '</td><td>' + kbds + '</td></tr>';
    });
    shortcutRows.innerHTML = html;
  }

  function openHelp() { helpBackdrop.hidden = false; helpClose.focus(); }
  function closeHelp() { helpBackdrop.hidden = true; }

  helpClose.addEventListener('click', closeHelp);
  helpBackdrop.addEventListener('click', function (e) {
    if (e.target === helpBackdrop) closeHelp();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !helpBackdrop.hidden) closeHelp();
  });

  var helpBtns = document.querySelectorAll('[data-shortcut-help]');
  for (var i = 0; i < helpBtns.length; i++) helpBtns[i].addEventListener('click', openHelp);

  WUS.registerShortcut('mod+s', function () { downloadPng(); }, 'Download PNG');
  WUS.registerShortcut('mod+r', function () {
    if (state.pattern === 'noise') shuffleNoise();
  }, 'Shuffle noise pattern');
  WUS.registerShortcut('?', function () { openHelp(); }, 'Show shortcuts');

  /* ================================ INIT ================================ */
  buildShortcutTable();
  restore();
})();
