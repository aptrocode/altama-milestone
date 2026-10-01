/**
 * ALTAMA Interactive Wall — Universal Sensor Bridge Client
 * Compatible with: TUIO 1.1, TUIO 2.0, and Augmenta Simulator OSC Protocol.
 * Listens on WebSocket 3334 (bridging UDP 3333, 12000, 13000).
 */
(function() {
  'use strict';

  console.log('[SENSOR] Initializing ALTAMA Universal Touch Bridge (TUIO 3333 & Augmenta 12000)...');

  const SENSOR_CONFIG = {
    wsPort: 3334,
    reconnectInterval: 2000,
    showVisualCursors: true,
    showStatusBadge: true,
    invertY: false // Can be toggled by pressing 'I' on keyboard or '?invertY=1'
  };

  // Check URL query params for invertY
  if (window.location.search.includes('invertY=1')) {
    SENSOR_CONFIG.invertY = true;
    console.log('[SENSOR] Y-Axis inverted via URL parameter.');
  }

  const activeCursors = new Map();
  let ws = null;
  let statusBadge = null;
  let touchBadgeTimeout = null;

  // 1. Status Indicator Badge for Tech Support / Installers
  function createStatusBadge() {
    if (!SENSOR_CONFIG.showStatusBadge || document.getElementById('tuio-status-badge')) return;

    statusBadge = document.createElement('div');
    statusBadge.id = 'tuio-status-badge';
    statusBadge.style.cssText = `
      position: fixed;
      bottom: 12px;
      right: 16px;
      z-index: 999999;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(10, 15, 29, 0.90);
      border: 1px solid rgba(0, 242, 254, 0.3);
      border-radius: 20px;
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: rgba(255, 255, 255, 0.85);
      pointer-events: auto;
      cursor: pointer;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
      transition: all 0.25s ease;
      user-select: none;
    `;
    statusBadge.title = "Klik untuk toggle invert sumbu Y (Atau tekan tombol 'I' pada keyboard)";

    const dot = document.createElement('span');
    dot.className = 'tuio-dot';
    dot.style.cssText = `
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ff4d4f;
      box-shadow: 0 0 8px #ff4d4f;
      display: inline-block;
      transition: all 0.25s ease;
    `;

    const label = document.createElement('span');
    label.className = 'tuio-label';
    label.textContent = 'TUIO (3333) & Augmenta (12000): Menghubungkan...';

    statusBadge.appendChild(dot);
    statusBadge.appendChild(label);

    statusBadge.addEventListener('click', () => {
      SENSOR_CONFIG.invertY = !SENSOR_CONFIG.invertY;
      showToast(`Sumbu Y: ${SENSOR_CONFIG.invertY ? 'TERBALIK (Inverted)' : 'NORMAL'}`);
    });

    document.body.appendChild(statusBadge);

    // Keyboard shortcut 'I' to toggle invertY
    window.addEventListener('keydown', (e) => {
      if (e.key === 'i' || e.key === 'I') {
        SENSOR_CONFIG.invertY = !SENSOR_CONFIG.invertY;
        showToast(`Sumbu Y: ${SENSOR_CONFIG.invertY ? 'TERBALIK (Inverted)' : 'NORMAL'}`);
      }
    });
  }

  function showToast(text) {
    let toast = document.getElementById('tuio-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'tuio-toast';
      toast.style.cssText = `
        position: fixed;
        top: 24px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000000;
        padding: 10px 24px;
        background: rgba(10, 25, 45, 0.95);
        border: 1px solid #00f2fe;
        border-radius: 30px;
        font-family: 'Inter', sans-serif;
        font-size: 13px;
        font-weight: 700;
        color: #00f2fe;
        box-shadow: 0 4px 20px rgba(0, 242, 254, 0.4);
        pointer-events: none;
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.opacity = '0';
    }, 2000);
  }

  function updateStatus(connected) {
    if (!statusBadge) return;
    const dot = statusBadge.querySelector('.tuio-dot');
    const label = statusBadge.querySelector('.tuio-label');
    if (connected) {
      dot.style.background = '#00f2fe';
      dot.style.boxShadow = '0 0 10px #00f2fe';
      statusBadge.style.borderColor = 'rgba(0, 242, 254, 0.6)';
      label.textContent = 'TUIO (3333) & Augmenta (12000) Aktif';
      label.style.color = '#e0f7fa';
    } else {
      dot.style.background = '#ff4d4f';
      dot.style.boxShadow = '0 0 8px #ff4d4f';
      statusBadge.style.borderColor = 'rgba(255, 77, 79, 0.4)';
      label.textContent = 'TUIO & Augmenta: Terputus (Menghubungkan...)';
      label.style.color = 'rgba(255, 255, 255, 0.6)';
    }
  }

  function notifyTouchReceived(id, x, y, protocol) {
    if (!statusBadge) return;
    const dot = statusBadge.querySelector('.tuio-dot');
    const label = statusBadge.querySelector('.tuio-label');
    dot.style.background = '#00ff88';
    dot.style.boxShadow = '0 0 14px #00ff88';
    label.textContent = `[${protocol || 'TOUCH'}] ID:${id} (${(x*100).toFixed(0)}%, ${(y*100).toFixed(0)}%)`;
    label.style.color = '#ffffff';

    if (touchBadgeTimeout) clearTimeout(touchBadgeTimeout);
    touchBadgeTimeout = setTimeout(() => {
      updateStatus(true);
    }, 1200);
  }

  // 2. Visual Touch Feedback Indicator (Glowing Neon Pulse Ring)
  function createVisualCursor(id, x, y, protocol) {
    if (!SENSOR_CONFIG.showVisualCursors) return null;

    const el = document.createElement('div');
    el.id = `sensor-cursor-${id}`;
    el.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 52px;
      height: 52px;
      margin-left: -26px;
      margin-top: -26px;
      border-radius: 50%;
      border: 2px solid #00f2fe;
      background: radial-gradient(circle, rgba(0, 242, 254, 0.45) 0%, rgba(0, 242, 254, 0.08) 65%, transparent 100%);
      box-shadow: 0 0 20px rgba(0, 242, 254, 0.9), inset 0 0 12px rgba(0, 242, 254, 0.5);
      pointer-events: none;
      z-index: 999998;
      transform: scale(0.6);
      opacity: 0;
      transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease;
    `;

    const centerPoint = document.createElement('div');
    centerPoint.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 10px;
      height: 10px;
      margin-left: -5px;
      margin-top: -5px;
      border-radius: 50%;
      background: #ffffff;
      box-shadow: 0 0 8px #00f2fe;
    `;
    el.appendChild(centerPoint);

    const tag = document.createElement('div');
    tag.style.cssText = `
      position: absolute;
      top: -18px;
      left: 50%;
      transform: translateX(-50%);
      font-family: 'Inter', sans-serif;
      font-size: 10px;
      font-weight: 700;
      color: #00f2fe;
      text-shadow: 0 0 6px #000;
      white-space: nowrap;
    `;
    tag.textContent = `${protocol || 'TUIO'} #${id}`;
    el.appendChild(tag);

    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = 'scale(1)';
      el.style.opacity = '1';
    });
    return el;
  }

  function removeVisualCursor(el) {
    if (!el) return;
    el.style.transform = 'scale(1.4)';
    el.style.opacity = '0';
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 200);
  }

  // 3. Dispatch Native DOM Pointer Events
  function handleSensorEvent(data) {
    let { type, id, x, y, protocol } = data;

    if (SENSOR_CONFIG.invertY) {
      y = 1.0 - y;
    }

    notifyTouchReceived(id, x, y, protocol);

    // Map normalized (0..1) to wall-container coordinates or viewport
    const container = document.getElementById('wall-container');
    let clientX, clientY;
    if (container) {
      const rect = container.getBoundingClientRect();
      clientX = Math.round(rect.left + x * rect.width);
      clientY = Math.round(rect.top + y * rect.height);
    } else {
      clientX = Math.round(x * window.innerWidth);
      clientY = Math.round(y * window.innerHeight);
    }

    if (type === 'pointerdown') {
      const targetEl = document.elementFromPoint(clientX, clientY) || document.body;
      const visualEl = createVisualCursor(id, clientX, clientY, protocol);

      activeCursors.set(id, {
        targetEl,
        clientX,
        clientY,
        visualEl
      });

      const eventInit = {
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerId: 1000 + (id % 10000),
        pointerType: 'touch',
        isPrimary: true,
        clientX,
        clientY,
        screenX: clientX,
        screenY: clientY,
        button: 0,
        buttons: 1,
        pressure: 1.0
      };

      try {
        targetEl.dispatchEvent(new PointerEvent('pointerdown', eventInit));
      } catch (err) {
        console.error('[SENSOR] Error dispatching pointerdown:', err);
      }
    }
    else if (type === 'pointermove') {
      const cursor = activeCursors.get(id);
      if (!cursor) {
        // If received pointermove without initial pointerdown, promote to pointerdown!
        handleSensorEvent({ ...data, type: 'pointerdown' });
        return;
      }

      cursor.clientX = clientX;
      cursor.clientY = clientY;

      if (cursor.visualEl) {
        cursor.visualEl.style.left = `${clientX}px`;
        cursor.visualEl.style.top = `${clientY}px`;
      }

      const newTarget = document.elementFromPoint(clientX, clientY) || document.body;

      // If finger moved out of original element, fire pointerleave on previous element
      if (cursor.targetEl && cursor.targetEl !== newTarget && !cursor.targetEl.contains(newTarget)) {
        try {
          cursor.targetEl.dispatchEvent(new PointerEvent('pointerleave', {
            bubbles: false,
            cancelable: true,
            composed: true,
            pointerId: 1000 + (id % 10000),
            pointerType: 'touch',
            clientX,
            clientY
          }));
        } catch (e) {}
      }

      const eventInit = {
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerId: 1000 + (id % 10000),
        pointerType: 'touch',
        isPrimary: true,
        clientX,
        clientY,
        screenX: clientX,
        screenY: clientY,
        button: 0,
        buttons: 1,
        pressure: 1.0
      };

      try {
        (newTarget || cursor.targetEl).dispatchEvent(new PointerEvent('pointermove', eventInit));
      } catch (err) {
        console.error('[SENSOR] Error dispatching pointermove:', err);
      }
    }
    else if (type === 'pointerup') {
      const cursor = activeCursors.get(id);
      if (!cursor) return;

      activeCursors.delete(id);
      removeVisualCursor(cursor.visualEl);

      const eventInit = {
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerId: 1000 + (id % 10000),
        pointerType: 'touch',
        isPrimary: true,
        clientX: cursor.clientX,
        clientY: cursor.clientY,
        screenX: cursor.clientX,
        screenY: cursor.clientY,
        button: 0,
        buttons: 0,
        pressure: 0.0
      };

      try {
        if (cursor.targetEl) {
          cursor.targetEl.dispatchEvent(new PointerEvent('pointerup', eventInit));
          cursor.targetEl.dispatchEvent(new MouseEvent('click', eventInit));
        } else {
          window.dispatchEvent(new PointerEvent('pointerup', eventInit));
        }
      } catch (err) {
        console.error('[SENSOR] Error dispatching pointerup:', err);
      }
    }
  }

  // 4. WebSocket Client Connection
  function connectWebSocket() {
    const host = window.location.hostname || 'localhost';
    const wsUrl = `ws://${host}:${SENSOR_CONFIG.wsPort}`;

    console.log(`[SENSOR] Connecting to Sensor WebSocket Bridge at ${wsUrl}...`);

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[SENSOR] [SUCCESS] Connected to Sensor UDP (3333 & 12000) -> WebSocket Bridge');
        updateStatus(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleSensorEvent(data);
        } catch (e) {
          console.warn('[SENSOR] Failed to parse message:', event.data, e);
        }
      };

      ws.onclose = () => {
        updateStatus(false);
        activeCursors.forEach(c => removeVisualCursor(c.visualEl));
        activeCursors.clear();
        setTimeout(connectWebSocket, SENSOR_CONFIG.reconnectInterval);
      };

      ws.onerror = () => {
        updateStatus(false);
        try { ws.close(); } catch (e) {}
      };
    } catch (err) {
      console.warn('[SENSOR] WebSocket initialization failed:', err);
      setTimeout(connectWebSocket, SENSOR_CONFIG.reconnectInterval);
    }
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createStatusBadge();
      connectWebSocket();
    });
  } else {
    createStatusBadge();
    connectWebSocket();
  }

  // Export helper for debugging
  window.TUIO_CLIENT = {
    getActiveCursors: () => Array.from(activeCursors.entries()),
    sendSyntheticEvent: handleSensorEvent,
    reconnect: connectWebSocket,
    toggleInvertY: () => {
      SENSOR_CONFIG.invertY = !SENSOR_CONFIG.invertY;
      showToast(`Sumbu Y: ${SENSOR_CONFIG.invertY ? 'TERBALIK' : 'NORMAL'}`);
      return SENSOR_CONFIG.invertY;
    }
  };

})();
