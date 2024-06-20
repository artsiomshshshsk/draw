import { CompatClient, Frame, Stomp } from '@stomp/stompjs';
import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';

interface onEventTopicMapping {
  topic: string,
  onEvent: (event: any) => void;
}

interface UseWebSocketProps {
  url: string;
  isCollaborating: boolean;
  mappings: onEventTopicMapping[]
}

const useWebSocket = ({ url, isCollaborating, mappings }: UseWebSocketProps) => {
  const clientRef = useRef<CompatClient>();

  const doNothing = () => {};

  useEffect(() => {
    if (!isCollaborating) return;

    console.log('calling useWebSocket effect')

    const createSocket = () => new SockJS(url);
    const client = Stomp.over(createSocket);

    client.connect({}, (_: Frame) => {
      mappings.forEach(({ topic, onEvent }) => {
        client.subscribe(topic, onEvent);
      });
    });

    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };

  }, [isCollaborating, mappings, url]);

  return !isCollaborating ? doNothing : (destination: string, message: string) => {
    if (!clientRef.current?.connected) {
      return;
    }
    clientRef.current.send(destination, {}, message);
  };
};

export { useWebSocket };