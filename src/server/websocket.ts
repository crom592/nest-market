import { Server as HTTPServer } from 'http';
import { Server as WebSocketServer } from 'ws';
import { parse } from 'url';
import { getToken } from 'next-auth/jwt';

interface NotificationMessage {
  type: string;
  userId: string;
  data: any;
}

export class WebSocketHandler {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocket[]>;

  constructor(server: HTTPServer) {
    this.wss = new WebSocketServer({ noServer: true });
    this.clients = new Map();

    server.on('upgrade', async (request, socket, head) => {
      try {
        const { pathname } = parse(request.url || '', true);

        if (pathname !== '/api/ws') {
          socket.destroy();
          return;
        }

        // Verify the token
        const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        if (!token || !token.sub) {
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
          return;
        }

        this.wss.handleUpgrade(request, socket, head, (ws) => {
          this.wss.emit('connection', ws, request, token.sub);
        });
      } catch (error) {
        console.error('WebSocket upgrade error:', error);
        socket.destroy();
      }
    });

    this.wss.on('connection', (ws: WebSocket, request: any, userId: string) => {
      this.handleConnection(ws, userId);
    });
  }

  private handleConnection(ws: WebSocket, userId: string) {
    // Add client to the map
    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }
    this.clients.get(userId)?.push(ws);

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        console.log('Received message:', data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    ws.on('close', () => {
      // Remove client from the map
      const userClients = this.clients.get(userId);
      if (userClients) {
        const index = userClients.indexOf(ws);
        if (index !== -1) {
          userClients.splice(index, 1);
        }
        if (userClients.length === 0) {
          this.clients.delete(userId);
        }
      }
    });

    // Send initial connection success message
    ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket connection established' }));
  }

  public sendNotification(notification: NotificationMessage) {
    const { userId, type, data } = notification;
    const userClients = this.clients.get(userId);

    if (userClients && userClients.length > 0) {
      const message = JSON.stringify({
        type,
        data,
        timestamp: new Date().toISOString(),
      });

      userClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  public broadcastMessage(message: any) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}
