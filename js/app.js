/* =====================================================================
   Placeholder Image Generator Pro — app.js
   Generates placeholder images entirely via <canvas>. No network calls.
   Classic script (no modules). Depends on window.WUS (core.js).
   ===================================================================== */
(function () {
  'use strict';

  var WUS = window.WUS;
  var STORE_KEY = 'placeholder.state';

  /* ----------------------------- DOM refs ---------------------------- */
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');

  var widthInput = document.getElementById('widthInput');
  var heightInput = document.getElementById('heightInput');
  var presetGrid = document.getElementById('presetGrid');

  var bgModeSeg = document.getElementById('bgModeSeg');
  var bgSolidRow = document.getElementById('bgSolidRow');
  var bgGradientRow = document.getElementById('bgGradientRow');
  var bgColor = document.getElementById('bgColor');
  var gradColor1 = document.getElementById('gradColor1');
  var gradColor2 = document.getElementById('gradColor2');
  var gradAngle = document.getElementById('gradAngle');
  var gradAngleVal = document.getElementById('gradAngleVal');

  var textInput = document.getElementById('textInput');
  var fontFamily = document.getElementById('fontFamily');
  var fontSize = document.getElementById('fontSize');
  var fontSizeVal = document.getElementById('fontSizeVal');
  var textColor = document.getElementById('textColor');

  var patternSeg = document.getElementById('patternSeg');
  var patternOptsRow = document.getElementById('patternOptsRow');
  var patternColor = document.getElementById('patternColor');
  var patternOpacity = document.getElementById('patternOpacity');
  var patternOpacityVal = document.getElementById('patternOpacityVal');

  var btnDownload = document.getElementById('btnDownload');
  var btnReset = document.getElementById('btnReset');

  var statusText = document.getElementById('statusText');
  var dimsMeta = document.getElementById('dimsMeta');

  var imgSnippet = document.getElementById('imgSnippet');
  var cssSnippet = document.getElementById('cssSnippet');
  var btnCopyImg = document.getElementById('btnCopyImg');
  var btnCopyCss = document.getElementById('btnCopyCss');

  /* ----------------------------- State -------------------------------- */
  var state = {
    width: 300,
    height: 200,
    bgMode: 'solid',
    bgColor: '#6366f1',
    gradColor1: '#6366f1',
    gradColor2: '#ec4899',
    gradAngle: 45,
    text: '',
    textDirty: false,
    fontFamily: "'Segoe UI', Arial, sans-serif",
    fontSize: 0, // 0 = auto
    textColor: '#ffffff',
    pattern: 'none',
    patternColor: '#ffffff',
    patternOpacity: 20
  };

  function defaultText() {
    return state.width + ' × ' + state.height;
  }

  /* ============================= DRAWING ============================= */
  function drawBackground() {
    if (state.bgMode === 'gradient') {
      var rad = (state.gradAngle - 90) * Math.PI / 180;
      var cx = state.width / 2, cy = state.height / 2;
      var len = Math.abs(state.width * Math.cos(rad)) + Math.abs(state.height * Math.sin(rad));
      var dx = Math.cos(rad) * len / 2;
      var dy = Math.sin(rad) * len / 2;
      var grad = ctx.createLinearGradient(cx - dx, cy - dy, cx + dx, cy + dy);
      grad.addColorStop(0, state.gradColor1);
      grad.addColorStop(1, state.gradColor2);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = state.bgColor;
    }
    ctx.fillRect(0, 0, state.width, state.height);
  }

  function hexToRgba(hex, alpha) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var r = parseInt(h.substring(0, 2), 16);
    var g = parseInt(h.substring(2, 4), 16);
    var b = parseInt(h.substring(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function drawPattern() {
    if (state.pattern === 'none') return;
    var alpha = state.patternOpacity / 100;
    var color = hexToRgba(state.patternColor, alpha);

    if (state.pattern === 'stripes') {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(2, Math.round(state.width / 60));
      var gap = ctx.lineWidth * 2.5;
      ctx.beginPath();
      var diag = state.width + state.height;
      for (var x = -state.height; x < diag; x += gap) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x + state.height, state.height);
      }
      ctx.stroke();
      ctx.restore();
    } else if (state.pattern === 'grid') {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      var step = Math.max(10, Math.round(Math.min(state.width, state.height) / 15));
      ctx.beginPath();
      for (var gx = 0; gx <= state.width; gx += step) {
        ctx.moveTo(gx + 0.5, 0);
        ctx.lineTo(gx + 0.5, state.height);
      }
      for (var gy = 0; gy <= state.height; gy += step) {
        ctx.moveTo(0, gy + 0.5);
        ctx.lineTo(state.width, gy + 0.5);
      }
      ctx.stroke();
      ctx.restore();
    } else if (state.pattern === 'noise') {
      ctx.save();
      var count = Math.round((state.width * state.height) / 250);
      for (var i = 0; i < count; i++) {
        var px = Math.random() * state.width;
        var py = Math.random() * state.height;
        var r = Math.random() * 1.6 + 0.4;
        ctx.fillStyle = hexToRgba(state.patternColor, alpha * (0.3 + Math.random() * 0.7));
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawText() {
    var text = state.text || defaultText();
    if (!text) return;
    var size = state.fontSize > 0 ? state.fontSize : Math.max(12, Math.round(Math.min(state.width, state.height) / 6));
    ctx.save();
    ctx.fillStyle = state.textColor;
    ctx.font = '600 ' + size + 'px ' + state.fontFamily;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shrink font to fit width with some padding, if needed.
    var maxWidth = state.width * 0.9;
    var measured = ctx.measureText(text).width;
    if (measured > maxWidth && measured > 0) {
      var scale = maxWidth / measured;
      var newSize = Math.max(8, Math.floor(size * scale));
      ctx.font = '600 ' + newSize + 'px ' + state.fontFamily;
    }

    ctx.fillText(text, state.width / 2, state.height / 2);
    ctx.restore();
  }

  function render() {
    canvas.width = state.width;
    canvas.height = state.height;
    ctx.clearRect(0, 0, state.width, state.height);
    drawBackground();
    drawPattern();
    drawText();

    statusText.textContent = state.width + ' × ' + state.height;
    dimsMeta.textContent = state.width + ' × ' + state.height;

    updateSnippets();
    persist();
  }

  /* ============================= SNIPPETS ============================= */
  function updateSnippets() {
    var dataUrl = canvas.toDataURL('image/png');
    var alt = (state.text || defaultText()).replace(/"/g, '&quot;');
    imgSnippet.textContent = '<img src="' + dataUrl + '" width="' + state.width + '" height="' + state.height + '" alt="' + alt + '">';
    cssSnippet.textContent =
      '.placeholder {\n' +
      '  width: ' + state.width + 'px;\n' +
      '  height: ' + state.height + 'px;\n' +
      '  background-image: url("' + dataUrl + '");\n' +
      '  background-size: cover;\n' +
      '}';
  }

  /* ============================ CONTROLS =============================== */
  function setDimensions(w, h) {
    state.width = WUS.clamp(Math.round(w) || 1, 1, 4000);
    state.height = WUS.clamp(Math.round(h) || 1, 1, 4000);
    widthInput.value = state.width;
    heightInput.value = state.height;
    if (!state.textDirty) textInput.placeholder = defaultText();
    render();
  }

  presetGrid.addEventListener('click', function (e) {
    var btn = e.target.closest('.preset-btn');
    if (!btn) return;
    setDimensions(Number(btn.dataset.w), Number(btn.dataset.h));
    WUS.toast('Loaded ' + btn.dataset.w + '×' + btn.dataset.h);
  });

  widthInput.addEventListener('input', function () { setDimensions(Number(widthInput.value), state.height); });
  heightInput.addEventListener('input', function () { setDimensions(state.width, Number(heightInput.value)); });

  bgModeSeg.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    state.bgMode = btn.dataset.mode;
    Array.prototype.forEach.call(bgModeSeg.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-selected', String(b === btn));
    });
    bgSolidRow.hidden = state.bgMode !== 'solid';
    bgGradientRow.hidden = state.bgMode !== 'gradient';
    render();
  });

  bgColor.addEventListener('input', function () { state.bgColor = bgColor.value; render(); });
  gradColor1.addEventListener('input', function () { state.gradColor1 = gradColor1.value; render(); });
  gradColor2.addEventListener('input', function () { state.gradColor2 = gradColor2.value; render(); });
  gradAngle.addEventListener('input', function () {
    state.gradAngle = Number(gradAngle.value);
    gradAngleVal.textContent = state.gradAngle;
    render();
  });

  textInput.addEventListener('input', function () {
    state.text = textInput.value;
    state.textDirty = textInput.value.length > 0;
    render();
  });

  fontFamily.addEventListener('change', function () { state.fontFamily = fontFamily.value; render(); });
  fontSize.addEventListener('input', function () {
    state.fontSize = Number(fontSize.value);
    fontSizeVal.textContent = state.fontSize > 0 ? state.fontSize + 'px' : '(auto)';
    render();
  });
  textColor.addEventListener('input', function () { state.textColor = textColor.value; render(); });

  patternSeg.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    state.pattern = btn.dataset.pattern;
    Array.prototype.forEach.call(patternSeg.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-selected', String(b === btn));
    });
    patternOptsRow.hidden = state.pattern === 'none';
    render();
  });

  patternColor.addEventListener('input', function () { state.patternColor = patternColor.value; render(); });
  patternOpacity.addEventListener('input', function () {
    state.patternOpacity = Number(patternOpacity.value);
    patternOpacityVal.textContent = state.patternOpacity;
    render();
  });

  function downloadPng() {
    canvas.toBlob(function (blob) {
      if (!blob) { WUS.toast('Could not generate PNG', 'error'); return; }
      var name = 'placeholder-' + state.width + 'x' + state.height + '.png';
      WUS.download(name, blob, 'image/png');
      WUS.toast('Downloaded ' + name);
    }, 'image/png');
  }

  btnDownload.addEventListener('click', downloadPng);

  function resetAll() {
    state = {
      width: 300, height: 200, bgMode: 'solid', bgColor: '#6366f1',
      gradColor1: '#6366f1', gradColor2: '#ec4899', gradAngle: 45,
      text: '', textDirty: false, fontFamily: "'Segoe UI', Arial, sans-serif",
      fontSize: 0, textColor: '#ffffff', pattern: 'none',
      patternColor: '#ffffff', patternOpacity: 20
    };
    widthInput.value = 300; heightInput.value = 200;
    bgColor.value = state.bgColor;
    gradColor1.value = state.gradColor1; gradColor2.value = state.gradColor2;
    gradAngle.value = state.gradAngle; gradAngleVal.textContent = state.gradAngle;
    textInput.value = ''; textInput.placeholder = defaultText();
    fontFamily.value = state.fontFamily;
    fontSize.value = 0; fontSizeVal.textContent = '(auto)';
    textColor.value = state.textColor;
    patternColor.value = state.patternColor;
    patternOpacity.value = state.patternOpacity; patternOpacityVal.textContent = state.patternOpacity;

    Array.prototype.forEach.call(bgModeSeg.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-selected', String(b.dataset.mode === 'solid'));
    });
    bgSolidRow.hidden = false; bgGradientRow.hidden = true;

    Array.prototype.forEach.call(patternSeg.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-selected', String(b.dataset.pattern === 'none'));
    });
    patternOptsRow.hidden = true;

    render();
    WUS.toast('Reset to defaults');
  }

  btnReset.addEventListener('click', resetAll);

  btnCopyImg.addEventListener('click', function () { WUS.copy(imgSnippet.textContent, 'img snippet copied'); });
  btnCopyCss.addEventListener('click', function () { WUS.copy(cssSnippet.textContent, 'CSS snippet copied'); });

  /* ============================ PERSISTENCE ============================ */
  function persist() {
    WUS.store.set(STORE_KEY, state);
  }
  var persistDebounced = WUS.debounce(persist, 400);

  function restore() {
    var saved = WUS.store.get(STORE_KEY, null);
    if (!saved) { textInput.placeholder = defaultText(); render(); return; }
    state = Object.assign({}, state, saved);

    widthInput.value = state.width; heightInput.value = state.height;
    bgColor.value = state.bgColor;
    gradColor1.value = state.gradColor1; gradColor2.value = state.gradColor2;
    gradAngle.value = state.gradAngle; gradAngleVal.textContent = state.gradAngle;
    textInput.value = state.textDirty ? state.text : '';
    textInput.placeholder = defaultText();
    fontFamily.value = state.fontFamily;
    fontSize.value = state.fontSize; fontSizeVal.textContent = state.fontSize > 0 ? state.fontSize + 'px' : '(auto)';
    textColor.value = state.textColor;
    patternColor.value = state.patternColor;
    patternOpacity.value = state.patternOpacity; patternOpacityVal.textContent = state.patternOpacity;

    Array.prototype.forEach.call(bgModeSeg.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-selected', String(b.dataset.mode === state.bgMode));
    });
    bgSolidRow.hidden = state.bgMode !== 'solid';
    bgGradientRow.hidden = state.bgMode !== 'gradient';

    Array.prototype.forEach.call(patternSeg.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-selected', String(b.dataset.pattern === state.pattern));
    });
    patternOptsRow.hidden = state.pattern === 'none';

    render();
  }

  /* Re-render on input changes should also persist (debounced for text). */
  textInput.addEventListener('input', persistDebounced);
  widthInput.addEventListener('input', persistDebounced);
  heightInput.addEventListener('input', persistDebounced);

  /* =========================== SHORTCUTS HELP =========================== */
  var helpBackdrop = document.getElementById('helpBackdrop');
  var helpClose = document.getElementById('helpClose');
  var shortcutRows = document.getElementById('shortcutRows');

  var SHORTCUTS = [
    { keys: ['mod', 'S'], desc: 'Download PNG' },
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
  helpBackdrop.addEventListener('click', function (e) { if (e.target === helpBackdrop) closeHelp(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !helpBackdrop.hidden) closeHelp();
  });

  var helpBtns = document.querySelectorAll('[data-shortcut-help]');
  for (var i = 0; i < helpBtns.length; i++) helpBtns[i].addEventListener('click', openHelp);

  WUS.registerShortcut('mod+s', function () { downloadPng(); }, 'Download PNG');
  WUS.registerShortcut('?', function () { openHelp(); }, 'Show shortcuts');

  /* ================================ INIT ================================ */
  buildShortcutTable();
  restore();
})();
