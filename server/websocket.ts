import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import { EconomicEngine, MarketState, PolicyState, PlayerAction } from './economicEngine';
import { storage } from './storage';

interface WSClient {
  ws: WebSocket;
  userId?: string;
  sessionId?: number;
  role?: string;
}

interface WSMessage {
  type: string;
  payload: any;
  sessionId?: number;
}

export class SimulationWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, WSClient> = new Map();
  private economicEngine: EconomicEngine;
  private marketUpdateInterval?: NodeJS.Timeout;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.economicEngine = new EconomicEngine();
    this.setupWebSocketHandlers();
    this.startMarketUpdates();
  }

  private setupWebSocketHandlers(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = this.generateClientId();
      const client: WSClient = { ws };
      this.clients.set(clientId, client);

      console.log(`WebSocket client connected: ${clientId}`);

      ws.on('message', async (data: Buffer) => {
        try {
          const message: WSMessage = JSON.parse(data.toString());
          await this.handleMessage(clientId, message);
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
          this.sendError(clientId, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        console.log(`WebSocket client disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });

      // Send initial market state
      this.sendMarketUpdate(clientId);
    });
  }

  private async handleMessage(clientId: string, message: WSMessage): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'authenticate':
        await this.handleAuthentication(clientId, message.payload);
        break;

      case 'join_session':
        await this.handleJoinSession(clientId, message.payload);
        break;

      case 'player_action':
        await this.handlePlayerAction(clientId, message.payload);
        break;

      case 'switch_role':
        await this.handleRoleSwitch(clientId, message.payload);
        break;

      case 'request_historical_data':
        await this.handleHistoricalDataRequest(clientId, message.payload);
        break;

      case 'reset_simulation':
        await this.handleSimulationReset(clientId, message.payload);
        break;

      default:
        this.sendError(clientId, `Unknown message type: ${message.type}`);
    }
  }

  private async handleAuthentication(clientId: string, payload: { userId: string }): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.userId = payload.userId;
    
    // Try to find user's active session
    const activeSession = await storage.getUserActiveSession(payload.userId);
    if (activeSession) {
      client.sessionId = activeSession.id;
      client.role = activeSession.currentRole;
    }

    this.sendMessage(clientId, {
      type: 'authentication_success',
      payload: {
        userId: payload.userId,
        sessionId: client.sessionId,
        role: client.role,
      },
    });
  }

  private async handleJoinSession(clientId: string, payload: { sessionId?: number; sessionName?: string }): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client || !client.userId) {
      this.sendError(clientId, 'Must authenticate first');
      return;
    }

    let session;
    
    if (payload.sessionId) {
      session = await storage.getGameSession(payload.sessionId);
    } else if (payload.sessionName) {
      // Create new session
      session = await storage.createGameSession({
        userId: client.userId,
        sessionName: payload.sessionName,
        currentRole: 'homebuyer',
        gameState: { tutorial: { completed: false, step: 0 } },
        marketState: this.economicEngine.getMarketState(),
        policyState: this.economicEngine.getPolicyState(),
      });
    }

    if (!session) {
      this.sendError(clientId, 'Session not found');
      return;
    }

    client.sessionId = session.id;
    client.role = session.currentRole;

    // Send session state
    this.sendMessage(clientId, {
      type: 'session_joined',
      payload: {
        session,
        marketState: this.economicEngine.getMarketState(),
        policyState: this.economicEngine.getPolicyState(),
      },
    });

    // Notify other clients in the same session
    this.broadcastToSession(session.id, {
      type: 'player_joined',
      payload: {
        userId: client.userId,
        role: client.role,
      },
    }, clientId);
  }

  private async handlePlayerAction(clientId: string, payload: PlayerAction): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client || !client.userId || !client.sessionId) {
      this.sendError(clientId, 'Must join a session first');
      return;
    }

    // Process the action through the economic engine
    const result = this.economicEngine.processPlayerAction({
      ...payload,
      userId: client.userId,
      role: client.role as any,
    }, client.sessionId);

    // Record the decision in the database
    await storage.recordDecision({
      sessionId: client.sessionId,
      userId: client.userId,
      role: client.role!,
      decisionType: payload.actionType,
      decisionData: payload.parameters,
      marketContext: this.economicEngine.getMarketState(),
    });

    // Record market events
    for (const event of result.marketEvents) {
      await storage.recordMarketEvent({
        ...event,
        sessionId: client.sessionId,
      });
    }

    // Update session state
    await storage.updateGameSession(client.sessionId, {
      marketState: result.newState,
      policyState: this.economicEngine.getPolicyState(),
    });

    // Broadcast market update to all clients in session
    this.broadcastToSession(client.sessionId, {
      type: 'market_update',
      payload: {
        marketState: result.newState,
        policyState: this.economicEngine.getPolicyState(),
        events: result.marketEvents,
        triggeredBy: client.userId,
      },
    });

    // Send historical comparison
    const historicalComparison = this.economicEngine.getHistoricalComparison();
    this.sendMessage(clientId, {
      type: 'historical_comparison',
      payload: historicalComparison,
    });
  }

  private async handleRoleSwitch(clientId: string, payload: { role: string }): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client || !client.sessionId) {
      this.sendError(clientId, 'Must join a session first');
      return;
    }

    client.role = payload.role;
    
    // Update session
    await storage.updateGameSession(client.sessionId, {
      currentRole: payload.role,
    });

    this.sendMessage(clientId, {
      type: 'role_switched',
      payload: { role: payload.role },
    });

    // Broadcast to other clients
    this.broadcastToSession(client.sessionId, {
      type: 'player_role_changed',
      payload: {
        userId: client.userId,
        role: payload.role,
      },
    }, clientId);
  }

  private async handleHistoricalDataRequest(clientId: string, payload: { quarter?: number }): Promise<void> {
    if (payload.quarter !== undefined) {
      this.economicEngine.resetToHistoricalPeriod(payload.quarter);
    }

    const historicalComparison = this.economicEngine.getHistoricalComparison();
    
    this.sendMessage(clientId, {
      type: 'historical_data',
      payload: {
        comparison: historicalComparison,
        marketState: this.economicEngine.getMarketState(),
      },
    });
  }

  private async handleSimulationReset(clientId: string, payload: { quarter?: number }): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client || !client.sessionId) {
      this.sendError(clientId, 'Must join a session first');
      return;
    }

    // Reset economic engine
    if (payload.quarter !== undefined) {
      this.economicEngine.resetToHistoricalPeriod(payload.quarter);
    }

    // Update session
    await storage.updateGameSession(client.sessionId, {
      marketState: this.economicEngine.getMarketState(),
      policyState: this.economicEngine.getPolicyState(),
    });

    // Broadcast reset to all clients in session
    this.broadcastToSession(client.sessionId, {
      type: 'simulation_reset',
      payload: {
        marketState: this.economicEngine.getMarketState(),
        policyState: this.economicEngine.getPolicyState(),
        quarter: payload.quarter,
      },
    });
  }

  private startMarketUpdates(): void {
    // Send periodic market updates every 30 seconds
    this.marketUpdateInterval = setInterval(() => {
      const marketState = this.economicEngine.getMarketState();
      const policyState = this.economicEngine.getPolicyState();

      this.broadcast({
        type: 'periodic_market_update',
        payload: {
          marketState,
          policyState,
          timestamp: Date.now(),
        },
      });
    }, 30000);
  }

  private sendMessage(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  private sendError(clientId: string, error: string): void {
    this.sendMessage(clientId, {
      type: 'error',
      payload: { message: error },
    });
  }

  private sendMarketUpdate(clientId: string): void {
    this.sendMessage(clientId, {
      type: 'market_update',
      payload: {
        marketState: this.economicEngine.getMarketState(),
        policyState: this.economicEngine.getPolicyState(),
      },
    });
  }

  private broadcast(message: any): void {
    this.clients.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  private broadcastToSession(sessionId: number, message: any, excludeClientId?: string): void {
    this.clients.forEach((client, clientId) => {
      if (client.sessionId === sessionId && 
          clientId !== excludeClientId && 
          client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  private generateClientId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  public destroy(): void {
    if (this.marketUpdateInterval) {
      clearInterval(this.marketUpdateInterval);
    }
    this.wss.close();
  }
}
