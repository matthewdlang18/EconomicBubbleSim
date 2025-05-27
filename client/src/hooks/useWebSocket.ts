import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './useAuth';

interface WSMessage {
  type: string;
  payload: any;
}

interface MarketState {
  medianPrice: number;
  priceGrowth: number;
  inventory: number;
  bubbleRisk: number;
  supplyLevel: number;
  demandLevel: number;
  priceToIncomeRatio: number;
  mortgageRate: number;
  unemploymentRate: number;
  housingStarts: number;
  foreclosureRate: number;
  timeStep: number;
}

interface PolicyState {
  fedRate: number;
  maxLTV: number;
  capitalRequirements: number;
  stressTesting: boolean;
  regulatoryStrength: number;
}

export function useWebSocket() {
  const { user, isAuthenticated } = useAuth();
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [marketState, setMarketState] = useState<MarketState | null>(null);
  const [policyState, setPolicyState] = useState<PolicyState | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [role, setRole] = useState<string>('homebuyer');
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: string;
    message: string;
    timestamp: number;
  }>>([]);

  const connect = useCallback(() => {
    if (!isAuthenticated || !user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Authenticate with the server
      ws.current?.send(JSON.stringify({
        type: 'authenticate',
        payload: { userId: user?.id }
      }));
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (isAuthenticated && user) {
          connect();
        }
      }, 3000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [isAuthenticated, user]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  const handleMessage = (message: WSMessage) => {
    switch (message.type) {
      case 'authentication_success':
        setSessionId(message.payload.sessionId);
        setRole(message.payload.role || 'homebuyer');
        break;

      case 'session_joined':
        setSessionId(message.payload.session.id);
        setRole(message.payload.session.currentRole);
        setMarketState(message.payload.marketState);
        setPolicyState(message.payload.policyState);
        break;

      case 'market_update':
      case 'periodic_market_update':
        setMarketState(message.payload.marketState);
        setPolicyState(message.payload.policyState);
        
        if (message.payload.events) {
          // Add notifications for significant market events
          message.payload.events.forEach((event: any) => {
            addNotification('market_event', getEventMessage(event));
          });
        }
        break;

      case 'role_switched':
        setRole(message.payload.role);
        break;

      case 'player_joined':
        addNotification('info', `${message.payload.userId} joined as ${message.payload.role}`);
        break;

      case 'player_role_changed':
        addNotification('info', `${message.payload.userId} switched to ${message.payload.role}`);
        break;

      case 'simulation_reset':
        setMarketState(message.payload.marketState);
        setPolicyState(message.payload.policyState);
        addNotification('warning', `Simulation reset to ${message.payload.quarter ? `Q${message.payload.quarter}` : 'initial state'}`);
        break;

      case 'historical_comparison':
        addNotification('education', `Historical context: ${message.payload.historicalEvent}`);
        break;

      case 'error':
        addNotification('error', message.payload.message);
        break;

      default:
        console.log('Unhandled message type:', message.type);
    }
  };

  const addNotification = (type: string, message: string) => {
    const notification = {
      id: Math.random().toString(36).substring(2),
      type,
      message,
      timestamp: Date.now(),
    };
    
    setNotifications(prev => [notification, ...prev].slice(0, 10)); // Keep only last 10
  };

  const getEventMessage = (event: any): string => {
    switch (event.eventType) {
      case 'homebuyer_purchase':
        return `New home purchase at $${event.eventData.price.toLocaleString()}`;
      case 'investor_purchase':
        return `Investor bought ${event.eventData.quantity} properties`;
      case 'fed_rate_change':
        return `Fed rate changed from ${event.eventData.oldRate}% to ${event.eventData.newRate}%`;
      case 'ltv_regulation':
        return `LTV limit set to ${event.eventData.maxLTV}%`;
      case 'stress_testing_mandate':
        return 'Mandatory stress testing implemented';
      default:
        return 'Market event occurred';
    }
  };

  const sendMessage = useCallback((type: string, payload: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  const joinSession = useCallback((sessionName: string) => {
    sendMessage('join_session', { sessionName });
  }, [sendMessage]);

  const switchRole = useCallback((newRole: string) => {
    sendMessage('switch_role', { role: newRole });
  }, [sendMessage]);

  const makePlayerAction = useCallback((actionType: string, parameters: any) => {
    sendMessage('player_action', { actionType, parameters });
  }, [sendMessage]);

  const requestHistoricalData = useCallback((quarter?: number) => {
    sendMessage('request_historical_data', { quarter });
  }, [sendMessage]);

  const resetSimulation = useCallback((quarter?: number) => {
    sendMessage('reset_simulation', { quarter });
  }, [sendMessage]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user, connect, disconnect]);

  return {
    isConnected,
    marketState,
    policyState,
    sessionId,
    role,
    notifications,
    joinSession,
    switchRole,
    makePlayerAction,
    requestHistoricalData,
    resetSimulation,
    removeNotification,
  };
}
