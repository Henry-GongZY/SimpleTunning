import type { WSMessage } from '../types/pipeline';

type MessageHandler = (msg: WSMessage) => void;

class PipelineWebSocket {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private url: string;

  constructor(url: string = 'ws://localhost:8000/ws/pipeline') {
    this.url = url;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('[WS] Connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        this.dispatch(msg.type, msg);
        this.dispatch('*', msg);
      } catch (e) {
        console.error('[WS] Failed to parse message:', e);
      }
    };

    this.ws.onclose = () => {
      console.log('[WS] Disconnected, reconnecting in 2s...');
      this.reconnectTimer = setTimeout(() => this.connect(), 2000);
    };

    this.ws.onerror = (err) => {
      console.error('[WS] Error:', err);
    };
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  send(msg: WSMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else {
      console.warn('[WS] Not connected, message queued');
    }
  }

  on(type: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  private dispatch(type: string, msg: WSMessage): void {
    this.handlers.get(type)?.forEach((h) => h(msg));
  }
}

export const wsClient = new PipelineWebSocket();
