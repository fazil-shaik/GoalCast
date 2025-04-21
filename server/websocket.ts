import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface ConnectedUser {
  userId: number;
  ws: WebSocket;
  lastSeen: Date;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private connectedUsers: Map<number, ConnectedUser> = new Map();

  constructor(server: Server, port?: number) {
    // Create a separate WebSocket server if port is provided
    if (port) {
      this.wss = new WebSocketServer({ 
        port,
        // Add WebSocket server options to handle connection errors
        clientTracking: true,
        perMessageDeflate: false,
        maxPayload: 1024 * 1024, // 1MB max payload
      });
    } else {
      // Use the HTTP server for WebSocket if no port is provided
      this.wss = new WebSocketServer({ 
        server,
        // Add WebSocket server options to handle connection errors
        clientTracking: true,
        perMessageDeflate: false,
        maxPayload: 1024 * 1024, // 1MB max payload
      });
    }
    
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', (ws: WebSocket) => {
      let userId: number | null = null;

      // Set up error handling for the WebSocket connection
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        if (userId !== null) {
          this.connectedUsers.delete(userId);
          this.broadcastOnlineUsers();
        }
      });

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          
          if (data.type === 'auth' && typeof data.userId === 'number') {
            const newUserId = data.userId;
            userId = newUserId;
            this.connectedUsers.set(newUserId, {
              userId: newUserId,
              ws,
              lastSeen: new Date()
            });
            
            // Broadcast updated online users list
            this.broadcastOnlineUsers();
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        if (userId !== null) {
          this.connectedUsers.delete(userId);
          this.broadcastOnlineUsers();
        }
      });
    });

    // Handle WebSocket server errors
    this.wss.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });
  }

  private broadcastOnlineUsers() {
    const onlineUsers = Array.from(this.connectedUsers.keys());
    const message = JSON.stringify({
      type: 'onlineUsers',
      users: onlineUsers
    });

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          console.error('Error broadcasting to client:', error);
        }
      }
    });
  }

  public isUserOnline(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }

  public getOnlineUsers(): number[] {
    return Array.from(this.connectedUsers.keys());
  }
}

export default WebSocketManager; 