import { Server as HTTPServer } from 'http';
import { WebSocket, Server as WSServer } from 'ws';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/prisma';

interface WebSocketMessage {
  type: string;
  payload?: any;
  token?: string;
}

export class WebSocketHandler {
  private clients: Map<string, WebSocket> = new Map();
  private wss: WSServer;

  constructor(wss: WSServer) {
    this.wss = wss;

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket connection established');

      ws.on('message', async (message: string) => {
        try {
          const data: WebSocketMessage = JSON.parse(message.toString());
          
          if (data.type === 'auth') {
            const session = await getSession({ req: { headers: { cookie: `next-auth.session-token=${data.token}` } } });
            if (session?.user?.email) {
              this.clients.set(session.user.email, ws);
              console.log(`User ${session.user.email} authenticated via WebSocket`);
              
              // Send confirmation back to client
              ws.send(JSON.stringify({
                type: 'auth_success',
                payload: {
                  email: session.user.email
                }
              }));
            }
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            payload: {
              message: 'Failed to process message'
            }
          }));
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        // Remove client from the map
        for (const [email, client] of this.clients.entries()) {
          if (client === ws) {
            this.clients.delete(email);
            console.log(`User ${email} disconnected`);
            break;
          }
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send initial connection success message
      ws.send(JSON.stringify({
        type: 'connected',
        payload: {
          message: 'WebSocket connection established'
        }
      }));
    });
  }

  async sendNotification(userEmail: string, notification: any) {
    const client = this.clients.get(userEmail);
    if (client?.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify({
          type: 'notification',
          payload: notification
        }));
      } catch (error) {
        console.error(`Error sending notification to ${userEmail}:`, error);
      }
    }
  }

  async broadcastNotification(notification: any) {
    for (const [email, client] of this.clients.entries()) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(JSON.stringify({
            type: 'notification',
            payload: notification
          }));
        } catch (error) {
          console.error(`Error broadcasting notification to ${email}:`, error);
        }
      }
    }
  }
}
