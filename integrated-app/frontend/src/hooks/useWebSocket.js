import { useEffect, useRef, useState } from 'react';

const useWebSocket = (url) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const ws = useRef(null);

  const connect = () => {
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      };

      ws.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('WebSocket connection error');
      };

      ws.current.onmessage = (event) => {
        setLastMessage(event);
      };
    } catch (err) {
      console.error('WebSocket connection error:', err);
      setError('Failed to establish WebSocket connection');
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      setError('WebSocket is not connected');
    }
  };

  const reconnect = () => {
    if (ws.current) {
      ws.current.close();
    }
    connect();
  };

  return {
    isConnected,
    lastMessage,
    error,
    sendMessage,
    reconnect,
  };
};

export default useWebSocket; 