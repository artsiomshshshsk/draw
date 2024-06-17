import { CompatClient, Frame, Stomp } from '@stomp/stompjs';
import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';

interface UseWebSocketProps {
  url: string;
  onEvent: (event: any) => void;
  subscribeTo: string;
  isCollaborating?: boolean;
}

const useWebSocket = ({ url, subscribeTo, onEvent, isCollaborating }: UseWebSocketProps) => {
  const clientRef = useRef<CompatClient>();
  
  const doNothing = () => {};
  
  useEffect(() => {
    if (!isCollaborating) return;
    
    const socket = new SockJS(url);
    const client = Stomp.over(socket);
    
    client.connect({}, (_: Frame) => {
      client.subscribe(subscribeTo, onEvent);
    });
    
    clientRef.current = client;
    
    return () => {
      clientRef.current && clientRef.current.disconnect();
    };
    
  }, [isCollaborating]);

  return !isCollaborating ? doNothing : (destination: string, message: string) => {
    if (!clientRef.current?.connected) {
      return;
    }
    clientRef.current.send(destination, {}, message);
  };
};

export { useWebSocket };