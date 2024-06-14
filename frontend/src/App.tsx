import './App.css';
import { Input } from '@/components/ui/input.tsx';
import { Frame, Stomp } from '@stomp/stompjs';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import rough from 'roughjs';
import SockJS from 'sockjs-client';

const generator = rough.generator();

let lastUsedId = 0;

type DrawElementType = 'LINE'

type DrawElement = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  roughElement: any;
  id: number;
  type: DrawElementType;
};

type DrawEvent = {
  element: DrawElement;
  type: 'CREATE' | 'UPDATE';
  userId?: string;
}

const createElement = (x1: number, y1: number, x2: number, y2: number, isNew: boolean = true, type: DrawElementType): DrawElement => {
  const roughElement = generator.line(x1, y1, x2, y2);
  
  isNew && lastUsedId++;
  return { x1, y1, x2, y2, roughElement, id: lastUsedId, type};
};



function App() {
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [username, ] = useState<string>(`user-${Math.floor(Math.random() * 1000)}`);
  const [room, ] = useState<string | undefined>('artsiRoom');
  const [stompClient, setStompClient] = useState<any>(null);
  
  
  
  
  
  
  useEffect(() => {
    
    console.log("useEffect running");
    
    console.log(`Starting ws connection with username: ${username}`)
    
    const socket = new SockJS('http://localhost:8080/ws');
    const client = Stomp.over(socket);
    

    client.connect({}, (frame: Frame) => {
      console.log('Connected: ' + frame);
      
      client.subscribe(`/topic/draw/${room}`, (drawEvent) => {
        const event: DrawEvent = JSON.parse(drawEvent.body);
        
        console.log(`event user: ${event.userId} -> username ${username}`)
        if(event.userId == username) return;
        
        console.log(`received draw event from ${event.userId}-> `, event);
        
        if(event.type === 'CREATE') {
          
          console.log("will create new element with id: ", event.element.id)
          
          lastUsedId = Math.max(lastUsedId, event.element.id);
          
          const newElement = {
            ...event.element,
            roughElement: generator.line(event.element.x1, event.element.y1, event.element.x2, event.element.y2)
          };
          
          setElements((prevState) => [...prevState, newElement]);
          
        }
        
        if(event.type === 'UPDATE') {
          setElements((prevState) => {
            
            console.log("prev state: ", prevState.length)
            
            return prevState.map((element) => {
              if(element.id === event.element.id) {
                return {
                  ...element,
                  x1: event.element.x1,
                  y1: event.element.y1,
                  x2: event.element.x2,
                  y2: event.element.y2,
                  roughElement: generator.line(event.element.x1, event.element.y1, event.element.x2, event.element.y2)
                }
              }
              
              return element;
            })
          });
        }
      });
    });
    
    setStompClient(client);
    
    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
    
  }, []);
  
  
  const sendDrawEvent = (event: DrawEvent) => {
    console.log("sending draw event with element id: ", event.element.id)
    stompClient.send(`/app/draw/${room}`, {}, JSON.stringify(event));
  }
  
  
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if(!username) return;
    
    setDrawing(true);
    
    const { clientX, clientY } = event;
    const element = createElement(clientX, clientY, clientX, clientY,true,'LINE');
    
    sendDrawEvent({element, type: 'CREATE', userId: username})
    
    setElements((prevState) => [...prevState, element]);
  };
  
  const handleMouseUp = (_: React.MouseEvent<HTMLCanvasElement>) => {
    if(!drawing || !username) return;
    setDrawing(false);
  };
  
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !username) return;
    
    const { clientX, clientY } = event;
    
    const index = elements.length - 1;
    
    const {x1, y1} = elements[index];
    const updatedElement = createElement(x1, y1, clientX, clientY, false, 'LINE');
    
    sendDrawEvent({element: updatedElement, type: 'UPDATE', userId: username})
    
    const elementsCopy = [...elements];
    elementsCopy[index] = updatedElement;
    setElements(elementsCopy);
  };
  
  useLayoutEffect(() => {
    
    const canvas = canvasRef.current!;
    
    const context = canvas.getContext("2d")!;
    const rc = rough.canvas(canvas);
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    
    elements.forEach(({ roughElement }) => rc.draw(roughElement));
    context.restore();
    
  }, [elements]);
  
  return (
    <div>
      <div className={'flex flex-row items-center fixed z-10 bg-amber-300 rounded m-2 p-2'}>
        <h1>Write your username here:</h1>
        <Input className={"w-24 m-4"} value={username} disabled={true}/>
      </div>
      
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={'absolute bg-white'}
      >
      </canvas>
    </div>
  );
}

export default App;
