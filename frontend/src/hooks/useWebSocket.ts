import { CompatClient, Frame, Stomp } from '@stomp/stompjs';
import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';

interface UseWebSocketProps {
  url: string;
  onEvent: (event: any) => void;
  subscribeTo: string;
}

const useWebSocket = ({ url, subscribeTo, onEvent }: UseWebSocketProps) => {
  const clientRef = useRef<CompatClient>();
  
  useEffect(() => {
    
    const socket = new SockJS(url);
    const client = Stomp.over(socket);
    
    client.connect({}, (_: Frame) => {
      client.subscribe(subscribeTo, onEvent);
    });
    
    clientRef.current = client;
    
    return () => {
      clientRef.current && clientRef.current.disconnect();
    };
    
  }, []);

  return (destination: string, message: string) => {
    clientRef.current?.send(destination, {}, message);
  };
};

export { useWebSocket };