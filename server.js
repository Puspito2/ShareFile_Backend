const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const clients = new Map();

wss.on('connection', (ws) => {
  const id = Math.random().toString(36).substr(2, 9);
  clients.set(id, ws);
  console.log(`Client connected: ${id}`);

  // Send back the assigned id to the client
  ws.send(JSON.stringify({ type: 'id', id }));

  // Broadcast updated peer list to all clients
  function broadcastPeers() {
    const peerIds = [...clients.keys()];
    const msg = JSON.stringify({ type: 'peers', peers: peerIds });
    for (const client of clients.values()) {
      client.send(msg);
    }
  }
  broadcastPeers();

  ws.on('message', (message) => {
    // Message from client should be JSON
    let data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      console.error('Invalid JSON:', message);
      return;
    }

    if (data.type === 'signal') {
      // Relay signaling data to the target peer
      const targetWs = clients.get(data.target);
      if (targetWs) {
        targetWs.send(JSON.stringify({
          type: 'signal',
          from: id,
          signal: data.signal
        }));
      }
    }
  });

  ws.on('close', () => {
    clients.delete(id);
    console.log(`Client disconnected: ${id}`);
    broadcastPeers();
  });
});

console.log('Signaling server running on ws://localhost:8080');
