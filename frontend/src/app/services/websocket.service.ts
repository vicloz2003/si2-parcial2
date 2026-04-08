import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WsNotification {
  type: string;
  incident_id?: number;
  status?: string;
  title?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  readonly notifications$ = new Subject<WsNotification>();

  connect(): void {
    const token = localStorage.getItem('token');
    if (!token || this.ws?.readyState === WebSocket.OPEN) return;

    const url = `${environment.wsUrl}?token=${token}`;
    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      try {
        const data: WsNotification = JSON.parse(event.data);
        this.notifications$.next(data);
      } catch { /* ignore malformed messages */ }
    };

    this.ws.onclose = () => {
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
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

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 5000);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
