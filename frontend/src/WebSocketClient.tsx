// WebSocketClient.tsx
import React, { useEffect, useState } from 'react';
import { Frame, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface Greeting {
  content: string;
}

const WebSocketClient: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  
  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = Stomp.over(socket);
    
    stompClient.connect({}, (frame: Frame) => {
      console.log('Connected: ' + frame);
      
      stompClient.subscribe('/topic/greetings', (greeting) => {
        const message: Greeting = JSON.parse(greeting.body);
        setMessages((prevMessages) => [...prevMessages, message.content]);
      });
    });
    
    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
  }, []);
  
  const sendName = (name: string) => {
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = Stomp.over(socket);
    
    stompClient.connect({}, () => {
      stompClient.send('/app/hello', {}, JSON.stringify({ name }));
    });
  };
  
  return (
    <div>
      <button onClick={() => sendName('John Doe')}>Send Message</button>
      <div>
        <h2>Messages:</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WebSocketClient;
