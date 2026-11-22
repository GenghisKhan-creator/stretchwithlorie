/**
 * Real-Time WebSocket Client Service for Stretch With Lorie
 * Handles live synchronization between the backend and instructor/admin dashboards.
 * Features automatic reconnection, heartbeats, and event pub/sub.
 */

function resolveWsUrl() {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (backendUrl && backendUrl.startsWith('http')) {
    return backendUrl.replace(/^http/, 'ws').replace(/\/api\/?$/, '') + '/ws';
  }
  if (typeof window !== 'undefined' && window.location) {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    if (window.location.port === '5173') {
      return `${proto}//${window.location.hostname}:5000/ws`;
    }
    return `${proto}//${window.location.host}/ws`;
  }
  // Default fallback for local development
  return 'ws://localhost:5000/ws';
}

class StudioWebSocketService {
  constructor() {
    this.ws = null;
    this.subscribers = new Map(); // eventType -> Set of callbacks
    this.status = 'disconnected'; // 'connecting' | 'connected' | 'disconnected' | 'reconnecting'
    this.reconnectAttempts = 0;
    this.maxReconnectDelay = 10000;
    this.pingInterval = null;
    this.reconnectTimer = null;
    this.isExplicitlyClosed = false;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isExplicitlyClosed = false;
    this.setStatus(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting');

    try {
      const url = resolveWsUrl();
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[WebSocket Client] ⚡ Real-time connected to studio backend:', url);
        this.reconnectAttempts = 0;
        this.setStatus('connected');
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this.handleIncomingMessage(payload);
        } catch {
          // ignore unparseable frame
        }
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        this.setStatus('disconnected');
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[WebSocket Client] Connection error (will auto-reconnect):', err.message || 'offline');
        // onclose will trigger reconnect
      };
    } catch (err) {
      console.warn('[WebSocket Client] Failed to create socket connection:', err);
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), this.maxReconnectDelay);
    this.reconnectAttempts++;
    this.setStatus('reconnecting');

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'PING' }));
      }
    }, 25000);
  }

  stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  setStatus(newStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.dispatch('STATUS_CHANGE', { status: newStatus });
    }
  }

  getStatus() {
    return this.status;
  }

  handleIncomingMessage(message) {
    if (!message || !message.type) return;

    if (message.type === 'PONG' || message.type === 'CONNECTED') {
      return;
    }

    console.log(`[WebSocket Client] 📥 Received real-time event: "${message.type}"`, message.payload);

    // Dispatch specific event
    this.dispatch(message.type, message.payload);
    // Dispatch wildcard event
    this.dispatch('*', message);
  }

  dispatch(eventType, data) {
    const listeners = this.subscribers.get(eventType);
    if (listeners) {
      for (const callback of listeners) {
        try {
          callback(data);
        } catch (err) {
          console.error(`[WebSocket Client] Error in listener for ${eventType}:`, err);
        }
      }
    }
  }

  /**
   * Subscribe to a specific real-time event
   * @param {string} eventType - e.g., 'NEW_REGISTRATION', 'NEW_EVENT_INQUIRY', 'NEW_GIFT_CARD', '*'
   * @param {function} callback - callback receives the event payload
   * @returns {function} unsubscribe function
   */
  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType).add(callback);

    // Auto-connect on first subscription if not already connected
    if (this.status === 'disconnected' && !this.reconnectTimer) {
      this.connect();
    }

    return () => {
      const set = this.subscribers.get(eventType);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.subscribers.delete(eventType);
        }
      }
    };
  }

  disconnect() {
    this.isExplicitlyClosed = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('disconnected');
  }
}

export const studioSocket = new StudioWebSocketService();
