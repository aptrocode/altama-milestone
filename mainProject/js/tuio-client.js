/**
 * ALTAMA Interactive Wall — TUIO 1.1 Client Bridge
 * Receives touch/pointer events from Python UDP 3333 bridge via WebSocket 3334.
 * Dispatches standard PointerEvents & TouchEvents to the DOM.
 */
(function() {
  'use strict';

  console.log('[TUIO] Initializing ALTAMA TUIO 1.1 Client (Port 3333 Bridge)...');

  const TUIO_CONFIG = {
    wsPort: 3334,
    reconnectInterval: 2500,
    showVisualCursors: true,
    showStatusBadge: true
  };

  const activeCursors = new Map();
  let ws = null;
  let statusBadge = null;

  // 1. Status Indicator Badge for Installers & Tech Support
  function createStatusBadge() {
    if (!TUIO_CONFIG.showStatusBadge || document.getElementById('tuio-status-badge')) return;

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
      background: rgba(10, 15, 29, 0.88);
      border: 1px solid rgba(0, 242, 254, 0.3);
      border-radius: 20px;
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      color: rgba(255, 255, 255, 0.8);
      pointer-events: none;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
      transition: all 0.3s ease;
    `;

    const dot = document.createElement('span');
    dot.className = 'tuio-dot';
    dot.style.cssText = `
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ff4d4f;
      box-shadow: 0 0 8px #ff4d4f;
      display: inline-block;
      transition: all 0.3s ease;
    `;

    const label = document.createElement('span');
    label.className = 'tuio-label';
    label.textContent = 'TUIO UDP:3333 Disconnected';

    statusBadge.appendChild(dot);
    statusBadge.appendChild(label);
    document.body.appendChild(statusBadge);
  }

  function updateStatus(connected) {
    if (!statusBadge) return;
    const dot = statusBadge.querySelector('.tuio-dot');
    const label = statusBadge.querySelector('.tuio-label');
    if (connected) {
      dot.style.background = '#00f2fe';
      dot.style.boxShadow = '0 0 10px #00f2fe';
      statusBadge.style.borderColor = 'rgba(0, 242, 254, 0.6)';
      label.textContent = 'TUIO UDP:3333 Connected';
      label.style.color = '#e0f7fa';
    } else {
      dot.style.background = '#ff4d4f';
      dot.style.boxShadow = '0 0 8px #ff4d4f';
      statusBadge.style.borderColor = 'rgba(255, 77, 79, 0.4)';
      label.textContent = 'TUIO UDP:3333 Connecting...';
      label.style.color = 'rgba(255, 255, 255, 0.6)';
    }
  }

  // 2. Visual Touch Feedback Indicator
  function createVisualCursor(id, x, y) {
    if (!TUIO_CONFIG.showVisualCursors) return null;

    const el = document.createElement('div');
    el.id = `tuio-cursor-${id}`;
    el.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 44px;
      height: 44px;
      margin-left: -22px;
      margin-top: -22px;
      border-radius: 50%;
      border: 2px solid #00f2fe;
      background: radial-gradient(circle, rgba(0, 242, 254, 0.4) 0%, rgba(0, 242, 254, 0.05) 70%, transparent 100%);
      box-shadow: 0 0 16px rgba(0, 242, 254, 0.8), inset 0 0 10px rgba(0, 242, 254, 0.5);
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
      width: 8px;
      height: 8px;
      margin-left: -4px;
      margin-top: -4px;
      border-radius: 50%;
      background: #ffffff;
      box-shadow: 0 0 6px #00f2fe;
    `;
    el.appendChild(centerPoint);

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
  function handleTuioEvent(data) {
    const { type, id, x, y } = data;
    
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
      const visualEl = createVisualCursor(id, clientX, clientY);

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
        console.error('[TUIO] Error dispatching pointerdown:', err);
      }
    }
    else if (type === 'pointermove') {
      const cursor = activeCursors.get(id);
      if (!cursor) return;

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
        console.error('[TUIO] Error dispatching pointermove:', err);
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
          // Also dispatch click
          cursor.targetEl.dispatchEvent(new MouseEvent('click', eventInit));
        } else {
          window.dispatchEvent(new PointerEvent('pointerup', eventInit));
        }
      } catch (err) {
        console.error('[TUIO] Error dispatching pointerup:', err);
      }
    }
  }

  // 4. WebSocket Client Connection
  function connectWebSocket() {
    const host = window.location.hostname || 'localhost';
    const wsUrl = `ws://${host}:${TUIO_CONFIG.wsPort}`;

    console.log(`[TUIO] Connecting to TUIO WebSocket Bridge at ${wsUrl}...`);

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[TUIO] [SUCCESS] Connected to TUIO UDP:3333 -> WebSocket Bridge');
        updateStatus(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleTuioEvent(data);
        } catch (e) {
          console.warn('[TUIO] Failed to parse message:', event.data, e);
        }
      };

      ws.onclose = () => {
        updateStatus(false);
        // Clear lingering cursors
        activeCursors.forEach(c => removeVisualCursor(c.visualEl));
        activeCursors.clear();
        setTimeout(connectWebSocket, TUIO_CONFIG.reconnectInterval);
      };

      ws.onerror = () => {
        updateStatus(false);
        try { ws.close(); } catch (e) {}
      };
    } catch (err) {
      console.warn('[TUIO] WebSocket initialization failed:', err);
      setTimeout(connectWebSocket, TUIO_CONFIG.reconnectInterval);
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
    sendSyntheticEvent: handleTuioEvent,
    reconnect: connectWebSocket
  };

})();
