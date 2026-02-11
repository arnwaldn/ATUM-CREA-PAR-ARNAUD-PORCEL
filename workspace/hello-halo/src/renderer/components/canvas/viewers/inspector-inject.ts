/**
 * Inspector Injection Script
 *
 * This script is injected into the HTML preview iframe's srcdoc.
 * It captures hover/click events and sends element info to the parent via postMessage.
 * Also intercepts console.* calls and forwards them.
 */

/**
 * Generate the injection script as a string to be included in srcdoc.
 */
export function getInspectorScript(): string {
  return `
<script>
(function() {
  // Highlight overlay
  var overlay = document.createElement('div');
  overlay.id = '__inspector_overlay__';
  overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483647;border:2px solid #3b82f6;background:rgba(59,130,246,0.08);display:none;transition:all 0.1s ease;';
  document.addEventListener('DOMContentLoaded', function() {
    document.body.appendChild(overlay);
  });

  // Selected element overlay
  var selectedOverlay = document.createElement('div');
  selectedOverlay.id = '__inspector_selected__';
  selectedOverlay.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483646;border:2px solid #f59e0b;background:rgba(245,158,11,0.08);display:none;';
  document.addEventListener('DOMContentLoaded', function() {
    document.body.appendChild(selectedOverlay);
  });

  function getElementInfo(el) {
    if (!el || el === document.body || el === document.documentElement) return null;
    var rect = el.getBoundingClientRect();
    var computed = window.getComputedStyle(el);
    var styles = {};
    var importantProps = ['color','background-color','font-size','font-family','font-weight',
      'margin','padding','border','display','position','width','height','line-height',
      'text-align','overflow','opacity','z-index','box-sizing'];
    for (var i = 0; i < importantProps.length; i++) {
      var val = computed.getPropertyValue(importantProps[i]);
      if (val) styles[importantProps[i]] = val;
    }
    return {
      tagName: el.tagName.toLowerCase(),
      id: el.id || undefined,
      classes: Array.from(el.classList),
      styles: styles,
      dimensions: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
      textPreview: (el.textContent || '').trim().substring(0, 100),
      attributes: Array.from(el.attributes).reduce(function(acc, attr) {
        if (attr.name !== 'class' && attr.name !== 'id' && attr.name !== 'style') {
          acc[attr.name] = attr.value;
        }
        return acc;
      }, {})
    };
  }

  function positionOverlay(target, el) {
    var rect = el.getBoundingClientRect();
    target.style.left = rect.x + 'px';
    target.style.top = rect.y + 'px';
    target.style.width = rect.width + 'px';
    target.style.height = rect.height + 'px';
    target.style.display = 'block';
  }

  // Hover: show blue overlay + send element info
  document.addEventListener('mousemove', function(e) {
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el.id === '__inspector_overlay__' || el.id === '__inspector_selected__') {
      overlay.style.display = 'none';
      return;
    }
    positionOverlay(overlay, el);
    var info = getElementInfo(el);
    if (info) {
      window.parent.postMessage({ type: 'inspector:hover', data: info }, '*');
    }
  }, true);

  // Click: select element, show yellow overlay
  document.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || el.id === '__inspector_overlay__' || el.id === '__inspector_selected__') return;
    positionOverlay(selectedOverlay, el);
    var info = getElementInfo(el);
    if (info) {
      window.parent.postMessage({ type: 'inspector:select', data: info }, '*');
    }
  }, true);

  // Mouse leave: hide hover overlay
  document.addEventListener('mouseleave', function() {
    overlay.style.display = 'none';
    window.parent.postMessage({ type: 'inspector:hover', data: null }, '*');
  });

  // Console interception
  var origConsole = { log: console.log, warn: console.warn, error: console.error, info: console.info };
  function safeStringify(obj) {
    try {
      if (typeof obj === 'string') return obj;
      if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
      if (obj === null) return 'null';
      if (obj === undefined) return 'undefined';
      if (obj instanceof Error) return obj.stack || obj.message;
      return JSON.stringify(obj, null, 2);
    } catch(e) {
      return String(obj);
    }
  }
  ['log','warn','error','info'].forEach(function(level) {
    console[level] = function() {
      origConsole[level].apply(console, arguments);
      var args = Array.from(arguments).map(safeStringify);
      window.parent.postMessage({ type: 'inspector:console', data: { level: level, args: args, timestamp: Date.now() } }, '*');
    };
  });

  // Error handler
  window.addEventListener('error', function(e) {
    window.parent.postMessage({ type: 'inspector:console', data: { level: 'error', args: [e.message + ' at ' + e.filename + ':' + e.lineno], timestamp: Date.now() } }, '*');
  });
})();
</script>
`;
}
