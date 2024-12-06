import { EventEmitter } from 'events';

class WebSocketClient extends EventEmitter {
  private url: string;
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private token: string | null = null;
  private isConnecting = false;

  constructor() {
    super();
    // Check if we're in the browser
    const isBrowser = typeof window !== 'undefined';
    const wsHost = process.env.NEXT_PUBLIC_WS_URL || 
      (isBrowser ? window.location.origin.replace(/^http/, 'ws') : 'ws://localhost:3000');
    this.url = `${wsHost}/api/ws`;
  }

  setToken(token: string) {
    this.token = token;
  }

  connect() {
    if (typeof window === 'undefined') {
      return; // Don't connect on server-side
    }

    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnecting = false;
        if (this.token) {
          this.ws?.send(JSON.stringify({ type: 'auth', token: this.token }));
        }
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type, data.payload);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.ws = null;
        this.emit('disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
    } catch (error) {
      this.isConnecting = false;
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 5000); // Try to reconnect after 5 seconds
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
}

const wsClient = new WebSocketClient();
export default wsClient;
