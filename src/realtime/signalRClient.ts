import * as signalR from '@microsoft/signalr';
import { API_BASE_URL, getApiAccessToken } from '../api/apiClient';

let connection: signalR.HubConnection | null = null;

export function getSignalRConnection(): signalR.HubConnection {
  if (!connection) {
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const hubUrl = `${baseUrl}/hubs/chat`;

    connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => getApiAccessToken() || ''
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();
  }

  return connection;
}

export async function startSignalRConnection(): Promise<void> {
  const conn = getSignalRConnection();
  if (conn.state === signalR.HubConnectionState.Disconnected) {
    try {
      await conn.start();
      console.log('[SignalR] Connected successfully to /hubs/chat');
    } catch (err) {
      console.warn('[SignalR] Connection failed:', err);
    }
  }
}

export async function stopSignalRConnection(): Promise<void> {
  if (connection && connection.state !== signalR.HubConnectionState.Disconnected) {
    try {
      await connection.stop();
      console.log('[SignalR] Connection stopped.');
    } catch (err) {
      console.warn('[SignalR] Disconnect error:', err);
    }
  }
}

export async function joinSignalRSession(sessionId: string): Promise<void> {
  const conn = getSignalRConnection();
  if (conn.state === signalR.HubConnectionState.Connected) {
    try {
      await conn.invoke('JoinSession', sessionId);
    } catch (err) {
      console.warn('[SignalR] JoinSession error:', err);
    }
  }
}

export async function leaveSignalRSession(sessionId: string): Promise<void> {
  const conn = getSignalRConnection();
  if (conn.state === signalR.HubConnectionState.Connected) {
    try {
      await conn.invoke('LeaveSession', sessionId);
    } catch (err) {
      console.warn('[SignalR] LeaveSession error:', err);
    }
  }
}
