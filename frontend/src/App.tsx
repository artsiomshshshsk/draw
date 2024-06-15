import './App.css';
import { Input } from '@/components/ui/input.tsx';
import { useWebSocket } from '@/hooks/useWebSocket.ts';
import React, { useLayoutEffect, useRef, useState } from 'react';
import rough from 'roughjs';

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

const generateId = async (): Promise<number> => {
  const response = await fetch("/api/draw/generateId")
  if(!response.ok) throw new Error("Failed to generate id");
  return await response.json()
}


const createElement = (x1: number, y1: number, x2: number, y2: number, isNew: boolean = true, type: DrawElementType): DrawElement => {
  const roughElement = generator.line(x1, y1, x2, y2);
  if(isNew) {
    generateId().then((id) => {
      console.log("Generated id: ", id)
    }).catch((err) => {
      console.error("Failed to generate id: ", err)
    })
  }
  
  isNew && lastUsedId++;
  return { x1, y1, x2, y2, roughElement, id: lastUsedId, type };
};

type DrawingState = {
  drawing: boolean;
  elementId: number | undefined;
}


function App() {
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState<DrawingState>({ drawing: false, elementId: undefined });
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [username,] = useState<string>(`user-${Math.floor(Math.random() * 1000)}`);
  const [room,] = useState<string | undefined>('artsiRoom');
  
  const addNewElement = (newElement: DrawElement) => {
    setElements((prevState) => [...prevState, newElement]);
  };
  
  const updateElement = (updatedElement: DrawElement) => {
    setElements((prevState) => {
      return prevState.map((element) => {
        if (element.id === updatedElement.id) {
          return {
            ...element,
            x1: updatedElement.x1,
            y1: updatedElement.y1,
            x2: updatedElement.x2,
            y2: updatedElement.y2,
            roughElement: generator.line(updatedElement.x1, updatedElement.y1, updatedElement.x2, updatedElement.y2)
          };
        }
        return element;
      });
    });
  };
  
  const sendDrawEvent = useWebSocket({
    url: 'http://localhost:8080/ws',
    subscribeTo: `/topic/draw/${room}`,
    onEvent: (drawEvent: any) => {
      const event: DrawEvent = JSON.parse(drawEvent.body);
      if (event.userId == username) return;
      
      if (event.type === 'CREATE') {
        lastUsedId = Math.max(lastUsedId, event.element.id);
        const newElement = {
          ...event.element,
          roughElement: generator.line(event.element.x1, event.element.y1, event.element.x2, event.element.y2)
        };
        addNewElement(newElement);
      }
      
      if (event.type === 'UPDATE') {
        updateElement(event.element);
      }
    }
  });
  
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!username) return;
    
    
    const { clientX, clientY } = event;
    const element = createElement(clientX, clientY, clientX, clientY, true, 'LINE');
    
    setDrawing({ drawing: true, elementId: element.id });
    
    sendDrawEvent(
      `/app/draw/${room}`,
      JSON.stringify({ element, type: 'CREATE', userId: username })
    );
    
    setElements((prevState) => [...prevState, element]);
  };
  
  const handleMouseUp = (_: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing.drawing || !username || !drawing.elementId) return;
    setDrawing({ drawing: false, elementId: undefined });
  };
  
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing.drawing || !drawing.elementId || !username) return;
    
    const { clientX, clientY } = event;
    
    console.log("drawing element with id: ", drawing.elementId)
    
    const index = elements.length - 1;
    const { x1, y1 } = elements[index];
    const updatedElement = createElement(x1, y1, clientX, clientY, false, 'LINE');
    
    sendDrawEvent(
      `/app/draw/${room}`,
      JSON.stringify({ element: updatedElement, type: 'UPDATE', userId: username })
    );
    
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
