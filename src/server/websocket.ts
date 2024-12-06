import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket as WSSocket } from 'ws';
import { parse } from 'url';
import { decode } from 'next-auth/jwt';

interface NotificationMessage {
  type: string;
  userId: string;
  data: any;
}

export class WebSocketHandler {
  private wss: WebSocketServer;
  private clients: Map<string, WSSocket[]>;

  constructor(server: HTTPServer) {
    this.wss = new WebSocketServer({ noServer: true });
    this.clients = new Map();

    server.on('upgrade', async (request, socket, head) => {
      try {
        const { pathname, query } = parse(request.url || '', true);

        if (pathname !== '/api/ws') {
          socket.destroy();
          return;
        }

        const token = query.token as string;
        if (!token) {
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
          return;
        }

        try {
          const decoded = await decode({
            token,
            secret: process.env.NEXTAUTH_SECRET || '',
          });

          if (!decoded?.sub) {
            throw new Error('Invalid token');
          }

          this.wss.handleUpgrade(request, socket, head, (ws) => {
            this.wss.emit('connection', ws, request, decoded.sub);
          });
        } catch (error) {
          console.error('Token verification error:', error);
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
        }
      } catch (error) {
        console.error('WebSocket upgrade error:', error);
        socket.destroy();
      }
    });

    this.wss.on('connection', (ws: WSSocket, request: any, userId: string) => {
      this.handleConnection(ws, userId);
    });
  }

  private handleConnection(ws: WSSocket, userId: string) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }
    this.clients.get(userId)?.push(ws);

    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data.toString());
        console.log('Received message:', data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    ws.addEventListener('close', () => {
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

    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });

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
        if (client.readyState === WSSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  public broadcastMessage(message: any) {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WSSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}
