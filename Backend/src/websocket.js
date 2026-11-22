import { WebSocketServer, WebSocket } from 'ws';

let wss = null;
const clients = new Set();

/**
 * Initialize WebSocket Server attached to the main HTTP server
 */
export function initWebSocketServer(httpServer) {
  wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  console.log('[WebSocket] Server initialized on path /ws');

  wss.on('connection', (ws, req) => {
    ws.isAlive = true;
    clients.add(ws);

    const clientIp = req.socket.remoteAddress || 'unknown';
    console.log(`[WebSocket] Client connected from ${clientIp}. Total active clients: ${clients.size}`);

    // Send welcome connection handshake
    try {
      ws.send(
        JSON.stringify({
          type: 'CONNECTED',
          message: 'Connected to Stretch With Lorie Realtime WebSocket Service',
          timestamp: new Date().toISOString()
        })
      );
    } catch (err) {
      console.warn('[WebSocket] Error sending welcome packet:', err);
    }

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
        }
      } catch {
        // Ignore unparseable frames
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log(`[WebSocket] Client disconnected. Remaining active clients: ${clients.size}`);
    });

    ws.on('error', (err) => {
      console.warn('[WebSocket] Client error:', err.message);
      clients.delete(ws);
    });
  });

  // Heartbeat ping/pong interval every 30s to prune dead sockets
  const interval = setInterval(() => {
    for (const ws of clients) {
      if (!ws.isAlive) {
        clients.delete(ws);
        ws.terminate();
        continue;
      }
      ws.isAlive = false;
      ws.ping();
    }
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  return wss;
}

/**
 * Broadcast an event to all active WebSocket clients (instructors & admins)
 *
 * @param {string} type - Event type (e.g., 'NEW_REGISTRATION', 'NEW_EVENT_INQUIRY', 'NEW_GIFT_CARD')
 * @param {any} payload - Event data
 */
export function broadcast(type, payload) {
  if (!wss || clients.size === 0) {
    return;
  }

  const message = JSON.stringify({
    type,
    payload,
    timestamp: new Date().toISOString()
  });

  let sentCount = 0;
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
        sentCount++;
      } catch (err) {
        console.warn(`[WebSocket Broadcast Error]: Failed to send to a client: ${err.message}`);
      }
    }
  }

  console.log(`[WebSocket Broadcast] Dispatched "${type}" to ${sentCount} client(s).`);
}
